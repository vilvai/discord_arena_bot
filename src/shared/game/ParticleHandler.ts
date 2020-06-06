import Particle from "./Particle";
import {
	randomWholeNumberBetween,
	randomNumberBetween,
} from "./playerClasses/utils";
import { GAME_FPS } from "../constants";

export default class ParticleHandler {
	constructor() {
		this.particles = [];
	}

	particles: Particle[];

	onDeleteParticle = (particleToBeDeleted: Particle) =>
		(this.particles = this.particles.filter(
			(particle) => particle !== particleToBeDeleted
		));

	createDodgeParticles(x: number, y: number) {
		const particleCount = randomWholeNumberBetween(12, 18);
		for (let i = 0; i < particleCount; i++) {
			const initialAngle = (i / particleCount) * Math.PI * 2;
			this.createDodgeParticle(x, y, initialAngle);
		}
	}

	createDodgeParticle(x: number, y: number, initialAngle: number) {
		const size = 9;
		const particleSlowdown = 0.9 * randomNumberBetween(0.95, 1.05);
		const lifeSpan = 0.65 * GAME_FPS * randomNumberBetween(0.8, 1.1);
		const dodgeParticleColor = "#999999";
		const velocity = randomNumberBetween(1.25, 2.25);
		const randomAngle = initialAngle + randomNumberBetween(0, 0.25 * Math.PI);
		const xSpeed = Math.cos(randomAngle) * velocity;
		const ySpeed = Math.sin(randomAngle) * velocity;
		const startPosition = randomNumberBetween(0, 2.5);
		const particle = new Particle(
			x + xSpeed * startPosition,
			y + ySpeed * startPosition,
			xSpeed,
			ySpeed,
			size,
			particleSlowdown,
			lifeSpan,
			dodgeParticleColor,
			this.onDeleteParticle
		);
		this.particles.push(particle);
	}

	update() {
		this.particles.forEach((particle) => particle.update());
	}

	draw(ctx: CanvasRenderingContext2D) {
		this.particles.forEach((particle) => particle.draw(ctx));
	}
}
