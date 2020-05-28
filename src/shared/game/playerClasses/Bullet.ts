import BasePlayer from "./BasePlayer";
import { TURRET_DAMAGE } from "./Turret";
import { isOutsideMap, checkPlayerCollision } from "./utils";

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
	owner: BasePlayer;
	xSpeed: number;
	ySpeed: number;
	size: number;
	onDelete: (bullet: Bullet) => void;

	update(otherPlayers: BasePlayer[]) {
		this.x += this.xSpeed;
		this.y += this.ySpeed;
		this.checkPlayerCollision(otherPlayers);
		if (isOutsideMap(this.x, this.y)) this.onDelete(this);
	}

	checkPlayerCollision(otherPlayers: BasePlayer[]) {
		const collidedPlayer = checkPlayerCollision(this.x, this.y, otherPlayers);
		if (collidedPlayer !== null) {
			collidedPlayer.onHit(this.x, this.y, TURRET_DAMAGE);
			collidedPlayer.setTarget(this.owner);
			this.onDelete(this);
		}
	}

	draw(ctx: CanvasRenderingContext2D) {
		ctx.fillStyle = "#eee";
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
		ctx.fill();
	}
}
