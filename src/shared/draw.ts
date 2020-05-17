import { loadImage } from "canvas";

import { GameData } from "./types";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "./constants";

export const drawFrame = (
	ctx: CanvasRenderingContext2D,
	gameData: GameData
) => {
	const time = new Date().getTime();

	ctx.fillRect(10, 10, 100, 100);

	const text = ctx.measureText("Awesome!");
	ctx.strokeStyle = "rgba(0,0,0,0.5)";
	ctx.beginPath();
	ctx.lineTo(0, 0);
	ctx.lineTo(400, 300);
	ctx.stroke();
	const drawTime = new Date().getTime() - time;
	console.log(`drawing took ${drawTime}ms`);
};
