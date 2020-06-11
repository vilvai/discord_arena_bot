import { PngConfig as CanvasPngConfig } from "canvas";

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
