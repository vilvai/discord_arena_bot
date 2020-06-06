import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import rimraf from "rimraf";
import { performance } from "perf_hooks";
import { createCanvas, Canvas } from "canvas";

import Game from "../shared/game/Game";
import {
	SCREEN_WIDTH,
	SCREEN_HEIGHT,
	GAME_FPS,
	TEMP_FILE_DIRECTORY,
} from "../shared/constants";
import { PlayerData } from "../shared/types";

export default class GameRunner {
	constructor() {
		this.players = [];
		this.canvas = createCanvas(SCREEN_WIDTH, SCREEN_HEIGHT);
		const ctx = this.canvas.getContext("2d");
		this.game = new Game(ctx);
	}

	game: Game;
	canvas: Canvas;
	players: PlayerData[];

	addPlayer(player: PlayerData) {
		this.players.push(player);
	}

	initializeGame = async () => {
		await this.game.initializeGame(this.players);
	};

	runGame = async () => {
		let i = 0;
		let endingTime = Infinity;

		const tailTimeSeconds = 2;
		const gameMaxTimeSeconds = 30;

		fs.mkdirSync(TEMP_FILE_DIRECTORY);

		let time = performance.now();

		while (i < gameMaxTimeSeconds * GAME_FPS && i < endingTime) {
			this.game.draw();
			const stream = fs.createWriteStream(
				`${TEMP_FILE_DIRECTORY}/pic${i.toString().padStart(3, "0")}.jpeg`
			);
			stream.write(
				this.canvas.toBuffer("image/jpeg", {
					quality: 0.98,
				}),
				() => stream.close()
			);
			this.game.update();
			if (this.game.isGameOver() && endingTime === Infinity) {
				endingTime = i + tailTimeSeconds * GAME_FPS;
			}
			i++;
		}

		time = performance.now() - time;
		console.log(
			"game update & temp file generation took " + time.toFixed(2) + "ms"
		);

		await this.renderVideo();
	};

	renderVideo = async () =>
		new Promise((resolve) => {
			let time = performance.now();
			ffmpeg()
				.addInput(`./${TEMP_FILE_DIRECTORY}/pic%3d.jpeg`)
				.inputFPS(GAME_FPS)
				.videoFilters([`fps=${GAME_FPS}`])
				.videoCodec("libx264")
				.outputOptions([
					"-preset veryfast",
					"-crf 18",
					"-tune film",
					"-movflags +faststart",
					"-profile:v high",
					"-pix_fmt yuv420p",
				])
				.save("Areena_fight.mp4")
				.on("end", () => {
					time = performance.now() - time;
					console.log("ffmpeg render took " + time.toFixed(2) + "ms");

					rimraf(TEMP_FILE_DIRECTORY, (error) => error && console.log(error));
					console.log("deleted temp files successfully");
					resolve();
				});
		});
}
