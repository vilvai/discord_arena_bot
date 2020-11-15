module.exports = {
	preset: "ts-jest",
	testEnvironment: "node",
	testMatch: ["<rootDir>/src/!(benchmarks)**/*spec.ts"],
	verbose: true,
};
