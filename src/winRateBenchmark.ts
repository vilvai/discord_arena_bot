import { PlayerData, PlayerClass } from "./shared/types";
import Game from "./shared/game/Game";
import { createCanvas } from "canvas";
import { SCREEN_WIDTH, SCREEN_HEIGHT } from "./shared/constants";
import { createUniqueBotPlayers } from "./shared/bots";
import { getPlayerClassName } from "./shared/game/playerClasses/getPlayerClassName";

const MAX_GAME_TICKS = 900;

const runGame = async (players: PlayerData[]) => {
	const canvas = createCanvas(SCREEN_WIDTH, SCREEN_HEIGHT);
	const ctx = canvas.getContext("2d");
	const game = new Game(ctx);
	await game.initializeGame(players);

	let i = 0;

	while (i < MAX_GAME_TICKS && !game.isGameOver()) {
		game.update();
		i++;
	}

	return game.isGameOver() ? game.getWinner() : null;
};

const dataByClass: {
	[playerClass: string]: { wins: number; games: number; winRate: string };
} = {};

const playerClassToClassName = {
	[PlayerClass.Fighter]: "FIGHTER",
	[PlayerClass.Chungus]: "CHUNGUS",
	[PlayerClass.Assassin]: "ASSASSIN",
	[PlayerClass.Spuge]: "SPUGE",
	[PlayerClass.Teekkari]: "TEEKKARI",
};

const runGames = async () => {
	const numberOfGames = 10;
	const playerCount = 5;
	for (let i = 0; i < numberOfGames; i++) {
		const randomPlayers = createUniqueBotPlayers(playerCount);
		const winner = await runGame(randomPlayers);

		randomPlayers.forEach((player) => {
			if (!dataByClass[playerClassToClassName[player.playerClass]]) {
				dataByClass[playerClassToClassName[player.playerClass]] = {
					wins: 0,
					games: 0,
					winRate: "0%",
				};
			}
			dataByClass[playerClassToClassName[player.playerClass]].games += 1;
		});

		if (winner !== null) {
			dataByClass[getPlayerClassName(winner)].wins += 1;
		}
	}

	Object.values(dataByClass).forEach((classData) => {
		classData.winRate = `${((classData.wins / classData.games) * 100).toFixed(
			2
		)}%`;
	});

	console.log(`Ran ${numberOfGames} games with ${playerCount} players`);

	Object.entries(dataByClass).forEach(([playerClass, classData]) => {
		console.log(
			`${playerClass}:     \t Winrate: ${classData.winRate}\tWins: ${classData.wins}\t Games: ${classData.games}`
		);
	});
};

runGames();
