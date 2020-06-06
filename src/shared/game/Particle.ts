export default class Particle {
	constructor(
		public x: number,
		public y: number,
		protected xSpeed: number,
		protected ySpeed: number,
		protected size: number,
		protected particleSlowdown: number,
		protected maxLifeSpan: number,
		protected color: string,
		protected onDelete: (particle: Particle) => void
	) {
		this.timeRemaining = maxLifeSpan;
	}

	timeRemaining: number;

	update() {
		this.xSpeed *= this.particleSlowdown;
		this.ySpeed *= this.particleSlowdown;
		this.x += this.xSpeed;
		this.y += this.ySpeed;
		this.timeRemaining -= 1;
		if (this.timeRemaining <= 0) this.onDelete(this);
	}

	draw(ctx: CanvasRenderingContext2D) {
		const ageMultiplier = (this.timeRemaining / this.maxLifeSpan) ** 0.85;
		ctx.globalAlpha = 0.6 * ageMultiplier;
		ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
		ctx.fill();
		ctx.globalAlpha = 1;
	}
}
