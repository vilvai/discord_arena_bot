import Discord from "discord.js";
import rimraf from "rimraf";
import fs from "fs";

import Bot from "./Bot";
import { INPUT_FILE_DIRECTORY, RENDER_DIRECTORY } from "../shared/constants";
import { messageStartsWithBotPrefix } from "./messages/commands";

require("dotenv").config();

const createRootFolders = () => {
	rimraf.sync(INPUT_FILE_DIRECTORY);
	rimraf.sync(RENDER_DIRECTORY);

	fs.mkdirSync(INPUT_FILE_DIRECTORY);
	fs.mkdirSync(RENDER_DIRECTORY);
};

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
