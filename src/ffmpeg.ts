import { createCanvas } from "canvas";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import { performance } from "perf_hooks";

import Game from "./shared/game/Game";
import { SCREEN_WIDTH, SCREEN_HEIGHT, GAME_FPS } from "./shared/constants";
import rimraf from "rimraf";
import { mockGameData } from "./shared/mocks";

const a = async () => {
	const canvas = createCanvas(SCREEN_WIDTH, SCREEN_HEIGHT);
	const ctx = canvas.getContext("2d");

	let i = 0;
	let endingTime = Infinity;
	const game = new Game(ctx);
	await game.initializeGame(mockGameData);

	const tailTimeSeconds = 2;

	const tempDirectory = "temp";
	fs.mkdirSync(tempDirectory);

	let time = performance.now();

	while (i < 20 * GAME_FPS && i < endingTime) {
		game.draw();
		const stream = fs.createWriteStream(
			`${tempDirectory}/pic${i.toString().padStart(3, "0")}.jpeg`
		);
		stream.write(
			canvas.toBuffer("image/jpeg", {
				quality: 0.98,
			}),
			() => stream.close()
		);
		game.update();
		if (game.isGameOver() && endingTime === Infinity) {
			endingTime = i + tailTimeSeconds * GAME_FPS;
		}
		i++;
	}

	time = performance.now() - time;
	const updateTime = time;
	console.log(
		"game update & temp file generation took " + updateTime.toFixed(2) + "ms"
	);

	ffmpeg()
		.addInput(`./${tempDirectory}/pic%3d.jpeg`)
		.inputFPS(30)
		.videoFilters(["fps=30"])
		.videoCodec("libx264")
		.outputOptions([
			"-preset veryfast",
			"-crf 18",
			"-tune film",
			"-movflags +faststart",
			"-profile:v high",
			"-pix_fmt yuv420p",
		])
		.save("ffmpeg_test.mp4")
		.on("end", () => {
			time = performance.now() - time;
			const ffmpegTime = time;
			console.log("ffmpeg render took " + ffmpegTime.toFixed(2) + "ms");

			rimraf(tempDirectory, (error) => error && console.log(error));
		});
};

a();
