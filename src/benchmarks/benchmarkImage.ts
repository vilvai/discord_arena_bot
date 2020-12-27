import { createCanvas, PngConfig as CanvasPngConfig } from "canvas";
import { performance } from "perf_hooks";

import { createUniqueBotPlayers } from "../shared/bots";
import GameRunner from "../bot/GameRunner";
import { PNGConfig, JPEGConfig } from "../shared/types";

const gameRunner = new GameRunner();

const renderGame = async (config: PNGConfig | JPEGConfig) => {
	gameRunner.initializeGame();

	createUniqueBotPlayers(5).forEach(({ playerClass, ...botPlayer }) => {
		gameRunner.addPlayer(botPlayer);
		gameRunner.setPlayerClass(botPlayer.id, playerClass);
	});

	let customToBufferArgs;

	if (config.fileType === "png") {
		const { filters, compressionLevel } = config;
		customToBufferArgs = [
			"image/png",
			{
				compressionLevel,
				filters,
			},
		];
	} else {
		const { quality, progressive, chromaSubsampling } = config;
		customToBufferArgs = [
			"image/jpeg",
			{
				quality,
				progressive,
				chromaSubsampling,
			},
		];
	}

	await gameRunner.initializePlayers();

	if (!gameRunner.game) return;

	const updateTimeStart = performance.now();

	const { imageBuffers } = gameRunner.runGameLoop(
		gameRunner.game,
		customToBufferArgs as any
	);

	const updateTime = performance.now() - updateTimeStart;

	const totalImageBufferSizes = imageBuffers.reduce(
		(acc, imageBuffer) => acc + imageBuffer.length,
		0
	);

	const frameCount = imageBuffers.length;

	console.log({
		frameCount,
		...config,
		timePerFrame: (updateTime / frameCount).toFixed(2) + "ms",
		sizePerFrame: (totalImageBufferSizes / 1024 / frameCount).toFixed(2) + "kB",
	});
};

type FileType = "png" | "jpeg";
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
					compressionLevel: compressionLevel as CanvasPngConfig["compressionLevel"],
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
				chromaSubsampling: true,
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
