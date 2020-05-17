import { SIDEBAR_WIDTH, SCREEN_HEIGHT } from "../constants";
import Player from "./playerClasses/Player";

export default class Sidebar {
	draw(ctx: CanvasRenderingContext2D, players: Player[]) {
		ctx.fillStyle = "#2F3136";
		ctx.fillRect(0, 0, SIDEBAR_WIDTH, SCREEN_HEIGHT);
	}
}
