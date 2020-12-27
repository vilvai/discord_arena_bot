import Discord from "discord.js";
import rimraf from "rimraf";
import fs from "fs";

import type { TextChannel } from "discord.js";

import Bot from "./Bot";
import { INPUT_FILE_DIRECTORY, RENDER_DIRECTORY } from "../shared/constants";

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

client.ws.on("INTERACTION_CREATE" as any, async (interaction) => {
	if (client.user === null) return;

	let channel: TextChannel;
	try {
		const anyChannel = await client.channels.fetch(interaction.channel_id);
		if (!anyChannel || anyChannel.type !== "text") return;
		channel = anyChannel as TextChannel;
	} catch (error) {
		console.log(error);
		return;
	}

	const channelId = channel.id;
	if (botsByChannel[channelId] === undefined) {
		console.log(
			`Bot added to channel ${channel.guild.name}/${channel.name} (${channel.id})`
		);
		botsByChannel[channelId] = new Bot(client.user.id, channelId);
	}

	console.log(interaction);

	//await botsByChannel[channelId].handleInteraction(interaction, channel);
});
