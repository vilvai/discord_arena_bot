import { performance } from "perf_hooks";

const timers: { [action: string]: number } = {};

export const startTimer = (action: string) =>
	(timers[action] = performance.now());

export const logTimer = (action: string) => {
	const existingTime = timers[action];
	if (existingTime) {
		const timeNow = performance.now();
		const timeSinceLastCall = timeNow - existingTime;
		console.log(`${action} took ${timeSinceLastCall.toFixed(0)}ms`);
	}
};
