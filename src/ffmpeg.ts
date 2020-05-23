import { createCanvas } from "canvas";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import { performance } from "perf_hooks";

import Game from "./shared/game/Game";
import { PlayerClass } from "./shared/types";
import { SCREEN_WIDTH, SCREEN_HEIGHT, GAME_FPS } from "./shared/constants";
import rimraf from "rimraf";

const a = async () => {
	const canvas = createCanvas(SCREEN_WIDTH, SCREEN_HEIGHT);
	const ctx = canvas.getContext("2d");

	const gameData = {
		players: [
			{
				avatarURL:
					"https://cdn.discordapp.com/avatars/160995903182864384/fa07b1a1db14e12a994d67ce32a887c3.png?size=128",
				class: PlayerClass.Teekkari,
				name: "player1",
			},
			{
				avatarURL:
					"https://cdn.discordapp.com/avatars/162898422892855297/a0a097c92ee1066133a18afaa9515e29.png?size=128",
				class: PlayerClass.Fighter,
				name: "player2",
			},
			{
				avatarURL:
					"https://cdn.discordapp.com/avatars/160785897149693952/69591f533a458a1a820d709ad491bd3e.png?size=128",
				class: PlayerClass.Chungus,
				name: "player3",
			},
			{
				avatarURL:
					"https://cdn.discordapp.com/avatars/160115262538907658/0de78ec90612f30c34f3140257f9fef9.png?size=128",
				class: PlayerClass.Assassin,
				name: "player4",
			},
		],
	};

	let i = 0;
	let endingTime = Infinity;
	const game = new Game(ctx);
	await game.initializeGame(gameData);

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
