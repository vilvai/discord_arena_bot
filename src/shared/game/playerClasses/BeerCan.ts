import BasePlayer from "./BasePlayer";
import { isOutsideMap, checkPlayerCollision } from "../utils";
import { BEER_CAN_DAMAGE } from "../../constants";
import {
	beerCanImage,
	BEER_CAN_IMAGE_WIDTH,
	BEER_CAN_IMAGE_HEIGHT,
} from "../images";

export default class BeerCan {
	constructor(
		x: number,
		y: number,
		xSpeed: number,
		ySpeed: number,
		owner: BasePlayer,
		onDelete: (beerCan: BeerCan) => void
	) {
		const canSpeed = 4.5;
		this.x = x;
		this.y = y;
		this.xSpeed = xSpeed * canSpeed;
		this.ySpeed = ySpeed * canSpeed;
		this.owner = owner;
		this.onDelete = onDelete;
		this.angle = 0;
	}

	x: number;
	y: number;
	xSpeed: number;
	ySpeed: number;
	owner: BasePlayer;
	onDelete: (beerCan: BeerCan) => void;
	angle: number;

	update(otherPlayers: BasePlayer[]) {
		this.x += this.xSpeed;
		this.y += this.ySpeed;
		this.checkPlayerCollision(otherPlayers);
		if (isOutsideMap(this.x, this.y, BEER_CAN_IMAGE_HEIGHT / 2)) {
			this.onDelete(this);
		}
		this.angle += 0.4;
	}

	checkPlayerCollision(otherPlayers: BasePlayer[]) {
		const collidedPlayer = checkPlayerCollision(this.x, this.y, otherPlayers);
		if (collidedPlayer !== null) {
			collidedPlayer.onHit(this.x, this.y, BEER_CAN_DAMAGE);
			this.onDelete(this);
		}
	}

	draw(ctx: CanvasRenderingContext2D) {
		ctx.translate(this.x, this.y);
		ctx.rotate(this.angle);
		ctx.drawImage(
			beerCanImage,
			-BEER_CAN_IMAGE_WIDTH / 2,
			-BEER_CAN_IMAGE_HEIGHT / 2
		);
		ctx.resetTransform();
	}
}
