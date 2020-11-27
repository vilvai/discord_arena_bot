import { Message, MessageEmbed } from "discord.js";

import { MAX_PLAYER_COUNT } from "../../shared/constants";

import { PlayerClass } from "../../shared/types";
import {
	getClassesForLanguage,
	getCommandLabelForLanguage,
	getLanguageOptions,
	getPlayersWithClassesAsString,
	commandWithBotPrefix,
} from "./commands";
import { Language, languages, MessageTranslations } from "../languages";
import { CommandType } from "./types";

export const messageWasSentByGuildOwner = (msg: Message) => {
	if (msg.channel.type !== "text") return false;
	return msg.author.id === msg.channel.guild.ownerID;
};

interface MessageFunctionsWithLogic {
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

export type MessageFunctions = Omit<
	MessageTranslations,
	keyof MessageFunctionsWithLogic
> &
	MessageFunctionsWithLogic;

const messageFunctionsForLanguage = (language: Language): MessageFunctions => {
	const {
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

	const startCommand = getCommandLabelForLanguage(language, CommandType.Start);
	const joinCommand = getCommandLabelForLanguage(language, CommandType.Join);
	const changeClassCommand = `${commandWithBotPrefix(
		getCommandLabelForLanguage(language, CommandType.Class)
	)}. ${selectableClasses(getClassesForLanguage(language))}`;

	const startNewFightWithBotPrefix = () =>
		startNewFight(commandWithBotPrefix(startCommand));

	return {
		fightStarting: (playersWithClasses: Array<[string, PlayerClass]>) => {
			return new MessageEmbed()
				.setColor("#000000")
				.setTitle(fightStarting())
				.addFields({
					name: participants(),
					value: getPlayersWithClassesAsString(language, playersWithClasses),
				});
		},
		startNewFight: startNewFightWithBotPrefix,
		fightAlreadyStarting: () =>
			fightAlreadyStarting(commandWithBotPrefix(joinCommand)),
		gameIsFull: () => gameIsFull(MAX_PLAYER_COUNT),
		selectableClasses: () => selectableClasses(getClassesForLanguage(language)),
		participants: (playersWithClasses: Array<[string, PlayerClass]>) => {
			return new MessageEmbed().setColor("#000000").addFields({
				name: participants(),
				value: `${getPlayersWithClassesAsString(
					language,
					playersWithClasses
				)}\n\n${changeClassWith(changeClassCommand)}`,
			});
		},
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
