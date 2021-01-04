import BasePlayer from "./BasePlayer";
import { isOutsideMap, checkPlayerCollision } from "../utils";
import { TURRET_DAMAGE } from "../../constants";

export default class Bullet {
	constructor(
		private x: number,
		private y: number,
		xDirection: number,
		yDirection: number,
		private onDelete: (bullet: Bullet) => void,
		private owner: BasePlayer
	) {
		const bulletSpeed = 8;
		this.xSpeed = xDirection * bulletSpeed;
		this.ySpeed = yDirection * bulletSpeed;
		this.size = 2;
	}

	xSpeed: number;
	ySpeed: number;
	size: number;

	update(otherPlayers: BasePlayer[]) {
		this.x += this.xSpeed;
		this.y += this.ySpeed;
		this.checkPlayerCollision(otherPlayers);
		if (isOutsideMap(this.x, this.y, this.size)) this.onDelete(this);
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
