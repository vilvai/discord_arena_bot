import BasePlayer, { CreateBloodStain } from "./BasePlayer";
import { SCREEN_HEIGHT, SCREEN_WIDTH, SIDEBAR_WIDTH } from "../../constants";
import { calculateVector, randomizeAttributes } from "../utils";
import { Target } from "../../types";

enum AssassinState {
	Stalking = "stalking",
	Fighting = "fighting",
	Assassinate = "assassinate",
	Slowdown = "slowdown",
}

export default class Assassin extends BasePlayer {
	constructor(
		x: number,
		y: number,
		createBloodStain: CreateBloodStain,
		name: string,
		private createDodgeParticles: (x: number, y: number) => void
	) {
		super(x, y, createBloodStain, name);

		this.dodgeDamage = 3;
		this.dodgeCooldown = 150;
		this.maxHealth = 15;
		this.health = this.maxHealth;
		this.damage = 4;

		this.assassinationCooldown = 180;
		this.assassinationThreshold = 0.5;
		this.assassinationVelocity = 12;
		this.assassinationMinDistance = 100;

		this.xSpeed = 0;
		this.ySpeed = 0;
		this.maxStalkingSpeed = 1;

		randomizeAttributes(this, [
			"damage",
			"dodgeDamage",
			"dodgeCooldown",
			"assassinationCooldown",
			"assassinationThreshold",
		]);

		this.dodgeCooldownLeft = 0;
		this.assassinationCooldownLeft = this.assassinationCooldown;

		this.startStalking();
	}

	state!: AssassinState;

	dodgeDamage: number;
	dodgeCooldown: number;
	dodgeCooldownLeft: number;

	assassinationCooldown: number;
	assassinationCooldownLeft: number;
	assassinationThreshold: number;
	assassinationTarget?: Target;
	assassinationTargetPlayer?: BasePlayer;
	assassinationVelocity: number;
	assassinationMinDistance: number;

	xSpeed: number;
	ySpeed: number;
	maxStalkingSpeed: number;

	onHit(
		sourceX: number,
		sourceY: number,
		damage: number,
		sourcePlayer?: BasePlayer
	) {
		if (this.state === AssassinState.Assassinate) return;
		if (this.dodgeCooldownLeft <= 0 && this.state !== AssassinState.Slowdown) {
			if (sourcePlayer) sourcePlayer.onHit(this.x, this.y, this.dodgeDamage);
			this.dodge();
		} else {
			super.onHit(sourceX, sourceY, damage);
		}
	}

	dodge() {
		this.createDodgeParticles(this.x, this.y);
		this.dodgeCooldownLeft = this.dodgeCooldown;
		const centerY = SCREEN_HEIGHT / 2;
		const centerX = (SCREEN_WIDTH + SIDEBAR_WIDTH) / 2;
		this.y = centerY + (centerY - this.y);
		this.x = centerX + (centerX - this.x);
	}

	updateAI(otherPlayers: BasePlayer[]) {
		switch (this.state) {
			case AssassinState.Fighting: {
				super.updateAI(otherPlayers);
				this.checkForAssassination(otherPlayers);
				break;
			}
			case AssassinState.Stalking: {
				this.stalk();
				this.checkForStartFighting(otherPlayers);
				this.checkForAssassination(otherPlayers);
				break;
			}
			case AssassinState.Assassinate: {
				this.assassinate();
				break;
			}
			case AssassinState.Slowdown: {
				this.slowdown();
				break;
			}
			default:
				break;
		}
		this.x += this.xSpeed;
		this.y += this.ySpeed;
		this.dodgeCooldownLeft -= 1;
		this.assassinationCooldownLeft -= 1;
	}

	checkForStartFighting(otherPlayers: BasePlayer[]) {
		if (
			otherPlayers.filter(
				(otherPlayer) =>
					!otherPlayer.isDead() && !(otherPlayer instanceof Assassin)
			).length <= 1
		) {
			this.state = AssassinState.Fighting;
		}
	}

