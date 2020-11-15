import Discord from "discord.js";

import { PlayerClass } from "../shared/types";
import GameRunner from "./GameRunner";
import { createNewBotPlayer } from "../shared/bots";
import {
	GAME_COUNTDOWN_SECONDS,
	MAX_PLAYER_COUNT_WITH_BOTS,
} from "../shared/constants";
import { startTimer, logTimer } from "../shared/timer";
import {
	acceptedClasses,
	acceptedCommandsAsString,
	parseCommand,
} from "./commands";
import {
	messageMentionsBot,
	MESSAGES,
	MessagesByLanguage,
	constructGameEndText,
} from "./messages";

enum BotState {
	Waiting = "waiting",
	Countdown = "countdown",
	Rendering = "rendering",
}

export default class Bot {
	constructor(private botUserId: string) {
		this.gameRunner = new GameRunner();
		this.state = BotState.Waiting;
		this.countdownLeft = 0;
		this.language = "finnish";
	}

	gameRunner: GameRunner;
	state: BotState;
	countdownLeft: number;
	currentParticipantsMessage?: Discord.Message;
	language: keyof MessagesByLanguage;

	handleMessage = async (msg: Discord.Message) => {
		const messageWithoutMentions = msg.content.replace(/<@.*> +/, "");
		const commandWithArgs = parseCommand(messageWithoutMentions);

		if (commandWithArgs === null) {
			await msg.channel.send(MESSAGES[this.language].unknownCommand());
		} else {
			await this.executeCommand(msg, commandWithArgs);
		}
	};

	executeCommand = async (msg: Discord.Message, commandWithArgs: string[]) => {
		if (msg.channel.type !== "text") return;
		const command = commandWithArgs[0];

		switch (command) {
			case "aloita": {
				if (this.state === BotState.Waiting) {
					this.gameRunner.initializeGame();
					this.addPlayerToGame(msg.author);
					this.state = BotState.Countdown;
					this.countdownLeft = GAME_COUNTDOWN_SECONDS;
					await this.countDown(msg.channel);
				} else {
					await msg.channel.send(MESSAGES[this.language].gameAlreadyStarting());
				}
				return;
			}
			case "liity": {
				switch (this.state) {
					case BotState.Countdown: {
						if (!this.gameRunner.playerInGame(msg.author.id))
							this.addPlayerToGame(msg.author);
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
			case "botti": {
				switch (this.state) {
					case BotState.Countdown: {
						if (
							this.gameRunner.getPlayerCount() <= MAX_PLAYER_COUNT_WITH_BOTS
						) {
							const { playerClass, ...botPlayer } = createNewBotPlayer();
							this.gameRunner.addPlayer(botPlayer);
							this.gameRunner.setPlayerClass(botPlayer.id, playerClass);
							await this.updatePlayersInGameText(msg.channel);
						} else {
							await msg.channel.send(
								MESSAGES[this.language].maxPlayerCountWithBotsReached()
							);
						}
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
			case "class": {
				const possibleClass = commandWithArgs[1];
				if (acceptedClasses.includes(possibleClass)) {
					const newPlayerClass = possibleClass as PlayerClass;
					this.gameRunner.setPlayerClass(msg.author.id, newPlayerClass);
					await msg.channel.send(
						MESSAGES[this.language].classSelected(
							msg.author.username,
							newPlayerClass
						)
					);
				} else {
					await msg.channel.send(MESSAGES[this.language].selectableClasses());
				}
				return;
			}
			case "info": {
				await msg.channel.send(acceptedCommandsAsString());
				return;
			}
			default: {
				return;
			}
		}
	};

	addPlayerToGame = (user: Discord.User) => {
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

	countDown = async (channel: Discord.TextChannel) => {
		if (this.countdownLeft === 0) {
			this.runGame(channel);
			return;
		}
		if (this.countdownLeft % 10 === 0 || this.countdownLeft === 5) {
			await channel.send(
				MESSAGES[this.language].gameStartsIn(this.countdownLeft)
			);
		}
		this.countdownLeft -= 1;
		setTimeout(() => this.countDown(channel), 1000);
	};

	runGame = async (channel: Discord.TextChannel) => {
		await this.deleteBotMessages(channel);

		if (this.gameRunner.getPlayerCount() <= 1) {
			await channel.send(MESSAGES[this.language].notEnoughPlayers());
		} else {
			this.state = BotState.Rendering;
			const gameStartMessage = await channel.send(
				MESSAGES[this.language].gameStarting(
					this.gameRunner.getCurrentPlayersWithClasses()
				)
			);
			const gameEndData = await this.gameRunner.runGame();
			if (gameStartMessage.deletable) gameStartMessage.delete();
			if (!gameEndData) return;

			const gameEndText = constructGameEndText(this.language, gameEndData);
			await channel.send(gameEndText, { files: ["Areena_fight.mp4"] });
		}
		await channel.send(MESSAGES[this.language].startNewGame());
		this.state = BotState.Waiting;
	};

	updatePlayersInGameText = async (channel: Discord.TextChannel) => {
		if (
			this.currentParticipantsMessage &&
			this.currentParticipantsMessage.deletable
		) {
			this.currentParticipantsMessage.delete();
		}
		this.currentParticipantsMessage = await channel.send(
			`${MESSAGES[this.language].playersInGame(
				this.gameRunner.getCurrentPlayersWithClasses()
			)}\n\n${MESSAGES[this.language].changeClassWith()}`
		);
	};

	sendNoGameInProgressText = async (channel: Discord.TextChannel) =>
		await channel.send(
			`${MESSAGES[this.language].noGameInProgress()} ${MESSAGES[
				this.language
			].startNewGame()}`
		);

	deleteBotMessages = async (channel: Discord.TextChannel) => {
		startTimer("Fetching messages");
		const messages = await channel.messages.fetch({ limit: 100 });
		logTimer("Fetching messages");
		const messagesToDelete = messages.filter((message) => {
			return (
				message.author.id === this.botUserId ||
				messageMentionsBot(message, this.botUserId)
			);
		});
		startTimer("Deleting messages");
		await channel.bulkDelete(messagesToDelete);
		logTimer("Deleting messages");
	};
}
