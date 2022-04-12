import Discord, { Intents, TextChannel, Guild, Collection } from "discord.js";

import Bot from "./Bot";
import { createRootFolders } from "./createRootFolders";
import { messages } from "./messages/messages";

require("dotenv").config();

createRootFolders();

const botsByChannel: { [channelId: string]: Bot } = {};

if (typeof process.env.CLIENT_ID !== "string") {
	console.error("CLIENT_ID not set");
	process.exit(1);
}

if (typeof process.env.TOKEN !== "string") {
	console.error("TOKEN not set");
	process.exit(1);
}

const client = new Discord.Client({ intents: [Intents.FLAGS.GUILDS] });
client.login(process.env.TOKEN);

const findFirstChannelOfGuild = (guild: Guild): TextChannel | undefined => {
	const { user } = client;
	if (!user) return;

	const potentialChannels = guild.channels.cache.filter(
		(channel) =>
			channel.type === "GUILD_TEXT" &&
			!!channel.permissionsFor(user)?.has("SEND_MESSAGES")
	) as Collection<string, TextChannel>;

	if (potentialChannels.size === 0) return undefined;

	const arenaChannel = potentialChannels.find((channel) =>
		channel.name.toLowerCase().includes("arena")
	);

	if (arenaChannel) {
		return arenaChannel;
	} else {
		return potentialChannels.at(0);
	}
};

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

	const firstChannel = findFirstChannelOfGuild(guild);

	if (firstChannel === undefined) return;

	firstChannel
		.send({ embeds: [messages.welcomeMessage()] })
		.catch((error) =>
			console.error(`Error when sending welcome message:\n${error}`)
		);
});

client.on("rateLimit", (rateLimitData) => {
	console.log(`Ratelimited on: ${rateLimitData.path}`);
	console.log(`Full ratelimit data: ${JSON.stringify(rateLimitData)}`);
});

client.on("error", (error) =>
	console.error(`Encountered an error: ${error.message}`)
);
