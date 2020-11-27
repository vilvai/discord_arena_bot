import {
	getLanguageOptions,
	Language,
	languages,
	optionsToString,
} from "../languages";
import { adminOnlyCommands, CommandType } from "./types";

export const BOT_PREFIX = "arena ";

export const commandWithBotPrefix = (command: string) =>
	`\`${BOT_PREFIX}${command}\``;

export const getCommandsAsStringForLanguage = (
	language: Language,
	type: "admin" | "general"
): string =>
	languages[language].commandTranslations
		.filter((command) =>
			type === "admin"
				? adminOnlyCommands.includes(command.type)
				: !adminOnlyCommands.includes(command.type)
		)
		.map((command) => {
			let commandLabel = command.label;
			if (
				command.type === CommandType.Class ||
				command.type === CommandType.Language
			) {
				commandLabel += ` [${command.label}]`;
			}

			let commandInfo = `${commandWithBotPrefix(commandLabel)} - ${
				command.info
			}`;

			if (command.type === CommandType.Class) {
				commandInfo += ` ${optionsToString(
					Object.values(command.playerClassTranslations)
				)}`;
			} else if (command.type === CommandType.Language) {
				commandInfo += ` ${getLanguageOptions()}`;
			}

			return "🔹" + commandInfo;
		})
		.join("\n");

export const parseCommand = (
	language: Language,
	message: string
): string[] | null => {
	const messageWithoutPrefix = message.replace(BOT_PREFIX, "");
	const commandWithArgs = messageWithoutPrefix.split(" ");
	return languages[language].commandTranslations.some(
		(command) => command.label === commandWithArgs[0]
	)
		? commandWithArgs
		: null;
};
