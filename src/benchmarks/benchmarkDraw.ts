import { performance } from "perf_hooks";
import GameRunner from "../bot/GameRunner";
import { createUniqueBotPlayers } from "../shared/bots";
import { PlayerClass } from "../shared/types";

console.log("Starting game.draw() benchmark\n");

const runOneGame = async () => {
	const gameRunner = new GameRunner();
	gameRunner.initializeGame();

	createUniqueBotPlayers(Object.values(PlayerClass).length).forEach(
		({ playerClass: _playerClass, ...botPlayer }, i) => {
			gameRunner.addPlayer(botPlayer);
			gameRunner.setPlayerClass(botPlayer.id, Object.values(PlayerClass)[i]);
		}
	);

	await gameRunner.initializePlayers();

	gameRunner.canvas = { toBuffer: () => Buffer.from(["foo"]) } as any;
	const drawTimeStart = performance.now();

	const { imageBuffers } = gameRunner.runGameLoop(
		gameRunner.game!,
		[] as any,
		"english"
	);

	const drawTime = performance.now() - drawTimeStart;
	const frameCount = imageBuffers.length;

	return { drawTime, frameCount };
};

const runDrawBenchmark = async () => {
	const gameCount = 10;

	console.log(`Running ${gameCount} games.`);

	const drawTimes: number[] = [];
	const frameCounts: number[] = [];

	for (let i = 1; i <= gameCount; i++) {
		const { drawTime, frameCount } = await runOneGame();
		drawTimes.push(drawTime);
		frameCounts.push(frameCount);
		console.log(`Ran game ${i}.`);
	}

	const totalTime = drawTimes.reduce((acc, time) => acc + time, 0);
	const totalFrames = frameCounts.reduce((acc, time) => acc + time, 0);

	console.log(`Total time: ${totalTime.toFixed(2)}ms`);
	console.log(`Frames: ${totalFrames}`);
	console.log(`Time per frame: ${(totalTime / totalFrames).toFixed(2)}ms\n`);
};

runDrawBenchmark();
