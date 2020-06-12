import BasePlayer, { CreateBloodStain } from "./BasePlayer";
import { randomizeAttributes } from "../utils";

export default class Chungus extends BasePlayer {
	constructor(
		x: number,
		y: number,
		createBloodStain: CreateBloodStain,
		name: string
	) {
		super(x, y, createBloodStain, name);
		this.radius = 24;
		this.maxSpeed = 1.5;
		this.damage = 9;
		this.meleeCooldown = 60;
		randomizeAttributes(this, ["maxSpeed", "damage", "meleeCooldown"]);
	}
}
