import { GameData, PlayerClass } from "../types";
import Player from "./playerClasses/Player";
import {
	SCREEN_HEIGHT,
	SIDEBAR_WIDTH,
	SCREEN_WIDTH,
	PLAYER_STARTING_CIRCLE_RADIUS,
} from "../constants";
import Sidebar from "./Sidebar";
import Chungus from "./playerClasses/Chungus";
import Blood from "./Blood";

export default class Game {
	constructor(ctx: CanvasRenderingContext2D) {
		this.ctx = ctx;
	}
	gameData: GameData;
	ctx: CanvasRenderingContext2D;
	players: Player[];
	bloodStains: Blood[];
	sidebar: Sidebar;

	static calculatePlayerStartingPosition(numberOfPlayers: number, i: number) {
		let x = SIDEBAR_WIDTH + (SCREEN_WIDTH - SIDEBAR_WIDTH) / 2;
		let y = SCREEN_HEIGHT / 2;

		const angle = ((Math.PI * 2) / numberOfPlayers) * i - Math.PI / 2;

		x += Math.cos(angle) * PLAYER_STARTING_CIRCLE_RADIUS;
		y += Math.sin(angle) * PLAYER_STARTING_CIRCLE_RADIUS;

		return { x, y };
	}

	async initializeGame(gameData: GameData) {
		this.players = [];
		for (const [i, playerData] of gameData.players.entries()) {
			const { x, y } = Game.calculatePlayerStartingPosition(
				gameData.players.length,
				i
			);
			let player;
			switch (playerData.class) {
				case PlayerClass.Chungus:
					player = new Chungus(x, y, this.createBloodStain);
					break;
				default:
					player = new Player(x, y, this.createBloodStain);
					break;
			}
			await player.loadAvatar(playerData.avatarURL);
			this.players.push(player);
		}
		this.bloodStains = [];
		this.sidebar = new Sidebar();
	}

	isGameOver = () =>
		this.players.filter((player) => !player.isDead()).length > 1;

	createBloodStain = (x: number, y: number, size: number) =>
		this.bloodStains.push(new Blood(x, y, size));

	update() {
		this.players.forEach((player) => {
			const otherPlayers = this.players.filter(
				(thatPlayer) => thatPlayer !== player
			);
			player.update(otherPlayers);
		});
	}

	draw() {
		this.ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
		this.ctx.resetTransform();
		this.ctx.imageSmoothingQuality = "high";

		this.drawBackground();
		this.bloodStains.forEach((bloodStain) => bloodStain.draw(this.ctx));
		this.sidebar.draw(this.ctx, this.players);

		const alivePlayers = this.players.filter((player) => !player.isDead());
		const deadPlayers = this.players.filter((player) => player.isDead());
		deadPlayers.forEach((player) => player.draw(this.ctx));
		alivePlayers.forEach((player) => player.draw(this.ctx));
	}

	drawBackground() {
		this.ctx.fillStyle = "#36393F";
		this.ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
	}
}
