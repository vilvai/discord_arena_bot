import { createCanvas, loadImage } from "canvas";
import { SCREEN_WIDTH, SIDEBAR_WIDTH, SCREEN_HEIGHT } from "../../constants";
import {
	findRandomAliveTarget,
	calculateVector,
	randomizeAttributes,
} from "../utils";

export type CreateBloodStain = (
	x: number,
	y: number,
	size: number,
	ySpeed: number,
	xSpeed: number
) => void;

export default class BasePlayer {
	constructor(
		public x: number,
		public y: number,
		private createBloodStain: CreateBloodStain,
		public name: string
	) {
		this.radius = 16;
		this.chaseSpeed = 0;
		this.knockbackXSpeed = 0;
		this.knockbackYSpeed = 0;
		this.maxSpeed = 3;
		this.acceleration = 0.1;
		this.damage = 6;
		this.maxHealth = 30;
		this.health = this.maxHealth;
		this.meleeRange = this.radius * 1.5;
		this.meleeCooldown = 30;
		this.meleeCooldownLeft = 0;
		randomizeAttributes(this, [
			"maxSpeed",
			"damage",
			"meleeRange",
			"meleeCooldown",
		]);
	}

	avatar?: CanvasImageSource;
	cachedAvatarImage?: any;
	cachedDeadAvatarImage?: any;
	radius: number;
	target?: BasePlayer;
	chaseSpeed: number;
	knockbackXSpeed: number;
	knockbackYSpeed: number;
	maxSpeed: number;
	acceleration: number;
	damage: number;
	maxHealth: number;
	health: number;
	meleeRange: number;
	meleeCooldown: number;
	meleeCooldownLeft: number;

	async loadAvatar(avatarURL: string) {
		const avatar: unknown = await loadImage(avatarURL);
		this.avatar = avatar as CanvasImageSource;
		/*
			Avatars are drawn once to their actual size and cached for performance.
			See: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas
		*/
		const { avatarCanvas, deadAvatarCanvas } = this.createCachedAvatars();
		this.cachedAvatarImage = avatarCanvas;
		this.cachedDeadAvatarImage = deadAvatarCanvas;
	}

	createCachedAvatars = (): {
		avatarCanvas: any;
		deadAvatarCanvas: any;
	} => {
		const avatarCanvas = this.createCanvasAvatar(false);
		const deadAvatarCanvas = this.createCanvasAvatar(true);
		return { avatarCanvas, deadAvatarCanvas };
	};

