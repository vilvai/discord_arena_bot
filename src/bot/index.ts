import Discord from "discord.js";
import fs from "fs";
import { createCanvas } from "canvas";
import ffmpeg from "fluent-ffmpeg";
import rimraf from "rimraf";
import { performance } from "perf_hooks";

import { SCREEN_WIDTH, SCREEN_HEIGHT, GAME_FPS } from "../shared/constants";
import { PlayerClass } from "../shared/types";
import Game from "../shared/game/Game";
import { mockGameData } from "../shared/mocks";

require("dotenv").config();

const client = new Discord.Client();

client.on("ready", () => {
	if (!client.user) return;
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", async (msg) => {
	if (!client.user) return;
	if (msg.author.id === client.user.id) return;
	msg.channel.send("Peli alkaa...");

	const avatarURL = msg.author.displayAvatarURL({ format: "png", size: 256 });
	const canvas = createCanvas(SCREEN_WIDTH, SCREEN_HEIGHT);
	const ctx = canvas.getContext("2d");

	const gameData = {
		...mockGameData,
		players: [
			...mockGameData.players,
			{
				avatarURL,
				playerClass: PlayerClass.Chungus,
				name: msg.author.username,
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
	console.log(
		"game update & temp file generation took " + time.toFixed(2) + "ms"
	);
	time = performance.now();
	ffmpeg()
		.addInput(`./${tempDirectory}/pic%3d.jpeg`)
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

			rimraf(tempDirectory, (error) => error && console.log(error));
			console.log("deleted temp files successfully");
			msg.channel.send("", { files: ["Areena_fight.mp4"] });
		});
});

client.login(process.env.TOKEN);
