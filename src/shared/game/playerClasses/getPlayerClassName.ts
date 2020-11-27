import BasePlayer from "./BasePlayer";
import Chungus from "./Chungus";
import Teekkari from "./Teekkari";
import Spuge from "./Spuge";
import Assassin from "./Assassin";
import { PlayerClass } from "../../types";

import { findClassLabelForLanguage, Language } from "../../../bot/languages";

export const getPlayerClassName = (player: BasePlayer, language: Language) => {
	let playerClass: PlayerClass;

	if (player instanceof Chungus) {
		playerClass = PlayerClass.Chungus;
	} else if (player instanceof Teekkari) {
		playerClass = PlayerClass.Teekkari;
	} else if (player instanceof Spuge) {
		playerClass = PlayerClass.Spuge;
	} else if (player instanceof Assassin) {
		playerClass = PlayerClass.Assassin;
	} else {
		playerClass = PlayerClass.Fighter;
	}

	return findClassLabelForLanguage(language, playerClass).toUpperCase();
};
