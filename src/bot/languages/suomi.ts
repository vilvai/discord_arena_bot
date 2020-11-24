import { Translations } from ".";
import { PlayerClass } from "../../shared/types";
import { CommandType } from "../messages/types";

const suomi: Translations = {
	messageTranslations: {
		fightStartsIn: (countdownLeft: number) =>
			`Taistelu alkaa ${countdownLeft} sekunnin kuluttua.`,
		fightStarting: (playersInFight: string) =>
			`**Taistelu alkaa.**\n${playersInFight}`,
		fightEndedTimesUp: () => "Aika loppui!",
		fightEndedWinner: () => "Voittaja:",
		fightEndedTie: () => "Tasapeli!",
		notEnoughPlayers: () => "Taistelussa oli liian vähän osallistujia.",
		startNewFight: (startCommand: string) =>
			`Aloita uusi taistelu komennolla ${startCommand}.`,
		noFightInProgress: () => "Ei käynnissä olevaa taistelua.",
		fightAlreadyStarting: (joinCommand: string) =>
			`Taistelu on jo alkamassa. Liity taisteluun komennolla ${joinCommand}.`,
		gameIsFull: (maxPlayerCount: number) =>
			`Peli on jo täynnä (${maxPlayerCount} pelaajaa).`,
		selectableClasses: (selectableClasses: string) =>
			`Valittavat luokat: ${selectableClasses}.`,
		classSelected: (userName: string, selectedClass: string) =>
			`${userName} on nyt ${selectedClass}.`,
		unknownCommand: (knownCommands: string) =>
			`Tuntematon komento. Tunnetut komennot:\n${knownCommands}`,
		playersInFight: (playersWithClasses: string) =>
			`**Osallistujat:**\n${playersWithClasses}`,
		changeClassWith: (changeClassCommand: string) =>
			`Vaihda luokka komennolla ${changeClassCommand}.`,
		onlyOwnerCanChangeLanguage: () =>
			"Vain serverin omistaja voi vaihtaa kieltä.",
		languageChanged: () => "Kieli asetettu suomeksi.",
		selectableLanguages: (selectableLanguages: string) =>
			`Tuetut kielet: ${selectableLanguages}`,
		renderingFailed: (startNewFightMessage: string) =>
			`Videon luonti epäonnistui 😢\n${startNewFightMessage}`,
	},
	commandTranslations: [
		{ type: CommandType.Start, label: "aloita", info: "aloita taistelu" },
		{ type: CommandType.Join, label: "liity", info: "liity taisteluun" },
		{ type: CommandType.Bot, label: "botti", info: "lisää botti taisteluun" },
		{ type: CommandType.Info, label: "info", info: "näytä komennot" },
		{
			type: CommandType.Class,
			label: "luokka",
			info: "vaihda oma luokka",
			playerClassTranslations: {
				[PlayerClass.Assassin]: "assassin",
				[PlayerClass.Teekkari]: "teekkari",
				[PlayerClass.Chungus]: "chungus",
				[PlayerClass.Spuge]: "spuge",
				[PlayerClass.Fighter]: "fighter",
			},
		},
		{ type: CommandType.Language, label: "kieli", info: "vaihda kieli" },
	],
};

export default suomi;
