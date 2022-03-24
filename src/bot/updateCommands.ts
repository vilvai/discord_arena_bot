import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";

require("dotenv").config();

if (!process.env.TOKEN) {
	console.log("TOKEN env variable not set");
	process.exit(1);
}

const commands = [
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
				name: "type",
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
		name: "help",
		description: "Display available commands and their help",
		type: 1,
	},
];

(async () => {
	try {
		console.log(process.env.TOKEN);
		const rest = new REST({ version: "9" }).setToken(
			process.env.TOKEN as string
		);

		const clientId = "725053536949239829";
		const guildId = "954077523023654942";

		console.log("Started refreshing application (/) commands.");

		await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
			body: commands,
		});

		console.log("Successfully reloaded application (/) commands.");
	} catch (error) {
		console.error(error);
	}
})();
