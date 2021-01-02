import BasePlayer from "./BasePlayer";
import Chungus from "./Chungus";
import Teekkari from "./Teekkari";
import Spuge from "./Spuge";
import Assassin from "./Assassin";
import { PlayerClass } from "../../types";

export const playerToPlayerClass = (player: BasePlayer): PlayerClass => {
	if (player instanceof Chungus) {
		return PlayerClass.Chungus;
	} else if (player instanceof Teekkari) {
		return PlayerClass.Teekkari;
	} else if (player instanceof Spuge) {
		return PlayerClass.Spuge;
	} else if (player instanceof Assassin) {
		return PlayerClass.Assassin;
	} else {
		return PlayerClass.Fighter;
	}
};

export const getPlayerClassName = (player: BasePlayer): string =>
	playerToPlayerClass(player).toUpperCase();
