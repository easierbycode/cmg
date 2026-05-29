// Boot entry for the "2028.Ai" web game — bundled by scripts/build-2028-ai.ts
// into static/games/2028-ai/game.bundle.js (a single IIFE; Phaser is a global
// loaded from lib/phaser.min.js).
//
// This is the one piece that is specific to hosting the game inside cmg: it
// reuses the 2019-es7 Phaser scenes unchanged, but replaces BootScene's inline
// level-loading with the reusable level-loader ScenePlugin. The plugin resolves
// the level from globalThis.__OFFLINE_LEVEL__ (baked from Firebase level "foo"
// — see build-level-data.js), merges its atlas beneath the base game atlas, and
// merges its enemy recipe, all with no network dependency.
//
// NOTE: imports reach into the sibling 2019-es7 checkout (../../../2019-es7);
// the bundle that ships in static/ is self-contained, this source only needs
// that repo present at build time.

import { levelLoaderScenePluginConfig } from "../../static/phaser-plugins/level-loader.js";

import { GAME_DIMENSIONS } from "../../../2019-es7/src/constants.js";
import { gameState, syncRuntimeFlagsFromLocation } from "../../../2019-es7/src/gameState.js";

import { BootScene } from "../../../2019-es7/src/phaser/BootScene.js";
import { PhaserTitleScene } from "../../../2019-es7/src/phaser/TitleScene.js";
import { PhaserAdvScene } from "../../../2019-es7/src/phaser/AdvScene.js";
import { PhaserGameScene } from "../../../2019-es7/src/phaser/GameScene.js";
import { PhaserContinueScene } from "../../../2019-es7/src/phaser/ContinueScene.js";
import { PhaserEndingScene } from "../../../2019-es7/src/phaser/EndingScene.js";
import { PhaserForgeScene } from "../../../2019-es7/src/phaser/ForgeScene.js";

const ASSET_BASE = "/games/2028-ai/";
// Primary level source is the deployed copy; fall back to the same-origin file
// so the game still boots in local dev / offline.
const LEVEL_DATA_URL = "https://cmg.easierbycode.deno.net/games/2028-ai/foo.json";
const LEVEL_DATA_FALLBACK_URL = ASSET_BASE + "foo.json";

function parseStageId(value) {
    const stageId = Number(value);
    if (!Number.isFinite(stageId)) return 0;
    return Math.max(0, Math.min(4, Math.floor(stageId)));
}

// Mirror of the (module-private) primeGameStateForStage in BootScene.js — the
// game-specific state wiring the plugin intentionally leaves to the caller.
function primeGameStateForStage(recipe, stageId) {
    if (recipe && recipe.playerData) {
        gameState.spDamage = recipe.playerData.spDamage;
        gameState.playerMaxHp = recipe.playerData.maxHp;
        gameState.playerHp = recipe.playerData.maxHp;
        gameState.shootMode = recipe.playerData.defaultShootName;
        gameState.shootSpeed = recipe.playerData.defaultShootSpeed;
    }
    gameState.combo = 0;
    gameState.maxCombo = 0;
    gameState.score = 0;
    gameState.spgage = 0;
    gameState.stageId = parseStageId(stageId);
    gameState.continueCnt = 0;
    gameState.akebonoCnt = 0;
    gameState.shortFlg = false;
}

// Reuse BootScene's asset preload verbatim; only swap the level-loading in
// create() to go through the plugin.
class PluginBootScene extends BootScene {
    preload() {
        // Assets ship under /games/2028-ai/assets/...; the 2019-es7 preload
        // uses document-relative "assets/..." paths.
        this.load.setBaseURL(ASSET_BASE);
        super.preload();
    }

    create() {
        const game = this.game;

        this.levelLoader.loadLevel({
            baseRecipeKey: "recipe",
            atlasKey: "game_asset",
            defaultLevel: "foo",
            lowMode: !!gameState.lowModeFlg,
            onPrimeState: (recipe, info) => {
                gameState._phaserRecipe = recipe;
                gameState.hasCustomEnemies = info.hasCustomEnemies;
                if (info.bossRush) gameState.shortFlg = true;
                primeGameStateForStage(recipe, info.stageId);
            },
        }).then((result) => {
            if (result.bgmSourceURLs) {
                gameState.bgmSourceURLs = result.bgmSourceURLs;
            }
            const nextScene = result.showTitle ? "PhaserTitleScene" : "PhaserGameScene";
            console.log("[2028.Ai] level loaded via plugin — source=" + result.source +
                " stage=" + result.stageId + " → " + nextScene);
            // Phaser 4: start the next scene via the game scene manager on the
            // next tick (matches BootScene's own transition pattern).
            setTimeout(() => {
                game.scene.stop("BootScene");
                game.scene.start(nextScene);
            }, 50);
        });
    }
}

function create2028Game() {
    syncRuntimeFlagsFromLocation();

    const phaserContainer = document.getElementById("phaser-canvas");
    if (phaserContainer) phaserContainer.style.display = "flex";

    const config = {
        type: Phaser.AUTO,
        width: GAME_DIMENSIONS.WIDTH,
        height: GAME_DIMENSIONS.HEIGHT,
        parent: "phaser-canvas",
        pixelArt: true,
        backgroundColor: "#000000",
        fps: { target: 60 },
        input: { mouse: { preventDefaultRight: true } },
        scale: { mode: Phaser.Scale.NONE, autoCenter: Phaser.Scale.NO_CENTER },
        audio: {
            disableWebAudio: false,
            context: window.__phaserAudioContext || undefined,
        },
        plugins: {
            scene: [levelLoaderScenePluginConfig({ mapping: "levelLoader" })],
        },
        scene: [
            PluginBootScene,
            PhaserTitleScene,
            PhaserAdvScene,
            PhaserGameScene,
            PhaserContinueScene,
            PhaserEndingScene,
            PhaserForgeScene,
        ],
    };

    const game = new Phaser.Game(config);
    globalThis.__PHASER_4_GAME__ = game;
    console.log("[2028.Ai] Phaser game started");

    // Fit the canvas to the viewport + fix input mapping under CSS scale/
    // rotation. These helpers are installed by the host page (route); the
    // page's MutationObserver also fires on canvas creation, so this is a
    // belt-and-suspenders call.
    if (typeof window !== "undefined") {
        if (typeof window.__fitCanvas === "function") window.__fitCanvas();
        if (typeof window.__fixPhaserTransform === "function") window.__fixPhaserTransform();
    }
    return game;
}

function whenPhaserReady(cb) {
    if (globalThis.Phaser) {
        cb();
        return;
    }
    const timer = setInterval(() => {
        if (globalThis.Phaser) {
            clearInterval(timer);
            cb();
        }
    }, 20);
}

async function fetchLevel(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error("HTTP " + res.status + " for " + url);
    return res.json();
}

async function main() {
    try {
        globalThis.__OFFLINE_LEVEL__ = await fetchLevel(LEVEL_DATA_URL);
    } catch (err) {
        console.warn("[2028.Ai] foo.json fetch failed (" + LEVEL_DATA_URL + ") — trying fallback", err);
        try {
            globalThis.__OFFLINE_LEVEL__ = await fetchLevel(LEVEL_DATA_FALLBACK_URL);
        } catch (err2) {
            console.warn("[2028.Ai] fallback foo.json fetch failed — using base recipe", err2);
        }
    }
    whenPhaserReady(create2028Game);
}

main();
