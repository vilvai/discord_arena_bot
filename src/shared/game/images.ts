import { Image as NodeImage } from "canvas";
import { IS_RUNNING_ON_NODE } from "../constants";

let beerCanImageConstructor: HTMLImageElement;
if (IS_RUNNING_ON_NODE) {
	beerCanImageConstructor = new NodeImage() as any;
	beerCanImageConstructor.src = "src/assets/karhu.png";
} else {
	beerCanImageConstructor = new Image();
	const turretSrc = require("../../assets/karhu.png").default;
	beerCanImageConstructor.src = turretSrc;
}

export const beerCanImage = beerCanImageConstructor;

export const BEER_CAN_IMAGE_WIDTH = 14;
export const BEER_CAN_IMAGE_HEIGHT = 24;

let turretImageConstructor: HTMLImageElement;
if (IS_RUNNING_ON_NODE) {
	turretImageConstructor = new NodeImage() as any;
	turretImageConstructor.src = "src/assets/turret.png";
} else {
	turretImageConstructor = new Image();
	const turretSrc = require("../../assets/turret.png").default;
	turretImageConstructor.src = turretSrc;
}

export const turretImage = turretImageConstructor;

export const TURRET_IMAGE_SIZE = 36;

let crownImageConstructor: HTMLImageElement;
if (IS_RUNNING_ON_NODE) {
	crownImageConstructor = new NodeImage() as any;
	crownImageConstructor.src = "src/assets/kruunu.png";
} else {
	crownImageConstructor = new Image();
	const crownSrc = require("../../assets/kruunu.png").default;
	crownImageConstructor.src = crownSrc;
}

export const crownImage = crownImageConstructor;
