import { GameEndReason, PlayerClass, PlayerData } from "../types";
import BasePlayer from "./playerClasses/BasePlayer";
import {
	SCREEN_HEIGHT,
	SIDEBAR_WIDTH,
	SCREEN_WIDTH,
	PLAYER_STARTING_CIRCLE_RADIUS,
} from "../constants";
import Sidebar from "./Sidebar";
import Chungus from "./playerClasses/Chungus";
import Blood from "./Blood";
import Teekkari from "./playerClasses/Teekkari";
import Turret from "./playerClasses/Turret";
import Spuge from "./playerClasses/Spuge";
import BeerCan from "./playerClasses/BeerCan";
import Assassin from "./playerClasses/Assassin";
import ParticleHandler from "./ParticleHandler";
import GameOverOverlay from "./GameOverOverlay";
import { createCanvas } from "canvas";

export default class Game {
	constructor(private ctx: CanvasRenderingContext2D) {}

	players!: BasePlayer[];
	bloodStains!: Blood[];
	cachedBloodStains!: Blood[];
	sidebar!: Sidebar;
	gameOverOverlay?: GameOverOverlay;
	turrets!: Turret[];
	beerCans!: BeerCan[];
	particleHandler!: ParticleHandler;
	cachedBackgroundCanvas!: OffscreenCanvas;
	cachingCounter: number = 0;

	static calculatePlayerStartingPosition(numberOfPlayers: number, i: number) {
		let x = SIDEBAR_WIDTH + (SCREEN_WIDTH - SIDEBAR_WIDTH) / 2;
		let y = SCREEN_HEIGHT / 2;

		const angle = ((Math.PI * 2) / numberOfPlayers) * i - Math.PI / 2;

		x += Math.cos(angle) * PLAYER_STARTING_CIRCLE_RADIUS;
		y += Math.sin(angle) * PLAYER_STARTING_CIRCLE_RADIUS;

		return { x, y };
	}

	async initializeGame(players: PlayerData[]) {
		this.players = [];
		for (const [i, playerData] of players.entries()) {
			const { x, y } = Game.calculatePlayerStartingPosition(players.length, i);
			let player;
			switch (playerData.playerClass) {
				case PlayerClass.Chungus:
					player = new Chungus(x, y, this.createBloodStain, playerData.name);
					break;
				case PlayerClass.Teekkari:
					player = new Teekkari(
						x,
						y,
						this.createBloodStain,
						playerData.name,
						this.createTurret
					);
					break;
				case PlayerClass.Spuge:
					player = new Spuge(
						x,
						y,
						this.createBloodStain,
						playerData.name,
						this.createBeerCan
					);
					break;
				case PlayerClass.Assassin:
					player = new Assassin(
						x,
						y,
						this.createBloodStain,
						playerData.name,
						this.createDodgeParticles
					);
					break;
				default:
					player = new BasePlayer(x, y, this.createBloodStain, playerData.name);
					break;
			}
			await player.loadAvatar(playerData.avatarURL);
			this.players.push(player);
		}
		this.bloodStains = [];
		this.cachedBloodStains = [];
		this.turrets = [];
		this.beerCans = [];
		this.sidebar = new Sidebar(this.players);
		this.particleHandler = new ParticleHandler();
		this.gameOverOverlay = undefined;
		this.updateBackgroundCanvas();
	}

	isGameOver = () =>
		this.players.filter((player) => !player.isDead()).length <= 1;

	createBloodStain = (
		x: number,
		y: number,
		size: number,
		xSpeed: number,
		ySpeed: number
	) => {
		this.bloodStains.push(
			new Blood(x, y, size, xSpeed, ySpeed, this.updateBackgroundCanvas)
		);
	};

	checkForBloodMerge = (bloodToBeMerged: Blood) => {
		const { x, y, size } = bloodToBeMerged;

		const nearestBlood = this.bloodStains.find((bloodStain) => {
			if (bloodStain === bloodToBeMerged) return false;
			if (bloodStain.toBeDeleted) return false;

			const distance = Math.sqrt(
				(bloodStain.x - x) ** 2 + (bloodStain.y - y) ** 2
			);
			return distance < bloodStain.size + size;
		});

		if (nearestBlood === undefined) return;

		nearestBlood.size = Math.sqrt(nearestBlood.size ** 2 + size);
		nearestBlood.x = nearestBlood.x / 2 + x / 2;
		nearestBlood.y = nearestBlood.y / 2 + y / 2;
		//bloodToBeMerged.toBeDeleted = true;
	};

	onDeleteBlood = (bloodToBeDeleted: Blood) => {
		this.bloodStains = this.bloodStains.filter(
			(bloodStain) => bloodStain !== bloodToBeDeleted
		);
	};

	createTurret = (x: number, y: number, owner: BasePlayer) =>
		this.turrets.push(new Turret(x, y, owner));

	createBeerCan = (
		x: number,
		y: number,
		xSpeed: number,
		ySpeed: number,
		owner: BasePlayer
	) =>
		this.beerCans.push(
			new BeerCan(x, y, xSpeed, ySpeed, owner, this.onDeleteBeerCan)
		);

