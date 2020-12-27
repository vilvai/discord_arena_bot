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

const commands = {
	data: {
		name: "arena",
		description: "Arena bot commands",
		options: [
			{
				name: "start",
				description:
					"Initiate a new fight / Start the fight when everyone has joined",
				type: 1,
			},
			{
				name: "join",
				description: "Join the fight",
				type: 1,
			},
			{
				name: "bot",
				description: "Add a bot to the fight",
				type: 1,
			},
			{
				name: "class",
				description: "Change your class",
				type: 1,
				options: [
					{
						name: "class",
						description: "Change your class",
						type: 3,
						required: true,
						choices: [
							{
								name: "drunk",
								value: "drunk",
							},
							{
								name: "engineer",
								value: "engineer",
							},
							{
								name: "chungus",
								value: "chungus",
							},
							{
								name: "assassin",
								value: "assassin",
							},
							{
								name: "fighter",
								value: "fighter",
							},
						],
					},
				],
			},
			{
				name: "info",
				description: "Display available commands and their info",
				type: 1,
			},
		],
	},
};

const updateCommands = async (mode: "dev" | "prod") => {
	const client = new Discord.Client();
	await client.login(process.env.TOKEN);

	const userId = client.user!.id;

	await new Promise((resolve) => {
		if (mode === "dev") {
			(client as any).api
				.applications(userId)
				.guilds(process.env.DISCORD_TEST_SERVER_ID)
				.commands.post(commands)
				.then(resolve);
		} else {
			(client as any).api
				.applications(userId)
				.commands.post(commands)
				.then(resolve);
		}
	});

	client.destroy();
};

updateCommands(process.argv[2]);
