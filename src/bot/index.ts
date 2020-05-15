import Discord from "discord.js";
import fs from "fs";
import { createCanvas } from "canvas";
import { drawFrame } from "../shared/draw";

require("dotenv").config();

const client = new Discord.Client();

client.on("ready", () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", async (msg) => {
	if (msg.author.id === client.user.id) return;
	const avatarURL = msg.author.displayAvatarURL({ format: "png", size: 256 });
	const canvas = createCanvas(400, 300);
	const ctx = canvas.getContext("2d");

	const gameData = {
		players: {
			[msg.author.id]: {
				avatarURL,
				x: 40,
				y: 20,
			},
		},
	};
	await drawFrame(ctx, gameData);

	fs.createWriteStream("test.png").write(canvas.toBuffer());
	msg.channel.send("", { files: ["test.png"] });
});

client.login(process.env.TOKEN);
