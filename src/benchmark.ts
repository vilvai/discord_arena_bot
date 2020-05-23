import { createCanvas, PngConfig as CanvasPngConfig, PngConfig } from "canvas";
import fs from "fs";
import { performance } from "perf_hooks";

import Game from "./shared/game/Game";
import { PlayerClass } from "./shared/types";
import { SCREEN_WIDTH, SCREEN_HEIGHT, GAME_FPS } from "./shared/constants";
import rimraf from "rimraf";

type FileType = "png" | "jpeg";

interface PNGConfig {
	fileType: "png";
	compressionLevel: CanvasPngConfig["compressionLevel"];
	filters: CanvasPngConfig["filters"];
}

interface JPEGConfig {
	fileType: "jpeg";
	quality: number;
	progressive: boolean;
	chromaSubsampling: boolean;
}

const renderGame = async (config: PNGConfig | JPEGConfig) => {
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

	let tempDirectory: string;
	if (config.fileType === "png") {
		const { fileType, filters, compressionLevel } = config;
		tempDirectory = `temp-${fileType}-f${filters}-c${compressionLevel}`;
	} else {
		const { fileType, quality, progressive, chromaSubsampling } = config;
		tempDirectory = `temp-${fileType}-q${quality}-p${progressive}-c${chromaSubsampling}`;
	}

	fs.mkdirSync(tempDirectory);

	let time = performance.now();

	while (i < 20 * GAME_FPS && i < endingTime) {
		game.draw();
		const writeStream = fs.createWriteStream(
			`${tempDirectory}/pic${i.toString().padStart(3, "0")}.${config.fileType}`
		);
		let buffer: Buffer;
		if (config.fileType === "png") {
			const { filters, compressionLevel } = config;
			buffer = canvas.toBuffer("image/png", {
				compressionLevel,
				filters,
			});
		} else {
			const { quality, progressive, chromaSubsampling } = config;
			buffer = canvas.toBuffer("image/jpeg", {
				quality,
				progressive,
				chromaSubsampling,
			});
		}

		writeStream.write(buffer, () => writeStream.close());
		game.update();
		if (game.isGameOver() && endingTime === Infinity) {
			endingTime = i + tailTimeSeconds * GAME_FPS;
		}
		i++;
	}

	time = performance.now() - time;
	const updateTime = time;

	setTimeout(() => {
		const tempDirectorySize = fs
			.readdirSync(tempDirectory)
			.reduce(
				(acc, fileName) =>
					acc + fs.statSync(`${tempDirectory}/${fileName}`).size,
				0
			);

		console.log({
			frames: i,
			...config,
			timePerFrame: (updateTime / i).toFixed(2) + "ms",
			sizePerFrame: (tempDirectorySize / 1024 / i).toFixed(2) + "kB",
		});

		//rimraf(`${tempDirectory}`, (error) => error && console.log(error));
	}, 100);
};

const benchmarkCompressionLevels = async (fileType: FileType | "all") => {
	if (fileType === "png" || fileType === "all") {
		const canvas = createCanvas(0, 0);
		const filtersList = [canvas.PNG_ALL_FILTERS, canvas.PNG_NO_FILTERS];
		for (const filters of filtersList) {
			for (
				let compressionLevel = 0;
				compressionLevel <= 9;
				compressionLevel++
			) {
				await renderGame({
					fileType: "png",
					compressionLevel: compressionLevel as PngConfig["compressionLevel"],
					filters,
				});
			}
		}
	}

	if (fileType === "jpeg" || fileType === "all") {
		const jpegQualities = [0.75, 0.8, 0.85, 0.9, 0.95, 0.97, 0.98, 0.99, 1];
		for (const quality of jpegQualities) {
			await renderGame({
				fileType: "jpeg",
				quality,
				progressive: false,
				chromaSubsampling: false,
			});
		}
	}
};

if (process.argv[2] === "png") {
	console.log("benchmarking for png");
	benchmarkCompressionLevels("png");
} else if (process.argv[2] === "jpeg") {
	console.log("benchmarking for jpeg");
	benchmarkCompressionLevels("jpeg");
} else {
	console.log("benchmarking for png and jpeg");
	benchmarkCompressionLevels("all");
}
