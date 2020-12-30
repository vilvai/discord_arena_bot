export const setCooldownForUser = () => {};

export const cooldownLeftForUser = (userId: string) =>
	userId === "mockCooldown" ? 9000 : 0;
