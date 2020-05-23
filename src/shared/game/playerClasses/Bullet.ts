import Player from "./Player";
import { SCREEN_WIDTH, SIDEBAR_WIDTH, SCREEN_HEIGHT } from "../../constants";
import { TURRET_DAMAGE } from "./Turret";

export default class Bullet {
	constructor(
		x: number,
		y: number,
		xDirection: number,
		yDirection: number,
		onDelete: (bullet: Bullet) => void
	) {
		const bulletSpeed = 8;
		this.x = x;
		this.y = y;
		this.xSpeed = xDirection * bulletSpeed;
		this.ySpeed = yDirection * bulletSpeed;
		this.size = 2;
		this.onDelete = onDelete;
	}

	x: number;
	y: number;
	owner: Player;
	xSpeed: number;
	ySpeed: number;
	size: number;
	onDelete: (bullet: Bullet) => void;

	update(otherPlayers: Player[]) {
		this.x += this.xSpeed;
		this.y += this.ySpeed;
		this.checkPlayerCollision(otherPlayers);
		if (this.isOutsideMap()) this.onDelete(this);
	}

	checkPlayerCollision(otherPlayers: Player[]) {
		otherPlayers.forEach((player) => {
			const { x: playerX, y: playerY } = player;
			const distance = Math.sqrt(
				(playerX - this.x) ** 2 + (playerY - this.y) ** 2
			);
			if (distance <= player.radius) {
				player.onHit(this.x, this.y, TURRET_DAMAGE);
				player.setTarget(this.owner);
				this.onDelete(this);
				return;
			}
		});
	}

	isOutsideMap() {
		return (
			this.x > SCREEN_WIDTH ||
			this.x < SIDEBAR_WIDTH ||
			this.y > SCREEN_HEIGHT ||
			this.y < 0
		);
	}

	draw(ctx: CanvasRenderingContext2D) {
		ctx.fillStyle = "#eee";
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
		ctx.fill();
	}
}
