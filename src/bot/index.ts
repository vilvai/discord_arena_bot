import Discord from "discord.js";
import fs from "fs";
import { createCanvas } from "canvas";
import ffmpeg from "fluent-ffmpeg";
import path from "path";
import rimraf from "rimraf";
import { performance } from "perf_hooks";

import { SCREEN_WIDTH, SCREEN_HEIGHT, GAME_FPS } from "../shared/constants";
import { PlayerClass } from "../shared/types";
import Game from "../shared/game/Game";
import { Readable } from "stream";

require("dotenv").config();

const client = new Discord.Client();

client.on("ready", () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", async (msg) => {
	if (msg.author.id === client.user.id) return;
	const avatarURL = msg.author.displayAvatarURL({ format: "png", size: 256 });
	const canvas = createCanvas(SCREEN_WIDTH * 2, SCREEN_HEIGHT * 2);
	const ctx = canvas.getContext("2d");

	const gameData = {
		players: [
			{
				avatarURL,
				class: PlayerClass.Spuge,
			},
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

	let i = 0;
	let endingTime = Infinity;
	const game = new Game(ctx);
	await game.initializeGame(gameData);

	const tailTimeSeconds = 2;

	const tempDirectory = "temp";

	console.log("game started");

	const oldTime = performance.now();
	let buffer: Buffer = canvas.toBuffer();

	while (i < 1 * GAME_FPS && i < endingTime) {
		game.draw();
		buffer = Buffer.concat([buffer, canvas.toBuffer()]);
		game.update();
		if (game.isGameOver() && endingTime === Infinity) {
			endingTime = i + tailTimeSeconds * GAME_FPS;
		}
		i++;
	}

	const time = performance.now() - oldTime;
	console.log("game update & render took " + time + "ms");

	const readable = new Readable();
	readable._read = () => {};
	readable.push(buffer);
	readable.push(null);

	ffmpeg(readable)
		//.addInput(`./${tempDirectory}/pic%3d.png`)
		.inputFormat("image2pipe")
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
		.save("test.mp4")
		.on("start", console.log)
		.on("end", () => {
			/*console.log("end");
			rimraf("temp/*", (error) => error && console.log(error));
			console.log("deleted successfully");*/

			/*fs.readdir(tempDirectory, (err, files) => {
				if (err) throw err;

				for (const file of files) {
					fs.unlinkSync(path.join(tempDirectory, file));
				}
				console.log("deleted successfully");
			});*/
			msg.channel.send("", { files: ["test.mp4"] });
		});
});

client.login(process.env.TOKEN);
