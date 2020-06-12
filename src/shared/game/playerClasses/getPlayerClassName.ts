import BasePlayer from "./BasePlayer";
import Chungus from "./Chungus";
import Teekkari from "./Teekkari";
import Spuge from "./Spuge";
import Assassin from "./Assassin";

export const getPlayerClassName = (player: BasePlayer) => {
	if (player instanceof Chungus) return "CHUNGUS";
	if (player instanceof Teekkari) return "TEEKKARI";
	if (player instanceof Spuge) return "SPUGE";
	if (player instanceof Assassin) return "ASSASSIN";
	return "FIGHTER";
};
