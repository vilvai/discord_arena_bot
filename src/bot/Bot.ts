import type { Message, MessageEmbed, TextChannel, User } from "discord.js";

import { GameEndData, PlayerClass } from "../shared/types";
import GameRunner from "./GameRunner";
import { createNewBotPlayer } from "../shared/bots";
import {
	GAME_COUNTDOWN_SECONDS,
	INPUT_FILE_DIRECTORY,
	MAX_PLAYER_COUNT,
	RENDER_DIRECTORY,
	RENDER_FILE_NAME,
} from "../shared/constants";
import { startTimer, logTimer } from "../shared/timer";
import {
	BOT_PREFIX,
	findCommandByLabel,
	getAcceptedCommandsForLanguage,
	parseCommand,
} from "./messages/commands";
import {
	messagesByLanguage,
	messageWasSentByGuildOwner,
	MessageFunctions,
} from "./messages/messages";
import { DEFAULT_LANGUAGE, Language, languages } from "./languages";
import { CommandType } from "./messages/types";
import { getLanguageForChannel, saveLanguageForChannel } from "./database";

export enum BotState {
	Waiting = "waiting",
	Countdown = "countdown",
	Rendering = "rendering",
}

export default class Bot {
	constructor(private botUserId: string, private channelId: string) {
		this.gameRunner = new GameRunner();
		this.state = BotState.Waiting;
		this.countdownLeft = 0;
		this.language = DEFAULT_LANGUAGE;
	}

	gameRunner: GameRunner;
	state: BotState;
	countdownLeft: number;
	currentParticipantsMessage?: Message;
	language: Language;

	loadLanguageFromDB = async () => {
		const language = await getLanguageForChannel(this.channelId);
		if (language !== null) this.language = language;
	};

	handleMessage = async (msg: Message) => {
		if (this.state === BotState.Rendering || msg.channel.type !== "text") {
			return;
		}

		const commandWithArgs = parseCommand(this.language, msg.content);

		if (commandWithArgs !== null) {
			await this.executeCommand(msg, commandWithArgs);
		}
	};

	executeCommand = async (
		msg: Message,
		commandWithArgs: string[]
	): Promise<void> => {
		if (msg.channel.type !== "text") return;
		const commandLabel = commandWithArgs[0];
		const command = findCommandByLabel(this.language, commandLabel);
		if (command === undefined) return;

		switch (command.type) {
			case CommandType.Start: {
				if (this.state === BotState.Waiting) {
					this.gameRunner.initializeGame();
					this.addPlayerToGame(msg.author);
					this.state = BotState.Countdown;
					this.countdownLeft = GAME_COUNTDOWN_SECONDS;
					await this.countdown(msg.channel);
				} else {
					await this.sendTranslatedMessage(msg.channel, "fightAlreadyStarting");
				}
				return;
			}
			case CommandType.Join:
			case CommandType.Bot: {
				switch (this.state) {
					case BotState.Countdown: {
						if (this.gameRunner.getPlayerCount() >= MAX_PLAYER_COUNT) {
							await this.sendTranslatedMessage(msg.channel, "gameIsFull");
							return;
						}

						if (command.type === CommandType.Join) {
							this.addPlayerToGame(msg.author);
						} else {
							this.addBotToGame();
						}

						await this.updatePlayersInGameText(msg.channel);
						return;
					}
					case BotState.Waiting: {
						await this.sendNoGameInProgressText(msg.channel);
						return;
					}
					default: {
						return;
					}
				}
			}
			case CommandType.Class: {
				const possibleClass = commandWithArgs[1];
				const newPlayerClass = Object.entries(
					command.playerClassTranslations
				).find(([_playerClass, label]) => label === possibleClass)?.[0];

				if (newPlayerClass !== undefined) {
					this.gameRunner.setPlayerClass(
						msg.author.id,
						newPlayerClass as PlayerClass
					);
					await this.sendTranslatedMessage(
						msg.channel,
						"classSelected",
						msg.author.username,
						possibleClass
					);
				} else {
					await this.sendTranslatedMessage(msg.channel, "selectableClasses");
				}
				return;
			}
			case CommandType.Info: {
				await this.sendMessage(
					msg.channel,
					getAcceptedCommandsForLanguage(this.language)
				);
				return;
			}
			case CommandType.Language: {
				if (!messageWasSentByGuildOwner(msg)) {
					await this.sendTranslatedMessage(
						msg.channel,
						"onlyOwnerCanChangeLanguage"
					);
					return;
				}

				const possibleLanguage = commandWithArgs[1];
				if (Object.keys(languages).includes(possibleLanguage)) {
					const language = possibleLanguage as Language;
					this.language = language;
					saveLanguageForChannel(this.channelId, language);
					await this.sendTranslatedMessage(msg.channel, "languageChanged");
				} else {
					await this.sendTranslatedMessage(msg.channel, "selectableLanguages");
				}

				return;
			}
		}
	};

