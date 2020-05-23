import Player from "./Player";
import {
	SCREEN_WIDTH,
	SIDEBAR_WIDTH,
	SCREEN_HEIGHT,
	ARENA_WIDTH,
} from "../../constants";
import { calculateVector } from "./utils";

enum TeekkariState {
	Moving = "moving",
	Building = "building",
}

export default class Teekkari extends Player {
	constructor(
		x: number,
		y: number,
		createBloodStain: (x: number, y: number, size: number) => void,
		name: string,
		createTurret: (x: number, y: number, owner: Player) => void
	) {
		super(x, y, createBloodStain, name);
		this.radius = 14;
		this.acceleration = 0.2;

		this.state = TeekkariState.Moving;
		this.initialMovingTime = 60;
		this.movingTimeLeft = this.initialMovingTime;
		this.initialBuildTime = 90;
		this.buildTimeLeft = this.initialBuildTime;
		this.movementTarget = this.getRandomMovementTarget();
		this.createTurret = createTurret;
	}

	initialMovingTime: number;
	movingTimeLeft: number;
	initialBuildTime: number;
	buildTimeLeft: number;
	state: TeekkariState;
	movementTarget: { x: number; y: number };
	createTurret: (x: number, y: number, owner: Player) => void;

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
	}

	startMoving() {
		this.state = TeekkariState.Moving;
		this.movingTimeLeft = this.initialMovingTime;
		this.movementTarget = this.getRandomMovementTarget();
		this.chaseSpeed = 0;
	}

	startBuilding() {
		this.state = TeekkariState.Building;
		this.buildTimeLeft = this.initialBuildTime;
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

		this.movingTimeLeft -= 1;

		if (
			vector.distance <= this.chaseSpeed + this.radius ||
			this.movingTimeLeft <= 0
		) {
			this.startBuilding();
		}
	}

	build() {
		this.buildTimeLeft -= 1;
		if (this.buildTimeLeft <= 0) {
			this.createTurret(this.x, this.y, this);
			this.startMoving();
		}
	}
}
