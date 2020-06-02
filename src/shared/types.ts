export enum PlayerClass {
	Spuge = "spuge",
	Teekkari = "teekkari",
	Chungus = "chungus",
	Assassin = "assassin",
	Fighter = "fighter",
}

export interface PlayerData {
	avatarURL: string;
	playerClass: PlayerClass;
	name: string;
}

export interface GameData {
	players: PlayerData[];
}

export interface Target {
	x: number;
	y: number;
}
