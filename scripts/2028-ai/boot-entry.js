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

import {
    DEFAULTS as LEVEL_LOADER_DEFAULTS,
    levelLoaderScenePluginConfig,
    parseStageId,
} from "../../static/phaser-plugins/level-loader.js";

import {
    hasSceneScript,
    initSceneScripts,
    isSceneScriptReplaced,
    runSceneScriptCreate,
    runSceneScriptEnd,
    runSceneScriptStart,
    runSceneScriptUpdate,
} from "../../static/phaser-plugins/scene-script.js";

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
    gameState.stageId = parseStageId(stageId, LEVEL_LOADER_DEFAULTS.maxStage);
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
                let stageId = info.stageId;
                let bossRush = info.bossRush;
                // OSD "Akuma Boss" cheat (?boss=goki): Goki only replaces the
                // stage-3 boss on a fresh run, so pin the stage there, flag the
                // override for Boss.bossAdd, and imply boss-rush. Mirrors the
                // native BootScene._finishBoot path used by the exported APK.
                try {
                    const p = new URLSearchParams(location.search);
                    if (p.get("boss") === "goki") {
                        gameState.forceBossName = "goki";
                        // Pin to Goki's stage only when no explicit ?stage was
                        // given (match the native path; don't override a choice).
                        if (p.get("stage") == null) stageId = 3;
                        bossRush = true;
                    }
                } catch (_e) { /* ignore */ }
                // primeGameStateForStage resets shortFlg to false, so apply the
                // boss-rush flag AFTER it — the previous order set it first and
                // primeGameStateForStage immediately clobbered it (bossRush never
                // skipped waves). Matches BootScene._finishBoot's ordering.
                primeGameStateForStage(recipe, stageId);
                if (bossRush) gameState.shortFlg = true;
            },
        }).then((result) => {
            if (result.bgmSourceURLs) {
                gameState.bgmSourceURLs = result.bgmSourceURLs;
            }
            // Resolve player scene scripts (editor hand-off / query params /
            // recipe.sceneScripts) before any scripted scene can start. Never
            // rejects — a broken script logs and the default scenes run.
            return initSceneScripts({ recipe: gameState._phaserRecipe }).then(() => {
                // Editor play / ?level= normally skips straight into the game,
                // but when the player attached scene scripts, route through the
                // scenes they customized so PLAY actually previews them. A
                // Dezaemon import launched from its first stage routes through
                // the title too — the save ships its own drawn title screen,
                // and power-on -> title -> stage 1 is how the Saturn plays it.
                // (Launching a later stage stays direct: that's author
                // iteration, not a run.)
                let nextScene = result.showTitle ? "PhaserTitleScene" : "PhaserGameScene";
                if (nextScene === "PhaserGameScene") {
                    const recipe = gameState._phaserRecipe;
                    if (hasSceneScript("title")) nextScene = "PhaserTitleScene";
                    else if (hasSceneScript("adv")) nextScene = "PhaserAdvScene";
                    else if (recipe && recipe.dezaemonTitle && gameState.stageId === 0) {
                        nextScene = "PhaserTitleScene";
                    }
                }
                console.log("[2028.Ai] level loaded via plugin — source=" + result.source +
                    " stage=" + result.stageId + " → " + nextScene);
                // Phaser 4: start the next scene via the game scene manager on
                // the next tick (matches BootScene's own transition pattern).
                setTimeout(() => {
                    game.scene.stop("BootScene");
                    game.scene.start(nextScene);
                }, 50);
            });
        });
    }
}

// ---- Player scene scripts ---------------------------------------------------
// Wrap the 2019-es7 title/story scenes with the scene-script runtime: a player
// script (from the level editor, ?titleScript=/?advScript= params, or the
// level record's sceneScripts) can hook each scene's start/end or replace it
// entirely, with full access to the scene's GameObjects via ctx.

class ScriptedTitleScene extends PhaserTitleScene {
    _ssOpts() {
        return {
            Phaser: globalThis.Phaser,
            state: gameState,
            next: () => {
                if (this.__ssAdvanced) return;
                this.__ssAdvanced = true;
                // In replace mode the default UI never existed, so skip
                // titleStart's tween/button teardown and jump straight to the
                // scene hand-off.
                if (isSceneScriptReplaced(this)) super.goToAdvScene();
                else super.titleStart();
            },
        };
    }

    create() {
        this.__ssAdvanced = false;
        if (runSceneScriptCreate("title", this, this._ssOpts())) return;
        super.create();
        runSceneScriptStart("title", this, this._ssOpts());
    }

    titleStart() {
        // Mirror the base guards so the onEnd hook only fires when the start
        // would actually go through.
        if (!this.transitioning && !(this.staffRollPanel && this.staffRollPanel.active)) {
            if (runSceneScriptEnd("title", this, this._ssOpts())) return;
        }
        super.titleStart();
    }

    update(time, delta) {
        runSceneScriptUpdate("title", this, time, delta);
        if (isSceneScriptReplaced(this)) return;
        super.update(time, delta);
    }
}

class ScriptedAdvScene extends PhaserAdvScene {
    _ssOpts() {
        return {
            Phaser: globalThis.Phaser,
            state: gameState,
            next: () => {
                if (this.__ssAdvanced) return;
                this.__ssAdvanced = true;
                if (this.endingFlg === undefined) {
                    // Replace mode: default create() never ran — mirror its
                    // ending-vs-game routing so goToNextScene lands right.
                    this.endingFlg = gameState.stageId === 5 ||
                        (gameState.stageId === 4 &&
                            !(gameState.akebonoCnt >= 4 && gameState.continueCnt === 0));
                }
                super.goToNextScene();
            },
        };
    }

    create() {
        this.__ssAdvanced = false;
        if (runSceneScriptCreate("adv", this, this._ssOpts())) return;
        // A hook-mode adv script outranks a recipe's noStory skip — the
        // author attached story content, so PhaserAdvScene must actually run
        // (its create checks this flag before passing through).
        this.__advSceneScripted = hasSceneScript("adv");
        super.create();
        runSceneScriptStart("adv", this, this._ssOpts());
    }

    goToNextScene() {
        if (runSceneScriptEnd("adv", this, this._ssOpts())) return;
        super.goToNextScene();
    }

    update(time, delta) {
        runSceneScriptUpdate("adv", this, time, delta);
        if (isSceneScriptReplaced(this)) return;
        super.update(time, delta);
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
            ScriptedTitleScene,
            ScriptedAdvScene,
            PhaserGameScene,
            PhaserContinueScene,
            PhaserEndingScene,
            PhaserForgeScene,
        ],
    };

    const game = new Phaser.Game(config);
    // __PHASER_4_GAME__ is what the host page's audio-unlock/canvas-fit
    // helpers already read; __PHASER_GAME__ is the canonical handle every cmg
    // game exposes, for the debugger and for gamepad-support /
    // controller-configurator, which look it up to start a scene.
    globalThis.__PHASER_4_GAME__ = game;
    globalThis.__PHASER_GAME__ = game;
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
