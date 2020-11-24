export const SCREEN_WIDTH = 400;
export const SCREEN_HEIGHT = 300;
export const SIDEBAR_WIDTH = 120;
export const ARENA_WIDTH = SCREEN_WIDTH - SIDEBAR_WIDTH;
export const GAME_FPS = 30;
export const PLAYER_STARTING_CIRCLE_RADIUS = 110;
export const GAME_OVER_OVERLAY_DURATION = 2 * GAME_FPS;

export const INPUT_FILE_DIRECTORY = "inputs";
export const RENDER_DIRECTORY = "renders";
export const RENDER_FILE_NAME = "areena_fight";

export const GAME_COUNTDOWN_SECONDS = 30;
export const MAX_PLAYER_COUNT = 10;

export const IS_RUNNING_ON_NODE = !!process.release;

export const TURRET_DAMAGE = 3;
export const BEER_CAN_DAMAGE = 3;

export const FONT_FAMILY = "Roboto";
export const FONT_WEIGHT = IS_RUNNING_ON_NODE ? "700" : "500";
