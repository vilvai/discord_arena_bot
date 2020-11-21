import { Language } from "../../bot/languages";
import { SIDEBAR_WIDTH, SCREEN_HEIGHT, IS_RUNNING_ON_NODE } from "../constants";
import BasePlayer from "./playerClasses/BasePlayer";
import { getPlayerClassName } from "./playerClasses/getPlayerClassName";

const truncatedStrings: { [key: string]: string } = {};

const memoizedTruncateText = (
	ctx: CanvasRenderingContext2D,
	text: string,
	maxWidth: number
): string => {
	if (truncatedStrings[text]) {
		return truncatedStrings[text];
	} else {
		const truncatedString = truncateText(ctx, text, maxWidth);
		truncatedStrings[text] = truncatedString;
		return truncatedString;
	}
};

const truncateText = (
	ctx: CanvasRenderingContext2D,
	text: string,
	maxWidth: number
): string => {
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

const fontFamily = "Roboto";
const fontWeight = IS_RUNNING_ON_NODE ? "700" : "500";

export default class Sidebar {
	initialDrawDone: boolean = false;
	deathOverlaysDrawn: { [position: number]: undefined | true } = {};

	draw(
		ctx: CanvasRenderingContext2D,
		players: BasePlayer[],
		language: Language
	) {
		if (!this.initialDrawDone) this.initialDraw(ctx, players, language);
		this.updatePlayerDeathOverlays(ctx, players);
	}

	initialDraw(
		ctx: CanvasRenderingContext2D,
		players: BasePlayer[],
		language: Language
	) {
		this.drawBackground(ctx);
		players.slice(0, 7).forEach((player) => {
			this.drawPlayer(ctx, player, language);
			ctx.translate(0, 42);
		});
		ctx.resetTransform();
		this.initialDrawDone = true;
	}

	updatePlayerDeathOverlays(
		ctx: CanvasRenderingContext2D,
		players: BasePlayer[]
	) {
		players.slice(0, 7).forEach((player, i) => {
			if (player.isDead() && this.deathOverlaysDrawn[i] === undefined) {
				this.drawPlayerDeathOverlay(ctx);
				this.deathOverlaysDrawn[i] = true;
			}
			ctx.translate(0, 42);
		});
		ctx.resetTransform();
	}

	drawBackground(ctx: CanvasRenderingContext2D) {
		ctx.fillStyle = "#2F3136";
		ctx.fillRect(0, 0, SIDEBAR_WIDTH, SCREEN_HEIGHT);
	}

	drawPlayer(
		ctx: CanvasRenderingContext2D,
		player: BasePlayer,
		language: Language
	) {
		this.drawPlayerIcon(ctx, player);
		this.drawPlayerName(ctx, player.name);
		this.drawPlayerClass(ctx, player, language);
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
		ctx.restore();
	}

	drawPlayerName(ctx: CanvasRenderingContext2D, name: string) {
		ctx.fillStyle = "#eeeeee";
		ctx.font = `${fontWeight} 12px ${fontFamily}`;
		const truncatedName = memoizedTruncateText(
			ctx,
			name,
			SIDEBAR_WIDTH - textStartX - 4
		);
		ctx.fillText(truncatedName, textStartX, iconCenterY - 4);
	}

	drawPlayerClass(
		ctx: CanvasRenderingContext2D,
		player: BasePlayer,
		language: Language
	) {
		const className = getPlayerClassName(player, language);
		ctx.fillStyle = "#bbbbbb";
		ctx.font = `italic ${fontWeight} 11px ${fontFamily}`;
		ctx.fillText(className, textStartX, iconCenterY + 12);
	}

	drawPlayerDeathOverlay(ctx: CanvasRenderingContext2D) {
		ctx.save();
		ctx.beginPath();
		ctx.arc(iconCenterX, iconCenterY, iconRadius, 0, Math.PI * 2);
		ctx.clip();

		ctx.fillStyle = "rgba(200,0,0,0.5)";
		ctx.fillRect(
			iconCenterX - 16,
			iconCenterY - 16,
			iconRadius * 2,
			iconRadius * 2
		);

		ctx.restore();
		ctx.fillStyle = "#fff";
		ctx.font = `${fontWeight} 12px ${fontFamily}`;
		const deathText = "R.I.P";
		const textWidth = ctx.measureText(deathText).width;
		ctx.fillText(deathText, iconCenterX - textWidth / 2, iconCenterY + 5);
	}
}