	onDeleteBeerCan = (beerCanToBeDeleted: BeerCan) =>
		(this.beerCans = this.beerCans.filter(
			(beerCan) => beerCan !== beerCanToBeDeleted
		));

	createDodgeParticles = (x: number, y: number) =>
		this.particleHandler.createDodgeParticles(x, y);

	getWinner = () => {
		const alivePlayers = this.players.filter((player) => !player.isDead());
		if (alivePlayers.length === 1) return alivePlayers[0];
		else return null;
	};

	update() {
		this.players.forEach((player) => {
			const otherPlayers = this.players.filter(
				(somePlayer) => somePlayer !== player
			);
			player.update(otherPlayers);
		});
		this.turrets.forEach((turret) => {
			const otherPlayers = this.players.filter(
				(player) => player !== turret.owner
			);
			turret.update(otherPlayers);
		});
		this.beerCans.forEach((beerCan) => {
			const otherPlayers = this.players.filter(
				(player) => player !== beerCan.owner
			);
			beerCan.update(otherPlayers);
		});
		this.particleHandler.update();

		this.bloodStains.forEach((bloodStain) => bloodStain.update());
		this.bloodStains = this.bloodStains.filter(
			(bloodStain) => !bloodStain.toBeDeleted
		);

		if (this.isGameOver()) {
			if (this.gameOverOverlay === undefined) {
				this.initializeGameOverOverlay(GameEndReason.PlayerWon);
			}
		}
		if (this.gameOverOverlay !== undefined) {
			this.gameOverOverlay.update();
		}

		this.cachingCounter += 1;
		if (this.cachingCounter === 50) {
			this.cachedBloodStains = [
				...this.cachedBloodStains,
				...this.bloodStains.filter(
					({ xSpeed, ySpeed }) => xSpeed === 0 && ySpeed === 0
				),
			];
			this.bloodStains = this.bloodStains.filter(
				(bloodStain) => !this.cachedBloodStains.includes(bloodStain)
			);
			this.updateBackgroundCanvas();
			this.cachingCounter = 0;
		}
	}

	initializeGameOverOverlay(gameEndReason: GameEndReason) {
		let gameOverText: string = "";
		let winnerName: string | undefined = undefined;
		let winnerAvatar: CanvasImageSource | undefined = undefined;

		if (gameEndReason === GameEndReason.TimeUp) {
			gameOverText = "TIME'S UP!";
		} else if (gameEndReason === GameEndReason.PlayerWon) {
			const winner = this.getWinner();
			if (winner === null) {
				gameOverText = "TIE!";
			} else {
				gameOverText = "WINNER:";
				winnerName = winner.name;
				winnerAvatar = winner.avatar;
			}
		}

		this.gameOverOverlay = new GameOverOverlay(
			gameOverText,
			winnerName,
			winnerAvatar
		);
	}

	updateBackgroundCanvas = () => {
		const canvas = createCanvas(SCREEN_WIDTH - SIDEBAR_WIDTH, SCREEN_HEIGHT);
		const ctx = canvas.getContext("2d");

		ctx.fillStyle = "#36393F";
		ctx.translate(-SIDEBAR_WIDTH, 0);
		ctx.fillRect(SIDEBAR_WIDTH, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

		this.cachedBloodStains.forEach((stillBlood) => stillBlood.draw(ctx));

		this.cachedBackgroundCanvas = canvas as any;
	};

	draw() {
		this.ctx.resetTransform();

		this.ctx.save();
		this.ctx.rect(SIDEBAR_WIDTH, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
		this.ctx.clip();
		// @ts-ignore textDrawingMode exists on node-canvas
		if (this.ctx.textDrawingMode) this.ctx.textDrawingMode = "path";

		const deadPlayers = this.players.filter((player) => player.isDead());
		const alivePlayers = this.players.filter((player) => !player.isDead());

		const stillBlood = this.bloodStains.filter(
			({ xSpeed, ySpeed }) => xSpeed === 0 && ySpeed === 0
		);
		const movingBlood = this.bloodStains.filter(
			(bloodStain) => !stillBlood.includes(bloodStain)
		);

		this.drawBackground();
		stillBlood.forEach((bloodStain) => bloodStain.draw(this.ctx));

		deadPlayers.forEach((player) => player.draw(this.ctx));
		this.turrets.forEach((turret) => turret.draw(this.ctx));
		alivePlayers.forEach((player) => player.draw(this.ctx));
		this.beerCans.forEach((beerCan) => beerCan.draw(this.ctx));
		this.particleHandler.draw(this.ctx);

		this.players.forEach((player) => player.drawHealthbar(this.ctx));
		movingBlood.forEach((bloodStain) => bloodStain.draw(this.ctx));
		this.ctx.restore();
		this.sidebar.draw(this.ctx, this.players);
		if (this.gameOverOverlay) this.gameOverOverlay.draw(this.ctx);
	}

	drawBackground() {
		this.ctx.drawImage(this.cachedBackgroundCanvas, SIDEBAR_WIDTH, 0);
	}
}
