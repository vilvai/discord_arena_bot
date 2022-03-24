import type {
	CommandInteraction,
	MessageEmbed,
	TextChannel,
	User,
} from "discord.js";

import { GameEndData, PlayerClass } from "../shared/types";
import GameRunner from "./GameRunner";
import { createNewBotPlayer } from "../shared/bots";
import {
	INPUT_FILE_DIRECTORY,
	MAX_PLAYER_COUNT,
	RENDER_DIRECTORY,
	RENDER_FILE_NAME,
} from "../shared/constants";
import { commands } from "./messages/commands";
import { messages, Messages, getAcceptedCommands } from "./messages/messages";
import { CommandType } from "./messages/types";
import { cooldownLeftForUser, setCooldownForUser } from "./cooldown";

export enum BotState {
	Idle = "idle",
	Waiting = "waiting",
	Rendering = "rendering",
}

export default class Bot {
	constructor(private botUserId: string, private channelId: string) {
		this.gameRunner = new GameRunner();
		this.state = BotState.Idle;
	}

	gameRunner: GameRunner;
	state: BotState;

	handleInteraction = async (interaction: CommandInteraction) => {
		if (
			this.state === BotState.Rendering ||
			interaction.channel?.type !== "GUILD_TEXT"
		) {
			return;
		}

		const commandName = interaction.commandName;
		const command = commands.find((command) => command.label === commandName);
		if (command === undefined) return;
		const option = interaction.options.data[0]?.value;

		await this.executeCommand(interaction, command, option);
	};

	executeCommand = async (
		interaction: CommandInteraction,
		command: typeof commands[0],
		possibleClass: string | number | boolean | undefined
	): Promise<void> => {
		if (interaction.channel?.type !== "GUILD_TEXT") {
			return;
		}
		const { user: author, channel } = interaction;

		switch (command.type) {
			case CommandType.Start: {
				if (this.state === BotState.Idle) {
					const userId = author.id;
					const cooldownLeft = cooldownLeftForUser(userId);
					if (cooldownLeft > 0) {
						const avatarURL = author.displayAvatarURL({
							format: "png",
							size: 128,
						});
						await this.replyToInteraction(
							interaction,
							"cooldown",
							author.username,
							avatarURL,
							cooldownLeft
						);
						return;
					}

					setCooldownForUser(userId);
					this.gameRunner.initializeGame();
					this.addPlayerToGame(author);
					await this.replyToInteraction(
						interaction,
						"fightInitiated",
						author.username
					);
					this.state = BotState.Waiting;
				} else if (this.state === BotState.Waiting) {
					await this.runGame(interaction, channel);
				}
				return;
			}
			case CommandType.Join:
			case CommandType.Bot: {
				if (this.state === BotState.Idle) {
					await this.replyToInteraction(interaction, "noFightInProgress");
				} else if (this.state === BotState.Waiting) {
					if (this.gameRunner.getPlayerCount() >= MAX_PLAYER_COUNT) {
						await this.replyToInteraction(interaction, "gameIsFull");
						return;
					}

					let playerWhoJoined: string;
					if (command.type === CommandType.Join) {
						this.addPlayerToGame(author);
						playerWhoJoined = author.username;
					} else {
						const botName = this.addBotToGame();
						playerWhoJoined = botName;
					}

					await this.replyToInteraction(
						interaction,
						"updatedParticipants",
						playerWhoJoined,
						this.gameRunner.getCurrentPlayersWithClasses()
					);
				}
				return;
			}
			case CommandType.Class: {
				const newPlayerClass = Object.values(PlayerClass).find(
					(playerClass) => playerClass === possibleClass
				);

				if (newPlayerClass === undefined) {
					console.error("Didn't find a class for option: " + possibleClass);
					return;
				}

				this.gameRunner.setPlayerClass(author.id, newPlayerClass);
				await this.replyToInteraction(
					interaction,
					"classSelected",
					author.username,
					newPlayerClass
				);
				return;
			}
			case CommandType.Help: {
				await this.replyToInteractionRaw(interaction, getAcceptedCommands());
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

	addBotToGame = (): string => {
		const { playerClass, ...botPlayer } = createNewBotPlayer();
		this.gameRunner.addPlayer(botPlayer);
		this.gameRunner.setPlayerClass(botPlayer.id, playerClass);
		return botPlayer.name;
	};

	runGame = async (interaction: CommandInteraction, channel: TextChannel) => {
		if (this.gameRunner.getPlayerCount() <= 1) {
			await this.replyToInteraction(interaction, "notEnoughPlayers");
			this.state = BotState.Idle;
			return;
		}

		this.state = BotState.Rendering;
		await this.replyToInteraction(
			interaction,
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
				outputDirectory
			);
		} catch (error) {
			this.state = BotState.Idle;
			await this.sendMessage(channel, "renderingFailed");
			return;
		}

		if (gameEndData === null) return;

		try {
			await channel.send({
				files: [`./${outputDirectory}/${RENDER_FILE_NAME}.mp4`],
			});
			await this.sendMessage(channel, "voteMessage");
		} catch (error) {
			console.error(`Error when posting fight:\n${error}`);
		}
		this.state = BotState.Idle;
	};

	replyToInteraction = async <M extends keyof Messages>(
		interaction: CommandInteraction,
		messageFunctionKey: M,
		...messageFunctionParameters: Parameters<Messages[M]>
	) =>
		await this.replyToInteractionRaw(
			interaction,
			(messages[messageFunctionKey] as any)(...messageFunctionParameters)
		);

	replyToInteractionRaw = async (
		interaction: CommandInteraction,
		message: string | MessageEmbed
	) => {
		try {
			if (typeof message === "string") {
				return await interaction.reply(message);
			} else {
				return await interaction.reply({ embeds: [message] });
			}
		} catch (error) {
			console.error(
				`Error when replying to interaction with message: ${message}\n${error}`
			);
		}
	};

	sendMessage = async <M extends keyof Messages>(
		channel: TextChannel,
		messageFunctionKey: M,
		...messageFunctionParameters: Parameters<Messages[M]>
	) =>
		await this.sendMessageRaw(
			channel,
			(messages[messageFunctionKey] as any)(...messageFunctionParameters)
		);

	sendMessageRaw = async (
		channel: TextChannel,
		message: string | MessageEmbed
	) => {
		try {
			if (typeof message === "string") {
				return await channel.send(message);
			} else {
				return await channel.send({ embeds: [message] });
			}
		} catch (error) {
			console.error(`Error when sending message: ${message}\n${error}`);
		}
	};
}
