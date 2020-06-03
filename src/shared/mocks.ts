import { PlayerClass, PlayerData } from "./types";

export const mockGameData = {
	players: [
		{
			avatarURL:
				"https://cdn.discordapp.com/avatars/328204246749020161/7a08d2b1f2f5d168ac50778ecc2fcf93.png?size=128",
			playerClass: PlayerClass.Chungus,
			name: "Cloudberry Gaison",
		},
		{
			avatarURL:
				"https://cdn.discordapp.com/avatars/160995903182864384/fa07b1a1db14e12a994d67ce32a887c3.png?size=128",
			playerClass: PlayerClass.Teekkari,
			name: "Cov🅱e🅱e",
		},
		{
			avatarURL:
				"https://cdn.discordapp.com/avatars/162898422892855297/a0a097c92ee1066133a18afaa9515e29.png?size=128",
			playerClass: PlayerClass.Fighter,
			name: "player2",
		},
		{
			avatarURL:
				"https://cdn.discordapp.com/avatars/160785897149693952/69591f533a458a1a820d709ad491bd3e.png?size=128",
			playerClass: PlayerClass.Spuge,
			name: "player3",
		},
		{
			avatarURL:
				"https://cdn.discordapp.com/avatars/160115262538907658/0de78ec90612f30c34f3140257f9fef9.png?size=128",
			playerClass: PlayerClass.Assassin,
			name: "player4",
		},
	],
};

const getRandomItem = <I>(items: I[]): I =>
	items[Math.floor(Math.random() * items.length)];

export const createNewPlayer = (): PlayerData => ({
	name: getRandomItem(randomPlayerNames),
	playerClass: getRandomItem(Object.values(PlayerClass)),
	avatarURL: getRandomItem(randomPlayerAvatarURLs),
});

const randomPlayerNames = [
	"Kyjb70Grog",
	"Bumpkin",
	"Glomerate",
	"Aardwolf",
	"Macaronic",
	"Equinox",
	"Bourasque",
	"Catechectics",
	"AbracMucid",
	"Threptic",
	"Ballyhoo",
	"Spodogenous",
];

const randomPlayerAvatarURLs = [
	"https://discord.com/assets/dd4dbc0016779df1378e7812eabaa04d.png",
	"https://discord.com/assets/322c936a8c8be1b803cd94861bdfa868.png",
	"https://discord.com/assets/6debd47ed13483642cf09e832ed0bc1b.png",
	"https://discord.com/assets/0e291f67c9274a1abdddeb3fd919cbaa.png",
];
