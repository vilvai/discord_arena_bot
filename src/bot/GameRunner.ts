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
	GAME_OVER_OVERLAY_DURATION,
} from "../shared/constants";
import { PlayerClass, GameEndReason } from "../shared/types";
import { loadFonts } from "./loadFonts";
import { startTimer, logTimer } from "../shared/timer";

import type {
	PlayerData,
	PlayerClassesById,
	GameEndData,
} from "../shared/types";

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
		this.game = new Game(ctx as CanvasRenderingContext2D);
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
		outputFolder: string
	): Promise<GameEndData | null> => {
		if (!this.game) return null;
		await this.initializePlayers();

		const gameUpdateTimerString =
			"Game update, draw and image buffer generation";
		startTimer(gameUpdateTimerString);

		this.createFolders(inputFolder, outputFolder);

		const { gameEndData, imageBuffers } = this.runGameLoop(this.game, [
			"image/jpeg",
			{ quality: 0.95 },
		]);

		logTimer(gameUpdateTimerString);

		const inputFileWriteTimerString = "Input file writing";
		startTimer(inputFileWriteTimerString);

		await this.writeInputFiles(inputFolder, imageBuffers);

		logTimer(inputFileWriteTimerString);

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
		toBufferArgs:
			| ["image/png", CanvasPngConfig]
			| ["image/jpeg", CanvasJpegConfig]
	): { gameEndData: GameEndData; imageBuffers: Buffer[] } => {
		let gameEndData: GameEndData = {
			gameEndReason: GameEndReason.TimeUp,
		};

		const imageBuffers: Buffer[] = [];

		let i = 0;
		const gameMaxTimeSeconds = 30;
		let endingTime: number = Infinity;

		while (i < endingTime) {
			game.draw();

			let chunk: Buffer;

			/*
				This if-else is required because of a bug in Typescript.
				See: https://github.com/Microsoft/TypeScript/issues/4130
			*/
			if (toBufferArgs[0] === "image/png") {
				chunk = this.canvas.toBuffer(...toBufferArgs);
			} else {
				chunk = this.canvas.toBuffer(...toBufferArgs);
			}

			imageBuffers.push(chunk);

			game.update();

			if (game.isGameOver() && endingTime === Infinity) {
				endingTime = i + GAME_OVER_OVERLAY_DURATION;
				const winner = game.getWinner();
				gameEndData = {
					gameEndReason: GameEndReason.PlayerWon,
					winnerName: winner ? winner.name : null,
				};
			} else if (i === gameMaxTimeSeconds * GAME_FPS) {
				endingTime = i + GAME_OVER_OVERLAY_DURATION;
				game.initializeGameOverOverlay(GameEndReason.TimeUp);
			}
			i++;
		}

		return { gameEndData, imageBuffers };
	};

	writeInputFiles = async (inputFolder: string, imageBuffers: Buffer[]) =>
		await Promise.all(
			imageBuffers.map(
				(imageBuffer, i): Promise<void> =>
					new Promise((resolve, reject) => {
						const stream = fs.createWriteStream(
							`${inputFolder}/${i.toString().padStart(3, "0")}.jpeg`
						);
						stream.write(imageBuffer, (possibleError) => {
							if (possibleError === null || possibleError === undefined) {
								stream.close();
								resolve();
							} else {
								console.error(
									`Error when writing input file: ${possibleError.name}\n${possibleError.message}`
								);
								reject();
							}
						});
					})
			)
		);

	renderVideo = async (
		inputFolder: string,
		outputFolder: string
	): Promise<void> =>
		new Promise((resolve, reject) => {
			const timerAction = "FFMpeg render";
			startTimer(timerAction);
			ffmpeg()
				.addInput(`./${inputFolder}/%3d.jpeg`)
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
					rimraf(`./${inputFolder}`, (error) => error && console.error(error));
					console.log("deleted input files successfully");
					resolve();
				})
				.on("error", (error) => {
					const errorMessage = `FFMpeg error: ${error.message}`;
					console.error(errorMessage);
					reject(errorMessage);
				});
		});
}
