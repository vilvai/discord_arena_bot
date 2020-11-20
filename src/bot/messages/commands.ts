import { PlayerClass } from "../../shared/types";
import { Language, languages } from "../languages";
import { withBotMention } from "./botMention";
import { CommandType } from "./types";

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

export const findClassLabelForLanguage = (
	language: Language,
	playerClass: PlayerClass
): string =>
	languages[language].commandTranslations[4].playerClassTranslations[
		playerClass
	];

export const getPlayersWithClassesAsString = (
	language: Language,
	playersWithClasses: Array<[string, PlayerClass]>
) =>
	playersWithClasses
		.map(
			([playerName, playerClass]) =>
				`${playerName} - ${findClassLabelForLanguage(language, playerClass)}`
		)
		.join("\n");

export const getClassesForLanguage = (language: Language): string =>
	optionsToString(
		Object.values(
			languages[language].commandTranslations[4].playerClassTranslations
		)
	);

export const getLanguageOptions = () => optionsToString(Object.keys(languages));

const optionsToString = (options: string[]): string =>
	`[${options.join(" | ")}]`;

export const getAcceptedCommandsForLanguage = (language: Language): string => {
	return languages[language].commandTranslations
		.map((command) => {
			let fullCommandInfo = withBotMention(command.label);
			if (command.type === CommandType.Class) {
				fullCommandInfo += ` ${getClassesForLanguage(language)}`;
			} else if (command.type === CommandType.Language) {
				fullCommandInfo += ` ${getLanguageOptions()}`;
			}
			fullCommandInfo += ` *(${command.info})*`;
			return fullCommandInfo;
		})
		.join("\n");
};

export const parseCommand = (
	language: Language,
	rawText: string
): string[] | null => {
	const commandWithArgs = rawText.split(" ");
	return languages[language].commandTranslations.some(
		(command) => command.label === commandWithArgs[0]
	)
		? commandWithArgs
		: null;
};
