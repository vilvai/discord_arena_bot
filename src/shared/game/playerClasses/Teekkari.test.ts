import Teekkari from "./Teekkari";
import { SCREEN_HEIGHT, SIDEBAR_WIDTH, ARENA_WIDTH } from "../../constants";

describe("isTargetInCenterArea", () => {
	[
		{
			target: { x: SIDEBAR_WIDTH + ARENA_WIDTH * 0.5, y: SCREEN_HEIGHT * 0.5 },
			result: true,
		},
		{
			target: { x: SIDEBAR_WIDTH + ARENA_WIDTH * 0.1, y: SCREEN_HEIGHT * 0.1 },
			result: false,
		},
		{
			target: { x: SIDEBAR_WIDTH + ARENA_WIDTH * 0.74, y: SCREEN_HEIGHT * 0.1 },
			result: false,
		},
		{
			target: {
				x: SIDEBAR_WIDTH + ARENA_WIDTH * 0.76,
				y: SCREEN_HEIGHT * 0.24,
			},
			result: false,
		},
		{
			target: {
				x: SIDEBAR_WIDTH + ARENA_WIDTH * 0.74,
				y: SCREEN_HEIGHT * 0.26,
			},
			result: true,
		},
		{
			target: {
				x: SIDEBAR_WIDTH + ARENA_WIDTH * 0.24,
				y: SCREEN_HEIGHT * 0.74,
			},
			result: false,
		},
		{
			target: {
				x: SIDEBAR_WIDTH + ARENA_WIDTH * 0.24,
				y: SCREEN_HEIGHT * 0.76,
			},
			result: false,
		},
	].forEach(({ target, result }) => {
		it(`results ${result} for ${JSON.stringify(target)}`, () => {
			expect(Teekkari.isTargetInCenterArea(target)).toEqual(result);
		});
	});
});
