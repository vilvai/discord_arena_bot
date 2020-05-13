require("dotenv").config();
import Discord from "discord.js";
import fs from "fs";
import { createCanvas, loadImage } from "canvas";

const client = new Discord.Client();

client.on("ready", () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", async (msg) => {
	if (msg.author.id === client.user.id) return;
	const avatarURL = msg.author.displayAvatarURL({ format: "png", size: 256 });

	const canvas = createCanvas(400, 300);
	const ctx = canvas.getContext("2d");
	ctx.font = "30px Impact";
	ctx.rotate(0.1);
	ctx.fillText("Awesome!", 50, 100);

	const text = ctx.measureText("Awesome!");
	ctx.strokeStyle = "rgba(0,0,0,0.5)";
	ctx.beginPath();
	ctx.lineTo(50, 102);
	ctx.lineTo(50 + text.width, 102);
	ctx.stroke();
	const image = await loadImage(avatarURL);
	ctx.drawImage(image, 50, 0, 32, 32);
	fs.createWriteStream("test.png").write(canvas.toBuffer());
	msg.channel.send("", { files: ["test.png"] });
});

client.login(process.env.TOKEN);
