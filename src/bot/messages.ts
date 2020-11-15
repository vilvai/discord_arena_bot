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
	fightStartsIn: (countdownLeft: number) => string;
	fightStarting: (playersWithClasses: string) => string;
	fightEndedOutOfTime: () => string;
	fightEndedPlayerWon: (winnerName: string) => string;
	fightEndedNobodyWon: () => string;
	notEnoughPlayers: () => string;
	startNewFight: () => string;
	noFightInProgress: () => string;
	fightAlreadyStarting: () => string;
	maxPlayerCountWithBotsReached: () => string;
	selectableClasses: () => string;
	classSelected: (userName: string, selectedClass: string) => string;
	unknownCommand: () => string;
	playersInFight: (playersWithClasses: string) => string;
	changeClassWith: () => string;
}

export type Language = "finnish" | "english";

type MessagesByLanguage = { [L in Language]: Messages };

export const constructGameEndText = (
	language: keyof MessagesByLanguage,
	gameEndData: GameEndData
) => {
	let gameEndText = "";
	if (gameEndData.gameEndReason === GameEndReason.TimeUp) {
		gameEndText = MESSAGES[language].fightEndedOutOfTime();
	} else {
		const winnerName = gameEndData.winnerName;
		gameEndText = winnerName
			? MESSAGES[language].fightEndedPlayerWon(winnerName)
			: MESSAGES[language].fightEndedNobodyWon();
	}
	return gameEndText;
};

export const MESSAGES: MessagesByLanguage = {
	finnish: {
		fightStartsIn: (countdownLeft: number) =>
			`Taistelu alkaa ${countdownLeft} sekunnin kuluttua.`,
		fightStarting: (playersWithClasses: string) =>
			`**Taistelu alkaa.** ${MESSAGES.finnish.playersInFight(
				playersWithClasses
			)}`,
		fightEndedOutOfTime: () => "Taistelu päättyi koska aika loppui kesken",
		fightEndedPlayerWon: (winnerName: string) =>
			`Taistelu päättyi. ${winnerName} voitti!`,
		fightEndedNobodyWon: () => "Taistelu päättyi ilman voittajaa.",
		notEnoughPlayers: () => "Taistelussa oli liian vähän osallistujia.",
		startNewFight: () => `Aloita uusi taistelu komennolla ${botMention} aloita`,
		noFightInProgress: () => "Ei käynnissä olevaa taistelua.",
		fightAlreadyStarting: () =>
			`Taistelu on jo alkamassa. Liity taisteluun komennolla ${botMention} liity.`,
		maxPlayerCountWithBotsReached: () =>
			`Pelissä on yli ${MAX_PLAYER_COUNT_WITH_BOTS} pelaajaa. Et voi lisätä enempää botteja.`,
		selectableClasses: () => `Valittavat classit: ${acceptedClassesAsString}`,
		classSelected: (userName: string, selectedClass: string) =>
			`${userName} on nyt ${selectedClass}.`,
		unknownCommand: () =>
			`Tuntematon komento. Tunnetut komennot:\n${acceptedCommandsAsString()}`,
		playersInFight: (playersWithClasses: string) =>
			`**Osallistujat:**\n${playersWithClasses}`,
		changeClassWith: () =>
			`Vaihda class komennolla ${botMention} class ${acceptedClassesAsString}`,
	},
	english: {
		fightStartsIn: (countdownLeft: number) =>
			`Fight starts in ${countdownLeft} seconds.`,
		fightStarting: (playersWithClasses: string) =>
			`**Fight is starting.** ${MESSAGES.english.playersInFight(
				playersWithClasses
			)}`,
		fightEndedOutOfTime: () => "Fight ended because time ran out",
		fightEndedPlayerWon: (winnerName: string) =>
			`Fight ended. ${winnerName} won!`,
		fightEndedNobodyWon: () => "Fight ended without a winner.",
		notEnoughPlayers: () => "Not enough players in the fight.",
		startNewFight: () => `Start a new fight with ${botMention} aloita`,
		noFightInProgress: () => "No fight in progress.",
		fightAlreadyStarting: () =>
			`Fight is already starting. Join the fight with ${botMention} liity.`,
		maxPlayerCountWithBotsReached: () =>
			`Max player count reached (${MAX_PLAYER_COUNT_WITH_BOTS}). You can't add more bots.`,
		selectableClasses: () => `Selectable classes: ${acceptedClassesAsString}`,
		classSelected: (userName: string, selectedClass: string) =>
			`${userName} is now ${selectedClass}.`,
		unknownCommand: () =>
			`Unknown command. Accepted commands:\n${acceptedCommandsAsString()}`,
		playersInFight: (playersWithClasses: string) =>
			`**Participants:**\n${playersWithClasses}`,
		changeClassWith: () =>
			`Change your class with ${botMention} class ${acceptedClassesAsString}`,
	},
};
