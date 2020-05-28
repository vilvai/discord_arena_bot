import BasePlayer, { CreateBloodStain } from "./BasePlayer";
import {
	SCREEN_WIDTH,
	SIDEBAR_WIDTH,
	SCREEN_HEIGHT,
	ARENA_WIDTH,
} from "../../constants";
import { calculateVector, randomizeAttributes } from "./utils";

enum TeekkariState {
	Moving = "moving",
	Building = "building",
}

type CreateTurret = (x: number, y: number, owner: BasePlayer) => void;

export default class Teekkari extends BasePlayer {
	constructor(
		x: number,
		y: number,
		createBloodStain: CreateBloodStain,
		name: string,
		createTurret: CreateTurret
	) {
		super(x, y, createBloodStain, name);
		this.radius = 14;
		this.acceleration = 0.2;

		this.movingTime = 60;
		this.buildingTime = 70;
		this.createTurret = createTurret;

		randomizeAttributes(this, ["movingTime", "buildingTime"]);

		this.startMoving();
	}

	movingTime: number;
	timeUntilStateChange: number;
	buildingTime: number;
	state: TeekkariState;
	movementTarget: { x: number; y: number };
	createTurret: CreateTurret;

	static isTargetInCenterArea(target: { x: number; y: number }) {
		const safeZoneProportion = 0.25;
		return (
			target.x > SIDEBAR_WIDTH + ARENA_WIDTH * safeZoneProportion &&
			target.x < SCREEN_WIDTH - ARENA_WIDTH * safeZoneProportion &&
			target.y > SCREEN_HEIGHT * safeZoneProportion &&
			target.y < SCREEN_HEIGHT * (1 - safeZoneProportion)
		);
	}

	getRandomMovementTarget() {
		const minDistance = SCREEN_HEIGHT * 0.35;
		const maxDistance = SCREEN_HEIGHT * 0.5;
		let target = { x: this.x, y: this.y };
		let distanceToTarget = Math.sqrt(
			(target.x - this.x) ** 2 + (target.y - this.y) ** 2
		);
		while (
			Teekkari.isTargetInCenterArea(target) ||
			distanceToTarget < minDistance ||
			distanceToTarget > maxDistance ||
			target.x <= SIDEBAR_WIDTH
		) {
			target = {
				x: SIDEBAR_WIDTH + ARENA_WIDTH * Math.random(),
				y: SCREEN_HEIGHT * Math.random(),
			};
			distanceToTarget = Math.sqrt(
				(target.x - this.x) ** 2 + (target.y - this.y) ** 2
			);
		}
		return target;
	}

	updateAI() {
		switch (this.state) {
			case TeekkariState.Moving:
				this.move();
				break;
			case TeekkariState.Building:
				this.build();
				break;
			default:
				break;
		}
		this.timeUntilStateChange -= 1;
	}

	startMoving() {
		this.state = TeekkariState.Moving;
		this.timeUntilStateChange = this.movingTime;
		this.movementTarget = this.getRandomMovementTarget();
		this.chaseSpeed = 0;
	}

	startBuilding() {
		this.state = TeekkariState.Building;
		this.timeUntilStateChange = this.buildingTime;
	}

	move() {
		this.chaseSpeed = Math.min(
			this.maxSpeed,
			this.chaseSpeed + this.acceleration
		);
		const { x: targetX, y: targetY } = this.movementTarget;
		const vector = calculateVector(this.x, this.y, targetX, targetY);

		this.x += vector.x * this.chaseSpeed;
		this.y += vector.y * this.chaseSpeed;

		if (
			vector.distance <= this.chaseSpeed + this.radius ||
			this.timeUntilStateChange <= 0
		) {
			this.startBuilding();
		}
	}

	build() {
		if (this.timeUntilStateChange <= 0) {
			this.buildingTime *= 1.5;
			this.createTurret(this.x, this.y, this);
			this.startMoving();
		}
	}
}
