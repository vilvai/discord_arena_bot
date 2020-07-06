import Discord from "discord.js";
import { GameEndData, GameEndReason } from "../shared/types";
import { MAX_PLAYER_COUNT_WITH_BOTS } from "../shared/constants";
import { acceptedClassesAsString, acceptedCommandsAsString } from "./commands";

export const messageMentionsBot = (
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

interface Messages {
	gameStartsIn: (countDownLeft: number) => string;
	gameStarting: (playersWithClasses: string) => string;
	gameEndedOutOfTime: () => string;
	gameEndedPlayerWon: (winnerName: string) => string;
	gameEndedNobodyWon: () => string;
	notEnoughPlayers: () => string;
	startNewGame: (botMention: string) => string;
	noGameInProgress: () => string;
	gameAlreadyStarting: (botMention: string) => string;
	maxPlayerCountWithBotsReached: () => string;
	selectableClasses: () => string;
	classSelected: (userName: string, selectedClass: string) => string;
	unknownCommand: (botMention: string) => string;
	playersInGame: (playersWithClasses: string) => string;
	changeClassWith: (botMention: string) => string;
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
		startNewGame: (botMention: string) =>
			`Aloita uusi taistelu komennolla ${botMention} aloita`,
		noGameInProgress: () => "Ei käynnissä olevaa taistelua.",
		gameAlreadyStarting: (botMention: string) =>
			`Taistelu on jo alkamassa. Liity taisteluun komennolla ${botMention} liity.`,
		maxPlayerCountWithBotsReached: () =>
			`Pelissä on yli ${MAX_PLAYER_COUNT_WITH_BOTS} pelaajaa. Et voi lisätä enempää botteja.`,
		selectableClasses: () => `Valittavat classit: ${acceptedClassesAsString}`,
		classSelected: (userName: string, selectedClass: string) =>
			`${userName} on nyt ${selectedClass}.`,
		unknownCommand: (botMention: string) =>
			`Tuntematon komento. Tunnetut komennot:\n${acceptedCommandsAsString(
				botMention
			)}`,
		playersInGame: (playersWithClasses: string) =>
			`**Osallistujat:**\n${playersWithClasses}`,
		changeClassWith: (botMention: string) =>
			`Vaihda class komennolla ${botMention} class ${acceptedClassesAsString}`,
	},
};
