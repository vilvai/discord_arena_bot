import { loadImage, CanvasRenderingContext2D } from "canvas";

import { GameData } from "./types";

export const drawFrame = async (
	ctx: CanvasRenderingContext2D,
	gameData: GameData
) => {
	ctx.font = "30px Impact";
	ctx.rotate(0.1);
	ctx.fillText("Awesome!", 50, 100);

	const text = ctx.measureText("Awesome!");
	ctx.strokeStyle = "rgba(0,0,0,0.5)";
	ctx.beginPath();
	ctx.lineTo(50, 102);
	ctx.lineTo(50 + text.width, 102);
	ctx.stroke();
	for (const { avatarURL, x, y } of Object.values(gameData.players)) {
		const image = await loadImage(avatarURL);
		ctx.drawImage(image, x, y, 32, 32);
	}
};
