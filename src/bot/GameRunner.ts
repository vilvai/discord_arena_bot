import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import rimraf from "rimraf";
import {
	createCanvas,
	Canvas,
	PngConfig as CanvasPngConfig,
	JpegConfig as CanvasJpegConfig,
} from "canvas";

import Game from "../shared/game/Game";
import {
	SCREEN_WIDTH,
	SCREEN_HEIGHT,
	GAME_FPS,
	RENDER_FILE_NAME,
} from "../shared/constants";
import {
	PlayerData,
	PlayerClassesById,
	PlayerClass,
	GameEndReason,
	GameEndData,
} from "../shared/types";
import { loadFonts } from "./loadFonts";
import { startTimer, logTimer } from "../shared/timer";
import { Language } from "./languages";

type PlayerWithoutClass = Omit<PlayerData, "playerClass">;
const defaultClass = PlayerClass.Fighter;
loadFonts();

export default class GameRunner {
	constructor() {
		this.playersInGame = [];
		this.canvas = createCanvas(SCREEN_WIDTH, SCREEN_HEIGHT);
		this.playerClassesById = {};
	}

	initializeGame() {
		this.playersInGame = [];
		const ctx = this.canvas.getContext("2d");
		this.game = new Game(ctx);
	}

	game?: Game;
	canvas: Canvas;
	playersInGame: PlayerWithoutClass[];
	playerClassesById: PlayerClassesById;

	getPlayerCount() {
		return this.playersInGame.length;
	}

	playerInGame(id: string) {
		return this.playersInGame.some((player) => player.id === id);
	}

	addPlayer(player: PlayerWithoutClass) {
		this.playersInGame.push(player);
	}

	setPlayerClass(playerId: string, playerClass: PlayerClass) {
		this.playerClassesById[playerId] = playerClass;
	}

	getCurrentPlayersWithClasses = (): Array<[string, PlayerClass]> => {
		return this.playersInGame.map((player) => [
			player.name,
			this.playerClassesById[player.id] || defaultClass,
		]);
	};

	runGame = async (
		inputFolder: string,
		outputFolder: string,
		language: Language
	): Promise<GameEndData | null> => {
		if (!this.game) return null;
		await this.initializePlayers();

		const timerAction = "Game update, draw and temp file generation";
		startTimer(timerAction);

		this.createFolders(inputFolder, outputFolder);

		const gameEndData = this.runGameLoop(
			this.game,
			inputFolder,
			["image/jpeg", { quality: 0.98 }],
			language
		);

		logTimer(timerAction);
		await this.renderVideo(inputFolder, outputFolder);
		return gameEndData;
	};

	initializePlayers = async () => {
		if (!this.game) return;
		const players = this.playersInGame.map((player) => ({
			...player,
			playerClass: this.playerClassesById[player.id] || defaultClass,
		}));

		await this.game.initializeGame(players);
	};

	createFolders = (inputFolder: string, outputFolder: string) => {
		rimraf.sync(inputFolder);
		rimraf.sync(outputFolder);

		fs.mkdirSync(inputFolder);
		fs.mkdirSync(outputFolder);
	};

	runGameLoop = (
		game: Game,
		inputFolder: string,
		toBufferArgs:
			| ["image/png", CanvasPngConfig]
			| ["image/jpeg", CanvasJpegConfig],
		language: Language
	): GameEndData => {
		let gameEndData: GameEndData = {
			gameEndReason: GameEndReason.TimeUp,
		};

		let i = 0;
		let endingTime = Infinity;

		const tailTimeSeconds = 2;
		const gameMaxTimeSeconds = 30;
		while (i < gameMaxTimeSeconds * GAME_FPS && i < endingTime) {
			game.draw(language);
			const stream = fs.createWriteStream(
				`${inputFolder}/pic${i.toString().padStart(3, "0")}.jpeg`
			);
			const [fileType, config]: [any, any] = toBufferArgs;
			stream.write(this.canvas.toBuffer(fileType, config), () =>
				stream.close()
			);
			game.update();
			if (game.isGameOver() && endingTime === Infinity) {
				endingTime = i + tailTimeSeconds * GAME_FPS;
				const winner = game.getWinner();
				gameEndData = {
					gameEndReason: GameEndReason.PlayerWon,
					winnerName: winner ? winner.name : null,
				};
			}
			i++;
		}

		return gameEndData;
	};

	renderVideo = async (inputFolder: string, outputFolder: string) =>
		new Promise((resolve) => {
			const timerAction = "FFMpeg render";
			startTimer(timerAction);
			ffmpeg()
				.addInput(`./${inputFolder}/pic%3d.jpeg`)
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
				.save(`./${outputFolder}/${RENDER_FILE_NAME}.mp4`)
				.on("end", () => {
					logTimer(timerAction);
					rimraf(`./${inputFolder}`, (error) => error && console.log(error));
					console.log("deleted input files successfully");
					resolve();
				});
		});
}
