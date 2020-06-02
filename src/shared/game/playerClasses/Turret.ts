import { Image as NodeImage } from "canvas";

import BasePlayer from "./BasePlayer";
import { findRandomAliveTarget, calculateVector } from "./utils";
import Bullet from "./Bullet";

let turretImage: HTMLImageElement;
if (process.env.NODE) {
	turretImage = new NodeImage() as any;
	turretImage.src = "src/assets/turret.png";
} else {
	turretImage = new Image();
	const turretSrc = require("../../../assets/turret.png").default;
	turretImage.src = turretSrc;
}

const TURRET_IMAGE_SIZE = 36;
export const TURRET_DAMAGE = 3;

export default class Turret {
	constructor(x: number, y: number, owner: BasePlayer) {
		this.x = x;
		this.y = y;
		this.owner = owner;
		this.shootCooldown = 25;
		this.shootCooldownLeft = this.shootCooldown;
		this.angle = 0;
		this.bullets = [];
	}

	x: number;
	y: number;
	owner: BasePlayer;
	shootCooldown: number;
	shootCooldownLeft: number;
	target?: BasePlayer;
	angle: number;
	bullets: Bullet[];

	update(otherPlayers: BasePlayer[]) {
		this.updateTurretLogic(otherPlayers);
		this.bullets.forEach((bullet) => bullet.update(otherPlayers));
	}

	updateTurretLogic(otherPlayers: BasePlayer[]) {
		if (this.owner.isDead()) return;
		if (!this.target || this.target.isDead())
			this.target = findRandomAliveTarget(otherPlayers);
		if (!this.target) return;
		this.rotateTowardsTarget();
		this.shootCooldownLeft -= 1;
		if (this.shootCooldownLeft === 0) {
			this.shoot();
			this.shootCooldownLeft = this.shootCooldown;
		}
	}

	rotateTowardsTarget() {
		if (!this.target) return;
		const deltaX = this.target.x - this.x;
		const deltaY = this.target.y - this.y;
		this.angle = Math.atan2(deltaY, deltaX);
	}

	shoot() {
		if (!this.target) return;

		const vector = calculateVector(
			this.x,
			this.y,
			this.target.x,
			this.target.y
		);
		this.bullets.push(
			new Bullet(
				this.x,
				this.y,
				vector.x,
				vector.y,
				this.onBulletDelete,
				this.owner
			)
		);
	}

	onBulletDelete = (bulletToBeDeleted: Bullet) => {
		this.bullets = this.bullets.filter(
			(bullet) => bullet !== bulletToBeDeleted
		);
	};

	draw(ctx: CanvasRenderingContext2D) {
		this.bullets.forEach((bullet) => bullet.draw(ctx));
		ctx.translate(this.x, this.y);
		ctx.rotate(this.angle);
		ctx.drawImage(turretImage, -TURRET_IMAGE_SIZE / 2, -TURRET_IMAGE_SIZE / 2);
		ctx.resetTransform();
	}
}
