import Player from "./Player";

export default class Chungus extends Player {
	constructor(
		x: number,
		y: number,
		createBloodStain: (x: number, y: number, size: number) => void
	) {
		super(x, y, createBloodStain);
		this.radius = 24;
		this.maxSpeed = 1;
		this.damage = 10;
		this.meleeCooldown = 60;
		this.randomizeAttributes(this.maxSpeed, this.damage, this.meleeCooldown);
	}

	/*update(otherPlayers: Player[]) {
		console.log("chungus update");
	}*/
}
