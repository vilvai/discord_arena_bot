import { createCanvas } from "canvas";
import {
	FONT_FAMILY,
	FONT_WEIGHT,
	GAME_OVER_OVERLAY_DURATION,
	IS_RUNNING_ON_NODE,
	SCREEN_HEIGHT,
	SCREEN_WIDTH,
} from "../constants";
import { crownImage } from "./images";

const getNameFontSize = (
	ctx: CanvasRenderingContext2D,
	winnerName: string
): number => {
	const maxFontSize = 36;
	const minFontSize = 12;
	const targetTextWidth = SCREEN_WIDTH * 0.65;

	ctx.font = `${FONT_WEIGHT} ${maxFontSize}px ${FONT_FAMILY}`;
	const maxFontWidth = ctx.measureText(winnerName).width;

	if (maxFontWidth <= targetTextWidth) return maxFontSize;

	const scaledFontSize = Math.floor(
		(targetTextWidth / maxFontWidth) * maxFontSize
	);

	return Math.max(minFontSize, scaledFontSize);
};

export default class GameOverOverlay {
	constructor(
		private gameOverText: string,
		private winnerName?: string,
		private winnerAvatar?: CanvasImageSource
	) {
		this.cachedOverlay = this.createCachedOverlay();
	}
	animationProgress: number = -15;
	cachedOverlay: OffscreenCanvas;
	crownX: number = 0;
	crownY: number = 0;

	createCachedOverlay = (): OffscreenCanvas => {
		const canvas = createCanvas(SCREEN_WIDTH, SCREEN_HEIGHT);
		const ctx = canvas.getContext("2d");

		ctx.fillStyle = "#ffffff";
		ctx.textBaseline = "hanging";

		const drawWinner =
			this.winnerName !== undefined && this.winnerAvatar !== undefined;

		if (drawWinner) {
			ctx.translate(0, 15);

			const avatarSize = 64;
			const avatarPadding = 8;

			const nameFontSize = getNameFontSize(ctx, this.winnerName!);
			ctx.font = `${FONT_WEIGHT} ${nameFontSize}px ${FONT_FAMILY}`;
			const nameMetrics = ctx.measureText(this.winnerName!);

			const capHeightRatio = IS_RUNNING_ON_NODE ? 1.1 : 0.9;

			ctx.fillText(
				this.winnerName!,
				SCREEN_WIDTH / 2 -
					nameMetrics.width / 2 +
					(avatarSize + avatarPadding) / 2,
				SCREEN_HEIGHT / 2 - (nameFontSize * capHeightRatio) / 2
			);

			const avatarX =
				SCREEN_WIDTH / 2 -
				nameMetrics.width / 2 -
				avatarSize / 2 -
				avatarPadding / 2;

			const avatarY = SCREEN_HEIGHT / 2 - avatarSize / 2;

			this.crownX = avatarX - 3;
			this.crownY = avatarY - 4;

			ctx.save();
			ctx.translate(avatarX, avatarY);
			ctx.beginPath();
			ctx.arc(avatarSize / 2, avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
			ctx.clip();
			ctx.drawImage(this.winnerAvatar, 0, 0, avatarSize, avatarSize);
			ctx.restore();

			ctx.translate(0, -40);
		}

		ctx.textAlign = "center";
		ctx.font = `${FONT_WEIGHT} ${drawWinner ? 28 : 40}px ${FONT_FAMILY}`;
		ctx.fillText(this.gameOverText, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 20);

		ctx.textAlign = "start";

		return canvas as any;
	};

	update() {
		this.animationProgress += 1;
	}

	draw(ctx: CanvasRenderingContext2D) {
		this.drawBackgroundAndSetAlpha(ctx);
		const animationProgressFraction = Math.max(
			Math.min(
				(this.animationProgress + 2) / (GAME_OVER_OVERLAY_DURATION / 4),
				1
			),
			0
		);
		const powAnimationProgressFraction = animationProgressFraction ** 2;

		const initialExtraZoom = 2;
		const currentZoomLevel =
			1 + initialExtraZoom - initialExtraZoom * powAnimationProgressFraction;

		ctx.transform(
			currentZoomLevel,
			0,
			0,
			currentZoomLevel,
			-(SCREEN_WIDTH / 2) *
				initialExtraZoom *
				(1 - powAnimationProgressFraction),
			-(SCREEN_HEIGHT / 2) *
				initialExtraZoom *
				(1 - powAnimationProgressFraction)
		);

		ctx.drawImage(this.cachedOverlay, 0, 0);

		ctx.globalAlpha = 1;
		ctx.resetTransform();

		if (this.winnerAvatar) this.drawCrown(ctx);
	}

	drawBackgroundAndSetAlpha(ctx: CanvasRenderingContext2D) {
		const animationProgressFraction = Math.max(
			Math.min(this.animationProgress / (GAME_OVER_OVERLAY_DURATION / 5), 1),
			0
		);
		ctx.fillStyle = `rgba(0,0,0,${animationProgressFraction * 0.6})`;
		ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

		ctx.globalAlpha = animationProgressFraction;
	}

	drawCrown(ctx: CanvasRenderingContext2D) {
		const animationProgressFraction = Math.max(
			Math.min(
				this.animationProgress / (GAME_OVER_OVERLAY_DURATION / 5) - 0.9,
				1
			),
			0
		);
		const powAnimationProgressFraction = animationProgressFraction ** 2.5;

		const crownFallHeight = 60;

		ctx.globalAlpha = animationProgressFraction;

		ctx.drawImage(
			crownImage,
			this.crownX,
			this.crownY - crownFallHeight * (1 - powAnimationProgressFraction)
		);

		ctx.globalAlpha = 1;
	}
}
