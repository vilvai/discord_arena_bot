import { createCanvas } from "canvas";
import ffmpeg from "fluent-ffmpeg";
import { Readable } from "stream";
import fs, { read } from "fs";
import path from "path";

import Game from "./shared/game/Game";
import { PlayerClass } from "./shared/types";
import { SCREEN_WIDTH, SCREEN_HEIGHT, GAME_FPS } from "./shared/constants";

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
	/*
	let i = 0;
	let endingTime = Infinity;
	const game = new Game(ctx);
	await game.initializeGame(gameData);

	const tailTimeSeconds = 2;

	while (i < 20 * GAME_FPS && i < endingTime) {
		game.draw();
		fs.createWriteStream(`temp/pic${i.toString().padStart(3, "0")}.png`).write(
			canvas.toBuffer()
		);
		game.update();
		if (game.isGameOver() && endingTime === Infinity) {
			endingTime = i + tailTimeSeconds * GAME_FPS;
		}
		i++;
	}

	ffmpeg()
		.addInput("./temp/pic%3d.png")
		.videoFilters(["fps=30"])
		.videoCodec("libx264")
		//.videoBitrate(8192)
		.outputOptions([
			"-preset veryslow",
			//"-crf 0",
			"-tune film",
			"-movflags +faststart",
			"-profile:v high",
			"-x265-params crf=18:bframes=0",
			"-pix_fmt yuv420p", // YUV420p color encoding, enforced by Facebook
			"-colorspace bt709", // BT.709 is closest to sRGB
			"-color_trc bt709",
			"-color_primaries bt709",
			"-vf scale=in_color_matrix=rgb:out_color_matrix=bt709", // Accurate colors
			"-map 0:v:0",
		])
		.save("test.mp4")
		.on("start", (cmd) => console.log(cmd))
		.on("end", () => {
			const directory = "temp";
			
			fs.readdir(directory, (err, files) => {
				if (err) throw err;

				for (const file of files) {
					fs.unlink(path.join(directory, file), (err) => {
						if (err) throw err;
					});
				}
			});
		});*/
	const game = new Game(ctx);
	await game.initializeGame(gameData);
	game.draw();
	console.log(canvas.toBuffer());
	let buffer: Buffer = canvas.toBuffer();
	for (let a = 0; a < 100; a++) {
		buffer = Buffer.concat([buffer, canvas.toBuffer()]);
	}

	const readable = new Readable();
	readable._read = () => {};
	readable.push(buffer);
	readable.push(null);
	//fs.createWriteStream("test2.png").write(buffer);
	//fs.createReadStream("test2.png").on("data", (a) => console.log(a));

	ffmpeg(readable)
		//.loop(1)
		.videoFilters(["fps=30"])
		.videoCodec("libx264")
		.outputOptions([
			"-preset medium",
			"-crf 18",
			"-tune film",
			"-movflags +faststart",
			"-profile:v high",
			"-x265-params crf=51:bframes=0",
			"-pix_fmt yuv420p", // YUV420p color encoding, enforced by Facebook
			"-colorspace bt709", // BT.709 is closest to sRGB
			"-color_trc bt709",
			"-color_primaries bt709",
			"-vf scale=in_color_matrix=rgb:out_color_matrix=bt709", // Accurate colors
			"-map 0:v:0",
		])
		.on("start", console.log)
		.save("test2.mp4");
};

a();
