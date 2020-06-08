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
	id: string;
}

export interface Target {
	x: number;
	y: number;
}

export interface PlayerClassesById {
	[playerId: string]: PlayerClass;
}
