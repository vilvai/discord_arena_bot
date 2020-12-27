import { createCanvas } from "canvas";
import {
	SIDEBAR_WIDTH,
	SCREEN_HEIGHT,
	FONT_FAMILY,
	FONT_WEIGHT,
} from "../constants";
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

export default class Sidebar {
	constructor(players: BasePlayer[]) {
		this.playerDeathStates = players.map((player) => player.isDead());
	}

	playerDeathStates: boolean[];
	cachedSidebar?: OffscreenCanvas;

	draw(ctx: CanvasRenderingContext2D, players: BasePlayer[]) {
		if (
			this.cachedSidebar === undefined ||
			players.some((player, i) => player.isDead() !== this.playerDeathStates[i])
		) {
			this.cachedSidebar = this.createCachedSidebar(players);
			this.playerDeathStates = players.map((player) => player.isDead());
		}
		ctx.drawImage(this.cachedSidebar, 0, 0);
	}

	createCachedSidebar = (players: BasePlayer[]): OffscreenCanvas => {
		const canvas = createCanvas(SIDEBAR_WIDTH, SCREEN_HEIGHT);
		const ctx = canvas.getContext("2d");

		this.drawBackground(ctx);
		players.slice(0, 7).forEach((player) => {
			this.drawPlayer(ctx, player);
			ctx.translate(0, 42);
		});
		ctx.resetTransform();
		return canvas as any;
	};

	drawBackground(ctx: CanvasRenderingContext2D) {
		ctx.fillStyle = "#2F3136";
		ctx.fillRect(0, 0, SIDEBAR_WIDTH, SCREEN_HEIGHT);
	}

	drawPlayer(ctx: CanvasRenderingContext2D, player: BasePlayer) {
		this.drawPlayerIcon(ctx, player);
		if (player.isDead()) this.drawPlayerDeathOverlay(ctx);
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

		ctx.restore();
	}

	drawPlayerName(ctx: CanvasRenderingContext2D, name: string) {
		ctx.fillStyle = "#eeeeee";
		ctx.font = `${FONT_WEIGHT} 12px ${FONT_FAMILY}`;
		const truncatedName = memoizedTruncateText(
			ctx,
			name,
			SIDEBAR_WIDTH - textStartX - 4
		);
		ctx.fillText(truncatedName, textStartX, iconCenterY - 4);
	}

	drawPlayerClass(ctx: CanvasRenderingContext2D, player: BasePlayer) {
		const className = getPlayerClassName(player);
		ctx.fillStyle = "#bbbbbb";
		ctx.font = `italic ${FONT_WEIGHT} 11px ${FONT_FAMILY}`;
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
		ctx.font = `${FONT_WEIGHT} 12px ${FONT_FAMILY}`;
		const deathText = "R.I.P";
		const textWidth = ctx.measureText(deathText).width;
		ctx.fillText(deathText, iconCenterX - textWidth / 2, iconCenterY + 5);
	}
}
