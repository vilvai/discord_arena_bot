import Discord from "discord.js";

import { PlayerClass, GameEndReason, GameEndData } from "../shared/types";
import GameRunner from "./GameRunner";
import { createNewBotPlayer } from "../shared/bots";
import { GAME_COUNTDOWN_SECONDS } from "../shared/constants";
import { startTimer, logTimer } from "../shared/timer";

require("dotenv").config();

const client = new Discord.Client();

const gameRunner: GameRunner = new GameRunner();

enum BotState {
	Waiting = "waiting",
	Countdown = "countdown",
	Rendering = "rendering",
}

let botState: BotState = BotState.Waiting;
let countDownLeft = 0;
let currentParticipantMessage: Discord.Message;

let botMention = "";
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

let acceptedCommandsAsString = "";
const setAcceptedCommandsAsString = () => {
	acceptedCommandsAsString = acceptedCommands
		.map((command) => {
			let fullCommandInfo = `${botMention} ${command.command}`;
			if (command.command === "class") {
				fullCommandInfo += ` ${acceptedClassesAsString}`;
			}
			fullCommandInfo += ` *(${command.info})*`;
			return fullCommandInfo;
		})
		.join("\n");
};

client.login(process.env.TOKEN);

client.on("ready", () => {
	if (!client.user) return;
	botMention = `@${client.user.username}`;
	setAcceptedCommandsAsString();
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", async (msg) => {
	if (!client.user || msg.channel.type !== "text" || !messageMentionsBot(msg)) {
		return;
	}

	const messageWithoutMention = msg.content.replace(/<@.*> +/, "");
	const command = parseAndValidateCommand(messageWithoutMention);

	if (command === null) {
		sendUnknownCommandText(msg);
	} else {
		executeCommand(msg, command);
	}
});

const messageMentionsBot = (msg: Discord.Message): boolean => {
	if (!client.user) return false;
	const mentionedUsers = msg.mentions.users;
	const mentionedRoles = msg.mentions.roles;
	const mentionsBotUser =
		mentionedUsers.size === 1 && mentionedUsers.first()!.id === client.user.id;
	const mentionsBotRole =
		mentionedRoles.size === 1 &&
		mentionedRoles.first()!.members.has(client.user.id);
	return mentionsBotUser || mentionsBotRole;
};

const parseAndValidateCommand = (rawText: string): string[] | null => {
	const commandWithArgs = rawText.split(" ");
	return acceptedCommands.some(
		(command) => command.command === commandWithArgs[0]
	)
		? commandWithArgs
		: null;
};

const executeCommand = async (
	msg: Discord.Message,
	commandWithArgs: string[]
) => {
	const command = commandWithArgs[0];

	switch (command) {
		case "aloita": {
			if (botState === BotState.Waiting) {
				gameRunner.initializeGame();
				addPlayerToGame(msg);
				botState = BotState.Countdown;
				countDownLeft = GAME_COUNTDOWN_SECONDS;
				await msg.channel.send(
					`Taistelu alkaa ${countDownLeft} sekunnin kuluttua. Liittykää taisteluun komennolla ${botMention} liity`
				);
				setTimeout(() => countDown(msg), 1000);
			} else {
				await msg.channel.send(
					`Taistelu on jo alkamassa. Liity taisteluun komennolla ${botMention} liity.`
				);
			}
			return;
		}
		case "liity": {
			switch (botState) {
				case BotState.Countdown: {
					if (!gameRunner.playerInGame(msg.author.id)) addPlayerToGame(msg);
					await sendPlayersInGameText(msg);
					return;
				}
				case BotState.Waiting: {
					await sendNoGameInProgressText(msg);
					return;
				}
				default: {
					return;
				}
			}
		}
		case "botti": {
			switch (botState) {
				case BotState.Countdown: {
					if (gameRunner.getPlayerCount() <= 10) {
						const { playerClass, ...botPlayer } = createNewBotPlayer();
						gameRunner.addPlayer(botPlayer);
						gameRunner.setPlayerClass(botPlayer.id, playerClass);
						await sendPlayersInGameText(msg);
					} else {
						await msg.channel.send(
							"Pelissä on yli 10 pelaajaa. Et voi lisätä enempää botteja."
						);
					}
					return;
				}
				case BotState.Waiting: {
					await sendNoGameInProgressText(msg);
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
				gameRunner.setPlayerClass(msg.author.id, newPlayerClass);
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
			await msg.channel.send(acceptedCommandsAsString);
			return;
		}
		default: {
			return;
		}
	}
};

const addPlayerToGame = (msg: Discord.Message) => {
	const avatarURL = msg.author.displayAvatarURL({
		format: "png",
		size: 128,
	});

	gameRunner.addPlayer({
		avatarURL,
		name: msg.author.username,
		id: msg.author.id,
	});
};

const countDown = async (msg: Discord.Message) => {
	countDownLeft -= 1;
	if (countDownLeft === 0) {
		runGame(msg);
		return;
	}
	if (countDownLeft % 10 === 0 || countDownLeft === 5) {
		await msg.channel.send(
			`Taistelu alkaa ${countDownLeft} sekunnin kuluttua.`
		);
	}
	setTimeout(() => countDown(msg), 1000);
};

const runGame = async (msg: Discord.Message) => {
	await deleteBotMessages(msg);

	if (gameRunner.getPlayerCount() <= 1) {
		await msg.channel.send("Taistelussa oli liian vähän osallistujia.");
	} else {
		botState = BotState.Rendering;
		const gameStartMessage = await msg.channel.send(
			`**Taistelu alkaa. Osallistujat:**\n${gameRunner.getCurrentPlayersWithClasses()}`
		);
		const gameEndData = await gameRunner.runGame();
		if (gameStartMessage.deletable) gameStartMessage.delete();
		if (!gameEndData) return;

		const gameEndText = getGameEndText(gameEndData);
		await msg.channel.send(gameEndText, { files: ["Areena_fight.mp4"] });
	}
	await msg.channel.send(
		`Aloita uusi taistelu komennolla ${botMention} aloita`
	);
	botState = BotState.Waiting;
};

const getGameEndText = (gameEndData: GameEndData) => {
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

const sendPlayersInGameText = async (msg: Discord.Message) => {
	if (currentParticipantMessage && currentParticipantMessage.deletable) {
		currentParticipantMessage.delete();
	}
	currentParticipantMessage = await msg.channel.send(
		`**Osallistujat:**\n${gameRunner.getCurrentPlayersWithClasses()}\n\nVaihda class komennolla ${botMention} class ${acceptedClassesAsString}`
	);
};

const sendUnknownCommandText = async (msg: Discord.Message) =>
	await msg.channel.send(
		`Tuntematon komento. Tunnetut komennot:\n${acceptedCommandsAsString}`
	);

const sendNoGameInProgressText = async (msg: Discord.Message) =>
	await msg.channel.send(
		`Ei käynnissä olevaa taistelua. Aloita taistelu komennolla ${botMention} aloita`
	);

const deleteBotMessages = async (msg: Discord.Message) => {
	startTimer("Fetching messages");
	const messages = await msg.channel.messages.fetch({ limit: 100 });
	logTimer("Fetching messages");
	const messagesToDelete = messages.filter((message) => {
		if (!client.user) return false;
		return message.author.id === client.user.id || messageMentionsBot(message);
	});
	startTimer("Deleting messages");
	await msg.channel.bulkDelete(messagesToDelete);
	logTimer("Deleting messages");
};
