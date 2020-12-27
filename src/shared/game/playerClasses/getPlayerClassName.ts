import BasePlayer from "./BasePlayer";
import Chungus from "./Chungus";
import Teekkari from "./Teekkari";
import Spuge from "./Spuge";
import Assassin from "./Assassin";
import { PlayerClass } from "../../types";

export const getPlayerClassName = (player: BasePlayer): string => {
	if (player instanceof Chungus) {
		return PlayerClass.Chungus.toUpperCase();
	} else if (player instanceof Teekkari) {
		return PlayerClass.Teekkari.toUpperCase();
	} else if (player instanceof Spuge) {
		return PlayerClass.Spuge.toUpperCase();
	} else if (player instanceof Assassin) {
		return PlayerClass.Assassin.toUpperCase();
	} else {
		return PlayerClass.Fighter.toUpperCase();
	}
};
