import { PlayerClass } from "../shared/types";

export const acceptedCommands = [
	{ command: "aloita", info: "aloita taistelu" },
	{ command: "liity", info: "liity taisteluun" },
	{ command: "botti", info: "lisää botti taisteluun" },
	{ command: "class", info: "vaihda oma class" },
	{ command: "info", info: "näytä komennot" },
];

export const acceptedClasses = Object.values(PlayerClass).map((playerClass) =>
	playerClass.toString()
);
export const acceptedClassesAsString = `[${acceptedClasses.join(" | ")}]`;

export const acceptedCommandsAsString = (botMention: string): string =>
	acceptedCommands
		.map((command) => {
			let fullCommandInfo = `${botMention} ${command.command}`;
			if (command.command === "class") {
				fullCommandInfo += ` ${acceptedClassesAsString}`;
			}
			fullCommandInfo += ` *(${command.info})*`;
			return fullCommandInfo;
		})
		.join("\n");

export const parseCommand = (rawText: string): string[] | null => {
	const commandWithArgs = rawText.split(" ");
	return acceptedCommands.some(
		(command) => command.command === commandWithArgs[0]
	)
		? commandWithArgs
		: null;
};
