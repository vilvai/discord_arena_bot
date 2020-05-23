import Player from "./Player";

export const findRandomAliveTarget = (players: Player[]): Player => {
	const alivePlayers = players.filter((player) => !player.isDead());
	const targetIndex = Math.floor(Math.random() * alivePlayers.length);
	return alivePlayers[targetIndex];
};

export const calculateVector = (
	startX: number,
	startY: number,
	targetX: number,
	targetY: number
) => {
	const deltaX = targetX - startX;
	const deltaY = targetY - startY;
	const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
	return { x: deltaX / distance, y: deltaY / distance, distance };
};
