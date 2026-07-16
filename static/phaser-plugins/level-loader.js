// Level Loader — a Phaser 4 ScenePlugin that resolves a "level" from one of
// several sources (an offline-baked record, a Firebase Realtime Database
// entry, or a level-editor draft in localStorage) and merges it into a base
// "recipe" object describing enemies, bosses, the player, the stage atlas and
// custom audio.
//
// This logic was extracted from the 2019-es7 game's BootScene, where it lived
// inline and was hard-wired to that game's `gameState`/constants. Here it is a
// self-contained, reusable plugin: the game-specific bits (which base recipe to
// merge into, the atlas/texture keys, how to prime per-stage state) are passed
// in as options instead of being baked in.
//
// USAGE
//   import { levelLoaderScenePluginConfig } from "/phaser-plugins/level-loader.js";
//
//   const config = {
//     type: Phaser.WEBGL,
//     scene: BootScene,
//     plugins: {
//       scene: [levelLoaderScenePluginConfig({ mapping: "levelLoader" })],
//     },
//   };
//   new Phaser.Game(config);
//
//   // ...then inside a scene that preloaded the base recipe + atlas:
//   class BootScene extends Phaser.Scene {
//     create() {
//       this.levelLoader.loadLevel({
//         baseRecipeKey: "recipe",
//         atlasKey: "game_asset",
//         onPrimeState: (recipe, info) => primeGameState(recipe, info.stageId),
//       }).then((result) => {
//         this.scene.start(result.showTitle ? "TitleScene" : "GameScene");
//       });
//     }
//   }
//
// Phaser must be loaded before `createLevelLoaderPlugin` is called. Because the
// plugin class extends `Phaser.Plugins.ScenePlugin`, it is produced lazily by a
// factory rather than at module-evaluation time, so importing this module never
// depends on Phaser already being present.
//
// Besides the plugin, this module exports the Phaser-free helpers the level
// EDITOR (static/editor/index.html) shares with the game: level-name/Firebase
// key sanitizing, stage-id clamping, the custom-audio IndexedDB opener, the
// Firebase database bootstrap, and DEFAULTS (the editor-play localStorage keys
// and custom-audio DB names live there). Keeping them here means the editor
// writes exactly what the plugin reads.

export const DEFAULTS = {
  defaultLevel: "foo",
  baseRecipeKey: "recipe",
  levelsPath: "levels",
  atlasKey: "game_asset",
  maxStage: 4,
  editorRecipeKey: "__editorPhaserRecipe__",
  editorStageKey: "__editorPhaserStageId__",
  fallbackOnError: true,
  lowMode: false,
  // Firebase data keys that carry a base64 image, mapped to the texture key to
  // create. `replace: true` removes any existing texture of that key first.
  titleImageKeys: {
    titleBgDataURL: { key: "title_bg", replace: true },
    logoDataURL: { key: "custom_logo", replace: false },
    subTitleDataURL: { key: "custom_subTitle", replace: false },
    titleStartTextDataURL: { key: "custom_titleStartText", replace: false },
  },
  audio: {
    enabled: true,
    dbName: "editorCustomAudio",
    store: "customAudio",
    customBgmDir: "assets/custom-bgm/",
    manifestKey: "custom-bgm-manifest",
    baseUrlElementId: "baseUrl",
  },
};

function deepClone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function readParam(name) {
  if (typeof globalThis === "undefined" || !globalThis.location) {
    return null;
  }
  try {
    return new URLSearchParams(globalThis.location.search).get(name);
  } catch (_e) {
    return null;
  }
}

export function sanitizeLevelName(name) {
  return name ? name.replace(/[.#$/\[\]]/g, "_").trim() : null;
}

// Firebase RTDB keys can't contain "." — encode it as the one-dot-leader
// character (U+2024) on write, and decode it back on read.
export function encodeFirebaseKey(key) {
  return key.replace(/\./g, "\u2024");
}

export function decodeFirebaseKey(key) {
  return key.replace(/\u2024/g, ".");
}

export function parseStageId(value, maxStage) {
  const stageId = Number(value);
  if (!Number.isFinite(stageId)) {
    return 0;
  }
  return Math.max(0, Math.min(maxStage, Math.floor(stageId)));
}

export function openCustomAudioDB(dbName, store) {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB not available"));
  }
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(dbName, 1);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(store)) {
        db.createObjectStore(store);
      }
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e.target.error);
  });
}