	createCanvasAvatar = (dead: boolean): any => {
		const SIZE = this.radius * 4;
		const canvas = createCanvas(SIZE, SIZE);
		const ctx = canvas.getContext("2d");
		ctx.beginPath();
		ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2, 0, Math.PI * 2);
		ctx.clip();
		ctx.drawImage(this.avatar, 0, 0, SIZE, SIZE);
		if (dead) {
			ctx.fillStyle = "rgba(255,0,0,0.5)";
			ctx.fillRect(0, 0, SIZE, SIZE);
		}
		return canvas;
	};

	onHit(
		sourceX: number,
		sourceY: number,
		damage: number,
		_sourcePlayer?: BasePlayer
	) {
		const vector = calculateVector(this.x, this.y, sourceX, sourceY);
		this.knockbackXSpeed -= vector.x * damage;
		this.knockbackYSpeed -= vector.y * damage;
		this.chaseSpeed = 0;
		this.health = Math.max(this.health - damage, 0);

		const cappedDamage = Math.max(5, damage);
		for (let i = 0; i < Math.floor(cappedDamage * 0.7); i++) {
			const size = cappedDamage * (0.6 + Math.random() * 0.8);
			this.createBloodStain(
				this.x,
				this.y,
				size,
				(1 + Math.random()) * (-vector.x * cappedDamage),
				(1 + Math.random()) * (-vector.y * cappedDamage)
			);
		}

		if (this.health === 0) {
			this.createDeathBloodParticles();
		}
	}

	createDeathBloodParticles() {
		for (let i = 0; i < 10; i++) {
			const size = 8 * (0.6 + Math.random() * 0.8);
			const xDirection = Math.round(Math.random()) * 2 - 1;
			const yDirection = Math.round(Math.random()) * 2 - 1;
			const xSpeed = xDirection * (1 + Math.random() * 4);
			const ySpeed = yDirection * (1 + Math.random() * 4);
			this.createBloodStain(this.x, this.y, size, xSpeed, ySpeed);
		}
	}

	setTarget = (player: BasePlayer) => (this.target = player);

	isDead = () => this.health <= 0;

	update(otherPlayers: BasePlayer[]) {
		this.updateKnockback();

		const alivePlayersLeft = otherPlayers.some((player) => !player.isDead());
		if (!this.isDead() && alivePlayersLeft) this.updateAI(otherPlayers);

		this.constrainIntoArena();
	}

	updateAI(otherPlayers: BasePlayer[]) {
		if (!this.target || this.target.isDead()) {
			this.target = findRandomAliveTarget(otherPlayers);
		}
		if (!this.target) return;
		this.moveTowardsTarget();
		this.checkTargetHit();
		this.meleeCooldownLeft -= 1;
	}

	updateKnockback() {
		this.knockbackXSpeed *= 0.85;
		this.knockbackYSpeed *= 0.85;
		if (Math.abs(this.knockbackXSpeed) < 0.1) this.knockbackXSpeed = 0;
		if (Math.abs(this.knockbackYSpeed) < 0.1) this.knockbackYSpeed = 0;
		this.x += this.knockbackXSpeed;
		this.y += this.knockbackYSpeed;
	}

	inMeleeRange() {
		if (!this.target) return;
		const { x: targetX, y: targetY } = this.target;
		const vector = calculateVector(this.x, this.y, targetX, targetY);
		return vector.distance <= this.meleeRange + this.target.radius;
	}

	moveTowardsTarget() {
		if (!this.target) return;
		this.chaseSpeed = Math.min(
			this.maxSpeed,
			this.chaseSpeed + this.acceleration
		);

		if (!this.inMeleeRange()) {
			const { x: targetX, y: targetY } = this.target;
			const vector = calculateVector(this.x, this.y, targetX, targetY);
			this.x += vector.x * this.chaseSpeed;
			this.y += vector.y * this.chaseSpeed;
		}
	}

	checkTargetHit() {
		if (!this.target) return;
		if (this.inMeleeRange()) {
			this.chaseSpeed = 0;
			if (this.meleeCooldownLeft <= 0) {
				this.target.onHit(this.x, this.y, this.damage, this);
				this.target.setTarget(this);
				this.meleeCooldownLeft = this.meleeCooldown;
			}
		}
	}

	constrainIntoArena() {
		this.x = Math.min(
			Math.max(this.x, SIDEBAR_WIDTH + this.radius),
			SCREEN_WIDTH - this.radius
		);
		this.y = Math.min(
			Math.max(this.y, this.radius),
			SCREEN_HEIGHT - this.radius
		);
	}

	isAtEdgeOfArena() {
		return (
			this.x <= SIDEBAR_WIDTH + this.radius ||
			this.x >= SCREEN_WIDTH - this.radius ||
			this.y <= this.radius ||
			this.y >= SCREEN_HEIGHT - this.radius
		);
	}

	draw(ctx: CanvasRenderingContext2D) {
		this.drawAvatar(ctx);
	}

	drawAvatar(ctx: CanvasRenderingContext2D) {
		if (
			!this.avatar ||
			!this.cachedAvatarImage ||
			!this.cachedDeadAvatarImage
		) {
			return;
		}
		ctx.drawImage(
			this.isDead() ? this.cachedDeadAvatarImage : this.cachedAvatarImage,
			this.x - this.radius,
			this.y - this.radius,
			this.radius * 2,
			this.radius * 2
		);
	}

	drawHealthbar(ctx: CanvasRenderingContext2D) {
		const healthPercent = this.health / this.maxHealth;
		const healthBarY = 4;
		const healthBarWidth = 36;
		const healthBarHeight = 5;
		ctx.fillStyle = "#A00002";
		ctx.fillRect(
			this.x - healthBarWidth / 2,
			this.y - healthBarY - this.radius - healthBarHeight,
			healthBarWidth,
			healthBarHeight
		);
		ctx.fillStyle = "#00CC0D";
		ctx.fillRect(
			this.x - healthBarWidth / 2,
			this.y - healthBarY - this.radius - healthBarHeight,
			healthBarWidth * healthPercent,
			healthBarHeight
		);
	}
}
