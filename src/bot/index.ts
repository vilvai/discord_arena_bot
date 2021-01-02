import Discord from "discord.js";

import Bot from "./Bot";
import { createRootFolders } from "./createRootFolders";
import { messageStartsWithBotPrefix } from "./messages/commands";
import { messages } from "./messages/messages";

require("dotenv").config();

createRootFolders();

const botsByChannel: { [channelId: string]: Bot } = {};

const client = new Discord.Client();
client.login(process.env.TOKEN);

client.on("ready", () => {
	if (client.user === null) return;
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", async (msg: Discord.Message) => {
	const channel = msg.channel;
	if (
		client.user === null ||
		channel.type !== "text" ||
		!messageStartsWithBotPrefix(msg.content)
	) {
		return;
	}

	const channelId = channel.id;
	if (botsByChannel[channelId] === undefined) {
		console.log(
			`Bot added to channel ${channel.guild.name}/${channel.name} (${channel.id})`
		);
		botsByChannel[channelId] = new Bot(client.user.id, channelId);
	}
	await botsByChannel[channelId].handleMessage(msg);
});

client.on("guildCreate", async (guild: Discord.Guild) => {
	const user = client.user;
	if (user === null) return;
	console.log(`Bot added to guild ${guild.name} (${guild.id})`);
	const firstChannel = guild.channels.cache.find(
		(channel) =>
			channel.type === "text" &&
			channel.permissionsFor(user)!.has("SEND_MESSAGES")
	) as Discord.TextChannel | undefined;

	if (firstChannel === undefined) return;

	firstChannel.send(messages.welcomeMessage());
});

client.on("rateLimit", (rateLimitData) =>
	console.log(`Ratelimited on: ${rateLimitData.path}`)
);

client.on("error", (error) =>
	console.error(`Encountered an error: ${error.message}`)
);
