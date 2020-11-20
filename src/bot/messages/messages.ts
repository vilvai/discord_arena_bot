import Discord from "discord.js";
import { MAX_PLAYER_COUNT } from "../../shared/constants";

import { GameEndData, GameEndReason, PlayerClass } from "../../shared/types";
import {
	getAcceptedCommandsForLanguage,
	getClassesForLanguage,
	getCommandLabelForLanguage,
	getLanguageOptions,
	getPlayersWithClassesAsString,
} from "./commands";
import { Language, languages, MessageTranslations } from "../languages";
import { CommandType } from "./types";
import { withBotMention } from "./botMention";

export const messageMentionsBot = (
	msg: Discord.Message,
	botUserId: string
): boolean => {
	const mentionedUsers = msg.mentions.users;
	const mentionedRoles = msg.mentions.roles;
	const mentionsBotUser =
		mentionedUsers.size === 1 && mentionedUsers.first()!.id === botUserId;
	const mentionsBotRole =
		mentionedRoles.size === 1 && mentionedRoles.first()!.members.has(botUserId);
	return mentionsBotUser || mentionsBotRole;
};

export const messageWasSentByGuildOwner = (msg: Discord.Message) => {
	if (msg.channel.type !== "text") return false;
	return msg.author.id === msg.channel.guild.ownerID;
};

interface MessageFunctionsWithLogic {
	fightStarting: (playersWithClasses: Array<[string, PlayerClass]>) => string;
	startNewFight: () => string;
	fightAlreadyStarting: () => string;
	gameIsFull: () => string;
	selectableClasses: () => string;
	unknownCommand: () => string;
	playersInFight: (playersWithClasses: Array<[string, PlayerClass]>) => string;
	changeClassWith: () => string;
	selectableLanguages: () => string;
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
		unknownCommand,
		playersInFight,
		changeClassWith,
		selectableLanguages,
		...restTranslations
	} = languages[language].messageTranslations;

	const startCommand = getCommandLabelForLanguage(language, CommandType.Start);
	const joinCommand = getCommandLabelForLanguage(language, CommandType.Join);
	const changeClassCommand = `${getCommandLabelForLanguage(
		language,
		CommandType.Class
	)} ${getClassesForLanguage(language)}`;

	return {
		fightStarting: (playersWithClasses: Array<[string, PlayerClass]>) => {
			const playersWithClassesAsString = getPlayersWithClassesAsString(
				language,
				playersWithClasses
			);
			return fightStarting(playersWithClassesAsString);
		},
		startNewFight: () => startNewFight(withBotMention(startCommand)),
		fightAlreadyStarting: () =>
			fightAlreadyStarting(withBotMention(joinCommand)),
		gameIsFull: () => gameIsFull(MAX_PLAYER_COUNT),
		selectableClasses: () => selectableClasses(getClassesForLanguage(language)),
		unknownCommand: () =>
			unknownCommand(getAcceptedCommandsForLanguage(language)),
		playersInFight: (playersWithClasses: Array<[string, PlayerClass]>) => {
			const playersWithClassesAsString = getPlayersWithClassesAsString(
				language,
				playersWithClasses
			);
			return playersInFight(playersWithClassesAsString);
		},
		changeClassWith: () => changeClassWith(withBotMention(changeClassCommand)),
		selectableLanguages: () => selectableLanguages(getLanguageOptions()),
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

export const constructGameEndText = (
	language: Language,
	gameEndData: GameEndData
) => {
	let gameEndText = "";
	if (gameEndData.gameEndReason === GameEndReason.TimeUp) {
		gameEndText = messagesByLanguage[language].fightEndedOutOfTime();
	} else {
		const winnerName = gameEndData.winnerName;
		gameEndText = winnerName
			? messagesByLanguage[language].fightEndedPlayerWon(winnerName)
			: messagesByLanguage[language].fightEndedNobodyWon();
	}
	return gameEndText;
};
