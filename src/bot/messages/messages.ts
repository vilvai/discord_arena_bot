import { MessageEmbed } from "discord.js";
import type { Message } from "discord.js";

import { MAX_PLAYER_COUNT } from "../../shared/constants";
import {
	formattedCommandWithPrefix,
	getCommandsAsStringForLanguage,
} from "./commands";
import {
	getClassesForLanguage,
	getLanguageOptions,
	getPlayersWithClassesAsString,
	Language,
	languages,
	MessageTranslations,
} from "../languages";
import { CommandType } from "./types";
import type { PlayerClass } from "../../shared/types";

export const messageWasSentByGuildOwner = (msg: Message) => {
	if (msg.channel.type !== "text") return false;
	return msg.author.id === msg.channel.guild.ownerID;
};

const MESSAGE_EMBED_COLOR = "#000000";

interface MessageFunctionsWithLogic {
	fightInitiated: () => MessageEmbed;
	fightStartsIn: (countdownLeft: number) => MessageEmbed;
	fightStarting: (
		playersWithClasses: Array<[string, PlayerClass]>
	) => MessageEmbed;
	startNewFight: () => string;
	fightAlreadyStarting: () => string;
	gameIsFull: () => string;
	selectableClasses: () => string;
	participants: (
		playersWithClasses: Array<[string, PlayerClass]>
	) => MessageEmbed;
	changeClassWith: () => string;
	selectableLanguages: () => string;
	renderingFailed: () => string;
}

type NotDirectlyCallableMessageTranslations = "waitingForOtherPlayers";

export type MessageFunctions = Omit<
	MessageTranslations,
	keyof MessageFunctionsWithLogic | NotDirectlyCallableMessageTranslations
> &
	MessageFunctionsWithLogic;

const messageFunctionsForLanguage = (language: Language): MessageFunctions => {
	const {
		fightInitiated,
		waitingForOtherPlayers,
		fightStartsIn,
		fightStarting,
		startNewFight,
		fightAlreadyStarting,
		gameIsFull,
		selectableClasses,
		participants,
		changeClassWith,
		selectableLanguages,
		renderingFailed,
		...restTranslations
	} = languages[language].messageTranslations;

	const startCommand = formattedCommandWithPrefix(language, CommandType.Start);
	const joinCommand = formattedCommandWithPrefix(language, CommandType.Join);
	const botCommand = formattedCommandWithPrefix(language, CommandType.Bot);
	const changeClassCommand = `${formattedCommandWithPrefix(
		language,
		CommandType.Class
	)}. ${selectableClasses(getClassesForLanguage(language))}`;

	const startNewFightWithBotPrefix = () => startNewFight(startCommand);

	return {
		fightInitiated: () =>
			new MessageEmbed()
				.setColor(MESSAGE_EMBED_COLOR)
				.setTitle(`⚔️ ${fightInitiated()} ⚔️`)
				.addFields({
					name: "\u200B",
					value: waitingForOtherPlayers(joinCommand, botCommand),
				}),
		fightStartsIn: (countdownLeft: number) =>
			new MessageEmbed()
				.setColor(MESSAGE_EMBED_COLOR)
				.setTitle(`⚔️ ${fightStartsIn(countdownLeft)} ⚔️`),
		fightStarting: (playersWithClasses: Array<[string, PlayerClass]>) =>
			new MessageEmbed()
				.setColor(MESSAGE_EMBED_COLOR)
				.setTitle(`⚔️ ${fightStarting()} ⚔️`)
				.addFields({
					name: participants(),
					value: getPlayersWithClassesAsString(language, playersWithClasses),
				}),
		startNewFight: startNewFightWithBotPrefix,
		fightAlreadyStarting: () => fightAlreadyStarting(joinCommand),
		gameIsFull: () => gameIsFull(MAX_PLAYER_COUNT),
		selectableClasses: () => selectableClasses(getClassesForLanguage(language)),
		participants: (playersWithClasses: Array<[string, PlayerClass]>) =>
			new MessageEmbed().setColor(MESSAGE_EMBED_COLOR).addFields({
				name: participants(),
				value: `${getPlayersWithClassesAsString(
					language,
					playersWithClasses
				)}\n\n${changeClassWith(changeClassCommand)}`,
			}),
		changeClassWith: () => changeClassWith(changeClassCommand),
		selectableLanguages: () => selectableLanguages(getLanguageOptions()),
		renderingFailed: () => renderingFailed(startNewFightWithBotPrefix()),
		...restTranslations,
	};
};

type MessagesByLanguage = { [L in Language]: MessageFunctions };

export const messagesByLanguage: MessagesByLanguage = Object.keys(
	languages
).reduce<MessagesByLanguage>(
	(messagesByLanguage, language) => ({
		...messagesByLanguage,
		[language]: messageFunctionsForLanguage(language as Language),
	}),
	{} as MessagesByLanguage
);

export const getAcceptedCommandsForLanguage = (
	language: Language
): MessageEmbed =>
	new MessageEmbed().setColor(MESSAGE_EMBED_COLOR).addFields(
		{
			name: `${languages[language].messageTranslations.generalCommands()}:`,
			value: getCommandsAsStringForLanguage(language, "general"),
		},
		{
			name: `${languages[language].messageTranslations.adminCommands()}:`,
			value: getCommandsAsStringForLanguage(language, "admin"),
		}
	);
