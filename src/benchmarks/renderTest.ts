import GameRunner from "../bot/GameRunner";
import { createUniqueBotPlayers } from "../shared/bots";

console.log("Starting render test");

const INPUT_FOLDER = "renderTestInput";
const OUTPUT_FOLDER = "renderTestOutput";

const runRenderTest = async () => {
	const gameRunner = new GameRunner();
	gameRunner.initializeGame();

	createUniqueBotPlayers(3).forEach(({ playerClass, ...botPlayer }) => {
		gameRunner.addPlayer(botPlayer);
		gameRunner.setPlayerClass(botPlayer.id, playerClass);
	});

	await gameRunner.runGame(INPUT_FOLDER, OUTPUT_FOLDER, "suomi");
};

runRenderTest();
