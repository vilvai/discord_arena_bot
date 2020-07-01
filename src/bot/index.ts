import Discord from "discord.js";

import { PlayerClass, GameEndReason, GameEndData } from "../shared/types";
import GameRunner from "./GameRunner";
import { createNewBotPlayer } from "../shared/bots";
import { GAME_COUNTDOWN_SECONDS } from "../shared/constants";
import { startTimer, logTimer } from "../shared/timer";

require("dotenv").config();

enum BotState {
	Waiting = "waiting",
	Countdown = "countdown",
	Rendering = "rendering",
}

const acceptedCommands = [
	{ command: "aloita", info: "aloita taistelu" },
	{ command: "liity", info: "liity taisteluun" },
	{ command: "botti", info: "lisää botti taisteluun" },
	{ command: "class", info: "vaihda oma class" },
	{ command: "info", info: "näytä komennot" },
];

const acceptedClasses = Object.values(PlayerClass).map((playerClass) =>
	playerClass.toString()
);
const acceptedClassesAsString = `[${acceptedClasses.join(" | ")}]`;

const acceptedCommandsAsString = (botMention: string): string =>
	acceptedCommands
		.map((command) => {
			let fullCommandInfo = `${botMention} ${command.command}`;
			if (command.command === "class") {
				fullCommandInfo += ` ${acceptedClassesAsString}`;
			}
			fullCommandInfo += ` *(${command.info})*`;
			return fullCommandInfo;
		})
		.join("\n");

class Bot {
	constructor() {
		this.client = new Discord.Client();
		this.gameRunner = new GameRunner();
		this.state = BotState.Waiting;
		this.countdownLeft = 0;
		this.botMention = "";

		this.client.login(process.env.TOKEN);
		this.client.on("ready", this.handleReady);
		this.client.on("message", this.handleMessage);
	}

	client: Discord.Client;
	gameRunner: GameRunner;
	state: BotState;
	countdownLeft: number;
	botMention: string;
	currentParticipantsMessage?: Discord.Message;

	handleReady = () => {
		if (!this.client.user) return;
		this.botMention = `@${this.client.user.username}`;
		console.log(`Logged in as ${this.client.user.tag}!`);
	};

	handleMessage = async (msg: Discord.Message) => {
		if (
			!this.client.user ||
			msg.channel.type !== "text" ||
			!this.messageMentionsBot(msg, this.client.user)
		) {
			return;
		}

		const messageWithoutMentions = msg.content.replace(/<@.*> +/, "");
		const commandWithArgs = this.parseAndValidateCommand(
			messageWithoutMentions
		);

		if (commandWithArgs === null) {
			await this.sendUnknownCommandText(msg);
		} else {
			await this.executeCommand(msg, commandWithArgs);
		}
	};

	executeCommand = async (msg: Discord.Message, commandWithArgs: string[]) => {
		const command = commandWithArgs[0];

		switch (command) {
			case "aloita": {
				if (this.state === BotState.Waiting) {
					this.gameRunner.initializeGame();
					this.addPlayerToGame(msg);
					this.state = BotState.Countdown;
					this.countdownLeft = GAME_COUNTDOWN_SECONDS;
					await this.countDown(msg);
				} else {
					await msg.channel.send(
						`Taistelu on jo alkamassa. Liity taisteluun komennolla ${this.botMention} liity.`
					);
				}
				return;
			}
			case "liity": {
				switch (this.state) {
					case BotState.Countdown: {
						if (!this.gameRunner.playerInGame(msg.author.id))
							this.addPlayerToGame(msg);
						await this.sendPlayersInGameText(msg);
						return;
					}
					case BotState.Waiting: {
						await this.sendNoGameInProgressText(msg);
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
						if (this.gameRunner.getPlayerCount() <= 10) {
							const { playerClass, ...botPlayer } = createNewBotPlayer();
							this.gameRunner.addPlayer(botPlayer);
							this.gameRunner.setPlayerClass(botPlayer.id, playerClass);
							await this.sendPlayersInGameText(msg);
						} else {
							await msg.channel.send(
								"Pelissä on yli 10 pelaajaa. Et voi lisätä enempää botteja."
							);
						}
						return;
					}
					case BotState.Waiting: {
						await this.sendNoGameInProgressText(msg);
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
						`${msg.author.username} on nyt ${newPlayerClass}.`
					);
				} else {
					await msg.channel.send(
						`Valittavat classit: ${acceptedClassesAsString}`
					);
				}
				return;
			}
			case "info": {
				await msg.channel.send(acceptedCommandsAsString(this.botMention));
				return;
			}
			default: {
				return;
			}
		}
	};

