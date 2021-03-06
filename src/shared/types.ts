import { PngConfig as CanvasPngConfig } from "canvas";

export enum PlayerClass {
	Spuge = "drunk",
	Teekkari = "engineer",
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

export interface PNGConfig {
	fileType: "png";
	compressionLevel: CanvasPngConfig["compressionLevel"];
	filters: CanvasPngConfig["filters"];
}

export interface JPEGConfig {
	fileType: "jpeg";
	quality: number;
	progressive: boolean;
	chromaSubsampling: boolean;
}

export enum GameEndReason {
	PlayerWon = "playerWon",
	TimeUp = "timeUp",
}

export type GameEndData =
	| { gameEndReason: GameEndReason.TimeUp }
	| { gameEndReason: GameEndReason.PlayerWon; winnerName: string | null };
