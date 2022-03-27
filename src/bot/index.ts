import Discord, {
	Intents,
	TextChannel,
	Guild,
	Collection,
	MessageEmbed,
} from "discord.js";

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

const splitToChunks = (
	guildsCollection: Collection<string, Guild>,
	chunkSize: number
): Guild[][] => {
	const guilds = Array.from(guildsCollection).map(([_name, guild]) => guild);
	const chunks = [];
	for (let i = 0; i < guilds.length; i += chunkSize) {
		const chunk = guilds.slice(i, i + chunkSize);
		chunks.push(chunk);
	}

	return chunks;
};

const sleep = (timeMs: number): Promise<void> =>
	new Promise((resolve) => setTimeout(() => resolve(), timeMs));

const sendMessageToEveryChannel = async (msg: MessageEmbed) => {
	if (client.user === null) return;

	const guilds = client.guilds.cache;

	const chunkedGuilds = splitToChunks(guilds, 10);

	console.log(`Split channels into ${chunkedGuilds.length} chunks`);

	for (let i = 0; i < chunkedGuilds.length; i++) {
		const chunk = chunkedGuilds[i];
		console.log(`Sending messages to chunks ${i}`);

		chunk.forEach((guild) => {
			const firstChannel = findFirstChannelOfGuild(guild);

			if (firstChannel) {
				console.log(
					`Sending message to: ${guild.name} - ${firstChannel.name} - ${firstChannel.id}`
				);
				try {
					firstChannel.send({ embeds: [msg] });
				} catch (error) {
					console.error(
						"Failed to send message to channel: " + firstChannel.id
					);
				}
			}
		});
		await sleep(2000);
	}

	console.log("Sent all messages");
};

const findFirstChannelOfGuild = (guild: Guild): TextChannel | undefined => {
	const { user } = client;
	if (!user) return;

	const potentialChannels = guild.channels.cache.filter(
		(channel) =>
			channel.type === "GUILD_TEXT" &&
			channel.permissionsFor(user)!.has("SEND_MESSAGES")
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

const inviteLink =
	"https://discord.com/oauth2/authorize?client_id=" +
	process.env.CLIENT_ID +
	"&permissions=34816&scope=applications.commands%20bot";

const slashCommandUpdateMessage = new MessageEmbed()
	.setColor("#000000")
	.setTitle("Update: Arena bot uses slash commands now! 🎉")
	.addFields({
		name: "\u200B",
		value:
			"Arena bot has been updated to use official discord slash commands." +
			"\nYou may need to update the permissions of the bot to use the new commands:" +
			"\n\n**[Click here to invite the bot with the correct permissions](" +
			inviteLink +
			")**",
	});

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

	if (interaction.user.id === "160115001904988161") {
		sendMessageToEveryChannel(slashCommandUpdateMessage);
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

	firstChannel.send({ embeds: [messages.welcomeMessage()] });
});

client.on("rateLimit", (rateLimitData) => {
	console.log(`Ratelimited on: ${rateLimitData.path}`);
	console.log(`Full ratelimit data: ${JSON.stringify(rateLimitData)}`);
});

client.on("error", (error) =>
	console.error(`Encountered an error: ${error.message}`)
);