function getAllCustomAudioEntries(dbName, store) {
  return openCustomAudioDB(dbName, store).then((db) =>
    new Promise((resolve, reject) => {
      const tx = db.transaction(store, "readonly");
      const objectStore = tx.objectStore(store);
      const entries = {};
      const cursorReq = objectStore.openCursor();
      cursorReq.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
          entries[cursor.key] = cursor.value;
          cursor.continue();
        } else {
          resolve(entries);
        }
      };
      cursorReq.onerror = (e) => reject(e.target.error);
    })
  );
}

// Resolve a Realtime Database handle from the compat firebase SDK, initializing
// the default app from `config` when none exists yet.
export function getFirebaseDatabase(firebase, config) {
  if (typeof firebase === "undefined" || !firebase || !firebase.database) {
    throw new Error("Firebase not available");
  }
  if (!firebase.apps || firebase.apps.length === 0) {
    if (!config) {
      throw new Error("No Firebase config");
    }
    firebase.initializeApp(config);
  }
  return firebase.database();
}

export function createLevelLoaderPlugin(Phaser = globalThis.Phaser) {
  if (!Phaser || !Phaser.Plugins || !Phaser.Plugins.ScenePlugin) {
    throw new Error(
      "createLevelLoaderPlugin: Phaser.Plugins.ScenePlugin is unavailable — load Phaser before calling this factory.",
    );
  }

  return class LevelLoaderPlugin extends Phaser.Plugins.ScenePlugin {
    constructor(scene, pluginManager, pluginKey) {
      super(scene, pluginManager, pluginKey);
    }

    // ---- URL parameter readers --------------------------------------------

    readLevelParam() {
      return sanitizeLevelName(readParam("level"));
    }

    readStageParam() {
      return readParam("stage");
    }

    readBossRushParam() {
      return readParam("bossRush") === "1";
    }

    // Editor "play" requests skip the network entirely: the level editor writes
    // a recipe draft to localStorage and navigates here with `?editorPlay=1`.
    readEditorPlayRequest(opts) {
      const o = opts || {};
      const recipeKey = o.editorRecipeKey || DEFAULTS.editorRecipeKey;
      const stageKey = o.editorStageKey || DEFAULTS.editorStageKey;
      const maxStage = o.maxStage != null ? o.maxStage : DEFAULTS.maxStage;

      if (typeof globalThis === "undefined" || readParam("editorPlay") !== "1") {
        return null;
      }

      let recipeText = null;
      try {
        recipeText = localStorage.getItem(recipeKey);
      } catch (_e) { /* localStorage may be blocked */ }
      if (!recipeText) {
        return null;
      }

      try {
        return {
          recipe: JSON.parse(recipeText),
          stageId: parseStageId(
            readParam("stage") || localStorage.getItem(stageKey) || 0,
            maxStage,
          ),
        };
      } catch (_e) {
        return null;
      }
    }

    // ---- Source resolution ------------------------------------------------

    // Resolve the raw level record. Priority: an offline-baked record on
    // `globalThis.__OFFLINE_LEVEL__` (build tooling inlines it so there is no
    // network dependency), otherwise Firebase Realtime Database.
    fetchLevel(levelName, opts) {
      const o = opts || {};
      const offline = o.offlineLevel !== undefined
        ? o.offlineLevel
        : (typeof globalThis !== "undefined" ? globalThis.__OFFLINE_LEVEL__ : null);
      if (offline) {
        return Promise.resolve(offline);
      }

      const firebase = o.firebase || (typeof globalThis !== "undefined" ? globalThis.firebase : undefined);
      const config = o.firebaseConfig ||
        (typeof globalThis !== "undefined" ? (globalThis.firebaseConfig || globalThis.__FIREBASE_CONFIG__) : null);
      let db;
      try {
        db = getFirebaseDatabase(firebase, config);
      } catch (err) {
        return Promise.reject(err);
      }

      const levelsPath = o.levelsPath || DEFAULTS.levelsPath;
      return db.ref(levelsPath + "/" + levelName).once("value").then((snapshot) => {
        const data = snapshot.val();
        if (!data || !data.enemylist) {
          throw new Error('Level "' + levelName + '" not found');
        }
        return data;
      });
    }

    // ---- Atlas merge ------------------------------------------------------

    // A level may ship its own atlas (base64 PNG + frame map). Stack it beneath
    // the local atlas in a single canvas so both local frames (player/UI) and
    // level frames (enemies) resolve from one texture. Resolves once merged (or
    // immediately, if the level carries no atlas).
    mergeAtlas(levelData, atlasKey) {
      const scene = this.scene;
      if (!levelData || !levelData.atlasImageDataURL || !levelData.atlasFrames) {
        return Promise.resolve(false);
      }

      return new Promise((resolve) => {
        const fbImg = new Image();
        fbImg.onload = () => {
          try {
            const localAtlas = scene.textures.get(atlasKey);
            const localSource = localAtlas && localAtlas.source && localAtlas.source[0]
              ? localAtlas.source[0].image
              : null;
            const localFrames = localAtlas ? localAtlas.frames : {};
            if (!localSource) {
              resolve(false);
              return;
            }

            const localW = localSource.width;
            const localH = localSource.height;
            const mergedCanvas = document.createElement("canvas");
            mergedCanvas.width = Math.max(localW, fbImg.width);
            mergedCanvas.height = localH + fbImg.height;
            const mctx = mergedCanvas.getContext("2d");
            mctx.drawImage(localSource, 0, 0);
            mctx.drawImage(fbImg, 0, localH);

            const mergedFrameMap = {};
            for (const lk in localFrames) {
              if (lk === "__BASE") continue;
              const lf = localFrames[lk];
              if (lf && lf.cutX !== undefined) {
                mergedFrameMap[lk] = {
                  frame: { x: lf.cutX, y: lf.cutY, w: lf.cutWidth, h: lf.cutHeight },
                };
              }
            }
            // Level frames are offset down by the local atlas height.
            for (const fname in levelData.atlasFrames) {
              const decodedName = decodeFirebaseKey(fname);
              const fd = levelData.atlasFrames[fname];
              if (fd && fd.frame) {
                const frameData = {
                  frame: { x: fd.frame.x, y: fd.frame.y + localH, w: fd.frame.w, h: fd.frame.h },
                };
                mergedFrameMap[decodedName] = frameData;
                // Let a .png replacement also satisfy a .gif lookup (and vice
                // versa) so animations find the swapped-in frames.
                let altName = null;
                if (decodedName.endsWith(".png")) {
                  altName = decodedName.slice(0, -4) + ".gif";
                } else if (decodedName.endsWith(".gif")) {
                  altName = decodedName.slice(0, -4) + ".png";
                }
                if (altName && mergedFrameMap[altName]) {
                  mergedFrameMap[altName] = frameData;
                }
              }
            }

            scene.textures.remove(atlasKey);
            scene.textures.addAtlas(atlasKey, mergedCanvas, { frames: mergedFrameMap });
            resolve(true);
          } catch (atlasErr) {
            console.warn("Failed to merge level atlas:", atlasErr);
            resolve(false);
          }
        };
        fbImg.onerror = () => {
          console.warn("Level atlas image failed to load, using local atlas");
          resolve(false);
        };
        fbImg.src = levelData.atlasImageDataURL;
      });
    }

    // ---- Recipe merge -----------------------------------------------------

    // Merge a level's enemy/boss/player/story data into a (cloned) base recipe.
    // For cross-game levels, a referenced texture may not exist in the loaded
    // atlas; in that case we keep the local texture so the entity still renders.
    mergeRecipe(baseRecipe, levelData, atlasKey) {
      const recipe = deepClone(baseRecipe) || {};
      const localEnemyData = recipe.enemyData ? deepClone(recipe.enemyData) : {};

      const stageKey = levelData.stageKey || "stage0";
      recipe[stageKey] = { enemylist: levelData.enemylist };

      const atlasFrames = (() => {
        try {
          const atlas = this.scene.textures.get(atlasKey);
          return atlas && atlas.frames ? atlas.frames : null;
        } catch (_e) {
          return null;
        }
      })();

      if (levelData.enemyData) {
        const merged = deepClone(levelData.enemyData);
        if (atlasFrames) {
          for (const ek in merged) {
            const fbTextures = merged[ek] && merged[ek].texture ? merged[ek].texture : [];
            if (fbTextures.length > 0 && !atlasFrames[fbTextures[0]]) {
              const localEnemy = localEnemyData[ek];
              if (localEnemy && localEnemy.texture && localEnemy.texture.length > 0) {
                merged[ek].texture = localEnemy.texture;
              }
              const projKey = merged[ek].projectileData
                ? "projectileData"
                : (merged[ek].bulletData ? "bulletData" : null);
              const localProjKey = localEnemy
                ? (localEnemy.projectileData ? "projectileData" : (localEnemy.bulletData ? "bulletData" : null))
                : null;
              if (projKey && localProjKey && merged[ek][projKey] && merged[ek][projKey].texture) {
                const fbProjTex = merged[ek][projKey].texture;
                if (
                  fbProjTex.length > 0 && !atlasFrames[fbProjTex[0]] &&
                  localEnemy[localProjKey] && localEnemy[localProjKey].texture
                ) {
                  merged[ek][projKey].texture = localEnemy[localProjKey].texture;
                }
              }
            }
          }
        }
        recipe.enemyData = merged;
      }

      if (levelData.bossData) {
        const mergedBoss = deepClone(levelData.bossData);
        const localBossData = recipe.bossData ? deepClone(recipe.bossData) : {};
        if (atlasFrames) {
          for (const bk in mergedBoss) {
            const fb = mergedBoss[bk];
            const lb = localBossData[bk];
            if (fb && fb.anim) {
              for (const ak in fb.anim) {
                if (ak.startsWith("_")) continue;
                const fbAnim = fb.anim[ak];
                if (Array.isArray(fbAnim) && fbAnim.length > 0 && !atlasFrames[fbAnim[0]]) {
                  if (lb && lb.anim && lb.anim[ak]) {
                    fb.anim[ak] = lb.anim[ak];
                  }
                }
              }
            }
            if (fb && fb.bulletData && fb.bulletData.texture) {
              const fbBulletTex = fb.bulletData.texture;
              if (fbBulletTex.length > 0 && !atlasFrames[fbBulletTex[0]]) {
                if (lb && lb.bulletData && lb.bulletData.texture) {
                  fb.bulletData.texture = lb.bulletData.texture;
                }
              }
            }
          }
        }
        recipe.bossData = mergedBoss;
      }

      if (levelData.storyData) {
        recipe.storyData = levelData.storyData;
      }

      // Player scene scripts (title/adv hooks or replacements) ride along the
      // recipe; the scene-script runtime reads recipe.sceneScripts.
      if (levelData.sceneScripts && typeof levelData.sceneScripts === "object") {
        recipe.sceneScripts = levelData.sceneScripts;
      }

      if (levelData.playerData && typeof levelData.playerData === "object") {
        const localPlayer = recipe.playerData ? deepClone(recipe.playerData) : {};
        const mergedPlayer = Object.assign(localPlayer, deepClone(levelData.playerData));
        if (atlasFrames) {
          const shootKeys = ["shootNormal", "shootBig", "shoot3way"];
          for (let sk = 0; sk < shootKeys.length; sk++) {
            const shootEntry = mergedPlayer[shootKeys[sk]];
            const localShoot = recipe.playerData && recipe.playerData[shootKeys[sk]];
            if (
              shootEntry && shootEntry.texture && shootEntry.texture.length > 0 &&
              !atlasFrames[shootEntry.texture[0]]
            ) {
              if (localShoot && localShoot.texture && localShoot.texture.length > 0) {
                shootEntry.texture = localShoot.texture;
              }
            }
          }
        }
        recipe.playerData = mergedPlayer;
      }

      return recipe;
    }

    // ---- Title imagery ----------------------------------------------------

    // Add/replace branding textures (title background, logo, etc.) from any
    // base64 images the level carries.
    applyTitleImages(levelData, keyMap) {
      const scene = this.scene;
      const map = keyMap || DEFAULTS.titleImageKeys;
      for (const dataKey in map) {
        const dataURL = levelData[dataKey];
        if (!dataURL) continue;
        const spec = map[dataKey];
        const textureKey = spec.key;
        const replace = !!spec.replace;
        const img = new Image();
        img.onload = () => {
          try {
            if (replace) {
              scene.textures.remove(textureKey);
            }
            scene.textures.addImage(textureKey, img);
          } catch (e) {
            console.warn('Failed to load custom "' + textureKey + '":', e);
          }
        };
        img.src = dataURL;
      }
    }

    // ---- Custom audio -----------------------------------------------------

    // Gather custom audio blobs from IndexedDB (browser/editor flow) and, when
    // present, the Electron filesystem bridge (disk wins over IndexedDB).
    collectCustomAudioEntries(opts) {
      const o = opts || {};
      const dbName = o.dbName || DEFAULTS.audio.dbName;
      const store = o.store || DEFAULTS.audio.store;
      const entries = {};

      const idbPromise = getAllCustomAudioEntries(dbName, store).then((idbEntries) => {
        for (const k in idbEntries) {
          entries[k] = idbEntries[k];
        }
      }).catch(() => {});

      let electronPromise;
      if (
        typeof globalThis !== "undefined" && globalThis.electronAudio &&
        typeof globalThis.electronAudio.loadCustomAudio === "function"
      ) {
        electronPromise = globalThis.electronAudio.loadCustomAudio().then((diskEntries) => {
          for (const k in diskEntries) {
            entries[k] = diskEntries[k];
          }
        }).catch((err) => {
          console.warn("Electron custom audio load failed:", err);
        });
      } else {
        electronPromise = Promise.resolve();
      }

      return Promise.all([idbPromise, electronPromise]).then(() => entries);
    }

    // Queue the level's remote BGM URL overrides onto the scene loader,
    // preferring locally downloaded copies. Returns the discovered source URLs.
    _queueAudioOverrides(levelData, opts) {
      const scene = this.scene;
      const sourceURLs = {};
      if (!levelData.customAudioURLs || typeof levelData.customAudioURLs !== "object") {
        return sourceURLs;
      }

      const manifestKey = opts.manifestKey || DEFAULTS.audio.manifestKey;
      const customBgmDir = opts.customBgmDir || DEFAULTS.audio.customBgmDir;
      const baseUrlEl = typeof document !== "undefined"
        ? document.getElementById(opts.baseUrlElementId || DEFAULTS.audio.baseUrlElementId)
        : null;
      const baseUrl = baseUrlEl ? baseUrlEl.textContent.trim() : "./";
      const manifest = scene.cache.json.exists(manifestKey)
        ? (scene.cache.json.get(manifestKey) || {})
        : {};

      for (const uKey in levelData.customAudioURLs) {
        const uUrl = levelData.customAudioURLs[uKey];
        if (uUrl && typeof uUrl === "string") {
          const localFilename = manifest[uKey] || (uKey + ".mp3");
          const localPath = baseUrl + customBgmDir + localFilename;
          sourceURLs[uKey] = uUrl;
          if (scene.cache.audio.exists(uKey)) {
            scene.cache.audio.remove(uKey);
          }
          scene.load.audio(uKey, [localPath, uUrl]);
        }
      }
      return sourceURLs;
    }

    // Queue every audio source (URL overrides + collected blobs), run the
    // loader once, and resolve with the level's BGM source URL map. Resolves
    // immediately when low mode is on or nothing needs loading.
    _loadAudio(levelData, opts, lowMode) {
      const scene = this.scene;
      if (lowMode || !opts.enabled) {
        return Promise.resolve(this._queueOnlySourceURLs(levelData));
      }

      const sourceURLs = this._queueAudioOverrides(levelData, opts);
      // Each entry in sourceURLs queued exactly one loader job above.
      let queuedCount = Object.keys(sourceURLs).length;

      return this.collectCustomAudioEntries(opts).then((entries) => {
        const blobURLs = [];
        for (const key in entries) {
          const data = entries[key];
          const blob = data instanceof Blob ? data : new Blob([data], { type: "audio/mpeg" });
          const url = URL.createObjectURL(blob);
          blobURLs.push(url);
          if (scene.cache.audio.exists(key)) {
            scene.cache.audio.remove(key);
          }
          scene.load.audio(key, url);
          queuedCount++;
        }

        if (queuedCount === 0) {
          return sourceURLs;
        }

        return new Promise((resolve) => {
          scene.load.once("complete", () => {
            for (let j = 0; j < blobURLs.length; j++) {
              URL.revokeObjectURL(blobURLs[j]);
            }
            resolve(sourceURLs);
          });
          scene.load.start();
        });
      }).catch((err) => {
        console.warn("Custom audio load failed:", err);
        return sourceURLs;
      });
    }

    // Discover BGM source URLs without queuing loads (low-mode path).
    _queueOnlySourceURLs(levelData) {
      const sourceURLs = {};
      if (levelData && levelData.customAudioURLs && typeof levelData.customAudioURLs === "object") {
        for (const uKey in levelData.customAudioURLs) {
          const uUrl = levelData.customAudioURLs[uKey];
          if (uUrl && typeof uUrl === "string") {
            sourceURLs[uKey] = uUrl;
          }
        }
      }
      return sourceURLs;
    }

    // ---- Orchestration ----------------------------------------------------

    // Resolve, merge and apply a level, returning a description the caller uses
    // to drive scene flow:
    //   { recipe, stageId, hasCustomEnemies, showTitle, bossRush, source,
    //     levelName, bgmSourceURLs }
    // `source` is one of "editor" | "firebase" | "offline" | "fallback".
    loadLevel(options) {
      const o = Object.assign({}, DEFAULTS, options || {});
      o.titleImageKeys = (options && options.titleImageKeys) || DEFAULTS.titleImageKeys;
      o.audio = Object.assign({}, DEFAULTS.audio, (options && options.audio) || {});

      const scene = this.scene;
      const baseRecipe = o.baseRecipe !== undefined
        ? o.baseRecipe
        : scene.cache.json.get(o.baseRecipeKey);
      const bossRush = this.readBossRushParam();

      const prime = (recipe, info) => {
        if (typeof o.onPrimeState === "function") {
          o.onPrimeState(recipe, info);
        }
      };

      // 1) Editor draft (localStorage) — skips the network entirely.
      const editorPlay = this.readEditorPlayRequest(o);
      if (editorPlay && editorPlay.recipe) {
        const recipe = deepClone(editorPlay.recipe);
        let hasCustomEnemies = false;
        try {
          hasCustomEnemies = !!(recipe.enemyData && baseRecipe && baseRecipe.enemyData) &&
            JSON.stringify(recipe.enemyData) !== JSON.stringify(baseRecipe.enemyData);
        } catch (_e) { /* ignore */ }
        const stageId = parseStageId(editorPlay.stageId, o.maxStage);
        const info = { stageId, bossRush, source: "editor", hasCustomEnemies };
        prime(recipe, info);
        return Promise.resolve({
          recipe,
          stageId,
          hasCustomEnemies,
          showTitle: false,
          bossRush,
          source: "editor",
          levelName: null,
          bgmSourceURLs: {},
        });
      }

      // 2) Network/offline level. An explicit ?level= jumps straight into the
      //    game; the default level shows the title first.
      const explicitLevel = this.readLevelParam();
      const levelName = explicitLevel || o.defaultLevel;
      const showTitle = !explicitLevel;
      const stageParam = this.readStageParam();
      const usingOffline = o.offlineLevel !== undefined
        ? !!o.offlineLevel
        : (typeof globalThis !== "undefined" && !!globalThis.__OFFLINE_LEVEL__);

      return this.fetchLevel(levelName, o).then((data) =>
        this.mergeAtlas(data, o.atlasKey).then(() => {
          const recipe = this.mergeRecipe(baseRecipe, data, o.atlasKey);
          this.applyTitleImages(data, o.titleImageKeys);

          const stageKey = data.stageKey || "stage0";
          const stageId = stageParam != null
            ? parseStageId(stageParam, o.maxStage)
            : parseStageId(stageKey.replace("stage", ""), o.maxStage);
          const hasCustomEnemies = !!data.enemyData;
          const source = usingOffline ? "offline" : "firebase";

          prime(recipe, { stageId, bossRush, source, hasCustomEnemies });

          return this._loadAudio(data, o.audio, o.lowMode).then((bgmSourceURLs) => ({
            recipe,
            stageId,
            hasCustomEnemies,
            showTitle,
            bossRush,
            source,
            levelName,
            bgmSourceURLs,
          }));
        })
      ).catch((err) => {
        console.warn("Level load failed for '" + levelName + "':", err);
        if (!o.fallbackOnError) {
          throw err;
        }
        // Fall back to the base recipe so the game can still boot.
        const recipe = deepClone(baseRecipe) || {};
        const stageId = stageParam != null ? parseStageId(stageParam, o.maxStage) : 0;
        prime(recipe, { stageId, bossRush, source: "fallback", hasCustomEnemies: false });
        return {
          recipe,
          stageId,
          hasCustomEnemies: false,
          showTitle: true,
          bossRush,
          source: "fallback",
          levelName,
          bgmSourceURLs: {},
        };
      });
    }
  };
}

// Convenience: build the entry for a Phaser game config's `plugins.scene`
// array. `mapping` is the property the plugin is exposed as on each scene.
export function levelLoaderScenePluginConfig(opts) {
  const o = opts || {};
  return {
    key: o.key || "LevelLoader",
    plugin: createLevelLoaderPlugin(o.Phaser),
    mapping: o.mapping || "levelLoader",
  };
}

export default createLevelLoaderPlugin;
