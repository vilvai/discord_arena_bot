import { MessageEmbed } from "discord.js";

import { MAX_PLAYER_COUNT } from "../../shared/constants";
import {
	formattedCommandWithPrefix,
	getCommandsAsString,
	selectableClassesAsString,
} from "./commands";
import { CommandType } from "./types";

import type { PlayerClass } from "../../shared/types";

export interface Messages {
	fightInitiated: (
		playersWithClasses: Array<[string, PlayerClass]>
	) => MessageEmbed;
	fightStartsIn: (countdownLeft: number) => MessageEmbed;
	fightStarting: (
		playersWithClasses: Array<[string, PlayerClass]>
	) => MessageEmbed;
	startNewFight: () => string;
	gameIsFull: () => string;
	selectableClasses: () => string;
	renderingFailed: () => string;
	noFightInProgress: () => string;
	classSelected: (userName: string, selectedClass: string) => string;
	notEnoughPlayers: () => string;
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

const startNewFightMessage = `Start a new fight with ${formattedStartCommand}.`;

export const messages: Messages = {
	fightInitiated: (playersWithClasses: Array<[string, PlayerClass]>) =>
		new MessageEmbed()
			.setColor(MESSAGE_EMBED_COLOR)
			.setTitle("⚔️ Fight initiated ⚔️")
			.addFields(
				{
					name: "Participants:",
					value: getPlayersWithClassesAsString(playersWithClasses),
				},
				{
					name: "\u200B",
					value:
						`Players can join with ${formattedJoinCommand}. ` +
						`You can also add bots with ${formattedBotCommand}. ` +
						`Change your class with ${formattedClassCommand}. ` +
						`When everyone is ready, write ${formattedStartCommand} again to start the fight.`,
				}
			),
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
	selectableClasses: () => `Selectable classes: ${selectableClassesAsString}.`,
	classSelected: (userName: string, selectedClass: string) =>
		`${userName} is now \`${selectedClass}\`.`,
	notEnoughPlayers: () => "Not enough players in the fight.",
	startNewFight: () => startNewFightMessage,
	renderingFailed: () =>
		`Rendering the video failed 😢\n${startNewFightMessage}`,
	noFightInProgress: () => `No fight in progress.\n${startNewFightMessage}`,
};

export const getAcceptedCommands = (): MessageEmbed =>
	new MessageEmbed().setColor(MESSAGE_EMBED_COLOR).addFields({
		name: "Commands:",
		value: getCommandsAsString(),
	});
