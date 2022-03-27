import { PlayerClass } from "../../shared/types";
import { CommandType } from "./types";

const optionsToString = (options: string[]): string =>
	`${options.map((option) => `\`${option}\``).join(", ")}`;

const selectableClassesAsString = optionsToString(Object.values(PlayerClass));

export const commands = [
	{ type: CommandType.Start, label: "start", info: "start a fight" },
	{ type: CommandType.Join, label: "join", info: "join a fight" },
	{ type: CommandType.Bot, label: "bot", info: "add a bot to the fight" },
	{ type: CommandType.Help, label: "help", info: "show available commands" },
	{
		type: CommandType.Class,
		label: "class",
		info: `change your class. Selectable classes: ${selectableClassesAsString}`,
	},
];

export const formattedWithBotPrefix = (command: string) => `\`/${command}\``;

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