	checkForAssassination(otherPlayers: BasePlayer[]) {
		if (this.assassinationCooldownLeft > 0) return;
		for (const player of otherPlayers) {
			const vector = calculateVector(this.x, this.y, player.x, player.y);
			if (
				!player.isDead() &&
				player.health / player.maxHealth <= this.assassinationThreshold &&
				vector.distance > this.assassinationMinDistance
			) {
				this.startAssassination(player);
				return;
			}
		}
	}

	startStalking() {
		this.state = AssassinState.Stalking;
	}

	stalk() {
		this.xSpeed += Math.random() * 0.25 - 0.125;
		this.ySpeed += Math.random() * 0.25 - 0.125;

		this.xSpeed = Math.min(
			Math.max(this.xSpeed, -this.maxStalkingSpeed),
			this.maxStalkingSpeed
		);
		this.ySpeed = Math.min(
			Math.max(this.ySpeed, -this.maxStalkingSpeed),
			this.maxStalkingSpeed
		);
	}

	startAssassination(targetPlayer: BasePlayer) {
		this.assassinationTargetPlayer = targetPlayer;
		this.assassinationTarget = { x: targetPlayer.x, y: targetPlayer.y };
		this.assassinationCooldownLeft = this.assassinationCooldown;
		const vector = calculateVector(
			this.x,
			this.y,
			targetPlayer.x,
			targetPlayer.y
		);

		this.xSpeed = vector.x * this.assassinationVelocity;
		this.ySpeed = vector.y * this.assassinationVelocity;

		this.state = AssassinState.Assassinate;
	}

	assassinate() {
		if (!this.assassinationTarget || !this.assassinationTargetPlayer) return;
		const lastFrameTargetDistance = Math.sqrt(
			(this.assassinationTarget.x - (this.x - this.xSpeed)) ** 2 +
				(this.assassinationTarget.y - (this.y - this.ySpeed)) ** 2
		);

		const vector = calculateVector(
			this.x,
			this.y,
			this.assassinationTargetPlayer.x,
			this.assassinationTargetPlayer.y
		);

		if (vector.distance < this.radius + this.assassinationTargetPlayer.radius) {
			this.assassinationTargetPlayer.onHit(
				this.x,
				this.y,
				this.assassinationTargetPlayer.health
			);
			this.startSlowdown();
		} else if (
			lastFrameTargetDistance <= this.radius / 2 ||
			this.isAtEdgeOfArena()
		) {
			this.startSlowdown();
		}
	}

	startSlowdown() {
		this.state = AssassinState.Slowdown;
	}

	slowdown() {
		this.xSpeed *= 0.85;
		this.ySpeed *= 0.85;
		if (Math.abs(this.xSpeed) < 0.1) {
			this.startStalking();
			this.xSpeed = 0;
			this.ySpeed = 0;
		}
	}

	drawAvatar(ctx: CanvasRenderingContext2D) {
		switch (this.state) {
			case AssassinState.Assassinate: {
				this.drawBlurredAvatar(ctx);
				break;
			}
			case AssassinState.Stalking: {
				ctx.globalAlpha = 0.5;
				super.drawAvatar(ctx);
				ctx.globalAlpha = 1;
				break;
			}
			default: {
				super.drawAvatar(ctx);
				break;
			}
		}
	}

	drawBlurredAvatar(ctx: CanvasRenderingContext2D) {
		const blurredImagesCount = Math.min(
			5,
			this.assassinationCooldown - this.assassinationCooldownLeft
		);
		ctx.globalAlpha = Math.sqrt(1 / blurredImagesCount) * 0.5;

		for (let i = 0; i < blurredImagesCount; i++) {
			const oldX = this.x;
			const oldY = this.y;
			this.x = this.x -= this.xSpeed * i;
			this.y = this.y -= this.ySpeed * i;
			super.drawAvatar(ctx);
			this.x = oldX;
			this.y = oldY;
		}

		ctx.globalAlpha = 1;
	}
}
