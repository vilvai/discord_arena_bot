import Discord from "discord.js";

require("dotenv").config();

if (process.argv[2] !== "dev" && process.argv[2] !== "prod") {
	console.log("script must be called with argument 'dev' or 'prod'");
	process.exit(1);
}

if (!process.env.DISCORD_TEST_SERVER_ID) {
	console.log("DISCORD_TEST_SERVER_ID env variable not set");
	process.exit(1);
}

const clearCommands = async (mode: "dev" | "prod") => {
	const client = new Discord.Client();
	await client.login(process.env.TOKEN);

	const userId = client.user!.id;

	if (mode === "dev") {
		const commands = await (client as any).api
			.applications(userId)
			.guilds(process.env.DISCORD_TEST_SERVER_ID)
			.commands.get();

		for (const command of commands) {
			await (client as any).api
				.applications(userId)
				.guilds(process.env.DISCORD_TEST_SERVER_ID)
				.commands(command.id)
				.delete();
		}
	} else {
		const commands = await (client as any).api
			.applications(userId)
			.commands.get();
		for (const command of commands) {
			await (client as any).api
				.applications(userId)
				.commands(command.id)
				.delete();
		}
	}

	client.destroy();
};

clearCommands(process.argv[2]);
