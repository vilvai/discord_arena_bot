import { SIDEBAR_WIDTH, SCREEN_HEIGHT } from "../constants";
import BasePlayer from "./playerClasses/BasePlayer";
import Chungus from "./playerClasses/Chungus";
import Teekkari from "./playerClasses/Teekkari";
import Spuge from "./playerClasses/Spuge";
import Assassin from "./playerClasses/Assassin";

const getPlayerClassName = (player: BasePlayer) => {
	if (player instanceof Chungus) return "CHUNGUS";
	if (player instanceof Teekkari) return "TEEKKARI";
	if (player instanceof Spuge) return "SPUGE";
	if (player instanceof Assassin) return "ASSASSIN";
	return "FIGHTER";
};

const truncateText = (
	ctx: CanvasRenderingContext2D,
	text: string,
	maxWidth: number
) => {
	let width = ctx.measureText(text).width;
	if (width <= maxWidth) return text;

	const ellipsis = "…";
	const ellipsisWidth = ctx.measureText(ellipsis).width;
	let textLength = text.length;
	while (width >= maxWidth - ellipsisWidth && textLength > 0) {
		textLength -= 1;
		text = text.substring(0, textLength);
		width = ctx.measureText(text).width;
	}
	return text + ellipsis;
};

const iconRadius = 16;
const iconCenterX = iconRadius + 6;
const iconCenterY = iconRadius + 6;
const textStartX = iconCenterX + iconRadius + 4;

export default class Sidebar {
	draw(ctx: CanvasRenderingContext2D, players: BasePlayer[]) {
		this.drawBackground(ctx);
		players.slice(0, 7).forEach((player) => {
			this.drawPlayer(ctx, player);
			ctx.translate(0, 42);
		});
		ctx.resetTransform();
	}

	drawBackground(ctx: CanvasRenderingContext2D) {
		ctx.fillStyle = "#2F3136";
		ctx.fillRect(0, 0, SIDEBAR_WIDTH, SCREEN_HEIGHT);
	}

	drawPlayer(ctx: CanvasRenderingContext2D, player: BasePlayer) {
		this.drawPlayerIcon(ctx, player);
		this.drawPlayerName(ctx, player.name);
		this.drawPlayerClass(ctx, player);
	}

	drawPlayerIcon(ctx: CanvasRenderingContext2D, player: BasePlayer) {
		if (!player.avatar) return;
		ctx.save();
		ctx.beginPath();
		ctx.arc(iconCenterX, iconCenterY, iconRadius, 0, Math.PI * 2);
		ctx.clip();
		ctx.drawImage(
			player.avatar,
			iconCenterX - 16,
			iconCenterY - 16,
			iconRadius * 2,
			iconRadius * 2
		);
		if (player.isDead()) {
			ctx.fillStyle = "rgba(200,0,0,0.5)";
			ctx.fillRect(
				iconCenterX - 16,
				iconCenterY - 16,
				iconRadius * 2,
				iconRadius * 2
			);
		}
		ctx.restore();
		if (player.isDead()) {
			ctx.fillStyle = "#fff";
			ctx.font = "700 14px Calibri";
			ctx.fillText("R.I.P", iconCenterX - 12, iconCenterY + 5);
		}
	}

	drawPlayerName(ctx: CanvasRenderingContext2D, name: string) {
		ctx.fillStyle = "#eeeeee";
		ctx.font = "700 12px Calibri";
		const truncatedName = truncateText(
			ctx,
			name,
			SIDEBAR_WIDTH - textStartX - 4
		);
		ctx.fillText(truncatedName, textStartX, iconCenterY - 4);
	}

	drawPlayerClass(ctx: CanvasRenderingContext2D, player: BasePlayer) {
		const className = getPlayerClassName(player);
		ctx.fillStyle = "#bbbbbb";
		ctx.font = "700 italic 12px Calibri";
		ctx.fillText(className, textStartX, iconCenterY + 12);
	}
}
