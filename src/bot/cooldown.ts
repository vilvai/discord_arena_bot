const cooldownsPerUser: Record<string, number> = {};

const COOLDOWN_MS = 30000;

export const setCooldownForUser = (userId: string) =>
	(cooldownsPerUser[userId] = Number(new Date()));

export const cooldownLeftForUser = (userId: string): number => {
	if (cooldownsPerUser[userId] === undefined) return 0;

	const timePassedMs = Number(new Date()) - cooldownsPerUser[userId];
	return Math.ceil((COOLDOWN_MS - timePassedMs) / 1000);
};
