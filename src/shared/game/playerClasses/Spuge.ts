import BasePlayer, { CreateBloodStain } from "./BasePlayer";
import {
	calculateVector,
	findRandomAliveTarget,
	randomizeAttributes,
} from "../utils";
import {
	beerCanImage,
	BEER_CAN_IMAGE_WIDTH,
	BEER_CAN_IMAGE_HEIGHT,
} from "../images";

enum SpugeState {
	Staggering = "stagger",
	Drinking = "drinking",
	Aggro = "aggro",
}

type CreateBeerCan = (
	x: number,
	y: number,
	xVector: number,
	yVector: number,
	owner: BasePlayer
) => void;

export default class Spuge extends BasePlayer {
	constructor(
		x: number,
		y: number,
		createBloodStain: CreateBloodStain,
		name: string,
		private createBeerCan: CreateBeerCan
	) {
		super(x, y, createBloodStain, name);
		this.aggroModeCooldown = 150;
		this.aggroModeCooldownLeft = this.aggroModeCooldown;

		this.staggeringTime = 70;
		this.drinkingTime = 30;
		this.aggroTime = 50;
		this.maxStaggerSpeed = 1.5;

		this.maxSpeed = 3;
		this.acceleration = 1;
		this.damage = 3;
		this.meleeCooldown = 7;

		randomizeAttributes(this, [
			"staggeringTime",
			"drinkingTime",
			"aggroTime",
			"maxStaggerSpeed",
			"maxSpeed",
			"damage",
			"meleeCooldown",
		]);

		this.startStaggering();
	}

	aggroModeCooldown: number;
	aggroModeCooldownLeft: number;
	staggeringTime: number;
	drinkingTime: number;
	aggroTime: number;
	timeUntilStateChange!: number;
	maxStaggerSpeed: number;
	xSpeed!: number;
	ySpeed!: number;
	state!: SpugeState;

	onHit(
		sourceX: number,
		sourceY: number,
		damage: number,
		sourcePlayer?: BasePlayer
	) {
		super.onHit(sourceX, sourceY, damage, sourcePlayer);
		if (this.aggroModeCooldownLeft <= 0) this.startAggro();
	}

	updateAI(otherPlayers: BasePlayer[]) {
		switch (this.state) {
			case SpugeState.Staggering:
				this.stagger();
				break;
			case SpugeState.Drinking:
				this.drink(otherPlayers);
				break;
			case SpugeState.Aggro:
				this.aggro(otherPlayers);
				break;
			default:
				break;
		}
		this.timeUntilStateChange -= 1;
		this.aggroModeCooldownLeft -= 1;
	}

	startStaggering() {
		this.xSpeed = 0;
		this.ySpeed = 0;
		this.timeUntilStateChange = this.staggeringTime;
		this.state = SpugeState.Staggering;
	}

	stagger() {
		this.xSpeed += Math.random() * 0.5 - 0.25;
		this.ySpeed += Math.random() * 0.5 - 0.25;

		this.xSpeed = Math.min(
			Math.max(this.xSpeed, -this.maxStaggerSpeed),
			this.maxStaggerSpeed
		);
		this.ySpeed = Math.min(
			Math.max(this.ySpeed, -this.maxStaggerSpeed),
			this.maxStaggerSpeed
		);

		this.x += this.xSpeed;
		this.y += this.ySpeed;
		if (this.timeUntilStateChange <= 0) {
			this.startDrinking();
		}
	}

	startDrinking() {
		this.timeUntilStateChange = this.drinkingTime;
		this.state = SpugeState.Drinking;
	}

	drink(otherPlayers: BasePlayer[]) {
		if (this.timeUntilStateChange <= 0) {
			this.health = Math.min(this.maxHealth, this.health + 3);
			this.throwCan(otherPlayers);
			this.startStaggering();
		}
	}

	throwCan(otherPlayers: BasePlayer[]) {
		this.target = findRandomAliveTarget(otherPlayers);
		const beerX = this.x - this.radius;
		const vector = calculateVector(beerX, this.y, this.target.x, this.target.y);
		this.createBeerCan(beerX, this.y, vector.x, vector.y, this);
	}

	startAggro() {
		this.aggroModeCooldownLeft = this.aggroModeCooldown;
		this.timeUntilStateChange = this.aggroTime;
		this.state = SpugeState.Aggro;
	}

	aggro(otherPlayers: BasePlayer[]) {
		super.updateAI(otherPlayers);
		if (this.timeUntilStateChange <= 0) {
			this.startStaggering();
		}
	}

	draw(ctx: CanvasRenderingContext2D) {
		if (this.state === SpugeState.Aggro && !this.isDead()) {
			this.drawRagingAvatar(ctx);
		} else {
			this.drawAvatar(ctx);
		}
		if (this.state === SpugeState.Drinking) {
			this.drawBeerCan(ctx);
		}
	}

	drawRagingAvatar(ctx: CanvasRenderingContext2D) {
		const oldX = this.x;
		const oldY = this.y;
		this.x = oldX + Math.round(Math.random() * 4) - 2;
		this.y = oldY + Math.round(Math.random() * 4) - 2;
		this.drawAvatar(ctx);
		ctx.save();
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
		ctx.clip();
		ctx.fillStyle = "rgba(200,0,0,0.5)";
		ctx.fillRect(
			this.x - this.radius,
			this.y - this.radius,
			this.radius * 2,
			this.radius * 2
		);
		ctx.restore();
		this.x = oldX;
		this.y = oldY;
	}

	drawBeerCan(ctx: CanvasRenderingContext2D) {
		const beerDrinkingProgress =
			1 - this.timeUntilStateChange / this.drinkingTime;
		let beerAngle;
		const maxBeerAngle = Math.PI * 0.65;
		let beerX = this.x - this.radius * 1.45;
		const maxBeerX = this.radius / 2;
		let beerY = this.y + this.radius * 0.3;
		const maxBeerY = this.radius * 0.7;

		if (beerDrinkingProgress < 0.25) {
			beerAngle = 0;
		} else if (beerDrinkingProgress < 0.75) {
			const beerAnimationProgress = (beerDrinkingProgress - 0.25) * 2;
			beerAngle = maxBeerAngle * beerAnimationProgress;
			beerY -= maxBeerY * beerAnimationProgress;
			beerX += maxBeerX * beerAnimationProgress;
		} else {
			beerAngle = maxBeerAngle;
			beerY -= maxBeerY;
			beerX += maxBeerX;
		}

		ctx.translate(beerX, beerY);
		ctx.rotate(beerAngle);
		ctx.drawImage(
			beerCanImage,
			-BEER_CAN_IMAGE_WIDTH / 2,
			-BEER_CAN_IMAGE_HEIGHT / 2
		);
		ctx.resetTransform();
	}
}