	messageMentionsBot = (
		msg: Discord.Message,
		botUser: Discord.ClientUser | null
	): boolean => {
		if (!botUser) return false;
		const mentionedUsers = msg.mentions.users;
		const mentionedRoles = msg.mentions.roles;
		const mentionsBotUser =
			mentionedUsers.size === 1 && mentionedUsers.first()!.id === botUser.id;
		const mentionsBotRole =
			mentionedRoles.size === 1 &&
			mentionedRoles.first()!.members.has(botUser.id);
		return mentionsBotUser || mentionsBotRole;
	};

	parseAndValidateCommand = (rawText: string): string[] | null => {
		const commandWithArgs = rawText.split(" ");
		return acceptedCommands.some(
			(command) => command.command === commandWithArgs[0]
		)
			? commandWithArgs
			: null;
	};

	addPlayerToGame = (msg: Discord.Message) => {
		const avatarURL = msg.author.displayAvatarURL({
			format: "png",
			size: 128,
		});

		this.gameRunner.addPlayer({
			avatarURL,
			name: msg.author.username,
			id: msg.author.id,
		});
	};

	countDown = async (msg: Discord.Message) => {
		if (this.countdownLeft === 0) {
			this.runGame(msg);
			return;
		}
		if (this.countdownLeft % 10 === 0 || this.countdownLeft === 5) {
			await msg.channel.send(
				`Taistelu alkaa ${this.countdownLeft} sekunnin kuluttua.`
			);
		}
		this.countdownLeft -= 1;
		setTimeout(() => this.countDown(msg), 1000);
	};

	runGame = async (msg: Discord.Message) => {
		await this.deleteBotMessages(msg);

		if (this.gameRunner.getPlayerCount() <= 1) {
			await msg.channel.send("Taistelussa oli liian vähän osallistujia.");
		} else {
			this.state = BotState.Rendering;
			const gameStartMessage = await msg.channel.send(
				`**Taistelu alkaa. Osallistujat:**\n${this.gameRunner.getCurrentPlayersWithClasses()}`
			);
			const gameEndData = await this.gameRunner.runGame();
			if (gameStartMessage.deletable) gameStartMessage.delete();
			if (!gameEndData) return;

			const gameEndText = this.getGameEndText(gameEndData);
			await msg.channel.send(gameEndText, { files: ["Areena_fight.mp4"] });
		}
		await msg.channel.send(
			`Aloita uusi taistelu komennolla ${this.botMention} aloita`
		);
		this.state = BotState.Waiting;
	};

	getGameEndText = (gameEndData: GameEndData) => {
		let gameEndText = "";
		if (gameEndData.gameEndReason === GameEndReason.TimeUp) {
			gameEndText = "Taistelu päättyi koska aika loppui kesken";
		} else {
			const winnerName = gameEndData.winnerName;
			const winnerText = winnerName
				? `${winnerName} voitti!`
				: "Kukaan ei voittanut";
			gameEndText = `Taistelu päättyi. ${winnerText}`;
		}
		return gameEndText;
	};

	sendPlayersInGameText = async (msg: Discord.Message) => {
		if (
			this.currentParticipantsMessage &&
			this.currentParticipantsMessage.deletable
		) {
			this.currentParticipantsMessage.delete();
		}
		this.currentParticipantsMessage = await msg.channel.send(
			`**Osallistujat:**\n${this.gameRunner.getCurrentPlayersWithClasses()}\n\nVaihda class komennolla ${
				this.botMention
			} class ${acceptedClassesAsString}`
		);
	};

	sendUnknownCommandText = async (msg: Discord.Message) =>
		await msg.channel.send(
			`Tuntematon komento. Tunnetut komennot:\n${acceptedCommandsAsString(
				this.botMention
			)}`
		);

	sendNoGameInProgressText = async (msg: Discord.Message) =>
		await msg.channel.send(
			`Ei käynnissä olevaa taistelua. Aloita taistelu komennolla ${this.botMention} aloita`
		);

	deleteBotMessages = async (msg: Discord.Message) => {
		startTimer("Fetching messages");
		const messages = await msg.channel.messages.fetch({ limit: 100 });
		logTimer("Fetching messages");
		const messagesToDelete = messages.filter((message) => {
			if (!this.client.user) return false;
			return (
				message.author.id === this.client.user.id ||
				this.messageMentionsBot(message, this.client.user)
			);
		});
		startTimer("Deleting messages");
		await msg.channel.bulkDelete(messagesToDelete);
		logTimer("Deleting messages");
	};
}

new Bot();
