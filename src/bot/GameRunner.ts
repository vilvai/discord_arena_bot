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
	TEMP_FILE_DIRECTORY,
} from "../shared/constants";
import {
	PlayerData,
	PlayerClassesById,
	PlayerClass,
	PNGConfig,
	JPEGConfig,
} from "../shared/types";
import { loadFonts } from "./loadFonts";
import { startTimer, logTimer } from "../shared/timer";

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

	getCurrentPlayersWithClasses() {
		return this.playersInGame
			.map(
				(player) =>
					`${player.name} – ${
						this.playerClassesById[player.id] || defaultClass
					}`
			)
			.join("\n");
	}

	runGame = async () => {
		if (!this.game) return;
		await this.initializePlayers();

		const timerAction = "Game update, draw and temp file generation";
		startTimer(timerAction);

		this.runGameLoop(TEMP_FILE_DIRECTORY, ["image/jpeg", { quality: 0.98 }]);

		logTimer(timerAction);
	};

	initializePlayers = async () => {
		if (!this.game) return;
		const players = this.playersInGame.map((player) => ({
			...player,
			playerClass: this.playerClassesById[player.id] || defaultClass,
		}));

		await this.game.initializeGame(players);
	};

	runGameLoop = (
		tempDirectory: string,
		toBufferArgs:
			| ["image/png", CanvasPngConfig]
			| ["image/jpeg", CanvasJpegConfig]
	) => {
		if (!this.game) return;
		fs.mkdirSync(tempDirectory);
		let i = 0;
		let endingTime = Infinity;

		const tailTimeSeconds = 2;
		const gameMaxTimeSeconds = 30;
		while (i < gameMaxTimeSeconds * GAME_FPS && i < endingTime) {
			this.game.draw();
			const stream = fs.createWriteStream(
				`${tempDirectory}/pic${i.toString().padStart(3, "0")}.jpeg`
			);
			const [fileType, config]: [any, any] = toBufferArgs;
			stream.write(this.canvas.toBuffer(fileType, config), () =>
				stream.close()
			);
			this.game.update();
			if (this.game.isGameOver() && endingTime === Infinity) {
				endingTime = i + tailTimeSeconds * GAME_FPS;
			}
			i++;
		}
	};

	renderVideo = async (tempDirectory: string) =>
		new Promise((resolve) => {
			const timerAction = "FFMpeg render";
			startTimer(timerAction);
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
					logTimer(timerAction);
					rimraf(tempDirectory, (error) => error && console.log(error));
					console.log("deleted temp files successfully");
					resolve();
				});
		});
}
