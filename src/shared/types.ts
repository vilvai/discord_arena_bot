export interface PlayerData {
	avatarURL: string;
	x: number;
	y: number;
}

export interface GameData {
	players: {
		[key: string]: PlayerData;
	};
}
