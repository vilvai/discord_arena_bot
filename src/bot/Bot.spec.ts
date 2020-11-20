import Discord from "discord.js";

import { GAME_COUNTDOWN_SECONDS, MAX_PLAYER_COUNT } from "../shared/constants";
import Bot, { BotState } from "./Bot";
import { DEFAULT_LANGUAGE } from "./languages";
import { messagesByLanguage } from "./messages/messages";

type MockMessage = Partial<
	Omit<Discord.Message, "channel" | "author" | "valueOf">
> & {
	channel: Partial<Omit<Discord.Message["channel"], "send" | "valueOf">> & {
		type: Discord.Message["channel"]["type"];
		send: jest.Mock;
	};
	author?: Partial<
		Omit<Discord.Message["author"], "displayAvatarURL" | "valueOf">
	> & {
		displayAvatarURL: () => string;
		username: string;
		id: string;
	};
};

const constructMockMessage = (
	mockMessage: Omit<MockMessage, "channel">
): MockMessage => ({
	channel: {
		type: "text",
		send: jest.fn(),
	},
	...mockMessage,
});

describe("Bot", () => {
	describe("when creating a new bot", () => {
		let bot: Bot;

		beforeEach(() => {
			bot = new Bot("fooUserId", "fooChannelId");
		});

		it("sets the state of the bot to Waiting", () => {
			expect(bot.state).toEqual(BotState.Waiting);
		});

		it("creates a gameRunner for the bot", () => {
			expect(bot.gameRunner).not.toEqual(undefined);
		});

		it("sets the default language", () => {
			expect(bot.language).toEqual(DEFAULT_LANGUAGE);
		});
	});

	describe("handling messages", () => {
		let bot: Bot;
		let mockMessage: MockMessage;

		describe("when handling a message with an unknown command", () => {
			beforeEach(() => {
				bot = new Bot("fooUserId", "fooChannelId");
				bot.language = "suomi";
				mockMessage = constructMockMessage({ content: "foo bar asdf" });
				bot.handleMessage(mockMessage as any);
			});

			it("calls the 'msg.channel.send' function with the unknownCommand text", () => {
				expect(mockMessage.channel.send).toHaveBeenCalledTimes(1);
				expect(mockMessage.channel.send).toHaveBeenCalledWith(
					messagesByLanguage[bot.language].unknownCommand()
				);
			});

			it("doesn't change the bot state", () => {
				expect(bot.state).toEqual(BotState.Waiting);
			});
		});

		describe("when handling a start game command", () => {
			describe("and a game is already starting", () => {
				beforeEach(() => {
					bot = new Bot("fooUserId", "fooChannelId");
					bot.language = "suomi";
					mockMessage = constructMockMessage({ content: "aloita" });
					bot.state = BotState.Countdown;
					bot.handleMessage(mockMessage as any);
				});

				it("sends a message that the game is already starting", () => {
					expect(mockMessage.channel.send).toHaveBeenCalledTimes(1);
					expect(mockMessage.channel.send).toHaveBeenCalledWith(
						messagesByLanguage[bot.language].fightAlreadyStarting()
					);
				});

				it("doesn't change the bot state", () => {
					expect(bot.state).toEqual(BotState.Countdown);
				});
			});

			describe("and the bot is ready to start a game", () => {
				beforeEach(() => {
					bot = new Bot("fooUserId", "fooChannelId");
					bot.language = "suomi";

					mockMessage = constructMockMessage({
						content: "aloita ignored extra words foobar",
						author: {
							username: "someUser",
							id: "someId",
							displayAvatarURL: () => "foo.com/foobar.png",
						},
					});

					bot.countdown = jest.fn();
					bot.gameRunner = {
						initializeGame: jest.fn(),
						addPlayer: jest.fn(),
						playerInGame: () => false,
					} as any;

					bot.handleMessage(mockMessage as any);
				});

				it("initializes a game", () => {
					expect(bot.gameRunner.initializeGame).toHaveBeenCalledTimes(1);
				});

				it("adds a player to the game", () => {
					expect(bot.gameRunner.addPlayer).toHaveBeenCalledTimes(1);
				});

				it("changes the bot state to Countdown", () => {
					expect(bot.state).toEqual(BotState.Countdown);
				});

				it("sets the countdownLeft property", () => {
					expect(bot.countdownLeft).toEqual(GAME_COUNTDOWN_SECONDS);
				});

				it("starts the countdown", () => {
					expect(bot.countdown).toHaveBeenCalledTimes(1);
				});
			});
		});

		describe("when handling a join game command", () => {
			beforeAll(() => {
				mockMessage = constructMockMessage({
					content: "liity ignored extra words foobar",
					author: {
						username: "someUser",
						id: "someId",
						displayAvatarURL: () => "foo.com/foobar.png",
					},
				});
			});

			describe("and there is no game in progress", () => {
				beforeEach(() => {
					bot = new Bot("fooUserId", "fooChannelId");
					bot.language = "suomi";
					bot.sendNoGameInProgressText = jest.fn();
					bot.handleMessage(mockMessage as any);
				});

				it("calls sendNoGameInProgressText", () => {
					expect(bot.sendNoGameInProgressText).toHaveBeenCalledTimes(1);
				});
			});

			describe("and player is already in the game", () => {
				beforeEach(() => {
					bot = new Bot("fooUserId", "fooChannelId");
					bot.language = "suomi";

					bot.gameRunner = {
						addPlayer: jest.fn(),
						playerInGame: () => true,
						getPlayerCount: () => 0,
					} as any;

					bot.state = BotState.Countdown;
					bot.updatePlayersInGameText = jest.fn();
					bot.handleMessage(mockMessage as any);
				});

				it("doesn't add player to the game", () => {
					expect(bot.gameRunner.addPlayer).toHaveBeenCalledTimes(0);
				});

				it("calls updatePlayersInGameText", () => {
					expect(bot.updatePlayersInGameText).toHaveBeenCalledTimes(1);
				});
			});

			describe("and player is not already in the game", () => {
				beforeEach(() => {
					bot = new Bot("fooUserId", "fooChannelId");
					bot.language = "suomi";

					bot.gameRunner = {
						addPlayer: jest.fn(),
						playerInGame: () => false,
						getPlayerCount: () => 0,
					} as any;

					bot.state = BotState.Countdown;
					bot.updatePlayersInGameText = jest.fn();
					bot.handleMessage(mockMessage as any);
				});

				it("adds player to the game", () => {
					expect(bot.gameRunner.addPlayer).toHaveBeenCalledTimes(1);
				});

				it("calls updatePlayersInGameText", () => {
					expect(bot.updatePlayersInGameText).toHaveBeenCalledTimes(1);
				});
			});

			describe("and the game already has max players", () => {
				beforeEach(() => {
					bot = new Bot("fooUserId", "fooChannelId");
					bot.language = "suomi";

					bot.gameRunner = {
						addPlayer: jest.fn(),
						playerInGame: () => false,
						getPlayerCount: () => MAX_PLAYER_COUNT,
					} as any;

					bot.state = BotState.Countdown;
					bot.updatePlayersInGameText = jest.fn();
					bot.handleMessage(mockMessage as any);
				});

				it("doesn't add player to the game", () => {
					expect(bot.gameRunner.addPlayer).toHaveBeenCalledTimes(0);
				});

				it("doesn't call updatePlayersInGameText", () => {
					expect(bot.updatePlayersInGameText).toHaveBeenCalledTimes(0);
				});
			});
		});
	});
});