	addPlayerToGame = (user: User) => {
		if (this.gameRunner.playerInGame(user.id)) return;

		const avatarURL = user.displayAvatarURL({
			format: "png",
			size: 128,
		});

		this.gameRunner.addPlayer({
			avatarURL,
			name: user.username,
			id: user.id,
		});
	};

	addBotToGame = () => {
		const { playerClass, ...botPlayer } = createNewBotPlayer();
		this.gameRunner.addPlayer(botPlayer);
		this.gameRunner.setPlayerClass(botPlayer.id, playerClass);
	};

	countdown = async (channel: TextChannel) => {
		if (this.countdownLeft === 0) {
			this.runGame(channel);
			return;
		}
		if (this.countdownLeft % 10 === 0 || this.countdownLeft === 5) {
			await this.sendTranslatedMessage(
				channel,
				"fightStartsIn",
				this.countdownLeft
			);
		}
		this.countdownLeft -= 1;
		setTimeout(() => this.countdown(channel), 1000);
	};

	runGame = async (channel: TextChannel) => {
		await this.deleteBotMessages(channel);

		if (this.gameRunner.getPlayerCount() <= 1) {
			await this.sendTranslatedMessage(channel, "notEnoughPlayers");
		} else {
			this.state = BotState.Rendering;
			const gameStartMessage = await this.sendTranslatedMessage(
				channel,
				"fightStarting",
				this.gameRunner.getCurrentPlayersWithClasses()
			);

			console.log(`Starting video render for channel ${channel.id}`);

			const inputDirectory = `${INPUT_FILE_DIRECTORY}/${this.channelId}`;
			const outputDirectory = `${RENDER_DIRECTORY}/${this.channelId}`;

			let gameEndData: GameEndData | null;
			try {
				gameEndData = await this.gameRunner.runGame(
					inputDirectory,
					outputDirectory,
					this.language
				);
			} catch (error) {
				this.state = BotState.Waiting;
				await this.sendTranslatedMessage(channel, "renderingFailed");
				return;
			}

			await this.deleteSingleMessage(gameStartMessage);

			if (gameEndData === null) return;

			try {
				await channel.send("", {
					files: [`./${outputDirectory}/${RENDER_FILE_NAME}.mp4`],
				});
			} catch (error) {
				console.error(`Error when posting fight:\n${error}`);
			}
		}
		await this.sendTranslatedMessage(channel, "startNewFight");
		this.state = BotState.Waiting;
	};

	sendTranslatedMessage = async <M extends keyof MessageFunctions>(
		channel: TextChannel,
		messageFunctionKey: M,
		...messageFunctionParameters: Parameters<MessageFunctions[M]>
	) =>
		await this.sendMessage(
			channel,
			(messagesByLanguage[this.language][messageFunctionKey] as any)(
				...messageFunctionParameters
			)
		);

	sendMessage = async (
		channel: TextChannel,
		message: string | MessageEmbed
	) => {
		try {
			return await channel.send(message);
		} catch (error) {
			console.error(`Error when sending message: ${message}\n${error}`);
		}
	};

	updatePlayersInGameText = async (channel: TextChannel) => {
		await this.deleteSingleMessage(this.currentParticipantsMessage);

		this.currentParticipantsMessage = await this.sendMessage(
			channel,
			messagesByLanguage[this.language].participants(
				this.gameRunner.getCurrentPlayersWithClasses()
			)
		);
	};

	sendNoGameInProgressText = async (channel: TextChannel) =>
		await this.sendMessage(
			channel,
			`${messagesByLanguage[
				this.language
			].noFightInProgress()} ${messagesByLanguage[
				this.language
			].startNewFight()}`
		);

	deleteSingleMessage = async (message: Message | undefined) => {
		if (message === undefined || !message.deletable) return;

		try {
			return await message.delete();
		} catch (error) {
			console.error(
				`Error when deleting message: ${message.content}\n${error}`
			);
		}
	};

	deleteBotMessages = async (channel: TextChannel) => {
		startTimer("Fetching messages");
		const messages = await channel.messages.fetch({ limit: 100 });
		logTimer("Fetching messages");
		const messagesToDelete = messages.filter((message) => {
			return (
				message.author.id === this.botUserId ||
				(message.content.startsWith(BOT_PREFIX) &&
					parseCommand(this.language, message.content) !== null)
			);
		});
		startTimer("Deleting messages");
		try {
			await channel.bulkDelete(messagesToDelete, true);
		} catch (error) {
			console.error(error);
		}
		logTimer("Deleting messages");
	};
}
