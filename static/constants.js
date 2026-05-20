import SOUND_DEFAULTS from "https://cmg.easierbycode.deno.net/sound_defaults.js";

const doc = typeof document !== "undefined" ? document : null;
const win = typeof window !== "undefined" ? window : null;

export default {
  LANG: (function () {
    const lang = doc?.documentElement.lang ??
      globalThis.navigator?.language ?? "";
    return lang.startsWith("ja") ? "ja" : "en";
  })(),
  BASE_PATH: "",
  boss_bison_bgm_info: {
    name: "boss_bison_bgm",
    start: 914888,
    end: 6111881,
  },
  boss_barlog_bgm_info: {
    name: "boss_barlog_bgm",
    start: 782400,
    end: 4315201,
  },
  boss_sagat_bgm_info: {
    name: "boss_sagat_bgm",
    start: 1635142,
    end: 6883739,
  },
  boss_vega_bgm_info: {
    name: "boss_vega_bgm",
    start: 513529,
    end: 4325295,
  },
  boss_goki_bgm_info: {
    name: "boss_goki_bgm",
    start: 864e3,
    end: 6130287,
  },
  boss_fang_bgm_info: {
    name: "boss_fang_bgm",
    start: 888672,
    end: 5802799,
  },
  RESOURCE: {
    recipe: "game.json",
    ...SOUND_DEFAULTS,
  },
  SCENE_NAME_LOAD: "LoadScene",
  SCENE_NAME_TITLE: "TitleScene",
  SCENE_NAME_HOWTOPLAY: "HowToPlayScene",
  SCENE_NAME_DEMO: "DemoScene",
  SCENE_NAME_ADV: "AdvScene",
  SCENE_NAME_GAME: "GameScene",
  SCENE_NAME_ENDING: "EndingScene",
  SCENE_NAME_RESULT: "ResultScene",
  STAGE_PROLOGUE_ID: 0,
  STAGE_ENDING_ID: 4,
  STAGE_SPENDING_ID: 5,
  GAME_WIDTH: 256,
  GAME_HEIGHT: 480,
  GAME_CENTER: 128,
  GAME_MIDDLE: 240,
  BASE_ANIMATION_SPEED: 0.33,
  STAGE_WIDTH: win?.innerWidth ?? 0,
  STAGE_HEIGHT: win?.innerHeight ?? 0,
  STAGE_CENTER: (win?.innerWidth ?? 0) / 2,
  STAGE_MIDDLE: (win?.innerHeight ?? 0) / 2,
  FPS: 30,
};
