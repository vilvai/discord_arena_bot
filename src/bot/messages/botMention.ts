let botMention: string = "";

export const setBotMention = (newBotMention: string) => {
	botMention = newBotMention;
};

export const withBotMention = (command: string) => `${botMention} ${command}`;
