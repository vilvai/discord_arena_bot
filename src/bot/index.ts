import Discord, { Intents } from "discord.js";

import Bot from "./Bot";
import { createRootFolders } from "./createRootFolders";
import { messages } from "./messages/messages";

require("dotenv").config();

createRootFolders();

const botsByChannel: { [channelId: string]: Bot } = {};

const client = new Discord.Client({ intents: [Intents.FLAGS.GUILDS] });
client.login(process.env.TOKEN);

client.on("ready", () => {
	if (client.user === null) return;
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on("interactionCreate", async (interaction) => {
	if (!interaction.isCommand()) return;
	const channel = interaction.channel;

	if (
		channel === null ||
		channel.type !== "GUILD_TEXT" ||
		client.user === null
	) {
		console.error(
			"Tried to reply to an interaction but channel or client.user was null or channel type not GUILD_TEXT"
		);
		return;
	}

	const channelId = channel.id;
	if (botsByChannel[channelId] === undefined) {
		console.log(
			`Bot added to channel ${channel.guild.name}/${channel.name} (${channel.id})`
		);
		botsByChannel[channelId] = new Bot(client.user.id, channelId);
	}
	await botsByChannel[channelId].handleInteraction(interaction);
});

client.on("guildCreate", async (guild: Discord.Guild) => {
	const user = client.user;
	if (user === null) return;
	console.log(`Bot added to guild ${guild.name} (${guild.id})`);
	const firstChannel = guild.channels.cache.find(
		(channel) =>
			channel.type === "GUILD_TEXT" &&
			channel.permissionsFor(user)!.has("SEND_MESSAGES")
	) as Discord.TextChannel | undefined;

	if (firstChannel === undefined) return;

	firstChannel.send({ embeds: [messages.welcomeMessage()] });
});

client.on("rateLimit", (rateLimitData) =>
	console.log(`Ratelimited on: ${rateLimitData.path}`)
);

client.on("error", (error) =>
	console.error(`Encountered an error: ${error.message}`)
);
