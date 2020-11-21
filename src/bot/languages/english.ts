import { Translations } from ".";
import { PlayerClass } from "../../shared/types";
import { CommandType } from "../messages/types";

const english: Translations = {
	messageTranslations: {
		fightStartsIn: (countdownLeft: number) =>
			`Fight starts in ${countdownLeft} seconds.`,
		fightStarting: (playersInFight: string) =>
			`**Fight is starting.**\n${playersInFight}`,
		fightEndedOutOfTime: () => "Fight ended because time ran out.",
		fightEndedPlayerWon: (winnerName: string) =>
			`Fight ended. ${winnerName} won!`,
		fightEndedNobodyWon: () => "Fight ended without a winner.",
		notEnoughPlayers: () => "Not enough players in the fight.",
		startNewFight: (startCommand: string) =>
			`Start a new fight with ${startCommand}.`,
		noFightInProgress: () => "No fight in progress.",
		fightAlreadyStarting: (joinCommand: string) =>
			`Fight is already starting. Join the fight with ${joinCommand}.`,
		gameIsFull: (maxPlayerCount: number) =>
			`Game is already full (${maxPlayerCount} players).`,
		selectableClasses: (selectableClasses: string) =>
			`Selectable classes: ${selectableClasses}.`,
		classSelected: (userName: string, selectedClass: string) =>
			`${userName} is now ${selectedClass}.`,
		unknownCommand: (knownCommands: string) =>
			`Unknown command. Accepted commands:\n${knownCommands}`,
		playersInFight: (playersWithClasses: string) =>
			`**Participants:**\n${playersWithClasses}`,
		changeClassWith: (changeClassCommand: string) =>
			`Change your class with ${changeClassCommand}.`,
		onlyOwnerCanChangeLanguage: () =>
			"Only the server owner can change the language.",
		languageChanged: () => "Language set to english.",
		selectableLanguages: (selectableLanguages: string) =>
			`Supported languages: ${selectableLanguages}`,
	},
	commandTranslations: [
		{ type: CommandType.Start, label: "start", info: "start a fight" },
		{ type: CommandType.Join, label: "join", info: "join a fight" },
		{ type: CommandType.Bot, label: "bot", info: "add a bot to the fight" },
		{ type: CommandType.Info, label: "info", info: "show available commands" },
		{
			type: CommandType.Class,
			label: "class",
			info: "change your class",
			playerClassTranslations: {
				[PlayerClass.Assassin]: "assassin",
				[PlayerClass.Teekkari]: "engineer",
				[PlayerClass.Chungus]: "chungus",
				[PlayerClass.Spuge]: "drunk",
				[PlayerClass.Fighter]: "fighter",
			},
		},
		{
			type: CommandType.Language,
			label: "language",
			info: "change the language",
		},
	],
};

export default english;