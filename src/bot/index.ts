import Discord from "discord.js";

import Bot from "./Bot";
import { messageMentionsBot, setBotMention } from "./messages";

require("dotenv").config();

const botsByChannel: { [channelId: string]: Bot } = {};

const client = new Discord.Client();
client.login(process.env.TOKEN);

client.on("ready", () => {
	if (client.user === null) return;
	setBotMention(`@${client.user.username}`);
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", async (msg: Discord.Message) => {
	if (
		client.user === null ||
		msg.channel.type !== "text" ||
		!messageMentionsBot(msg, client.user.id)
	) {
		return;
	}

	const channelId = msg.channel.id;
	if (botsByChannel[channelId] === undefined) {
		botsByChannel[channelId] = new Bot(client.user.id);
	}
	await botsByChannel[channelId].handleMessage(msg);
});
