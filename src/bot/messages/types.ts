export enum CommandType {
	Start = "Start",
	Join = "Join",
	Bot = "Bot",
	Class = "Class",
	Info = "Info",
	Language = "Language",
}

export const adminOnlyCommands: CommandType[] = [CommandType.Language];
