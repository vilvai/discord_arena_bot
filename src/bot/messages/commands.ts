import { PlayerClass } from "../../shared/types";
import { CommandType } from "./types";

const optionsToString = (options: string[]): string =>
	`${options.map((option) => `\`${option}\``).join(", ")}`;

export const selectableClassesAsString = optionsToString(
	Object.values(PlayerClass)
);

export const commands = [
	{ type: CommandType.Start, label: "start", info: "start a fight" },
	{ type: CommandType.Join, label: "join", info: "join a fight" },
	{ type: CommandType.Bot, label: "bot", info: "add a bot to the fight" },
	{ type: CommandType.Info, label: "info", info: "show available commands" },
	{
		type: CommandType.Class,
		label: "class",
		info: `change your class. Selectable classes: ${selectableClassesAsString}`,
	},
];

export const BOT_PREFIX = "/arena ";

export const messageStartsWithBotPrefix = (message: string): boolean =>
	message.toLowerCase().startsWith(BOT_PREFIX);

export const formattedWithBotPrefix = (command: string) =>
	`\`${BOT_PREFIX}${command}\``;

export const formattedCommandWithPrefix = (
	commandType: CommandType
): string => {
	let label = commands.find((command) => command.type === commandType)!.label;
	if (commandType === CommandType.Class) {
		label += ` [${label}]`;
	}
	return formattedWithBotPrefix(label);
};

export const getCommandsAsString = (): string =>
	commands
		.map(
			(command) =>
				"🔹" + `${formattedCommandWithPrefix(command.type)} - ${command.info}`
		)
		.join("\n");

export const parseCommand = (message: string): string[] | null => {
	if (!messageStartsWithBotPrefix(message)) return null;

	const messageWithoutPrefix = message.slice(BOT_PREFIX.length);
	const commandWithArgs = messageWithoutPrefix.split(" ");
	return commands.some((command) => command.label === commandWithArgs[0])
		? commandWithArgs
		: null;
};
