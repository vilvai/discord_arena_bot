import GameRunner from "../bot/GameRunner";
import { createRootFolders } from "../bot/createRootFolders";
import { createUniqueBotPlayers } from "../shared/bots";
import { INPUT_FILE_DIRECTORY, RENDER_DIRECTORY } from "../shared/constants";

console.log("Starting render test");

createRootFolders();

const INPUT_FOLDER = `${INPUT_FILE_DIRECTORY}/render_test`;
const OUTPUT_FOLDER = `${RENDER_DIRECTORY}/render_test`;

const runRenderTest = async () => {
	const gameRunner = new GameRunner();
	gameRunner.initializeGame();

	createUniqueBotPlayers(5).forEach(({ playerClass, ...botPlayer }) => {
		gameRunner.addPlayer(botPlayer);
		gameRunner.setPlayerClass(botPlayer.id, playerClass);
	});

	try {
		await gameRunner.runGame(INPUT_FOLDER, OUTPUT_FOLDER);
	} catch (error) {
		console.error(error);
		process.exit(1);
	}
};

runRenderTest();
