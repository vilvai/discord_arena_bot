export default class Blood {
	constructor(x: number, y: number, size: number) {
		this.x = x;
		this.y = y;
		this.size = size;
	}

	x: number;
	y: number;
	size: number;

	draw(ctx: CanvasRenderingContext2D) {
		ctx.fillStyle = "#A50000";
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
		ctx.fill();
	}
}
