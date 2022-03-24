import type { CommandInteraction, User } from "discord.js";

import { MAX_PLAYER_COUNT } from "../shared/constants";
import { PlayerClass } from "../shared/types";
import Bot, { BotState } from "./Bot";
import { messages } from "./messages/messages";

jest.mock("./cooldown");

type MockInteraction = Partial<
	Omit<CommandInteraction, "channel" | "user" | "valueOf">
> & {
	channel: Partial<Omit<CommandInteraction["channel"], "send" | "valueOf">> & {
		type: "GUILD_TEXT";
		send: jest.Mock;
	};
	user?: Partial<Omit<User, "displayAvatarURL" | "valueOf" | "toString">> & {
		displayAvatarURL: () => string;
		username: string;
		id: string;
	};
	reply: jest.Mock;
};

const constructMockInteraction = (
	mockInteraction: Omit<MockInteraction, "channel" | "reply">
): MockInteraction => ({
	channel: {
		type: "GUILD_TEXT",
		send: jest.fn(),
	} as any,
	reply: jest.fn(),
	options: { data: [] } as any,
	...mockInteraction,
});

describe("Bot", () => {
	describe("when creating a new bot", () => {
		let bot: Bot;

		beforeEach(() => {
			bot = new Bot("fooUserId", "fooChannelId");
		});

		it("sets the state of the bot to Idle", () => {
			expect(bot.state).toEqual(BotState.Idle);
		});

		it("creates a gameRunner for the bot", () => {
			expect(bot.gameRunner).not.toEqual(undefined);
		});
	});

	describe("handling messages", () => {
		let bot: Bot;
		let mockInteraction: MockInteraction;

		describe("when handling a start game command", () => {
			describe("and the bot is in Idle state", () => {
				beforeEach(() => {
					bot = new Bot("fooUserId", "fooChannelId");

					mockInteraction = constructMockInteraction({
						commandName: "start",
						user: {
							username: "someUser",
							id: "someId",
							displayAvatarURL: () => "foo.com/foobar.png",
						},
					});

					bot.gameRunner = {
						initializeGame: jest.fn(),
						addPlayer: jest.fn(),
						playerInGame: () => false,
					} as any;

					bot.handleInteraction(mockInteraction as any);
				});

				it("initializes a game", () => {
					expect(bot.gameRunner.initializeGame).toHaveBeenCalledTimes(1);
				});

				it("adds a player to the game", () => {
					expect(bot.gameRunner.addPlayer).toHaveBeenCalledTimes(1);
				});

				it("changes the bot state to Waiting", () => {
					expect(bot.state).toEqual(BotState.Waiting);
				});
			});

			describe("and the user has cooldown left", () => {
				beforeEach(() => {
					bot = new Bot("fooUserId", "fooChannelId");

					mockInteraction = constructMockInteraction({
						commandName: "start",
						user: {
							username: "someUser",
							id: "mockCooldown",
							displayAvatarURL: () => "foo.com/foobar.png",
						},
					});

					bot.gameRunner = {
						initializeGame: jest.fn(),
						addPlayer: jest.fn(),
						playerInGame: () => false,
					} as any;

					bot.handleInteraction(mockInteraction as any);
				});

				it("doesn't initialize a game", () => {
					expect(bot.gameRunner.initializeGame).toHaveBeenCalledTimes(0);
				});

				it("doesn't add a player to the game", () => {
					expect(bot.gameRunner.addPlayer).toHaveBeenCalledTimes(0);
				});

				it("doesn't change the bot state", () => {
					expect(bot.state).toEqual(BotState.Idle);
				});

				it("sends cooldown message", () => {
					expect(mockInteraction.reply).toHaveBeenCalledTimes(1);
					const cooldownMessageEmbed = mockInteraction.reply.mock.calls[0][0];
					expect(cooldownMessageEmbed.embeds.length).toEqual(1);
					expect(
						cooldownMessageEmbed.embeds?.[0].author?.name?.startsWith(
							mockInteraction.user!.username
						)
					).toBe(true);
				});
			});

			describe("and a bot is in Waiting state", () => {
				beforeEach(() => {
					bot = new Bot("fooUserId", "fooChannelId");
					mockInteraction = constructMockInteraction({ commandName: "start" });
					bot.state = BotState.Waiting;
					bot.runGame = jest.fn();
					bot.handleInteraction(mockInteraction as any);
				});

				it("starts the game", () => {
					expect(bot.runGame).toHaveBeenCalledTimes(1);
				});
			});
		});

		describe("when handling a join game command", () => {
			beforeAll(() => {
				mockInteraction = constructMockInteraction({
					commandName: "join",
					user: {
						username: "someUser",
						id: "someId",
						displayAvatarURL: () => "foo.com/foobar.png",
					},
				});
			});

			describe("and the bot is in Idle state", () => {
				beforeEach(() => {
					bot = new Bot("fooUserId", "fooChannelId");
					bot.handleInteraction(mockInteraction as any);
				});

				it("sends noFightInProgress message", () => {
					expect(mockInteraction.reply).toHaveBeenCalledWith(
						messages.noFightInProgress()
					);
				});
			});

			describe("and player is already in the game", () => {
				beforeEach(() => {
					bot = new Bot("fooUserId", "fooChannelId");

					bot.gameRunner = {
						addPlayer: jest.fn(),
						playerInGame: () => true,
						getPlayerCount: () => 0,
						getCurrentPlayersWithClasses: () => [["foo", PlayerClass.Chungus]],
					} as any;

					bot.state = BotState.Waiting;
					bot.handleInteraction(mockInteraction as any);
				});

				it("doesn't add player to the game", () => {
					expect(bot.gameRunner.addPlayer).toHaveBeenCalledTimes(0);
				});
			});

			describe("and player is not already in the game", () => {
				beforeEach(() => {
					bot = new Bot("fooUserId", "fooChannelId");

					bot.gameRunner = {
						addPlayer: jest.fn(),
						playerInGame: () => false,
						getPlayerCount: () => 0,
						getCurrentPlayersWithClasses: () => [["foo", PlayerClass.Chungus]],
					} as any;

					bot.state = BotState.Waiting;
					bot.handleInteraction(mockInteraction as any);
				});

				it("adds player to the game", () => {
					expect(bot.gameRunner.addPlayer).toHaveBeenCalledTimes(1);
				});
			});

			describe("and the game already has max players", () => {
				beforeEach(() => {
					bot = new Bot("fooUserId", "fooChannelId");

					bot.gameRunner = {
						addPlayer: jest.fn(),
						playerInGame: () => false,
						getPlayerCount: () => MAX_PLAYER_COUNT,
					} as any;

					bot.state = BotState.Waiting;
					bot.handleInteraction(mockInteraction as any);
				});

				it("doesn't add player to the game", () => {
					expect(bot.gameRunner.addPlayer).toHaveBeenCalledTimes(0);
				});
			});
		});

		describe("when handling change class command", () => {
			describe("and the user tries to change to an existing class", () => {
				const newPlayerClass = "drunk";
				beforeEach(() => {
					bot = new Bot("fooUserId", "fooChannelId");

					mockInteraction = constructMockInteraction({
						commandName: "class",
						options: {
							data: [{ value: newPlayerClass }],
						} as any,
						user: {
							username: "someUser",
							id: "someId",
							displayAvatarURL: () => "foo.com/foobar.png",
						},
					});

					bot.gameRunner = {
						setPlayerClass: jest.fn(),
					} as any;

					bot.handleInteraction(mockInteraction as any);
				});

				it("calls setPlayerClass with the correct class", () => {
					expect(bot.gameRunner.setPlayerClass).toHaveBeenCalledTimes(1);
					expect((bot.gameRunner.setPlayerClass as any).mock.calls[0]).toEqual([
						mockInteraction.user!.id,
						newPlayerClass,
					]);
				});

				it("sends a classSelected message", () => {
					expect(mockInteraction.reply).toHaveBeenCalledWith(
						messages.classSelected(
							mockInteraction.user!.username,
							newPlayerClass
						)
					);
				});
			});
		});
	});

	describe("error handling for sending messages", () => {
		let bot: Bot;
		const error = "Sending failed because of some random HTTP issue";
		let originalConsoleError: any;
		const brokenMockChannel = {
			send: () => {
				throw new Error(error);
			},
		};

		beforeAll(() => {
			originalConsoleError = console.error;
			console.error = jest.fn();
		});

		afterAll(() => {
			console.error = originalConsoleError;
		});

		beforeEach(() => {
			bot = new Bot("fooUserId", "fooChannelId");
			bot.sendMessageRaw(brokenMockChannel as any, "Lorem ipsum");
		});

		it("logs the error", () => {
			expect(console.error as jest.Mock).toHaveBeenCalledTimes(1);
			expect(
				(console.error as jest.Mock).mock.calls[0][0].includes(error)
			).toBe(true);
		});
	});

	describe("error handling for rendering video", () => {
		let bot: Bot;
		let channel: MockInteraction["channel"];
		let interaction: MockInteraction;

		beforeEach(() => {
			interaction = constructMockInteraction({});
			channel = constructMockInteraction({}).channel;
			bot = new Bot("fooUserId", "fooChannelId");
			bot.gameRunner = {
				getPlayerCount: () => 2,
				getCurrentPlayersWithClasses: () => ["fooPlayer", PlayerClass.Chungus],
				runGame: () => {
					throw new Error("Bam");
				},
			} as any;

			bot.runGame(interaction as any, channel as any);
		});

		it("sets the bot state to Idle", () => {
			expect(bot.state).toEqual(BotState.Idle);
		});

		it("sends a message saying the rendering failed", () => {
			expect(channel.send).toHaveBeenCalledWith(messages.renderingFailed());
		});
	});
});
