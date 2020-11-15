import Discord from "discord.js";

import { GameEndData, GameEndReason } from "../shared/types";
import { MAX_PLAYER_COUNT_WITH_BOTS } from "../shared/constants";
import { acceptedClassesAsString, acceptedCommandsAsString } from "./commands";

let botMention: string = "";

export const setBotMention = (newBotMention: string) => {
	botMention = newBotMention;
};

export const getBotMention = () => botMention;

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

interface Messages {
	gameStartsIn: (countDownLeft: number) => string;
	gameStarting: (playersWithClasses: string) => string;
	gameEndedOutOfTime: () => string;
	gameEndedPlayerWon: (winnerName: string) => string;
	gameEndedNobodyWon: () => string;
	notEnoughPlayers: () => string;
	startNewGame: () => string;
	noGameInProgress: () => string;
	gameAlreadyStarting: () => string;
	maxPlayerCountWithBotsReached: () => string;
	selectableClasses: () => string;
	classSelected: (userName: string, selectedClass: string) => string;
	unknownCommand: () => string;
	playersInGame: (playersWithClasses: string) => string;
	changeClassWith: () => string;
}

export interface MessagesByLanguage {
	finnish: Messages;
}

export const constructGameEndText = (
	language: keyof MessagesByLanguage,
	gameEndData: GameEndData
) => {
	let gameEndText = "";
	if (gameEndData.gameEndReason === GameEndReason.TimeUp) {
		gameEndText = MESSAGES[language].gameEndedOutOfTime();
	} else {
		const winnerName = gameEndData.winnerName;
		gameEndText = winnerName
			? MESSAGES[language].gameEndedPlayerWon(winnerName)
			: MESSAGES[language].gameEndedNobodyWon();
	}
	return gameEndText;
};

export const MESSAGES: MessagesByLanguage = {
	finnish: {
		gameStartsIn: (countdownLeft: number) =>
			`Taistelu alkaa ${countdownLeft} sekunnin kuluttua.`,
		gameStarting: (playersWithClasses: string) =>
			`**Taistelu alkaa.** ${MESSAGES.finnish.playersInGame(
				playersWithClasses
			)}`,
		gameEndedOutOfTime: () => "Taistelu päättyi koska aika loppui kesken",
		gameEndedPlayerWon: (winnerName: string) =>
			`Taistelu päättyi. ${winnerName} voitti!`,
		gameEndedNobodyWon: () => "Taistelu päättyi ilman voittajaa.",
		notEnoughPlayers: () => "Taistelussa oli liian vähän osallistujia.",
		startNewGame: () => `Aloita uusi taistelu komennolla ${botMention} aloita`,
		noGameInProgress: () => "Ei käynnissä olevaa taistelua.",
		gameAlreadyStarting: () =>
			`Taistelu on jo alkamassa. Liity taisteluun komennolla ${botMention} liity.`,
		maxPlayerCountWithBotsReached: () =>
			`Pelissä on yli ${MAX_PLAYER_COUNT_WITH_BOTS} pelaajaa. Et voi lisätä enempää botteja.`,
		selectableClasses: () => `Valittavat classit: ${acceptedClassesAsString}`,
		classSelected: (userName: string, selectedClass: string) =>
			`${userName} on nyt ${selectedClass}.`,
		unknownCommand: () =>
			`Tuntematon komento. Tunnetut komennot:\n${acceptedCommandsAsString()}`,
		playersInGame: (playersWithClasses: string) =>
			`**Osallistujat:**\n${playersWithClasses}`,
		changeClassWith: () =>
			`Vaihda class komennolla ${botMention} class ${acceptedClassesAsString}`,
	},
};
