import type { Translations } from ".";
import { PlayerClass } from "../../shared/types";
import { CommandType } from "../messages/types";

const english: Translations = {
	messageTranslations: {
		fightInitiated: () => "Fight initiated",
		waitingForOtherPlayers: (joinCommand: string, botCommand: string) =>
			`Waiting for other players. Players can join with ${joinCommand}. You can also add bots with ${botCommand}`,
		fightStartsIn: (countdownLeft: number) =>
			`Fight starts in ${countdownLeft} seconds.`,
		fightStarting: () => "Fight is starting.",
		fightEndedTimesUp: () => "Time's up!",
		fightEndedWinner: () => "Winner:",
		fightEndedTie: () => "Tie!",
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
		participants: () => "Participants:",
		changeClassWith: (changeClassCommand: string) =>
			`Change your class with ${changeClassCommand}`,
		onlyOwnerCanChangeLanguage: () =>
			"Only the server owner can change the language.",
		languageChanged: () => "Language set to english.",
		selectableLanguages: (selectableLanguages: string) =>
			`Supported languages: ${selectableLanguages}`,
		renderingFailed: (startNewFightMessage: string) =>
			`Rendering the video failed 😢\n${startNewFightMessage}`,
		generalCommands: () => "Commands available for everyone",
		adminCommands: () => "Commands for channel owner",
	},
	commandTranslations: [
		{ type: CommandType.Start, label: "start", info: "start a fight" },
		{ type: CommandType.Join, label: "join", info: "join a fight" },
		{ type: CommandType.Bot, label: "bot", info: "add a bot to the fight" },
		{ type: CommandType.Info, label: "info", info: "show available commands" },
		{
			type: CommandType.Class,
			label: "class",
			info: "change your class. Selectable classes: ",
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
			info: "change the language. Supported languages: ",
		},
	],
};

export default english;
