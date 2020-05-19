export enum PlayerClass {
	Spuge = "spuge",
	Teekkari = "teekkari",
	Chungus = "chungus",
	Assassin = "assassin",
	Fighter = "fighter",
}

export interface PlayerData {
	avatarURL: string;
	class: PlayerClass;
	name: string;
}

export interface GameData {
	players: PlayerData[];
}

/*
{
	"players": {
		"ads": {
			"avatarURL": "https://vectorified.com/images/royalty-free-icon-14.png",
			"x": 20,
			"y": 30
		}
	}
}
*/
