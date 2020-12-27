import { createCanvas } from "canvas";

import { PlayerData, PlayerClass } from "../shared/types";
import Game from "../shared/game/Game";
import { SCREEN_WIDTH, SCREEN_HEIGHT } from "../shared/constants";
import { createUniqueBotPlayers } from "../shared/bots";
import { getPlayerClassName } from "../shared/game/playerClasses/getPlayerClassName";

const MAX_GAME_TICKS = 900;

jest.setTimeout(60000);
jest.mock("../shared/game/playerClasses/BasePlayer");

// jest adds stack trace for console.log calls so use process.stdout.write instead
const testLog = (string: string) => process.stdout.write(`${string}\n`);

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

const numberOfGames = 1000;
const numberOfPlayers = 4;

describe("Win rate benchmark", () => {
	it(`Ran ${numberOfGames} games with ${numberOfPlayers} players`, async () => {
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

		for (let i = 0; i < numberOfGames; i++) {
			const randomPlayers = createUniqueBotPlayers(numberOfPlayers);
			const winner = await runGame(randomPlayers);

			randomPlayers.forEach((player) => {
				if (!dataByClass[playerClassToClassName[player.playerClass]]) {
					dataByClass[playerClassToClassName[player.playerClass]] = {
						wins: 0,
						games: 0,
						winRate: "0",
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
			)}`;
		});

		const dataByClassEntries = Object.entries(dataByClass).sort(
			(firstElement, secondElement) =>
				Number(secondElement[1].winRate) - Number(firstElement[1].winRate)
		);

		dataByClassEntries.forEach(([playerClass, classData]) => {
			testLog(
				`${playerClass}:     \tWinrate: ${classData.winRate}%    \tWins: ${classData.wins}     \tGames: ${classData.games}`
			);
		});
		testLog("");

		expect(true).toEqual(true);
	});
});
