export default class Blood {
	constructor(private x: number, private y: number, private size: number) {}

	draw(ctx: CanvasRenderingContext2D) {
		ctx.fillStyle = "#A50000";
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
		ctx.fill();
	}
}
