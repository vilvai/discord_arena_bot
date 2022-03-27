import { MessageEmbed } from "discord.js";
import type { Message } from "discord.js";

import { MAX_PLAYER_COUNT } from "../../shared/constants";
import {
	formattedCommandWithPrefix,
	formattedWithBotPrefix,
	getCommandsAsString,
} from "./commands";
import { CommandType } from "./types";

import { PlayerClass } from "../../shared/types";

export interface Messages {
	fightInitiated: (playerWhoInitiated: string) => MessageEmbed;
	updatedParticipants: (
		playerWhoJoined: string,
		playersWithClasses: Array<[string, PlayerClass]>
	) => MessageEmbed;
	fightStartsIn: (countdownLeft: number) => MessageEmbed;
	fightStarting: (
		playersWithClasses: Array<[string, PlayerClass]>
	) => MessageEmbed;
	gameIsFull: () => string;
	renderingFailed: () => string;
	noFightInProgress: () => string;
	classSelected: (userName: string, selectedClass: string) => string;
	notEnoughPlayers: () => MessageEmbed;
	cooldown: (
		userName: string,
		authorAvatarURL: string,
		cooldownLeft: number
	) => MessageEmbed;
	welcomeMessage: () => MessageEmbed;
	voteMessage: () => MessageEmbed;
}

export const getPlayersWithClassesAsString = (
	playersWithClasses: Array<[string, PlayerClass]>
) =>
	playersWithClasses
		.map(([playerName, playerClass]) => `${playerName} - \`${playerClass}\``)
		.join("\n");

const MESSAGE_EMBED_COLOR = "#000000";

const formattedStartCommand = formattedCommandWithPrefix(CommandType.Start);
const formattedJoinCommand = formattedCommandWithPrefix(CommandType.Join);
const formattedBotCommand = formattedCommandWithPrefix(CommandType.Bot);
const formattedClassCommand = formattedCommandWithPrefix(CommandType.Class);
const formattedInfoCommand = formattedCommandWithPrefix(CommandType.Help);
const exampleClassCommand = formattedWithBotPrefix(
	`class ${PlayerClass.Spuge}`
);

const startNewFightMessage = `Start a new fight with ${formattedStartCommand}.`;

const welcomeMessageTitle = "Thanks for adding me to your server! 👋";

export const messages: Messages = {
	fightInitiated: (playerWhoInitiated: string) =>
		new MessageEmbed()
			.setColor(MESSAGE_EMBED_COLOR)
			.setTitle(`⚔️ ${playerWhoInitiated} initiated a fight ⚔️`)
			.addFields({
				name: "\u200B",
				value:
					`Other players can join with ${formattedJoinCommand}. ` +
					`You can also add bots with ${formattedBotCommand}. ` +
					`Change your class with ${formattedClassCommand} (e.g. ${exampleClassCommand}). ` +
					`When everyone is ready, write ${formattedStartCommand} again to start the fight.`,
			}),
	updatedParticipants: (
		playerWhoJoined: string,
		playersWithClasses: Array<[string, PlayerClass]>
	) =>
		new MessageEmbed()
			.setColor(MESSAGE_EMBED_COLOR)
			.setTitle(`⚔️ ${playerWhoJoined} joined ⚔️`)
			.addFields({
				name: "Participants:",
				value: getPlayersWithClassesAsString(playersWithClasses),
			}),
	fightStartsIn: (countdownLeft: number) =>
		new MessageEmbed()
			.setColor(MESSAGE_EMBED_COLOR)
			.setTitle(`⚔️ Fight starts in ${countdownLeft} seconds. ⚔️`),
	fightStarting: (playersWithClasses: Array<[string, PlayerClass]>) =>
		new MessageEmbed()
			.setColor(MESSAGE_EMBED_COLOR)
			.setTitle("⚔️ Fight is starting. ⚔️")
			.addFields({
				name: "Participants:",
				value: getPlayersWithClassesAsString(playersWithClasses),
			}),
	gameIsFull: () => `Game is already full (${MAX_PLAYER_COUNT} players).`,
	classSelected: (userName: string, selectedClass: string) =>
		`${userName} is now \`${selectedClass}\`.`,
	notEnoughPlayers: () =>
		new MessageEmbed()
			.setColor(MESSAGE_EMBED_COLOR)
			.setTitle("Not enough players in the fight 😢")
			.addFields({
				name: "\u200B",
				value: startNewFightMessage,
			}),
	renderingFailed: () =>
		`Rendering the video failed 😢\n${startNewFightMessage}`,
	noFightInProgress: () => `No fight in progress.\n${startNewFightMessage}`,
	cooldown: (userName: string, authorAvatarURL: string, cooldownLeft: number) =>
		new MessageEmbed()
			.setColor(MESSAGE_EMBED_COLOR)
			.setAuthor(`${userName}'s cooldown ⏳`, authorAvatarURL)
			.setDescription(
				`You must wait **${cooldownLeft} seconds** before you can initiate a new fight.`
			),
	welcomeMessage: () =>
		new MessageEmbed()
			.setColor(MESSAGE_EMBED_COLOR)
			.setTitle(welcomeMessageTitle)
			.setDescription(
				`You can start a new arena battle with ${formattedStartCommand}. ` +
					`Change your class with ${formattedClassCommand} (for example: ${exampleClassCommand}). ` +
					`For a full list of commands and classes, type ${formattedInfoCommand}.`
			),
	voteMessage: () =>
		new MessageEmbed()
			.setColor(MESSAGE_EMBED_COLOR)
			.setDescription(
				"If you enjoy Arena bot, consider upvoting and/or reviewing it at: https://top.gg/bot/710161541059575864"
			)
			.addFields({
				name: "\u200B",
				value: startNewFightMessage,
			}),
};

export const messageIsWelcomeMessage = (message: Message) =>
	message.embeds.length === 1 &&
	message.embeds[0].title === welcomeMessageTitle;

export const getAcceptedCommands = (): MessageEmbed =>
	new MessageEmbed().setColor(MESSAGE_EMBED_COLOR).addFields({
		name: "Commands:",
		value: getCommandsAsString(),
	});
