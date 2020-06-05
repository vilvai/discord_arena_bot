import BasePlayer from "./BasePlayer";
import { SCREEN_WIDTH, SIDEBAR_WIDTH, SCREEN_HEIGHT } from "../../constants";

export const findRandomAliveTarget = (players: BasePlayer[]): BasePlayer => {
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

export const isOutsideMap = (x: number, y: number) =>
	x > SCREEN_WIDTH || x < SIDEBAR_WIDTH || y > SCREEN_HEIGHT || y < 0;

export const checkPlayerCollision = (
	x: number,
	y: number,
	otherPlayers: BasePlayer[]
): BasePlayer | null => {
	for (const player of otherPlayers) {
		const { x: playerX, y: playerY } = player;
		const distance = Math.sqrt((playerX - x) ** 2 + (playerY - y) ** 2);
		if (distance <= player.radius) return player;
	}
	return null;
};

export const randomizeAttributes = <P extends BasePlayer, A extends keyof P>(
	player: P,
	attributes: A[]
) =>
	attributes.forEach((attribute) => {
		(player[attribute] as any) *= Math.random() * 0.2 + 0.9;
	});

export const IS_RUNNING_ON_NODE = !!process.release;
