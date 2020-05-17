import { createCanvas } from "canvas";
import ffmpeg from "fluent-ffmpeg";
import { Readable } from "stream";
import fs from "fs";

import Game from "./shared/game/Game";
import { PlayerClass } from "./shared/types";
import { SCREEN_WIDTH, SCREEN_HEIGHT } from "./shared/constants";

const a = async () => {
	const canvas = createCanvas(SCREEN_WIDTH, SCREEN_HEIGHT);
	const ctx = canvas.getContext("2d");

	const gameData = {
		players: [
			{
				avatarURL:
					"https://cdn.discordapp.com/avatars/160995903182864384/fa07b1a1db14e12a994d67ce32a887c3.png?size=128",
				class: PlayerClass.Teekkari,
			},
			{
				avatarURL:
					"https://cdn.discordapp.com/avatars/162898422892855297/a0a097c92ee1066133a18afaa9515e29.png?size=128",
				class: PlayerClass.Fighter,
			},
			{
				avatarURL:
					"https://cdn.discordapp.com/avatars/160785897149693952/69591f533a458a1a820d709ad491bd3e.png?size=128",
				class: PlayerClass.Chungus,
			},
			{
				avatarURL:
					"https://cdn.discordapp.com/avatars/160115262538907658/0de78ec90612f30c34f3140257f9fef9.png?size=128",
				class: PlayerClass.Assassin,
			},
		],
	};

	const game = new Game(ctx);
	await game.initializeGame(gameData);
	game.draw();

	fs.createWriteStream("test.png").write(canvas.toBuffer());

	//const stream = fs.createWriteStream("test.png").write(canvas.toBuffer());
	//const stream = fs.createWriteStream("test.mp4");
	/*const readable = new Readable();
	readable._read = () => {};
	readable.push(canvas.toBuffer());
	readable.push(null);*/
	ffmpeg(fs.createReadStream("test.png"))
		//.inputFormat("png")
		.loop(10)
		//.format("mp4")
		.duration(100)
		.fps(10)
		.outputOptions("-pix_fmt yuv420p")
		.save("test.mp4")
		.on("start", (cmd) => console.log(cmd));
	//.videoCodec("libx264")
	//.size("400x300")
};

a();
