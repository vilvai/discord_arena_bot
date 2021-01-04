import { isOutsideMap } from "./utils";

export default class Blood {
	constructor(
		public x: number,
		public y: number,
		public size: number,
		public xSpeed: number,
		public ySpeed: number,
		private onDelete: (blood: Blood) => void
	) {}

	update() {
		this.xSpeed *= 0.85;
		this.ySpeed *= 0.85;
		if (Math.abs(this.xSpeed) < 0.3) this.xSpeed = 0;
		if (Math.abs(this.ySpeed) < 0.3) this.ySpeed = 0;
		this.x += this.xSpeed;
		this.y += this.ySpeed;
		if (isOutsideMap(this.x, this.y, this.size)) this.onDelete(this);
	}

	draw(ctx: CanvasRenderingContext2D) {
		ctx.fillStyle = "#A50000";
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
		ctx.fill();
	}
}
