import { loadImage } from "canvas";
import { SCREEN_WIDTH, SIDEBAR_WIDTH, SCREEN_HEIGHT } from "../../constants";

export default class Player {
	constructor(
		x: number,
		y: number,
		createBloodStain: (x: number, y: number, size: number) => void,
		name: string
	) {
		this.name = name;
		this.avatar = null;
		this.x = x;
		this.y = y;
		this.radius = 16;
		this.chaseSpeed = 0;
		this.knockbackXSpeed = 0;
		this.knockbackYSpeed = 0;
		this.maxSpeed = 3;
		this.acceleration = 0.1;
		this.damage = 5;
		this.maxHealth = 25;
		this.health = this.maxHealth;
		this.meleeRange = this.radius * 1.5;
		this.meleeCooldown = 30;
		this.meleeCooldownLeft = 0;
		this.createBloodStain = createBloodStain;
		this.randomizeAttributes(
			this.maxSpeed,
			this.damage,
			this.meleeRange,
			this.meleeCooldown
		);
	}

	avatarLoaded: boolean;
	avatar?: CanvasImageSource;
	name: string;
	x: number;
	y: number;
	radius: number;
	target?: Player;
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
	createBloodStain: (x: number, y: number, size: number) => void;

	randomizeAttributes = (...attributes: number[]) =>
		attributes.forEach((attribute) => (attribute *= Math.random() * 0.2 + 0.9));

	async loadAvatar(avatarURL: string) {
		const avatar: unknown = await loadImage(avatarURL);
		this.avatar = avatar as CanvasImageSource;
	}

	calculateVector(targetX: number, targetY: number) {
		const deltaX = targetX - this.x;
		const deltaY = targetY - this.y;
		const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
		return { x: deltaX / distance, y: deltaY / distance, distance };
	}

	onHit(otherPlayer: Player) {
		const { x: sourceX, y: sourceY, damage } = otherPlayer;
		const vector = this.calculateVector(sourceX, sourceY);
		this.knockbackXSpeed -= vector.x * damage;
		this.knockbackYSpeed -= vector.y * damage;
		this.chaseSpeed = 0;
		this.target = otherPlayer;
		const size = damage + Math.random() * 4;
		this.createBloodStain(this.x, this.y, size);
		this.health = Math.max(this.health - damage, 0);
	}

	isDead = () => this.health <= 0;

	update(otherPlayers: Player[]) {
		this.updateKnockback();

		if (!this.isDead()) this.updateAI(otherPlayers);

		this.constrainIntoArena();
		this.updateBleeding();
	}

	updateAI(otherPlayers: Player[]) {
		if (!this.target || this.target.isDead()) this.setNewTarget(otherPlayers);
		if (!this.target) return;
		this.moveTowardsTarget();
		this.checkTargetHit();
		this.meleeCooldownLeft -= 1;
	}

	setNewTarget(otherPlayers: Player[]) {
		const otherAlivePlayers = otherPlayers.filter((player) => !player.isDead());
		if (otherAlivePlayers.length === 0) {
			this.target = null;
			return;
		}
		const targetIndex = Math.floor(Math.random() * otherAlivePlayers.length);
		this.target = otherAlivePlayers[targetIndex];
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
		const { x: targetX, y: targetY } = this.target;
		const vector = this.calculateVector(targetX, targetY);
		return vector.distance <= this.meleeRange + this.target.radius;
	}

	moveTowardsTarget() {
		this.chaseSpeed = Math.min(
			this.maxSpeed,
			this.chaseSpeed + this.acceleration
		);

		if (!this.inMeleeRange()) {
			const { x: targetX, y: targetY } = this.target;
			const vector = this.calculateVector(targetX, targetY);
			this.x += vector.x * this.chaseSpeed;
			this.y += vector.y * this.chaseSpeed;
		}
	}

	checkTargetHit() {
		if (this.inMeleeRange()) {
			this.chaseSpeed = 0;
			if (this.meleeCooldownLeft <= 0) {
				this.target.onHit(this);
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

	updateBleeding() {
		if ((1 - this.health / this.maxHealth) * 0.07 > Math.random()) {
			const size = 6 + Math.random() * 4;
			this.createBloodStain(this.x, this.y, size);
		}
	}

	draw(ctx: CanvasRenderingContext2D) {
		this.drawAvatar(ctx);
	}

	drawAvatar(ctx: CanvasRenderingContext2D) {
		ctx.save();
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
		ctx.clip();
		ctx.drawImage(
			this.avatar,
			this.x - this.radius,
			this.y - this.radius,
			this.radius * 2,
			this.radius * 2
		);
		if (this.isDead()) {
			ctx.fillStyle = "rgba(255,0,0,0.5)";
			ctx.fillRect(
				this.x - this.radius,
				this.y - this.radius,
				this.radius * 2,
				this.radius * 2
			);
		}
		ctx.restore();
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
