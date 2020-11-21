import { PlayerClass } from "../../shared/types";
import { CommandType } from "../messages/types";

import english from "./english";
import suomi from "./suomi";

export type Language = "english" | "suomi";

export const DEFAULT_LANGUAGE: Language = "suomi";

export interface MessageTranslations {
	fightStartsIn: (countdownLeft: number) => string;
	fightStarting: (playersInFight: string) => string;
	fightEndedOutOfTime: () => string;
	fightEndedPlayerWon: (winnerName: string) => string;
	fightEndedNobodyWon: () => string;
	notEnoughPlayers: () => string;
	startNewFight: (startCommand: string) => string;
	noFightInProgress: () => string;
	fightAlreadyStarting: (joinCommand: string) => string;
	gameIsFull: (maxPlayerCount: number) => string;
	selectableClasses: (selectableClasses: string) => string;
	classSelected: (userName: string, selectedClass: string) => string;
	unknownCommand: (knownCommands: string) => string;
	playersInFight: (playersWithClasses: string) => string;
	changeClassWith: (changeClassCommand: string) => string;
	onlyOwnerCanChangeLanguage: () => string;
	languageChanged: () => string;
	selectableLanguages: (selectableLanguages: string) => string;
	renderingFailed: (startNewFightMessage: string) => string;
}

interface CommandTranslation<T extends CommandType> {
	type: T;
	label: string;
	info: string;
}

type PlayerClassTranslations = { [P in PlayerClass]: string };

export interface Translations {
	messageTranslations: MessageTranslations;
	commandTranslations: [
		CommandTranslation<CommandType.Start>,
		CommandTranslation<CommandType.Join>,
		CommandTranslation<CommandType.Bot>,
		CommandTranslation<CommandType.Info>,
		CommandTranslation<CommandType.Class> & {
			playerClassTranslations: PlayerClassTranslations;
		},
		CommandTranslation<CommandType.Language>
	];
}

export const languages: { [L in Language]: Translations } = {
	english,
	suomi,
};
