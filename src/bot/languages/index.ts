import type { PlayerClass } from "../../shared/types";
import type { CommandType } from "../messages/types";

import english from "./english";
import suomi from "./suomi";

export type Language = "english" | "suomi";

export const DEFAULT_LANGUAGE: Language = "english";

export interface MessageTranslations {
	fightInitiated: () => string;
	waitingForOtherPlayers: (joinCommand: string, botCommand: string) => string;
	fightStartsIn: (countdownLeft: number) => string;
	fightStarting: () => string;
	fightEndedTimesUp: () => string;
	fightEndedWinner: () => string;
	fightEndedTie: () => string;
	notEnoughPlayers: () => string;
	startNewFight: (startCommand: string) => string;
	noFightInProgress: () => string;
	fightAlreadyStarting: (joinCommand: string) => string;
	gameIsFull: (maxPlayerCount: number) => string;
	selectableClasses: (selectableClasses: string) => string;
	classSelected: (userName: string, selectedClass: string) => string;
	participants: () => string;
	changeClassWith: (changeClassCommand: string) => string;
	onlyOwnerCanChangeLanguage: () => string;
	languageChanged: () => string;
	selectableLanguages: (selectableLanguages: string) => string;
	renderingFailed: (startNewFightMessage: string) => string;
	generalCommands: () => string;
	adminCommands: () => string;
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

export const findClassLabelForLanguage = (
	language: Language,
	playerClass: PlayerClass
): string =>
	languages[language].commandTranslations[4].playerClassTranslations[
		playerClass
	];

export const findCommandByLabel = (language: Language, label: string) =>
	languages[language].commandTranslations.find(
		(acceptedCommand) => acceptedCommand.label === label
	);

export const getCommandLabelForLanguage = (
	language: Language,
	commandType: CommandType
): string =>
	languages[language].commandTranslations.find(
		(command) => command.type === commandType
	)!.label;

export const getPlayersWithClassesAsString = (
	language: Language,
	playersWithClasses: Array<[string, PlayerClass]>
) =>
	playersWithClasses
		.map(
			([playerName, playerClass]) =>
				`${playerName} - \`${findClassLabelForLanguage(
					language,
					playerClass
				)}\``
		)
		.join("\n");

export const getClassesForLanguage = (language: Language): string =>
	optionsToString(
		Object.values(
			languages[language].commandTranslations[4].playerClassTranslations
		)
	);

export const getLanguageOptions = () => optionsToString(Object.keys(languages));

export const optionsToString = (options: string[]): string =>
	`${options.map((option) => `\`${option}\``).join(", ")}`;
