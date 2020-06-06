import Discord, { MessageOptions } from "discord.js";

import { PlayerClass } from "../shared/types";
import GameRunner from "./GameRunner";
import { createUniqueBotPlayers } from "../shared/bots";

require("dotenv").config();

const client = new Discord.Client();

let gameRunner: GameRunner;

const botCommandStartString = "/areena ";
const acceptedCommands = [
	{ command: "aloita", args: [], info: "aloita peli" },
	{ command: "liity", args: [], info: "liity peliin" },
	{ command: "botti", args: [], info: "lisää botti peliin" },
	{
		command: "class",
		args: Object.values(PlayerClass).map((playerClass) =>
			playerClass.toString()
		),
		info: "vaihda oma class",
	},
	{ command: "info", args: [], info: "näytä komennot" },
];

client.on("ready", () => {
	if (!client.user) return;
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", async (msg) => {
	if (!client.user) return;
	if (msg.author.id === client.user.id) return;

	const command = parseAndValidateCommand(msg.toString());

	if (command === null) {
		sendUnknownCommandText(msg);
		return;
	} else {
		executeCommand(msg, command);
	}
});

client.login(process.env.TOKEN);

const parseAndValidateCommand = (rawText: string): string[] | null => {
	if (!rawText.startsWith(botCommandStartString)) {
		return null;
	}

	const possibleCommand = rawText.split(botCommandStartString)[1];
	if (!possibleCommand) {
		return null;
	}

	const commandWithArgs = possibleCommand.split(" ");
	if (
		acceptedCommands.some(
			(command) =>
				command.command === commandWithArgs[0] &&
				(command.args.length === 0 || command.args.includes(commandWithArgs[1]))
		)
	) {
		return commandWithArgs;
	} else {
		return null;
	}
};

type SendMessageFunction = (message: string, options?: MessageOptions) => void;

const sendUnknownCommandText = (msg: Discord.Message) => {
	const fullAcceptedCommands = acceptedCommands.map((command) => {
		let fullCommandInfo = `${botCommandStartString}${command.command}`;
		if (command.args.length > 0) {
			fullCommandInfo += ` [${command.args.join(" | ")}]`;
		}
		fullCommandInfo += ` *(${command.info})*`;
		return fullCommandInfo;
	});

	const botResponse = `Tuntematon komento. Tunnetut komennot:\n${fullAcceptedCommands.join(
		"\n"
	)}`;
	msg.channel.send(botResponse);
};

const executeCommand = async (msg: Discord.Message, command: string[]) => {
	switch (command[0]) {
		case "aloita":
			break;
		case "liity":
			break;
		case "botti":
			break;
		case "class":
			break;
		case "info":
			break;
		default:
			break;
	}
	msg.channel.send("Peli alkaa...");

	gameRunner = new GameRunner();

	const avatarURL = msg.author.displayAvatarURL({
		format: "png",
		size: 128,
	});

	gameRunner.addPlayer({
		avatarURL,
		playerClass: PlayerClass.Chungus,
		name: msg.author.username,
		id: msg.author.id,
	});

	createUniqueBotPlayers(4).forEach((botPlayer) =>
		gameRunner.addPlayer(botPlayer)
	);
	await gameRunner.initializeGame();

	await gameRunner.runGame();

	msg.channel.send("", { files: ["Areena_fight.mp4"] });
};
