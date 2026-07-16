(() => {
  // static/phaser-plugins/level-loader.js
  var DEFAULTS = {
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
      titleStartTextDataURL: { key: "custom_titleStartText", replace: false }
    },
    audio: {
      enabled: true,
      dbName: "editorCustomAudio",
      store: "customAudio",
      customBgmDir: "assets/custom-bgm/",
      manifestKey: "custom-bgm-manifest",
      baseUrlElementId: "baseUrl"
    }
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
  function sanitizeLevelName(name) {
    return name ? name.replace(/[.#$/\[\]]/g, "_").trim() : null;
  }
  function decodeFirebaseKey(key) {
    return key.replace(/\u2024/g, ".");
  }
  function parseStageId(value, maxStage) {
    const stageId = Number(value);
    if (!Number.isFinite(stageId)) {
      return 0;
    }
    return Math.max(0, Math.min(maxStage, Math.floor(stageId)));
  }
  function openCustomAudioDB(dbName, store) {
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
    return openCustomAudioDB(dbName, store).then(
      (db) => new Promise((resolve, reject) => {
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
  function getFirebaseDatabase(firebase2, config) {
    if (typeof firebase2 === "undefined" || !firebase2 || !firebase2.database) {
      throw new Error("Firebase not available");
    }
    if (!firebase2.apps || firebase2.apps.length === 0) {
      if (!config) {
        throw new Error("No Firebase config");
      }
      firebase2.initializeApp(config);
    }
    return firebase2.database();
  }
  function createLevelLoaderPlugin(Phaser2 = globalThis.Phaser) {
    if (!Phaser2 || !Phaser2.Plugins || !Phaser2.Plugins.ScenePlugin) {
      throw new Error(
        "createLevelLoaderPlugin: Phaser.Plugins.ScenePlugin is unavailable — load Phaser before calling this factory."
      );
    }
    return class LevelLoaderPlugin extends Phaser2.Plugins.ScenePlugin {
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
        } catch (_e) {
        }
        if (!recipeText) {
          return null;
        }
        try {
          return {
            recipe: JSON.parse(recipeText),
            stageId: parseStageId(
              readParam("stage") || localStorage.getItem(stageKey) || 0,
              maxStage
            )
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
        const offline = o.offlineLevel !== void 0 ? o.offlineLevel : typeof globalThis !== "undefined" ? globalThis.__OFFLINE_LEVEL__ : null;
        if (offline) {
          return Promise.resolve(offline);
        }
        const firebase2 = o.firebase || (typeof globalThis !== "undefined" ? globalThis.firebase : void 0);
        const config = o.firebaseConfig || (typeof globalThis !== "undefined" ? globalThis.firebaseConfig || globalThis.__FIREBASE_CONFIG__ : null);
        let db;
        try {
          db = getFirebaseDatabase(firebase2, config);
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
              const localSource = localAtlas && localAtlas.source && localAtlas.source[0] ? localAtlas.source[0].image : null;
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
                if (lf && lf.cutX !== void 0) {
                  mergedFrameMap[lk] = {
                    frame: { x: lf.cutX, y: lf.cutY, w: lf.cutWidth, h: lf.cutHeight }
                  };
                }
              }
              for (const fname in levelData.atlasFrames) {
                const decodedName = decodeFirebaseKey(fname);
                const fd = levelData.atlasFrames[fname];
                if (fd && fd.frame) {
                  const frameData = {
                    frame: { x: fd.frame.x, y: fd.frame.y + localH, w: fd.frame.w, h: fd.frame.h }
                  };
                  mergedFrameMap[decodedName] = frameData;
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
                const projKey = merged[ek].projectileData ? "projectileData" : merged[ek].bulletData ? "bulletData" : null;
                const localProjKey = localEnemy ? localEnemy.projectileData ? "projectileData" : localEnemy.bulletData ? "bulletData" : null : null;
                if (projKey && localProjKey && merged[ek][projKey] && merged[ek][projKey].texture) {
                  const fbProjTex = merged[ek][projKey].texture;
                  if (fbProjTex.length > 0 && !atlasFrames[fbProjTex[0]] && localEnemy[localProjKey] && localEnemy[localProjKey].texture) {
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
              if (shootEntry && shootEntry.texture && shootEntry.texture.length > 0 && !atlasFrames[shootEntry.texture[0]]) {
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
        }).catch(() => {
        });
        let electronPromise;
        if (typeof globalThis !== "undefined" && globalThis.electronAudio && typeof globalThis.electronAudio.loadCustomAudio === "function") {
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
        const baseUrlEl = typeof document !== "undefined" ? document.getElementById(opts.baseUrlElementId || DEFAULTS.audio.baseUrlElementId) : null;
        const baseUrl = baseUrlEl ? baseUrlEl.textContent.trim() : "./";
        const manifest = scene.cache.json.exists(manifestKey) ? scene.cache.json.get(manifestKey) || {} : {};
        for (const uKey in levelData.customAudioURLs) {
          const uUrl = levelData.customAudioURLs[uKey];
          if (uUrl && typeof uUrl === "string") {
            const localFilename = manifest[uKey] || uKey + ".mp3";
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
        o.titleImageKeys = options && options.titleImageKeys || DEFAULTS.titleImageKeys;
        o.audio = Object.assign({}, DEFAULTS.audio, options && options.audio || {});
        const scene = this.scene;
        const baseRecipe = o.baseRecipe !== void 0 ? o.baseRecipe : scene.cache.json.get(o.baseRecipeKey);
        const bossRush = this.readBossRushParam();
        const prime = (recipe, info) => {
          if (typeof o.onPrimeState === "function") {
            o.onPrimeState(recipe, info);
          }
        };
        const editorPlay = this.readEditorPlayRequest(o);
        if (editorPlay && editorPlay.recipe) {
          const recipe = deepClone(editorPlay.recipe);
          let hasCustomEnemies = false;
          try {
            hasCustomEnemies = !!(recipe.enemyData && baseRecipe && baseRecipe.enemyData) && JSON.stringify(recipe.enemyData) !== JSON.stringify(baseRecipe.enemyData);
          } catch (_e) {
          }
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
            bgmSourceURLs: {}
          });
        }
        const explicitLevel = this.readLevelParam();
        const levelName = explicitLevel || o.defaultLevel;
        const showTitle = !explicitLevel;
        const stageParam = this.readStageParam();
        const usingOffline = o.offlineLevel !== void 0 ? !!o.offlineLevel : typeof globalThis !== "undefined" && !!globalThis.__OFFLINE_LEVEL__;
        return this.fetchLevel(levelName, o).then(
          (data) => this.mergeAtlas(data, o.atlasKey).then(() => {
            const recipe = this.mergeRecipe(baseRecipe, data, o.atlasKey);
            this.applyTitleImages(data, o.titleImageKeys);
            const stageKey = data.stageKey || "stage0";
            const stageId = stageParam != null ? parseStageId(stageParam, o.maxStage) : parseStageId(stageKey.replace("stage", ""), o.maxStage);
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
              bgmSourceURLs
            }));
          })
        ).catch((err) => {
          console.warn("Level load failed for '" + levelName + "':", err);
          if (!o.fallbackOnError) {
            throw err;
          }
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
            bgmSourceURLs: {}
          };
        });
      }
    };
  }
  function levelLoaderScenePluginConfig(opts) {
    const o = opts || {};
    return {
      key: o.key || "LevelLoader",
      plugin: createLevelLoaderPlugin(o.Phaser),
      mapping: o.mapping || "levelLoader"
    };
  }

  // static/phaser-plugins/scene-script.js
  var SCENE_SCRIPT_DEFAULTS = {
    editorKey: "__editorSceneScripts__",
    targets: {
      title: { param: "titleScript", modeParam: "titleScriptMode" },
      adv: { param: "advScript", modeParam: "advScriptMode" }
    },
    defaultGistUser: "easierbycode",
    gistApiBase: "https://api.github.com/gists",
    gistUserApiBase: "https://api.github.com/users",
    sucraseCdn: "https://esm.sh/sucrase@3.35.0",
    svelteCdn: "https://esm.sh/svelte@5.16.0"
  };
  var SCENE_SCRIPT_TARGETS = ["title", "adv"];
  function dynImport(url) {
    return new Function("u", "return import(u)")(url);
  }
  function readParam2(name) {
    if (typeof globalThis === "undefined" || !globalThis.location) return null;
    try {
      return new URLSearchParams(globalThis.location.search).get(name);
    } catch (_e) {
      return null;
    }
  }
  function inferSceneScriptLang(filename) {
    const f = String(filename || "").split(/[?#]/)[0].toLowerCase();
    if (f.endsWith(".svelte")) return "svelte";
    if (f.endsWith(".ts") || f.endsWith(".tsx") || f.endsWith(".mts")) return "ts";
    return "js";
  }
  async function compileTypeScript(code) {
    const sucrase = await dynImport(SCENE_SCRIPT_DEFAULTS.sucraseCdn);
    const transform = sucrase.transform || sucrase.default && sucrase.default.transform;
    if (!transform) throw new Error("sucrase transform unavailable");
    return transform(code, { transforms: ["typescript"] }).code;
  }
  async function compileSvelte(code, filename) {
    const compiler = await dynImport(SCENE_SCRIPT_DEFAULTS.svelteCdn + "/compiler");
    const compile = compiler.compile || compiler.default && compiler.default.compile;
    if (!compile) throw new Error("svelte compiler unavailable");
    const out = compile(code, {
      filename: filename || "SceneScript.svelte",
      generate: "client",
      css: "injected"
      // keep <style> blocks — there is no separate .css file at runtime
    });
    let js = out.js.code.replace(
      /((?:from|import)\s*\(?\s*)(["'])(svelte(?:\/[^"']*)?)\2/g,
      (_m, pre, q, spec) => pre + q + SCENE_SCRIPT_DEFAULTS.svelteCdn + spec.slice("svelte".length) + q
    );
    js += "\nexport const __svelte = true;\n";
    return js;
  }
  function compileSceneScript(code, lang, filename) {
    const l = lang || inferSceneScriptLang(filename);
    if (l === "ts") return compileTypeScript(code);
    if (l === "svelte") return compileSvelte(code, filename);
    return Promise.resolve(code);
  }
  async function importModuleFromSource(jsCode) {
    const blob = new Blob([jsCode], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    try {
      return await dynImport(url);
    } finally {
      URL.revokeObjectURL(url);
    }
  }
  async function fetchGistFile(spec) {
    const s = spec || {};
    if (!s.id) throw new Error("gist id required");
    const rev = s.rev && s.rev !== "latest" ? "/" + s.rev : "";
    const res = await fetch(`${SCENE_SCRIPT_DEFAULTS.gistApiBase}/${s.id}${rev}`, {
      headers: { Accept: "application/vnd.github+json" }
    });
    if (!res.ok) throw new Error(`gist ${s.id}${rev}: HTTP ${res.status}`);
    const gist = await res.json();
    const files = gist.files || {};
    const names = Object.keys(files);
    let name = s.file && files[s.file] ? s.file : null;
    if (!name) name = names.find((f) => /scene/i.test(f) && /\.(js|ts|svelte)$/i.test(f));
    if (!name) name = names.find((f) => /\.(js|ts|svelte)$/i.test(f));
    if (!name) name = names[0];
    if (!name) throw new Error(`gist ${s.id} has no files`);
    const file = files[name];
    let content = file.content;
    if (file.truncated || content == null) {
      const raw = await fetch(file.raw_url);
      if (!raw.ok) throw new Error(`gist raw ${name}: HTTP ${raw.status}`);
      content = await raw.text();
    }
    return { content, filename: name, revision: gist.history && gist.history[0] ? gist.history[0].version : null };
  }
  function parseGistSpec(value) {
    let rest = String(value || "").replace(/^gist:/, "");
    let file;
    const hash = rest.indexOf("#");
    if (hash >= 0) {
      file = rest.slice(hash + 1) || void 0;
      rest = rest.slice(0, hash);
    }
    let rev;
    const at = rest.indexOf("@");
    if (at >= 0) {
      rev = rest.slice(at + 1) || void 0;
      rest = rest.slice(0, at);
    }
    let user, id;
    const slash = rest.indexOf("/");
    if (slash >= 0) {
      user = rest.slice(0, slash) || void 0;
      id = rest.slice(slash + 1);
    } else {
      id = rest;
    }
    return { user, id, rev: rev || "latest", file };
  }
  function entryFromParamValue(value, mode) {
    const m = mode === "replace" ? "replace" : "hook";
    if (/^gist:/i.test(value)) {
      return { sourceType: "gist", mode: m, gist: parseGistSpec(value) };
    }
    return { sourceType: "url", mode: m, url: value };
  }
  function resolveSceneScriptEntries(opts) {
    const o = opts || {};
    const out = { title: null, adv: null };
    if (readParam2("editorPlay") === "1") {
      try {
        const raw = localStorage.getItem(SCENE_SCRIPT_DEFAULTS.editorKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          for (const t of SCENE_SCRIPT_TARGETS) {
            if (parsed && parsed[t] && typeof parsed[t] === "object") out[t] = parsed[t];
          }
        }
      } catch (_e) {
      }
    }
    for (const t of SCENE_SCRIPT_TARGETS) {
      const v = readParam2(SCENE_SCRIPT_DEFAULTS.targets[t].param);
      if (v) out[t] = entryFromParamValue(v, readParam2(SCENE_SCRIPT_DEFAULTS.targets[t].modeParam));
    }
    const rs = o.recipe && o.recipe.sceneScripts;
    if (rs && typeof rs === "object") {
      for (const t of SCENE_SCRIPT_TARGETS) {
        if (!out[t] && rs[t] && typeof rs[t] === "object") out[t] = rs[t];
      }
    }
    return out;
  }
  async function resolveEntrySource(entry) {
    if (entry.sourceType === "inline") {
      if (entry.compiledJs) return { js: entry.compiledJs };
      return { js: await compileSceneScript(entry.code || "", entry.lang, null) };
    }
    if (entry.sourceType === "gist") {
      const g = Object.assign({ user: SCENE_SCRIPT_DEFAULTS.defaultGistUser }, entry.gist);
      const { content, filename } = await fetchGistFile(g);
      return { js: await compileSceneScript(content, null, filename) };
    }
    const url = entry.url;
    const lang = inferSceneScriptLang(url);
    if (lang === "js") {
      try {
        return { module: await dynImport(url) };
      } catch (_e) {
      }
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error(`scene script ${url}: HTTP ${res.status}`);
    return { js: await compileSceneScript(await res.text(), lang, url) };
  }
  function normalizeLoaded(entry, module) {
    const svelte = !!module.__svelte;
    let hooks = module.default;
    const mode = entry.mode === "replace" ? "replace" : "hook";
    if (!svelte && typeof hooks === "function") {
      hooks = mode === "replace" ? { create: hooks } : { onStart: hooks };
    }
    if (!svelte && (!hooks || typeof hooks !== "object")) {
      hooks = {
        onStart: module.onStart,
        onEnd: module.onEnd,
        create: module.create,
        update: module.update
      };
    }
    return { entry, mode, module, hooks: svelte ? null : hooks, svelte };
  }
  async function loadSceneScriptModule(entry) {
    const src = await resolveEntrySource(entry);
    const module = src.module || await importModuleFromSource(src.js);
    return normalizeLoaded(entry, module);
  }
  var _loaded = { title: null, adv: null };
  var _initPromise = null;
  function initSceneScripts(opts) {
    if (!_initPromise) {
      _initPromise = (async () => {
        let entries;
        try {
          entries = resolveSceneScriptEntries(opts);
        } catch (e) {
          console.error("[scene-script] entry resolution failed:", e);
          return _loaded;
        }
        for (const t of SCENE_SCRIPT_TARGETS) {
          if (!entries[t]) continue;
          try {
            _loaded[t] = await loadSceneScriptModule(entries[t]);
            console.log(`[scene-script] loaded ${t} script (${_loaded[t].mode} mode)`);
          } catch (e) {
            console.error(`[scene-script] failed to load ${t} script:`, e);
          }
        }
        return _loaded;
      })();
    }
    return _initPromise;
  }
  function hasSceneScript(target) {
    return !!_loaded[target];
  }
  function isSceneScriptReplaced(scene) {
    return !!(scene && scene.__sceneScriptReplaced);
  }
  function registerCleanup(scene, fn) {
    if (!scene.__sceneScriptCleanup) {
      scene.__sceneScriptCleanup = [];
      scene.events.once("shutdown", () => {
        const fns = scene.__sceneScriptCleanup || [];
        scene.__sceneScriptCleanup = null;
        scene.__sceneScriptCtx = null;
        scene.__sceneScriptReplaced = false;
        for (const f of fns) {
          try {
            f();
          } catch (e) {
            console.error("[scene-script] cleanup failed:", e);
          }
        }
      });
    }
    scene.__sceneScriptCleanup.push(fn);
  }
  function createOverlayHost(scene) {
    const canvas = scene.game.canvas;
    const div = document.createElement("div");
    div.className = "scene-script-overlay";
    div.style.cssText = "position:absolute;z-index:1000;overflow:hidden;pointer-events:none;";
    const place = () => {
      const r = canvas.getBoundingClientRect();
      div.style.left = r.left + globalThis.scrollX + "px";
      div.style.top = r.top + globalThis.scrollY + "px";
      div.style.width = r.width + "px";
      div.style.height = r.height + "px";
    };
    place();
    document.body.appendChild(div);
    globalThis.addEventListener("resize", place);
    const interval = setInterval(place, 500);
    registerCleanup(scene, () => {
      globalThis.removeEventListener("resize", place);
      clearInterval(interval);
      div.remove();
    });
    return div;
  }
  function getSceneScriptContext(target, scene, opts) {
    if (scene.__sceneScriptCtx) return scene.__sceneScriptCtx;
    const o = opts || {};
    let advanced = false;
    let overlayHost = null;
    const ctx = {
      scene,
      game: scene.game,
      Phaser: o.Phaser || globalThis.Phaser,
      state: o.state || {},
      target,
      get stageId() {
        return o.state && o.state.stageId != null ? o.state.stageId : 0;
      },
      get gameObjects() {
        return scene.children && scene.children.list ? scene.children.list.slice() : [];
      },
      find(name) {
        if (!name) return null;
        const byName = scene.children && scene.children.getByName ? scene.children.getByName(name) : null;
        if (byName) return byName;
        const v = scene[name];
        return v && typeof v === "object" && typeof v.destroy === "function" ? v : null;
      },
      overlay() {
        if (!overlayHost) overlayHost = createOverlayHost(scene);
        return overlayHost;
      },
      next() {
        if (advanced) return;
        advanced = true;
        if (typeof o.next === "function") o.next();
      },
      onCleanup(fn) {
        registerCleanup(scene, fn);
      }
    };
    registerCleanup(scene, () => {
    });
    scene.__sceneScriptCtx = ctx;
    return ctx;
  }
  async function mountSvelteScript(script, scene, ctx) {
    const svelte = await dynImport(SCENE_SCRIPT_DEFAULTS.svelteCdn);
    const host = ctx.overlay();
    const instance = svelte.mount(script.module.default, {
      target: host,
      props: { ctx }
    });
    registerCleanup(scene, () => {
      try {
        svelte.unmount(instance);
      } catch (_e) {
      }
    });
  }
  function runSceneScriptCreate(target, scene, opts) {
    const s = _loaded[target];
    if (!s || s.mode !== "replace") return false;
    scene.__sceneScriptReplaced = true;
    const ctx = getSceneScriptContext(target, scene, opts);
    try {
      if (s.svelte) {
        mountSvelteScript(s, scene, ctx).catch(
          (e) => console.error("[scene-script] svelte mount failed:", e)
        );
      } else if (s.hooks && typeof s.hooks.create === "function") {
        s.hooks.create(ctx);
      } else if (s.hooks && typeof s.hooks.onStart === "function") {
        s.hooks.onStart(ctx);
      } else {
        console.warn(`[scene-script] ${target} replace script exports no create(); continuing to next scene`);
        ctx.next();
      }
    } catch (e) {
      console.error(`[scene-script] ${target} create failed:`, e);
    }
    return true;
  }
  function runSceneScriptStart(target, scene, opts) {
    const s = _loaded[target];
    if (!s || s.mode === "replace") return;
    const ctx = getSceneScriptContext(target, scene, opts);
    try {
      if (s.svelte) {
        mountSvelteScript(s, scene, ctx).catch(
          (e) => console.error("[scene-script] svelte mount failed:", e)
        );
      } else if (s.hooks && typeof s.hooks.onStart === "function") {
        s.hooks.onStart(ctx);
      }
    } catch (e) {
      console.error(`[scene-script] ${target} onStart failed:`, e);
    }
  }
  function runSceneScriptEnd(target, scene, opts) {
    const s = _loaded[target];
    if (!s || s.svelte || !s.hooks || typeof s.hooks.onEnd !== "function") return false;
    const ctx = getSceneScriptContext(target, scene, opts);
    let result;
    try {
      result = s.hooks.onEnd(ctx);
    } catch (e) {
      console.error(`[scene-script] ${target} onEnd failed:`, e);
      return false;
    }
    if (result === true) return true;
    if (result && typeof result.then === "function") {
      result.then(
        (v) => {
          if (v !== true) ctx.next();
        },
        (e) => {
          console.error(`[scene-script] ${target} onEnd rejected:`, e);
          ctx.next();
        }
      );
      return true;
    }
    return false;
  }
  function runSceneScriptUpdate(target, scene, time, delta) {
    const s = _loaded[target];
    if (!s || s.svelte || !s.hooks || typeof s.hooks.update !== "function") return;
    const ctx = scene.__sceneScriptCtx;
    if (!ctx) return;
    try {
      s.hooks.update(ctx, time, delta);
    } catch (e) {
      console.error(`[scene-script] ${target} update failed:`, e);
      s.hooks.update = null;
    }
  }

  // ../2019-es7/src/constants.js
  var LANG = (() => {
    if (typeof document !== "undefined" && document.documentElement) {
      switch (document.documentElement.lang) {
        case "ja":
          return "ja";
        default:
          return "en";
      }
    }
    return "en";
  })();
  var BASE_PATH = (() => {
    const base = typeof window !== "undefined" && typeof window.baseUrl === "string" ? window.baseUrl : "http://localhost/";
    return base.replace(/^https?\:\/\/[^\/]+/, "").replace(/\/api\/$/, "");
  })();
  var RESOURCE_PATHS = {
    recipe: "assets/game.json",
    game_ui: "assets/game_ui.json",
    game_asset: "assets/game_asset.json",
    voice_titlecall: "assets/sounds/scene_title/voice_titlecall.mp3",
    se_decision: "assets/sounds/ui/se_decision.mp3",
    se_correct: "assets/sounds/ui/se_correct.mp3",
    se_cursor_sub: "assets/sounds/ui/se_cursor_sub.mp3",
    se_cursor: "assets/sounds/ui/se_cursor.mp3",
    se_over: "assets/sounds/ui/se_over.mp3",
    adventure_bgm: "assets/sounds/scene_adventure/adventure_bgm.mp3",
    g_adbenture_voice0: "assets/sounds/scene_adventure/g_adbenture_voice0.mp3",
    voice_thankyou: "assets/sounds/voice_thankyou.mp3",
    se_explosion: "assets/sounds/se_explosion.mp3",
    se_shoot: "assets/sounds/se_shoot.mp3",
    se_shoot_b: "assets/sounds/se_shoot_b.mp3",
    se_sp: "assets/sounds/se_sp.mp3",
    se_sp_explosion: "assets/sounds/se_sp_explosion.mp3",
    se_damage: "assets/sounds/se_damage.mp3",
    se_guard: "assets/sounds/se_guard.mp3",
    se_finish_akebono: "assets/sounds/se_finish_akebono.mp3",
    se_barrier_start: "assets/sounds/se_barrier_start.mp3",
    se_barrier_end: "assets/sounds/se_barrier_end.mp3",
    voice_round0: "assets/sounds/voice_round0.mp3",
    voice_round1: "assets/sounds/voice_round1.mp3",
    voice_round2: "assets/sounds/voice_round2.mp3",
    voice_round3: "assets/sounds/voice_round3.mp3",
    voice_fight: "assets/sounds/voice_fight.mp3",
    voice_ko: "assets/sounds/voice_ko.mp3",
    voice_another_fighter: "assets/sounds/voice_another_fighter.mp3",
    g_stage_voice_0: "assets/sounds/scene_game/g_stage_voice_0.mp3",
    g_stage_voice_1: "assets/sounds/scene_game/g_stage_voice_1.mp3",
    g_stage_voice_2: "assets/sounds/scene_game/g_stage_voice_2.mp3",
    g_stage_voice_3: "assets/sounds/scene_game/g_stage_voice_3.mp3",
    g_stage_voice_4: "assets/sounds/scene_game/g_stage_voice_4.mp3",
    g_damage_voice: "assets/sounds/g_damage_voice.mp3",
    g_powerup_voice: "assets/sounds/g_powerup_voice.mp3",
    g_sp_voice: "assets/sounds/g_sp_voice.mp3",
    boss_bison_bgm: "assets/sounds/boss_bison_bgm.mp3",
    boss_bison_voice_add: "assets/sounds/boss_bison_voice_add.mp3",
    boss_bison_voice_ko: "assets/sounds/boss_bison_voice_ko.mp3",
    boss_bison_voice_faint: "assets/sounds/boss_bison_voice_faint.mp3",
    boss_bison_voice_faint_punch: "assets/sounds/boss_bison_voice_faint_punch.mp3",
    boss_bison_voice_punch: "assets/sounds/boss_bison_voice_punch.mp3",
    boss_barlog_bgm: "assets/sounds/boss_barlog_bgm.mp3",
    boss_barlog_voice_add: "assets/sounds/boss_barlog_voice_add.mp3",
    boss_barlog_voice_ko: "assets/sounds/boss_barlog_voice_ko.mp3",
    boss_barlog_voice_projectile: "assets/sounds/boss_barlog_voice_projectile.mp3",
    boss_barlog_voice_barcelona: "assets/sounds/boss_barlog_voice_barcelona.mp3",
    boss_sagat_bgm: "assets/sounds/boss_sagat_bgm.mp3",
    boss_sagat_voice_add: "assets/sounds/boss_sagat_voice_add.mp3",
    boss_sagat_voice_ko: "assets/sounds/boss_sagat_voice_ko.mp3",
    boss_sagat_voice_projectile0: "assets/sounds/boss_sagat_voice_projectile0.mp3",
    boss_sagat_voice_projectile1: "assets/sounds/boss_sagat_voice_projectile1.mp3",
    boss_sagat_voice_kick: "assets/sounds/boss_sagat_voice_kick.mp3",
    boss_vega_bgm: "assets/sounds/boss_vega_bgm.mp3",
    boss_vega_voice_add: "assets/sounds/boss_vega_voice_add.mp3",
    boss_vega_voice_ko: "assets/sounds/boss_vega_voice_ko.mp3",
    boss_vega_voice_crusher: "assets/sounds/boss_vega_voice_crusher.mp3",
    boss_vega_voice_warp: "assets/sounds/boss_vega_voice_warp.mp3",
    boss_vega_voice_projectile: "assets/sounds/boss_vega_voice_projectile.mp3",
    boss_vega_voice_shoot: "assets/sounds/boss_vega_voice_shoot.mp3",
    boss_goki_bgm: "assets/sounds/boss_goki_bgm.mp3",
    boss_goki_voice_add: "assets/sounds/boss_goki_voice_add.mp3",
    boss_goki_voice_ko: "assets/sounds/boss_goki_voice_ko.mp3",
    boss_goki_voice_projectile0: "assets/sounds/boss_goki_voice_projectile0.mp3",
    boss_goki_voice_projectile1: "assets/sounds/boss_goki_voice_projectile1.mp3",
    boss_goki_voice_ashura: "assets/sounds/boss_goki_voice_ashura.mp3",
    boss_goki_voice_syungokusatu0: "assets/sounds/boss_goki_voice_syungokusatu0.mp3",
    boss_goki_voice_syungokusatu1: "assets/sounds/boss_goki_voice_syungokusatu1.mp3",
    boss_fang_bgm: "assets/sounds/boss_fang_bgm.mp3",
    boss_fang_voice_add: "assets/sounds/boss_fang_voice_add.mp3",
    boss_fang_voice_ko: "assets/sounds/boss_fang_voice_ko.mp3",
    boss_fang_voice_beam0: "assets/sounds/boss_fang_voice_beam0.mp3",
    boss_fang_voice_beam1: "assets/sounds/boss_fang_voice_beam1.mp3",
    boss_fang_voice_projectile: "assets/sounds/boss_fang_voice_projectile.mp3",
    bgm_continue: "assets/sounds/scene_continue/bgm_continue.mp3",
    bgm_gameover: "assets/sounds/scene_continue/bgm_gameover.mp3",
    voice_countdown0: "assets/sounds/scene_continue/voice_countdown0.mp3",
    voice_countdown1: "assets/sounds/scene_continue/voice_countdown1.mp3",
    voice_countdown2: "assets/sounds/scene_continue/voice_countdown2.mp3",
    voice_countdown3: "assets/sounds/scene_continue/voice_countdown3.mp3",
    voice_countdown4: "assets/sounds/scene_continue/voice_countdown4.mp3",
    voice_countdown5: "assets/sounds/scene_continue/voice_countdown5.mp3",
    voice_countdown6: "assets/sounds/scene_continue/voice_countdown6.mp3",
    voice_countdown7: "assets/sounds/scene_continue/voice_countdown7.mp3",
    voice_countdown8: "assets/sounds/scene_continue/voice_countdown8.mp3",
    voice_countdown9: "assets/sounds/scene_continue/voice_countdown9.mp3",
    voice_gameover: "assets/sounds/scene_continue/voice_gameover.mp3",
    g_continue_yes_voice0: "assets/sounds/scene_continue/g_continue_yes_voice0.mp3",
    g_continue_yes_voice1: "assets/sounds/scene_continue/g_continue_yes_voice1.mp3",
    g_continue_yes_voice2: "assets/sounds/scene_continue/g_continue_yes_voice2.mp3",
    g_continue_no_voice0: "assets/sounds/scene_continue/g_continue_no_voice0.mp3",
    g_continue_no_voice1: "assets/sounds/scene_continue/g_continue_no_voice1.mp3",
    voice_congra: "assets/sounds/scene_clear/voice_congra.mp3",
    title_bg: "assets/img/title_bg.jpg",
    stage_loop0: "assets/img/stage/stage_loop3.png",
    stage_loop1: "assets/img/stage/stage_loop3.png",
    stage_loop2: "assets/img/stage/stage_loop3.png",
    stage_loop3: "assets/img/stage/stage_loop3.png",
    stage_loop4: "assets/img/stage/stage_loop4.png",
    stage_end0: "assets/img/stage/stage_end3.png",
    stage_end1: "assets/img/stage/stage_end3.png",
    stage_end2: "assets/img/stage/stage_end3.png",
    stage_end3: "assets/img/stage/stage_end3.png",
    stage_end4: "assets/img/stage/stage_end4.png"
  };
  var GAME_DIMENSIONS = {
    WIDTH: 256,
    HEIGHT: 480,
    CENTER_X: 128,
    CENTER_Y: 240
  };
  var STAGE_DIMENSIONS = {
    WIDTH: typeof window !== "undefined" ? window.innerWidth : GAME_DIMENSIONS.WIDTH,
    HEIGHT: typeof window !== "undefined" ? window.innerHeight : GAME_DIMENSIONS.HEIGHT,
    CENTER_X: typeof window !== "undefined" ? window.innerWidth / 2 : GAME_DIMENSIONS.CENTER_X,
    CENTER_Y: typeof window !== "undefined" ? window.innerHeight / 2 : GAME_DIMENSIONS.CENTER_Y
  };

  // ../2019-es7/src/gameState.js
  function ensureGameState() {
    if (!globalThis.__GAME_STATE__ || typeof globalThis.__GAME_STATE__ !== "object") {
      globalThis.__GAME_STATE__ = {};
    }
    return globalThis.__GAME_STATE__;
  }
  function normalizeScore(value) {
    const MAX_SANE_SCORE = 999999999;
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0 || parsed > MAX_SANE_SCORE) {
      return 0;
    }
    return Math.max(0, Math.floor(parsed));
  }
  function ensureScoreState(state) {
    if (typeof state.score !== "number") {
      state.score = normalizeScore(state.score);
    }
    state.highScore = normalizeScore(state.highScore);
    state.localHighScore = normalizeScore(state.localHighScore);
    state.remoteHighScore = normalizeScore(state.remoteHighScore);
    state.highScore = Math.max(state.highScore, state.localHighScore, state.remoteHighScore);
    if (typeof state.scoreSyncStatus !== "string" || !state.scoreSyncStatus) {
      state.scoreSyncStatus = "idle";
    }
    if (typeof state.scoreSyncMessage !== "string") {
      state.scoreSyncMessage = "";
    }
  }
  function readSearchParam(name) {
    if (typeof window === "undefined" || !window.location || typeof window.location.search !== "string") {
      return null;
    }
    try {
      return new URLSearchParams(window.location.search).get(name);
    } catch (error) {
      return null;
    }
  }
  function readBooleanSearchParam(name, defaultValue) {
    const value = readSearchParam(name);
    if (value == null || value === "") {
      return defaultValue;
    }
    return !/^(0|false|off|no)$/i.test(String(value));
  }
  function ensureRuntimeState(state) {
    if (typeof state.vibrateFlg !== "boolean") {
      state.vibrateFlg = true;
    }
    if (typeof state.canvasPosition !== "string") {
      try {
        var saved = localStorage.getItem("canvasPosition");
        state.canvasPosition = saved === "center" ? "center" : "bottom";
      } catch (e) {
        state.canvasPosition = "bottom";
      }
    }
  }
  var gameState = ensureGameState();
  ensureScoreState(gameState);
  ensureRuntimeState(gameState);
  function syncRuntimeFlagsFromLocation(state = gameState) {
    if (!state || typeof state !== "object") {
      return;
    }
    state.vibrateFlg = readBooleanSearchParam("vibrate", typeof state.vibrateFlg === "boolean" ? state.vibrateFlg : true);
    var canvasPosParam = readSearchParam("canvasPosition");
    if (canvasPosParam === "bottom" || canvasPosParam === "center") {
      state.canvasPosition = canvasPosParam;
      try {
        localStorage.setItem("canvasPosition", canvasPosParam);
      } catch (e) {
      }
    }
    var secondLoopParam = readSearchParam("secondLoop");
    if (secondLoopParam != null && secondLoopParam !== "") {
      state.secondLoop = secondLoopParam === "1";
    } else if (typeof state.secondLoop !== "boolean") {
      state.secondLoop = false;
    }
  }
  syncRuntimeFlagsFromLocation(gameState);
  function setHighScore(value, source = "merged") {
    const normalized = normalizeScore(value);
    if (source === "local") {
      gameState.localHighScore = normalized;
    } else if (source === "remote") {
      gameState.remoteHighScore = normalized;
    } else {
      gameState.localHighScore = Math.max(normalizeScore(gameState.localHighScore), normalized);
      gameState.remoteHighScore = Math.max(normalizeScore(gameState.remoteHighScore), normalized);
    }
    gameState.highScore = Math.max(
      normalized,
      normalizeScore(gameState.localHighScore),
      normalizeScore(gameState.remoteHighScore)
    );
    return gameState.highScore;
  }
  function setScoreSyncStatus(status, message = "") {
    gameState.scoreSyncStatus = typeof status === "string" && status ? status : "idle";
    gameState.scoreSyncMessage = typeof message === "string" ? message : "";
  }
  function saveHighScore(cookieKey = "afc2019_highScore") {
    if (typeof document === "undefined") {
      return normalizeScore(gameState.highScore);
    }
    const highScore = setHighScore(
      Math.max(
        normalizeScore(gameState.highScore),
        normalizeScore(gameState.localHighScore),
        normalizeScore(gameState.remoteHighScore)
      ),
      "local"
    );
    const oneYearSeconds = 60 * 60 * 24 * 365;
    document.cookie = encodeURIComponent(cookieKey) + "=" + encodeURIComponent(String(highScore)) + ";path=/;max-age=" + String(oneYearSeconds);
    return highScore;
  }

  // ../2019-es7/src/globals.js
  function ensureResources() {
    if (!globalThis.__GAME_RESOURCES__ || typeof globalThis.__GAME_RESOURCES__ !== "object") {
      globalThis.__GAME_RESOURCES__ = {};
    }
    return globalThis.__GAME_RESOURCES__;
  }
  function resolveInteractionManager() {
    const game = globalThis.__PHASER_GAME__;
    if (!game || !game.renderer || !game.renderer.plugins) {
      return null;
    }
    return game.renderer.plugins.interaction || null;
  }
  function resolvePixiApp() {
    const game = globalThis.__PHASER_GAME__;
    return game || null;
  }
  function resolveGameManager() {
    return globalThis.__GAME_MANAGER__ || null;
  }
  var globals = {};
  Object.defineProperty(globals, "resources", {
    configurable: false,
    enumerable: true,
    get() {
      return ensureResources();
    },
    set(value) {
      globalThis.__GAME_RESOURCES__ = value && typeof value === "object" ? value : {};
    }
  });
  Object.defineProperty(globals, "interactionManager", {
    configurable: false,
    enumerable: true,
    get() {
      return resolveInteractionManager();
    }
  });
  Object.defineProperty(globals, "pixiApp", {
    configurable: false,
    enumerable: true,
    get() {
      return resolvePixiApp();
    }
  });
  Object.defineProperty(globals, "gameManager", {
    configurable: false,
    enumerable: true,
    get() {
      return resolveGameManager();
    }
  });

  // ../2019-es7/src/phaser/BootScene.js
  var EDITOR_PLAY_RECIPE_KEY = "__editorPhaserRecipe__";
  var EDITOR_PLAY_STAGE_KEY = "__editorPhaserStageId__";
  var FIREBASE_LEVELS_PATH = "levels";
  function readLevelParam() {
    if (typeof window === "undefined") {
      return null;
    }
    try {
      var name = new URLSearchParams(window.location.search).get("level");
      return name ? name.replace(/[.#$/\[\]]/g, "_").trim() : null;
    } catch (e) {
      return null;
    }
  }
  function readStageParam() {
    if (typeof window === "undefined") {
      return null;
    }
    try {
      return new URLSearchParams(window.location.search).get("stage");
    } catch (e) {
      return null;
    }
  }
  function readBossRushParam() {
    if (typeof window === "undefined") {
      return false;
    }
    try {
      return new URLSearchParams(window.location.search).get("bossRush") === "1";
    } catch (e) {
      return false;
    }
  }
  function fetchFirebaseLevel(levelName) {
    if (typeof window !== "undefined" && window.__OFFLINE_LEVEL__) {
      return Promise.resolve(window.__OFFLINE_LEVEL__);
    }
    if (typeof firebase === "undefined" || !firebase.database) {
      return Promise.reject(new Error("Firebase not available"));
    }
    var db;
    if (firebase.apps && firebase.apps.length > 0) {
      db = firebase.database();
    } else if (window.firebaseConfig || window.__FIREBASE_CONFIG__) {
      firebase.initializeApp(window.firebaseConfig || window.__FIREBASE_CONFIG__);
      db = firebase.database();
    } else {
      return Promise.reject(new Error("No Firebase config"));
    }
    return db.ref(FIREBASE_LEVELS_PATH + "/" + levelName).once("value").then(function(snapshot) {
      var data = snapshot.val();
      if (!data || !data.enemylist) {
        return Promise.reject(new Error('Level "' + levelName + '" not found'));
      }
      return data;
    });
  }
  function parseStageId2(value) {
    var stageId = Number(value);
    if (!Number.isFinite(stageId)) {
      return 0;
    }
    return Math.max(0, Math.min(4, Math.floor(stageId)));
  }
  function readEditorPlayRequest() {
    if (typeof window === "undefined") {
      return null;
    }
    var params;
    try {
      params = new URLSearchParams(window.location.search);
    } catch (error) {
      return null;
    }
    if (params.get("editorPlay") !== "1") {
      return null;
    }
    var recipeText = null;
    try {
      recipeText = localStorage.getItem(EDITOR_PLAY_RECIPE_KEY);
    } catch (error) {
    }
    if (!recipeText) {
      return null;
    }
    try {
      return {
        recipe: JSON.parse(recipeText),
        stageId: parseStageId2(
          params.get("stage") || localStorage.getItem(EDITOR_PLAY_STAGE_KEY) || 0
        )
      };
    } catch (error) {
      return null;
    }
  }
  var CUSTOM_AUDIO_DB_NAME = "editorCustomAudio";
  var CUSTOM_AUDIO_STORE = "customAudio";
  function openCustomAudioDB2() {
    if (typeof indexedDB === "undefined") {
      return Promise.reject(new Error("IndexedDB not available"));
    }
    return new Promise(function(resolve, reject) {
      var req = indexedDB.open(CUSTOM_AUDIO_DB_NAME, 1);
      req.onupgradeneeded = function(e) {
        var db = e.target.result;
        if (!db.objectStoreNames.contains(CUSTOM_AUDIO_STORE)) {
          db.createObjectStore(CUSTOM_AUDIO_STORE);
        }
      };
      req.onsuccess = function(e) {
        resolve(e.target.result);
      };
      req.onerror = function(e) {
        reject(e.target.error);
      };
    });
  }
  function getAllCustomAudioEntries2() {
    return openCustomAudioDB2().then(function(db) {
      return new Promise(function(resolve, reject) {
        var tx = db.transaction(CUSTOM_AUDIO_STORE, "readonly");
        var store = tx.objectStore(CUSTOM_AUDIO_STORE);
        var entries = {};
        var cursorReq = store.openCursor();
        cursorReq.onsuccess = function(e) {
          var cursor = e.target.result;
          if (cursor) {
            entries[cursor.key] = cursor.value;
            cursor.continue();
          } else {
            resolve(entries);
          }
        };
        cursorReq.onerror = function(e) {
          reject(e.target.error);
        };
      });
    });
  }
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
    gameState.stageId = parseStageId2(stageId);
    gameState.continueCnt = 0;
    gameState.akebonoCnt = 0;
    gameState.shortFlg = false;
  }
  var BootScene = class extends Phaser.Scene {
    constructor() {
      super({ key: "BootScene" });
    }
    preload() {
      var cx = GAME_DIMENSIONS.CENTER_X;
      var cy = GAME_DIMENSIONS.CENTER_Y;
      this.loadingBg = null;
      this.loadingG = null;
      this.loadingFrameIndex = 0;
      var self = this;
      function ensureLoadingPreview() {
        if (self.loadingBg || !self.textures.exists("loading_bg") || !self.textures.exists("loading0")) {
          return;
        }
        self.loadingBg = self.add.image(cx, cy, "loading_bg");
        self.loadingBg.setAlpha(0.09);
        self.loadingG = self.add.image(cx, cy, "loading0");
        self.time.addEvent({
          delay: 120,
          loop: true,
          callback: function() {
            if (!self.loadingG) {
              return;
            }
            self.loadingFrameIndex = (self.loadingFrameIndex + 1) % 3;
            self.loadingG.setTexture("loading" + String(self.loadingFrameIndex));
            if (self.loadingBg) {
              self.loadingBg.flipX = !self.loadingBg.flipX;
            }
          }
        });
      }
      var failedAudioFiles = [];
      this.load.on("loaderror", function(file) {
        if (file.key === "custom-bgm-manifest") {
          return;
        }
        console.warn("Load error:", file.key, file.src);
        if (file.type === "audio") {
          failedAudioFiles.push({ key: file.key, src: file.src || file.url });
        }
        setTimeout(function() {
          if (self.children && self.children.list) {
            var children = self.children.list.slice();
            for (var e = 0; e < children.length; e++) {
              var child = children[e];
              if (child && child.type === "Text" && child.text && child.text.indexOf("ERR:") !== -1) {
                child.destroy();
              }
            }
          }
        }, 6700);
      });
      this.load.on("filecomplete-image-loading_bg", ensureLoadingPreview);
      this.load.on("filecomplete-image-loading0", ensureLoadingPreview);
      this.load.on("loaderror", function(file) {
        if (file.key === "custom-bgm-manifest") {
          return;
        }
        console.error("LOAD ERROR:", file.key, file.type, file.src || file.url);
        var el = document.getElementById("loadError");
        if (!el) {
          el = document.createElement("div");
          el.id = "loadError";
          el.style.cssText = "position:fixed;top:0;left:0;right:0;background:red;color:white;font:12px monospace;padding:4px;z-index:9999;max-height:30vh;overflow:auto;";
          document.body.appendChild(el);
        }
        el.textContent += "ERR: " + file.key + " (" + file.type + ") " + (file.src || file.url || "") + "\n";
      });
      this.load.on("complete", function() {
        if (self.loadingG) {
          self.loadingG.destroy();
          self.loadingG = null;
        }
        if (self.loadingBg) {
          self.loadingBg.destroy();
          self.loadingBg = null;
        }
        if (failedAudioFiles.length > 0) {
          console.log("Retrying " + failedAudioFiles.length + " failed audio file(s)…");
          var actx = window.__phaserAudioContext;
          if (actx && (actx.state === "suspended" || actx.state === "interrupted")) {
            actx.resume().catch(function() {
            });
          }
          var retryFiles = failedAudioFiles.splice(0);
          for (var r = 0; r < retryFiles.length; r++) {
            self.load.audio(retryFiles[r].key, retryFiles[r].src);
          }
          self.load.start();
        }
        var loadErrorEl = document.getElementById("loadError");
        if (loadErrorEl) {
          setTimeout(function() {
            loadErrorEl.style.display = "none";
          }, 6700);
        }
        var atlasKeys = ["title_ui", "game_ui", "game_asset"];
        for (var a = 0; a < atlasKeys.length; a++) {
          var k = atlasKeys[a];
          var tex = self.textures.exists(k) ? self.textures.get(k) : null;
          if (tex) {
            var src = tex.source && tex.source[0];
            console.log("ATLAS " + k + ": frames=" + tex.getFrameNames().length + " img=" + (src && src.image ? src.image.width + "x" + src.image.height : "none") + " src=" + (src && src.image ? src.image.src : "none"));
          } else {
            console.warn("ATLAS " + k + ": NOT FOUND in textures");
          }
        }
      });
      var ea = window.__editorAtlases || {};
      this.load.atlas(
        "title_ui",
        ea.title_ui ? "assets/img/_title_ui.png" : "assets/img/title_ui.png",
        ea.title_ui ? "assets/_title_ui.json" : "assets/title_ui.json"
      );
      this.load.atlas(
        "game_ui",
        ea.game_ui ? "assets/img/_game_ui.png" : "assets/img/game_ui.png",
        ea.game_ui ? "assets/_game_ui.json" : "assets/game_ui.json"
      );
      this.load.atlas(
        "game_asset",
        ea.game_asset ? "assets/img/_game_asset.png" : "assets/img/game_asset.png",
        ea.game_asset ? "assets/_game_asset.json" : "assets/game_asset.json"
      );
      this.load.json("recipe", "assets/game.json");
      this.load.json("custom-bgm-manifest", "assets/custom-bgm/manifest.json");
      this.load.image("title_bg", "assets/img/title_bg.jpg");
      for (var i = 0; i < 5; i++) {
        this.load.image("stage_loop" + i, "assets/img/stage/stage_loop" + i + ".png");
        this.load.image("stage_end" + i, "assets/img/stage/stage_end" + i + ".png");
      }
      var customLoopPaths = [
        "assets/img/stage/stage_loop3.png",
        "assets/img/stage/stage_loop3.png",
        "assets/img/stage/stage_loop3.png",
        "assets/img/stage/stage_loop3.png",
        "assets/img/stage/stage_loop4.png"
      ];
      var customEndPaths = [
        "assets/img/stage/stage_end3.png",
        "assets/img/stage/stage_end3.png",
        "assets/img/stage/stage_end3.png",
        "assets/img/stage/stage_end3.png",
        "assets/img/stage/stage_end4.png"
      ];
      for (var i = 0; i < 5; i++) {
        this.load.image("stage_loop_c" + i, customLoopPaths[i]);
        this.load.image("stage_end_c" + i, customEndPaths[i]);
      }
      this.load.image("loading_bg", "assets/img/loading/loading_bg.png");
      this.load.image("loading0", "assets/img/loading/loading0.gif");
      this.load.image("loading1", "assets/img/loading/loading1.gif");
      this.load.image("loading2", "assets/img/loading/loading2.gif");
      if (!gameState.lowModeFlg) {
        var soundKeys = Object.keys(RESOURCE_PATHS);
        for (var s = 0; s < soundKeys.length; s++) {
          var key = soundKeys[s];
          var path = RESOURCE_PATHS[key];
          if (path.indexOf(".mp3") > 0) {
            this.load.audio(key, path);
          }
        }
      }
    }
    create() {
      var self = this;
      var editorPlay = readEditorPlayRequest();
      if (editorPlay) {
        this._finishBoot();
        return;
      }
      var explicitLevel = readLevelParam();
      var levelName = explicitLevel || "foo";
      this._loadFirebaseLevel(levelName, !explicitLevel);
    }
    _loadFirebaseLevel(levelName, showTitle) {
      var self = this;
      var game = this.game;
      var stageParam = readStageParam();
      fetchFirebaseLevel(levelName).then(function(data) {
        var baseRecipe = self.cache.json.get("recipe") || {};
        var localEnemyData = baseRecipe.enemyData ? JSON.parse(JSON.stringify(baseRecipe.enemyData)) : {};
        var stageKey = data.stageKey || "stage0";
        baseRecipe[stageKey] = { enemylist: data.enemylist };
        function finishLevelLoad() {
          if (data.enemyData) {
            var merged = JSON.parse(JSON.stringify(data.enemyData));
            try {
              var atlas = self.textures.get("game_asset");
              var atlasFrames = atlas && atlas.frames ? atlas.frames : null;
              if (atlasFrames) {
                for (var ek in merged) {
                  var fbTextures = merged[ek] && merged[ek].texture ? merged[ek].texture : [];
                  if (fbTextures.length > 0 && !atlasFrames[fbTextures[0]]) {
                    var localEnemy = localEnemyData[ek];
                    if (localEnemy && localEnemy.texture && localEnemy.texture.length > 0) {
                      merged[ek].texture = localEnemy.texture;
                    }
                    var projKey = merged[ek].projectileData ? "projectileData" : merged[ek].bulletData ? "bulletData" : null;
                    var localProjKey = localEnemy ? localEnemy.projectileData ? "projectileData" : localEnemy.bulletData ? "bulletData" : null : null;
                    if (projKey && localProjKey && merged[ek][projKey] && merged[ek][projKey].texture) {
                      var fbProjTex = merged[ek][projKey].texture;
                      if (fbProjTex.length > 0 && !atlasFrames[fbProjTex[0]] && localEnemy[localProjKey] && localEnemy[localProjKey].texture) {
                        merged[ek][projKey].texture = localEnemy[localProjKey].texture;
                      }
                    }
                  }
                }
              }
            } catch (texErr) {
              console.warn("Texture resolution failed, using Firebase enemy data as-is:", texErr);
            }
            baseRecipe.enemyData = merged;
          }
          if (data.bossData) {
            var mergedBoss = JSON.parse(JSON.stringify(data.bossData));
            var localBossData = baseRecipe.bossData ? JSON.parse(JSON.stringify(baseRecipe.bossData)) : {};
            try {
              var bossAtlas = self.textures.get("game_asset");
              var bossAtlasFrames = bossAtlas && bossAtlas.frames ? bossAtlas.frames : null;
              if (bossAtlasFrames) {
                for (var bk in mergedBoss) {
                  var fb = mergedBoss[bk];
                  var lb = localBossData[bk];
                  if (fb && fb.anim) {
                    for (var ak in fb.anim) {
                      if (ak.startsWith("_")) continue;
                      var fbAnim = fb.anim[ak];
                      if (Array.isArray(fbAnim) && fbAnim.length > 0 && !bossAtlasFrames[fbAnim[0]]) {
                        if (lb && lb.anim && lb.anim[ak]) {
                          fb.anim[ak] = lb.anim[ak];
                        }
                      }
                    }
                  }
                  if (fb && fb.bulletData && fb.bulletData.texture) {
                    var fbBulletTex = fb.bulletData.texture;
                    if (fbBulletTex.length > 0 && !bossAtlasFrames[fbBulletTex[0]]) {
                      if (lb && lb.bulletData && lb.bulletData.texture) {
                        fb.bulletData.texture = lb.bulletData.texture;
                      }
                    }
                  }
                }
              }
            } catch (bossTexErr) {
              console.warn("Boss texture resolution failed, using Firebase boss data as-is:", bossTexErr);
            }
            baseRecipe.bossData = mergedBoss;
          }
          if (data.storyData) {
            baseRecipe.storyData = data.storyData;
          }
          if (data.playerData && typeof data.playerData === "object") {
            var mergedPlayer = Object.assign(
              baseRecipe.playerData ? JSON.parse(JSON.stringify(baseRecipe.playerData)) : {},
              JSON.parse(JSON.stringify(data.playerData))
            );
            try {
              var playerAtlas = self.textures.get("game_asset");
              var playerAtlasFrames = playerAtlas && playerAtlas.frames ? playerAtlas.frames : null;
              if (playerAtlasFrames) {
                var shootKeys = ["shootNormal", "shootBig", "shoot3way"];
                for (var sk = 0; sk < shootKeys.length; sk++) {
                  var shootEntry = mergedPlayer[shootKeys[sk]];
                  var localShoot = baseRecipe.playerData && baseRecipe.playerData[shootKeys[sk]];
                  if (shootEntry && shootEntry.texture && shootEntry.texture.length > 0 && !playerAtlasFrames[shootEntry.texture[0]]) {
                    if (localShoot && localShoot.texture && localShoot.texture.length > 0) {
                      shootEntry.texture = localShoot.texture;
                    }
                  }
                }
              }
            } catch (playerTexErr) {
              console.warn("Player texture resolution failed, using Firebase playerData as-is:", playerTexErr);
            }
            baseRecipe.playerData = mergedPlayer;
          }
          if (data.titleBgDataURL) {
            var titleImg = new Image();
            titleImg.onload = function() {
              try {
                self.textures.remove("title_bg");
                self.textures.addImage("title_bg", titleImg);
              } catch (e) {
                console.warn("Failed to load custom title_bg:", e);
              }
            };
            titleImg.src = data.titleBgDataURL;
          }
          if (data.logoDataURL) {
            var logoImg = new Image();
            logoImg.onload = function() {
              try {
                self.textures.addImage("custom_logo", logoImg);
              } catch (e) {
                console.warn("Failed to load custom logo:", e);
              }
            };
            logoImg.src = data.logoDataURL;
          }
          if (data.subTitleDataURL) {
            var subTitleImg = new Image();
            subTitleImg.onload = function() {
              try {
                self.textures.addImage("custom_subTitle", subTitleImg);
              } catch (e) {
                console.warn("Failed to load custom subTitle:", e);
              }
            };
            subTitleImg.src = data.subTitleDataURL;
          }
          if (data.titleStartTextDataURL) {
            var startTextImg = new Image();
            startTextImg.onload = function() {
              try {
                self.textures.addImage("custom_titleStartText", startTextImg);
              } catch (e) {
                console.warn("Failed to load custom titleStartText:", e);
              }
            };
            startTextImg.src = data.titleStartTextDataURL;
          }
          gameState._phaserRecipe = baseRecipe;
          gameState.hasCustomEnemies = !!data.enemyData;
          var stageId = stageParam != null ? parseStageId2(stageParam) : parseStageId2(stageKey.replace("stage", ""));
          primeGameStateForStage(baseRecipe, stageId);
          if (readBossRushParam()) {
            gameState.shortFlg = true;
          }
          if (data.customAudioURLs && typeof data.customAudioURLs === "object") {
            gameState.bgmSourceURLs = {};
            var urlKeys = Object.keys(data.customAudioURLs);
            var baseUrl = document.getElementById("baseUrl") ? document.getElementById("baseUrl").textContent.trim() : "./";
            var bgmManifest = self.cache.json.exists("custom-bgm-manifest") ? self.cache.json.get("custom-bgm-manifest") || {} : {};
            for (var ui = 0; ui < urlKeys.length; ui++) {
              var uKey = urlKeys[ui];
              var uUrl = data.customAudioURLs[uKey];
              if (uUrl && typeof uUrl === "string") {
                var localFilename = bgmManifest[uKey] || uKey + ".mp3";
                var localPath = baseUrl + "assets/custom-bgm/" + localFilename;
                gameState.bgmSourceURLs[uKey] = uUrl;
                if (self.cache.audio.exists(uKey)) {
                  self.cache.audio.remove(uKey);
                }
                self.load.audio(uKey, [localPath, uUrl]);
              }
            }
          }
          var nextScene = showTitle ? "PhaserTitleScene" : "PhaserGameScene";
          self._loadCustomAudio(function() {
            if (gameState.bgmSourceURLs && Object.keys(gameState.bgmSourceURLs).length > 0) {
              self.load.once("complete", function() {
                setTimeout(function() {
                  game.scene.stop("BootScene");
                  game.scene.start(nextScene);
                }, 50);
              });
              self.load.start();
            } else {
              setTimeout(function() {
                game.scene.stop("BootScene");
                game.scene.start(nextScene);
              }, 50);
            }
          });
        }
        if (data.atlasImageDataURL && data.atlasFrames) {
          var fbImg = new Image();
          fbImg.onload = function() {
            try {
              var localAtlas = self.textures.get("game_asset");
              var localSource = localAtlas && localAtlas.source && localAtlas.source[0] ? localAtlas.source[0].image : null;
              var localFrames = localAtlas ? localAtlas.frames : {};
              if (!localSource) {
                finishLevelLoad();
                return;
              }
              var mergedCanvas = document.createElement("canvas");
              var localW = localSource.width, localH = localSource.height;
              var fbW = fbImg.width, fbH = fbImg.height;
              mergedCanvas.width = Math.max(localW, fbW);
              mergedCanvas.height = localH + fbH;
              var mctx = mergedCanvas.getContext("2d");
              mctx.drawImage(localSource, 0, 0);
              mctx.drawImage(fbImg, 0, localH);
              var mergedFrameMap = {};
              for (var lk in localFrames) {
                if (lk === "__BASE") continue;
                var lf = localFrames[lk];
                if (lf && lf.cutX !== void 0) {
                  mergedFrameMap[lk] = { frame: { x: lf.cutX, y: lf.cutY, w: lf.cutWidth, h: lf.cutHeight } };
                }
              }
              for (var fname in data.atlasFrames) {
                var decodedName = fname.replace(/\u2024/g, ".");
                var fd = data.atlasFrames[fname];
                if (fd && fd.frame) {
                  var frameData = {
                    frame: { x: fd.frame.x, y: fd.frame.y + localH, w: fd.frame.w, h: fd.frame.h }
                  };
                  mergedFrameMap[decodedName] = frameData;
                  var altName = null;
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
              self.textures.remove("game_asset");
              self.textures.addAtlas("game_asset", mergedCanvas, { frames: mergedFrameMap });
            } catch (atlasErr) {
              console.warn("Failed to merge Firebase atlas:", atlasErr);
            }
            finishLevelLoad();
          };
          fbImg.onerror = function() {
            console.warn("Firebase atlas image failed to load, using local");
            finishLevelLoad();
          };
          fbImg.src = data.atlasImageDataURL;
        } else {
          finishLevelLoad();
        }
      }).catch(function(err) {
        console.warn("Firebase level load failed for '" + levelName + "':", err);
        self._finishBoot();
      });
    }
    _finishBoot() {
      var editorPlay = readEditorPlayRequest();
      var recipe = editorPlay && editorPlay.recipe ? editorPlay.recipe : this.cache.json.get("recipe");
      if (recipe) {
        gameState._phaserRecipe = recipe;
      }
      var baseRecipe = this.cache.json.get("recipe");
      if (recipe && baseRecipe && recipe.enemyData && baseRecipe.enemyData) {
        try {
          gameState.hasCustomEnemies = JSON.stringify(recipe.enemyData) !== JSON.stringify(baseRecipe.enemyData);
        } catch (e) {
          gameState.hasCustomEnemies = false;
        }
      } else {
        gameState.hasCustomEnemies = false;
      }
      var stageParam = readStageParam();
      var bossRush = readBossRushParam();
      var forceBoss = null;
      try {
        forceBoss = new URLSearchParams(window.location.search).get("boss");
      } catch (e) {
      }
      if (forceBoss === "goki") {
        gameState.forceBossName = "goki";
        if (stageParam == null) stageParam = 3;
        bossRush = true;
      }
      var nextSceneKey = "PhaserTitleScene";
      if (editorPlay && recipe) {
        primeGameStateForStage(recipe, editorPlay.stageId);
        if (bossRush) {
          gameState.shortFlg = true;
        }
        nextSceneKey = "PhaserGameScene";
      } else if (stageParam != null || bossRush) {
        primeGameStateForStage(recipe, stageParam != null ? stageParam : 0);
        if (bossRush) {
          gameState.shortFlg = true;
        }
        nextSceneKey = "PhaserGameScene";
      }
      var debugScene = null;
      try {
        debugScene = new URLSearchParams(window.location.search).get("scene");
      } catch (e) {
      }
      if (debugScene) {
        if (recipe) {
          gameState.score = 12345;
          gameState.highScore = 1e4;
          gameState.maxCombo = 42;
          gameState.continueCnt = 1;
        }
        nextSceneKey = debugScene;
      }
      var self = this;
      this._loadCustomAudio(function() {
        var game = self.game;
        setTimeout(function() {
          game.scene.stop("BootScene");
          game.scene.start(nextSceneKey);
        }, 50);
      });
    }
    _loadCustomAudio(callback) {
      if (gameState.lowModeFlg) {
        callback();
        return;
      }
      var self = this;
      self._collectCustomAudioEntries().then(function(entries) {
        var keys = Object.keys(entries);
        if (keys.length === 0) {
          callback();
          return;
        }
        console.log("Loading " + keys.length + " custom audio override(s)…");
        var blobURLs = [];
        for (var i = 0; i < keys.length; i++) {
          var key = keys[i];
          var data = entries[key];
          var blob = data instanceof Blob ? data : new Blob([data], { type: "audio/mpeg" });
          var url = URL.createObjectURL(blob);
          blobURLs.push(url);
          if (self.cache.audio.exists(key)) {
            self.cache.audio.remove(key);
          }
          self.load.audio(key, url);
        }
        self.load.once("complete", function() {
          for (var j = 0; j < blobURLs.length; j++) {
            URL.revokeObjectURL(blobURLs[j]);
          }
          callback();
        });
        self.load.start();
      }).catch(function(err) {
        console.warn("Custom audio load failed:", err);
        callback();
      });
    }
    _collectCustomAudioEntries() {
      var entries = {};
      var idbPromise = getAllCustomAudioEntries2().then(function(idbEntries) {
        var keys = Object.keys(idbEntries);
        for (var i = 0; i < keys.length; i++) {
          entries[keys[i]] = idbEntries[keys[i]];
        }
      }).catch(function() {
      });
      var electronPromise;
      if (typeof window !== "undefined" && window.electronAudio && typeof window.electronAudio.loadCustomAudio === "function") {
        electronPromise = window.electronAudio.loadCustomAudio().then(function(diskEntries) {
          var keys = Object.keys(diskEntries);
          for (var i = 0; i < keys.length; i++) {
            entries[keys[i]] = diskEntries[keys[i]];
          }
        }).catch(function(err) {
          console.warn("Electron custom audio load failed:", err);
        });
      } else {
        electronPromise = Promise.resolve();
      }
      return Promise.all([idbPromise, electronPromise]).then(function() {
        return entries;
      });
    }
  };

  // ../2019-es7/src/highScoreUi.js
  var SYNC_COPY = {
    idle: "WORLD BEST STANDBY",
    loading: "SYNCING WORLD BEST",
    ready: "FIREBASE ONLINE",
    saving: "UPDATING WORLD BEST",
    disabled: "LOCAL CACHE ONLY",
    error: "FIREBASE OFFLINE"
  };
  var SYNC_TINT = {
    idle: 13421772,
    loading: 16175973,
    ready: 10216319,
    saving: 16175973,
    disabled: 13421772,
    error: 16747136
  };
  function getDisplayedHighScore() {
    return normalizeScore(gameState.highScore);
  }
  function getWorldBestLabel() {
    return "WORLD BEST";
  }
  function getHighScoreSyncText() {
    const status = typeof gameState.scoreSyncStatus === "string" ? gameState.scoreSyncStatus : "idle";
    return SYNC_COPY[status] || SYNC_COPY.idle;
  }
  function getHighScoreSyncTint() {
    const status = typeof gameState.scoreSyncStatus === "string" ? gameState.scoreSyncStatus : "idle";
    return SYNC_TINT[status] || SYNC_TINT.idle;
  }

  // ../2019-es7/src/phaser/StaffRollPanel.js
  function openExternalUrl(url) {
    if (!url) {
      return;
    }
    try {
      window.open(url, "_blank");
    } catch (e) {
    }
  }
  var StaffRollPanel = class extends Phaser.GameObjects.Container {
    constructor(scene) {
      super(scene, 0, 0);
      this.scene = scene;
      this.GW = GAME_DIMENSIONS.WIDTH;
      this.GH = GAME_DIMENSIONS.HEIGHT;
      this.GCX = GAME_DIMENSIONS.CENTER_X;
      this.bg = scene.add.rectangle(this.GCX, this.GH / 2, this.GW, this.GH, 0, 0.9);
      this.add(this.bg);
      this.panelBg = scene.add.graphics();
      this.panelBg.fillStyle(4605510, 0.8);
      this.panelBg.fillRoundedRect(12, 72, this.GW - 24, this.GH - 120, 8);
      this.add(this.panelBg);
      this.panelBg.setScale(1, 0);
      this.wakingG = scene.add.sprite(this.GCX, 55, "game_ui", "staffrollG0.gif");
      this.wakingG.setOrigin(0.5);
      this.add(this.wakingG);
      if (!scene.anims.exists("staffroll_waking")) {
        scene.anims.create({
          key: "staffroll_waking",
          frames: scene.anims.generateFrameNames("game_ui", {
            prefix: "staffrollG",
            start: 0,
            end: 7,
            suffix: ".gif"
          }),
          frameRate: 8,
          repeat: -1
        });
      }
      this.wakingG.play("staffroll_waking");
      this.namePanel = scene.add.sprite(15, 90, "game_ui", "staffrollName.gif");
      this.namePanel.setOrigin(0, 0);
      this.add(this.namePanel);
      this.closeBtn = scene.add.sprite(this.GW - 12, 102, "game_ui", "staffrollCloseBtn.gif");
      this.closeBtn.setOrigin(1, 0.5);
      this.closeBtn.setInteractive({ useHandCursor: true });
      this.closeBtn.on("pointerup", this.close, this);
      this.add(this.closeBtn);
      this.addLinkButton("staffrollTwitterBtn.gif", 165, 118, "https://twitter.com/takaNakayama");
      this.addLinkButton("staffrollTwitterBtn.gif", 131, 276, "https://twitter.com/bengasu");
      this.addLinkButton("staffrollTwitterBtn.gif", 178, 304, "https://twitter.com/rereibara");
      this.addLinkButton("staffrollLinkBtn.gif", 153, 329, "https://magazine.jp.square-enix.com/biggangan/introduction/highscoregirl/");
      this.addLinkButton("staffrollLinkBtn.gif", 161, 355, "http://hi-score-girl.com/");
      var thanksLabelStyle = { fontSize: "8px", fontFamily: "Orbitron, Arial", fill: "#ffff00", align: "center", stroke: "#000000", strokeThickness: 2, resolution: 4 };
      var thanksNameStyle = { fontSize: "7px", fontFamily: "Orbitron, Arial", fill: "#ffffff", align: "center", stroke: "#000000", strokeThickness: 2, resolution: 4 };
      this.thanksLabel = scene.add.text(this.GCX, 393, "SPECIAL THANKS", thanksLabelStyle);
      this.thanksLabel.setOrigin(0.5, 0);
      this.add(this.thanksLabel);
      this.thanksName = scene.add.text(this.GCX, 405, "SEAMUS MCNAMARA", thanksNameStyle);
      this.thanksName.setOrigin(0.5, 0);
      this.add(this.thanksName);
      this.setSize(this.GW, this.GH);
      this.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.GW, this.GH), Phaser.Geom.Rectangle.Contains);
      this.on("pointerup", function() {
      });
      scene.add.existing(this);
      this.showWithAnimation();
    }
    addLinkButton(frameName, x, y, url) {
      var button = this.scene.add.sprite(x, y, "game_ui", frameName);
      button.setOrigin(0, 0);
      button.setInteractive({ useHandCursor: true });
      button.on("pointerup", function() {
        openExternalUrl(url);
      });
      this.add(button);
    }
    showWithAnimation() {
      this.bg.setAlpha(0);
      this.wakingG.setY(-100);
      this.namePanel.setY(90 + this.namePanel.height);
      this.closeBtn.setAlpha(0);
      this.closeBtn.setRotation(Math.PI * 2);
      this.closeBtn.setScale(2);
      this.scene.tweens.add({
        targets: this.bg,
        alpha: 0.9,
        duration: 200
      });
      this.scene.tweens.add({
        targets: this.panelBg,
        scaleY: 1,
        duration: 1e3,
        ease: "Elastic.easeOut"
      });
      this.scene.tweens.add({
        targets: this.wakingG,
        y: 55,
        duration: 600,
        ease: "Back.easeOut"
      });
      this.scene.tweens.add({
        targets: this.namePanel,
        y: 90,
        duration: 1e3,
        ease: "Quint.easeOut",
        delay: 200
      });
      this.scene.tweens.add({
        targets: this.closeBtn,
        alpha: 1,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        duration: 600,
        delay: 500
      });
    }
    close() {
      this.scene.tweens.add({
        targets: this.namePanel,
        y: 90 + this.namePanel.height,
        duration: 400,
        ease: "Quint.easeIn"
      });
      this.scene.tweens.add({
        targets: this.panelBg,
        scaleY: 0,
        duration: 500,
        ease: "Quint.easeOut",
        delay: 200
      });
      this.scene.tweens.add({
        targets: this.bg,
        alpha: 0,
        duration: 200,
        delay: 300,
        onComplete: () => this.destroy()
      });
    }
  };

  // ../2019-es7/src/phaser/GamepadInput.js
  var FACE_BOTTOM = 0;
  var FACE_RIGHT = 1;
  var FACE_LEFT = 2;
  var FACE_TOP = 3;
  var SHOULDER_L1 = 4;
  var SHOULDER_R1 = 5;
  var SHOULDER_L2 = 6;
  var SHOULDER_R2 = 7;
  var BTN_SELECT = 8;
  var BTN_START = 9;
  var BTN_R3 = 11;
  var SP_BUTTONS = [FACE_BOTTOM, FACE_RIGHT, FACE_LEFT, FACE_TOP, SHOULDER_L1, SHOULDER_R1, SHOULDER_L2, SHOULDER_R2];
  var ENTER_BUTTONS = [BTN_START];
  var DPAD_UP = 12;
  var DPAD_DOWN = 13;
  var DPAD_LEFT = 14;
  var DPAD_RIGHT = 15;
  var STICK_THRESHOLD = 0.5;
  var _prevButtons = {};
  var _gamepadConnected = false;
  try {
    window.addEventListener("gamepadconnected", function(e) {
      _gamepadConnected = true;
      console.log("Gamepad connected: " + e.gamepad.id + " (index " + e.gamepad.index + ")");
    });
    window.addEventListener("gamepaddisconnected", function(e) {
      delete _prevButtons[e.gamepad.index];
      console.log("Gamepad disconnected: " + e.gamepad.id);
    });
  } catch (e) {
  }
  function getGamepads() {
    if (!navigator.getGamepads) return [];
    try {
      var raw = navigator.getGamepads();
      if (!raw) return [];
      var pads = [];
      for (var i = 0; i < raw.length; i++) {
        if (raw[i]) pads.push(raw[i]);
      }
      return pads;
    } catch (e) {
      return [];
    }
  }
  function isButtonPressed(btn) {
    if (!btn) return false;
    return typeof btn === "object" ? btn.pressed : btn > 0.5;
  }
  function pollGamepads() {
    var pads = getGamepads();
    var result = {
      sp: false,
      // any face/shoulder button just pressed
      enter: false,
      // start button just pressed
      editor: false,
      // R3 just pressed (or SELECT on controllers with fewer buttons)
      spDown: false,
      // any face/shoulder button held
      enterDown: false,
      // start button held
      left: false,
      right: false,
      up: false,
      down: false
    };
    for (var p = 0; p < pads.length; p++) {
      var gp = pads[p];
      if (!gp || !gp.buttons) continue;
      var idx = gp.index;
      if (!_prevButtons[idx]) _prevButtons[idx] = {};
      for (var i = 0; i < SP_BUTTONS.length; i++) {
        var bi = SP_BUTTONS[i];
        var pressed = isButtonPressed(gp.buttons[bi]);
        var wasPressed = !!_prevButtons[idx][bi];
        if (pressed && !wasPressed) result.sp = true;
        if (pressed) result.spDown = true;
        _prevButtons[idx][bi] = pressed;
      }
      for (var i = 0; i < ENTER_BUTTONS.length; i++) {
        var bi = ENTER_BUTTONS[i];
        var pressed = isButtonPressed(gp.buttons[bi]);
        var wasPressed = !!_prevButtons[idx][bi];
        if (pressed && !wasPressed) result.enter = true;
        if (pressed) result.enterDown = true;
        _prevButtons[idx][bi] = pressed;
      }
      var editorBtn = gp.buttons.length > BTN_R3 ? BTN_R3 : BTN_SELECT;
      if (editorBtn < gp.buttons.length) {
        var editorPressed = isButtonPressed(gp.buttons[editorBtn]);
        var editorWas = !!_prevButtons[idx]["_editor_" + editorBtn];
        if (editorPressed && !editorWas) result.editor = true;
        _prevButtons[idx]["_editor_" + editorBtn] = editorPressed;
      }
      if (isButtonPressed(gp.buttons[DPAD_LEFT])) result.left = true;
      if (isButtonPressed(gp.buttons[DPAD_RIGHT])) result.right = true;
      if (isButtonPressed(gp.buttons[DPAD_UP])) result.up = true;
      if (isButtonPressed(gp.buttons[DPAD_DOWN])) result.down = true;
      if (gp.axes && gp.axes.length >= 2) {
        if (gp.axes[0] < -STICK_THRESHOLD) result.left = true;
        if (gp.axes[0] > STICK_THRESHOLD) result.right = true;
        if (gp.axes[1] < -STICK_THRESHOLD) result.up = true;
        if (gp.axes[1] > STICK_THRESHOLD) result.down = true;
      }
    }
    return result;
  }

  // ../2019-es7/src/phaser/TitleScene.js
  var PhaserTitleScene = class extends Phaser.Scene {
    constructor() {
      super({ key: "PhaserTitleScene" });
      this.transitioning = false;
    }
    create() {
      this.transitioning = false;
      this.staffRollPanel = null;
      this.bg = this.add.tileSprite(
        0,
        0,
        GAME_DIMENSIONS.WIDTH,
        GAME_DIMENSIONS.HEIGHT,
        "title_bg"
      );
      this.bg.setOrigin(0, 0);
      this.titleG = this.add.sprite(0, 0, "game_ui", "titleG.gif");
      this.titleG.setOrigin(0, 0);
      this.titleG.setPosition(GAME_DIMENSIONS.WIDTH, 100);
      if (this.textures.exists("custom_logo")) {
        this.logo = this.add.sprite(0, 0, "custom_logo");
      } else {
        this.logo = this.add.sprite(0, 0, "game_ui", "logo.gif");
      }
      this.logo.setOrigin(0.5);
      this.logo.setPosition(this.logo.width / 2, -this.logo.height / 2);
      this.logo.setScale(2);
      if (this.textures.exists("custom_subTitle")) {
        this.subTitle = this.add.sprite(0, 0, "custom_subTitle");
      } else {
        var subtitleKey = "subTitle" + (LANG === "ja" ? "" : "En") + ".gif";
        this.subTitle = this.add.sprite(0, 0, "game_ui", subtitleKey);
      }
      this.subTitle.setOrigin(0.5);
      this.subTitle.setPosition(this.subTitle.width / 2, -this.logo.height / 2);
      this.subTitle.setScale(3);
      this.belt = this.add.graphics();
      this.belt.fillStyle(0, 1);
      this.belt.fillRect(0, GAME_DIMENSIONS.HEIGHT - 120, GAME_DIMENSIONS.WIDTH, 120);
      if (this.textures.exists("custom_titleStartText")) {
        this.startText = this.add.sprite(
          GAME_DIMENSIONS.CENTER_X,
          330,
          "custom_titleStartText"
        );
      } else {
        this.startText = this.add.sprite(
          GAME_DIMENSIONS.CENTER_X,
          330,
          "game_ui",
          "titleStartText.gif"
        );
      }
      this.startText.setOrigin(0.5);
      this.startText.setAlpha(0);
      this.startText.setInteractive({ useHandCursor: true });
      this.copyright = this.add.sprite(0, 0, "game_ui", "titleCopyright.gif");
      this.copyright.setOrigin(0, 0);
      this.copyright.y = GAME_DIMENSIONS.HEIGHT - this.copyright.height - 6;
      this.scoreTitleImg = this.add.sprite(32, 0, "game_ui", "hiScoreTxt.gif");
      this.scoreTitleImg.setOrigin(0, 0);
      this.scoreTitleImg.y = this.copyright.y - 58;
      this.worldBestLabel = this.add.text(
        32,
        this.scoreTitleImg.y - 16,
        getWorldBestLabel(),
        {
          fontFamily: "Arial",
          fontSize: "11px",
          fontStyle: "bold",
          color: "#ffffff",
          stroke: "#000000",
          strokeThickness: 2
        }
      );
      this.highScoreText = this.add.text(
        this.scoreTitleImg.x + this.scoreTitleImg.width + 3,
        this.scoreTitleImg.y + this.scoreTitleImg.height / 2,
        String(getDisplayedHighScore()),
        {
          fontFamily: "Arial",
          fontSize: "16px",
          fontStyle: "bold",
          color: "#ffffff",
          stroke: "#000000",
          strokeThickness: 2
        }
      );
      this.highScoreText.setOrigin(0, 0.5);
      this.scoreSyncLabel = this.add.text(
        32,
        this.scoreTitleImg.y + 22,
        getHighScoreSyncText(),
        {
          fontFamily: "Arial",
          fontSize: "8px",
          fontStyle: "bold",
          color: "#9be37f",
          stroke: "#000000",
          strokeThickness: 2
        }
      );
      var self = this;
      this.startText.on("pointerup", function() {
        self.titleStart();
      });
      this.tapZone = this.add.zone(
        GAME_DIMENSIONS.CENTER_X,
        GAME_DIMENSIONS.CENTER_Y,
        GAME_DIMENSIONS.WIDTH,
        GAME_DIMENSIONS.HEIGHT
      );
      this.tapZone.setInteractive({ useHandCursor: true });
      this.tapZone.on("pointerup", function() {
        self.titleStart();
      });
      this.twitterBtn = this.createFrameButton(
        GAME_DIMENSIONS.CENTER_X,
        this.copyright.y - 12,
        "twitterBtn"
      );
      this.twitterBtn.setOrigin(0.5);
      this.twitterBtn.on("pointerup", this.tweet, this);
      this.howtoBtn = this.createFrameButton(15, 10, "howtoBtn");
      this.howtoBtn.setOrigin(0, 0);
      this.howtoBtn.setScale(1, 0);
      this.howtoBtn.on("pointerup", function() {
        try {
          if (typeof window.howtoModalOpen === "function") {
            window.howtoModalOpen();
          }
        } catch (e) {
        }
      });
      this.staffrollBtn = this.createFrameButton(
        GAME_DIMENSIONS.WIDTH - 15,
        10,
        "staffrollBtn"
      );
      this.staffrollBtn.setOrigin(1, 0);
      this.staffrollBtn.setScale(1, 0);
      this.staffrollBtn.on("pointerup", this.showStaffroll, this);
      if (typeof window !== "undefined" && window.cordova && window.cordova.platformId === "android") {
        this.forgeBtn = this.add.text(
          GAME_DIMENSIONS.WIDTH - 6,
          GAME_DIMENSIONS.HEIGHT - 22,
          "BUILD APK",
          {
            fontFamily: "Arial",
            fontSize: "10px",
            fontStyle: "bold",
            color: "#0f0",
            stroke: "#000",
            strokeThickness: 2,
            backgroundColor: "rgba(0,0,0,0.6)",
            padding: { left: 4, right: 4, top: 2, bottom: 2 }
          }
        );
        this.forgeBtn.setOrigin(1, 0);
        this.forgeBtn.setInteractive({ useHandCursor: true });
        this.forgeBtn.on("pointerup", function() {
          self.scene.start("PhaserForgeScene");
        });
      }
      this.playTitleVoice = false;
      this.startIntroAnimation();
      this.enterKey = null;
      this.spaceKey = null;
      try {
        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      } catch (e) {
      }
    }
    startIntroAnimation() {
      var self = this;
      var titleGTarget = GAME_DIMENSIONS.CENTER_X - this.titleG.width / 2 + 5;
      this.tweens.add({
        targets: this.titleG,
        x: titleGTarget,
        y: 20,
        duration: 2e3,
        ease: "Quint.easeOut"
      });
      this.tweens.add({
        targets: this.logo,
        y: 75,
        duration: 900,
        delay: 1200,
        ease: "Quint.easeIn"
      });
      this.tweens.add({
        targets: this.logo,
        scaleX: 1,
        scaleY: 1,
        duration: 900,
        delay: 1100,
        ease: "Quint.easeIn"
      });
      this.tweens.add({
        targets: this.subTitle,
        y: 130,
        duration: 900,
        delay: 1180,
        ease: "Quint.easeIn"
      });
      this.tweens.add({
        targets: this.subTitle,
        scaleX: 1,
        scaleY: 1,
        duration: 900,
        delay: 1100,
        ease: "Quint.easeIn"
      });
      this.time.delayedCall(1500, function() {
        self.playVoice("voice_titlecall");
      });
      this.tweens.add({
        targets: this.startText,
        alpha: 1,
        duration: 100,
        delay: 2200,
        onComplete: function() {
          self.startFlashing();
        }
      });
      this.tweens.add({
        targets: this.howtoBtn,
        scaleY: 1,
        duration: 300,
        delay: 2600,
        ease: "Elastic.easeOut"
      });
      this.tweens.add({
        targets: this.staffrollBtn,
        scaleY: 1,
        duration: 300,
        delay: 2750,
        ease: "Elastic.easeOut"
      });
    }
    createFrameButton(x, y, framePrefix) {
      var button = this.add.sprite(x, y, "game_ui", framePrefix + "0.gif");
      button.setInteractive({ useHandCursor: true });
      button.on("pointerover", function() {
        button.setFrame(framePrefix + "1.gif");
      });
      button.on("pointerout", function() {
        button.setFrame(framePrefix + "0.gif");
      });
      button.on("pointerdown", function() {
        button.setFrame(framePrefix + "2.gif");
      });
      button.on("pointerup", function() {
        button.setFrame(framePrefix + "1.gif");
      });
      return button;
    }
    showStaffroll() {
      if (this.staffRollPanel && this.staffRollPanel.active) {
        return;
      }
      this.staffRollPanel = new StaffRollPanel(this);
    }
    tweet() {
      var score = Number(gameState.score || 0);
      var highScore = Number(gameState.highScore || 0);
      var url = "";
      var hashtags = "";
      var text = "";
      if (LANG === "ja") {
        url = encodeURIComponent("https://game.capcom.com/cfn/sfv/aprilfool/2019/?lang=ja");
        hashtags = encodeURIComponent("シャド研,SFVAE,aprilfool,エイプリルフール");
        text = encodeURIComponent("エイプリルフール 2019 世界大統領がSTGやってみた\nHISCORE:" + highScore + "\n");
      } else {
        url = encodeURIComponent("https://game.capcom.com/cfn/sfv/aprilfool/2019/?lang=en");
        hashtags = encodeURIComponent("ShadalooCRI, SFVAE, aprilfool");
        text = encodeURIComponent("APRIL FOOL 2019 WORLD PRESIDENT CHALLENGES A STG\nBEST:" + highScore + "\n");
      }
      var tweetUrl = "https://twitter.com/intent/tweet?url=" + url + "&hashtags=" + hashtags + "&text=" + text + "&score=" + score;
      try {
        window.open(tweetUrl, "_blank");
      } catch (e) {
      }
    }
    startFlashing() {
      if (this.startText) {
        this.tweens.add({
          targets: this.startText,
          alpha: 0,
          duration: 300,
          delay: 100,
          yoyo: true,
          repeat: -1,
          hold: 800
        });
      }
    }
    playVoice(key) {
      if (gameState.lowModeFlg) {
        return;
      }
      try {
        if (this.sound.get(key)) {
          this.sound.play(key, { volume: 0.7 });
        } else if (this.cache.audio.exists(key)) {
          this.sound.add(key).play({ volume: 0.7 });
        }
      } catch (e) {
      }
    }
    playSound(key, volume) {
      if (gameState.lowModeFlg) {
        return;
      }
      try {
        var vol = typeof volume === "number" ? volume : 0.75;
        if (this.sound.get(key)) {
          this.sound.play(key, { volume: vol });
        } else if (this.cache.audio.exists(key)) {
          this.sound.add(key).play({ volume: vol });
        }
      } catch (e) {
      }
    }
    titleStart() {
      if (this.transitioning) {
        return;
      }
      if (this.staffRollPanel && this.staffRollPanel.active) {
        return;
      }
      this.transitioning = true;
      this.playSound("se_decision", 0.75);
      this.tweens.killTweensOf(this.startText);
      this.startText.disableInteractive();
      this.twitterBtn.disableInteractive();
      this.howtoBtn.disableInteractive();
      this.staffrollBtn.disableInteractive();
      this.tapZone.disableInteractive();
      var self = this;
      this.cameras.main.fade(1e3, 0, 0, 0, false, function(cam, progress) {
        if (progress >= 1) {
          self.goToAdvScene();
        }
      });
    }
    launchLevelEditor() {
      try {
        window.open("level-editor.html", "_blank");
      } catch (e) {
      }
    }
    goToAdvScene() {
      var recipe = gameState._phaserRecipe;
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
      gameState.stageId = 0;
      gameState.continueCnt = 0;
      gameState.akebonoCnt = 0;
      gameState.shortFlg = false;
      gameState.forceBossName = null;
      var game = this.game;
      setTimeout(function() {
        game.scene.stop("PhaserTitleScene");
        game.scene.start("PhaserAdvScene");
      }, 50);
    }
    update(time, delta) {
      var STEP = 8.333333;
      this._accumulator = (this._accumulator || 0) + Math.min(delta, 66.67);
      while (this._accumulator >= STEP) {
        this._accumulator -= STEP;
        if (this.bg) {
          this.bg.tilePositionX -= 0.5;
        }
      }
      if (this.highScoreText) {
        this.highScoreText.setText(String(getDisplayedHighScore()));
      }
      if (this.scoreSyncLabel) {
        this.scoreSyncLabel.setText(getHighScoreSyncText());
        var syncTint = getHighScoreSyncTint();
        this.scoreSyncLabel.setColor("#" + syncTint.toString(16).padStart(6, "0"));
      }
      var gp = pollGamepads();
      if (!this.transitioning) {
        if (gp.editor) {
          this.launchLevelEditor();
        } else if (this.enterKey && Phaser.Input.Keyboard.JustDown(this.enterKey) || this.spaceKey && Phaser.Input.Keyboard.JustDown(this.spaceKey) || gp.sp || gp.enter) {
          this.titleStart();
        }
      }
    }
  };

  // ../2019-es7/src/phaser/AdvScene.js
  var ADV_SCENARIO_JA = {
    stage0: {
      part: [
        { background: "0", text: "君の闘いは我が闘い\nハイスコアを求めるのは\n地球人民の本能" },
        { background: "Done", text: "STG(シューティングゲーム)\nやってみた！" }
      ]
    },
    stage1: {
      part: [
        { background: "1", text: "君こそハイスコア\nそして、私でもあることが" },
        { background: "Done", text: "お分かりいただけただろう！" }
      ]
    },
    stage2: {
      part: [
        { background: "2", text: "地球人民はハイスコアを\n追い求めるからこそ美しい" },
        { background: "Done", text: "美しさとは君であり\nそして私なのだ！" }
      ]
    },
    stage3: {
      part: [
        { background: "3", text: "おお地球人民よ！\nハイスコアを求める地球人民よ" },
        { background: "3", text: "私こそがハイスコア\nそう、君こそが\nハイスコアなのだ" },
        { background: "Done", text: "存分に語り合おうではないか！" }
      ]
    },
    stage4: {
      part: [
        { background: "Done", text: "Thank you for playing" },
        { background: "Done", text: "ありがとう！\nハイスコアは私であり\n君であった！" }
      ]
    },
    stage5: {
      part: [
        { background: "Done", text: "ありがとう！\nハイスコアは私であり\n君であった！！" }
      ]
    }
  };
  var ADV_SCENARIO_EN = {
    stage0: {
      part: [
        { background: "0", text: "Your fight is our fight.\nIt is up to the citizens \nof the world to challenge \nthe high score" },
        { background: "Done", text: "in this shooting \ngame (STG)!" }
      ]
    },
    stage1: {
      part: [
        { background: "1", text: "Through achieving\nthe high score,\nboth you and I," },
        { background: "Done", text: "can come to a mutual \nunderstanding!" }
      ]
    },
    stage2: {
      part: [
        { background: "2", text: "The people of Earth, \ncoming together to \nachieve the high score, \nis truly a beautiful thing." },
        { background: "Done", text: "This beauty is something \nthat both you as well as I,\nboth possess!" }
      ]
    },
    stage3: {
      part: [
        { background: "3", text: "Now, citizens of the \nearth!\nYou fine people who \nchallenge the high score." },
        { background: "3", text: "My high score\nis also your high score." },
        { background: "Done", text: "Let us talk to\nour heart's content!" }
      ]
    },
    stage4: {
      part: [
        { background: "Done", text: "Thank you for playing." },
        { background: "Done", text: "This high score belongs\n to me,\nand it also belongs to you!" }
      ]
    },
    stage5: {
      part: [
        { background: "Done", text: "This high score belongs\n to me,\nand it also belongs to you!" }
      ]
    }
  };
  function addPixiPositionedText(scene, x, y, value, style) {
    var textStyle = Object.assign({}, style);
    var padding = textStyle.padding;
    var paddingX = 0;
    var paddingY = 0;
    if (typeof padding === "number") {
      paddingX = padding;
      paddingY = padding;
      textStyle.padding = { x: padding, y: padding };
    } else if (padding) {
      paddingX = padding.x || 0;
      paddingY = padding.y || 0;
    }
    var text = scene.add.text(x - paddingX, y - paddingY, value, textStyle);
    text.setOrigin(0, 0);
    return text;
  }
  var PhaserAdvScene = class extends Phaser.Scene {
    constructor() {
      super({ key: "PhaserAdvScene" });
    }
    create() {
      var recipe = gameState._phaserRecipe;
      if (recipe && recipe.storyData) {
        this.scenario = recipe.storyData;
      } else {
        this.scenario = LANG === "ja" ? ADV_SCENARIO_JA : ADV_SCENARIO_EN;
      }
      this.customImages = this.scenario.customImages || {};
      this.partNum = 0;
      this.stageKey = "stage" + String(gameState.stageId);
      this.partText = this.scenario[this.stageKey].part[this.partNum].text;
      this.partTextCursor = 0;
      this.partTextComp = false;
      this.textTimer = 0;
      this.endingFlg = false;
      if (gameState.stageId === 5) {
        this.endingFlg = true;
      } else if (gameState.stageId === 4) {
        this.playSound("voice_thankyou", 0.7);
        if (!(gameState.akebonoCnt >= 4 && gameState.continueCnt === 0)) {
          this.endingFlg = true;
        }
      }
      if (!gameState.bgmContinuityActive) {
        this.playBgm("adventure_bgm", 0.2);
      }
      var bgKey = "advBg" + this.scenario[this.stageKey].part[this.partNum].background + ".gif";
      this.bgSprite = this.add.sprite(0, 0, "game_ui", bgKey);
      this.bgSprite.setOrigin(0, 0);
      this._applyCustomImage(this.stageKey, this.partNum);
      this.txtBg = this.add.graphics();
      this.txtBg.lineStyle(2, 16777215, 1);
      this.txtBg.fillStyle(0, 1);
      this.txtBg.fillRoundedRect(8, GAME_DIMENSIONS.CENTER_Y + 7, GAME_DIMENSIONS.WIDTH - 16, 180, 6);
      this.txtBg.strokeRoundedRect(8, GAME_DIMENSIONS.CENTER_Y + 7, GAME_DIMENSIONS.WIDTH - 16, 180, 6);
      var nameBg = this.add.graphics();
      nameBg.lineStyle(2, 16777215, 1);
      nameBg.fillStyle(0, 1);
      nameBg.fillRoundedRect(16, GAME_DIMENSIONS.CENTER_Y - 5, 80, 24, 6);
      nameBg.strokeRoundedRect(16, GAME_DIMENSIONS.CENTER_Y - 5, 80, 24, 6);
      this.nameTxt = addPixiPositionedText(this, 50, GAME_DIMENSIONS.CENTER_Y - 4, "G", {
        fontFamily: "sans-serif",
        fontSize: "16px",
        fontStyle: "bold",
        color: "#ffffff",
        padding: { x: 10, y: 10 }
      });
      this.txt = addPixiPositionedText(this, 15, GAME_DIMENSIONS.CENTER_Y + 30, "", {
        fontFamily: "sans-serif",
        fontSize: "16px",
        fontStyle: "bold",
        color: "#ffffff",
        lineSpacing: 4,
        wordWrap: { width: 230, useAdvancedWrap: true },
        padding: { x: 10, y: 10 }
      });
      this.nextBtn = this.add.text(
        GAME_DIMENSIONS.WIDTH - 20,
        GAME_DIMENSIONS.HEIGHT - 30,
        "Next▼",
        {
          fontFamily: "sans-serif",
          fontSize: "16px",
          color: "#ffffff"
        }
      );
      this.nextBtn.setOrigin(1, 1);
      this.nextBtn.setInteractive({ useHandCursor: true });
      this.nextBtn.setVisible(false);
      var self = this;
      this.nextBtn.on("pointerup", function() {
        self.onNextPress();
      });
      this.tapZone = this.add.zone(
        GAME_DIMENSIONS.CENTER_X,
        GAME_DIMENSIONS.CENTER_Y,
        GAME_DIMENSIONS.WIDTH,
        GAME_DIMENSIONS.HEIGHT
      );
      this.tapZone.setInteractive({ useHandCursor: true });
      this.tapZone.on("pointerup", function() {
        if (self.partTextComp) {
          self.onNextPress();
        }
      });
      this.enterKey = null;
      this.spaceKey = null;
      try {
        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      } catch (e) {
      }
    }
    playSound(key, volume) {
      if (gameState.lowModeFlg) {
        return;
      }
      try {
        var vol = typeof volume === "number" ? volume : 0.7;
        if (this.sound.get(key)) {
          this.sound.play(key, { volume: vol });
        } else if (this.cache.audio.exists(key)) {
          this.sound.add(key).play({ volume: vol });
        }
      } catch (e) {
      }
    }
    playBgm(key, volume) {
      if (gameState.lowModeFlg) {
        return;
      }
      try {
        var existing = this.sound.get(key);
        if (existing) {
          existing.play({ volume: volume || 0.2, loop: true });
        } else if (this.cache.audio.exists(key)) {
          this.sound.add(key, { loop: true, volume: volume || 0.2 }).play();
        }
      } catch (e) {
      }
    }
    stopSound(key) {
      try {
        var snd = this.sound.get(key);
        if (snd && snd.isPlaying) {
          snd.stop();
        }
      } catch (e) {
      }
    }
    _applyCustomImage(stageKey, partNum) {
      var customKey = stageKey + "_part" + partNum;
      var dataURL = this.customImages[customKey];
      if (!dataURL) return;
      var texKey = "advCustom_" + customKey;
      var self = this;
      if (this.textures.exists(texKey)) {
        this.bgSprite.setTexture(texKey);
      } else {
        var img = new Image();
        img.onload = function() {
          self.textures.addImage(texKey, img);
          if (self.bgSprite && self.bgSprite.active) {
            self.bgSprite.setTexture(texKey);
          }
        };
        img.src = dataURL;
      }
    }
    onNextPress() {
      var maxParts = this.scenario[this.stageKey].part.length;
      if (this.partNum < maxParts - 1) {
        this.playSound("se_cursor_sub", 0.9);
        this.partNum++;
        this.partText = this.scenario[this.stageKey].part[this.partNum].text;
        this.partTextCursor = 0;
        this.partTextComp = false;
        this.txt.setText("");
        this.nextBtn.setVisible(false);
        var customKey = this.stageKey + "_part" + this.partNum;
        if (this.customImages[customKey]) {
          this._applyCustomImage(this.stageKey, this.partNum);
        } else {
          var bgKey = "advBg" + this.scenario[this.stageKey].part[this.partNum].background + ".gif";
          if (this.textures.getFrame("game_ui", bgKey)) {
            this.bgSprite.setTexture("game_ui", bgKey);
          }
        }
        var bgKeyForSound = "advBg" + this.scenario[this.stageKey].part[this.partNum].background + ".gif";
        if (bgKeyForSound === "advBgDone.gif") {
          this.playSound("g_adbenture_voice0", 0.5);
        }
      } else {
        this.goToNextScene();
      }
    }
    goToNextScene() {
      this.playSound("se_correct", 0.9);
      if (!gameState.bgmContinuityActive) {
        this.stopSound("adventure_bgm");
      }
      var nextScene = this.endingFlg ? "PhaserEndingScene" : "PhaserGameScene";
      var game = this.game;
      setTimeout(function() {
        game.scene.stop("PhaserAdvScene");
        game.scene.start(nextScene);
      }, 50);
    }
    update(time, delta) {
      var gp = pollGamepads();
      if (this.partTextComp && this.nextBtn && this.nextBtn.visible && (this.enterKey && Phaser.Input.Keyboard.JustDown(this.enterKey) || this.spaceKey && Phaser.Input.Keyboard.JustDown(this.spaceKey) || gp.sp || gp.enter)) {
        this.onNextPress();
        return;
      }
      if (this.partTextComp || !this.txt) {
        return;
      }
      this.textTimer += delta;
      if (this.textTimer < 33) {
        return;
      }
      this.textTimer = 0;
      if (this.partTextCursor <= this.partText.length - 1) {
        this.txt.setText(this.txt.text + this.partText.charAt(this.partTextCursor));
        this.partTextCursor++;
        return;
      }
      this.partTextComp = true;
      this.nextBtn.setVisible(true);
      if (this.partNum >= this.scenario[this.stageKey].part.length - 1) {
        this.nextBtn.setText("LET'S GO! ▶︎");
      } else {
        this.nextBtn.setText("Next▼");
      }
    }
  };

  // ../2019-es7/src/enums/player-boss-states.js
  var PLAYER_STATES = {
    SHOOT_NAME_NORMAL: "normal",
    SHOOT_NAME_BIG: "big",
    SHOOT_NAME_3WAY: "3way",
    SHOOT_SPEED_NORMAL: "speed_normal",
    SHOOT_SPEED_HIGH: "speed_high",
    BARRIER: "barrier"
  };

  // ../2019-es7/src/haptics.js
  var HAPTIC_PRESETS = {
    ui: {
      cooldown: 60,
      duration: 12,
      vibration: 10,
      weakMagnitude: 0.2,
      strongMagnitude: 0.08,
      tapticKind: "selection",
      tapticImpact: "light"
    },
    ready: {
      cooldown: 400,
      duration: 18,
      vibration: 16,
      weakMagnitude: 0.32,
      strongMagnitude: 0.12,
      tapticImpact: "light"
    },
    pickup: {
      cooldown: 120,
      duration: 22,
      vibration: 18,
      weakMagnitude: 0.45,
      strongMagnitude: 0.18,
      tapticImpact: "light"
    },
    damage: {
      cooldown: 180,
      duration: 34,
      vibration: 28,
      weakMagnitude: 0.55,
      strongMagnitude: 0.4,
      tapticImpact: "medium"
    },
    warning: {
      cooldown: 800,
      duration: 30,
      vibration: [14, 28, 14],
      weakMagnitude: 0.6,
      strongMagnitude: 0.35,
      tapticNotification: "warning",
      tapticImpact: "medium"
    },
    special: {
      cooldown: 500,
      duration: 44,
      vibration: [18, 24, 40],
      weakMagnitude: 0.9,
      strongMagnitude: 0.85,
      tapticImpact: "heavy"
    },
    bossEnter: {
      cooldown: 1200,
      duration: 40,
      vibration: 36,
      weakMagnitude: 0.8,
      strongMagnitude: 0.65,
      tapticImpact: "heavy"
    },
    bossDefeat: {
      cooldown: 1500,
      duration: 52,
      vibration: [24, 36, 48],
      weakMagnitude: 1,
      strongMagnitude: 1,
      tapticNotification: "success",
      tapticImpact: "heavy"
    },
    stageClear: {
      cooldown: 1500,
      duration: 36,
      vibration: [18, 28, 24],
      weakMagnitude: 0.72,
      strongMagnitude: 0.45,
      tapticNotification: "success",
      tapticImpact: "medium"
    },
    kill: {
      cooldown: 80,
      duration: 10,
      vibration: 8,
      weakMagnitude: 0.15,
      strongMagnitude: 0.06,
      tapticKind: "selection",
      tapticImpact: "light"
    },
    death: {
      cooldown: 2e3,
      duration: 60,
      vibration: [30, 40, 50, 30, 80],
      weakMagnitude: 1,
      strongMagnitude: 1,
      tapticNotification: "error",
      tapticImpact: "heavy"
    },
    deflect: {
      cooldown: 100,
      duration: 8,
      vibration: 6,
      weakMagnitude: 0.12,
      strongMagnitude: 0.05,
      tapticKind: "selection",
      tapticImpact: "light"
    }
  };
  var lastHapticByPreset = /* @__PURE__ */ Object.create(null);
  var lastHapticAt = 0;
  function nowMs() {
    if (typeof performance !== "undefined" && typeof performance.now === "function") {
      return performance.now();
    }
    return Date.now();
  }
  function isIOSDevice() {
    if (typeof navigator === "undefined") {
      return false;
    }
    var ua = navigator.userAgent || "";
    return /iPad|iPhone|iPod/.test(ua) || navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  }
  function pulseDurationFromPattern(pattern) {
    if (!Array.isArray(pattern)) {
      return typeof pattern === "number" ? pattern : 0;
    }
    var total = 0;
    for (var i = 0; i < pattern.length; i += 2) {
      total += Number(pattern[i]) || 0;
    }
    return total;
  }
  function resolveBrowserVibration(preset) {
    if (Array.isArray(preset.vibration) && !isIOSDevice()) {
      return preset.vibration.slice();
    }
    if (typeof preset.vibration === "number") {
      return preset.vibration;
    }
    return pulseDurationFromPattern(preset.vibration || preset.duration);
  }
  function resolvePreset(name) {
    return HAPTIC_PRESETS[name] || HAPTIC_PRESETS.ui;
  }
  function isHapticsEnabled() {
    return gameState.vibrateFlg !== false;
  }
  function shouldTriggerPreset(name, preset) {
    if (!isHapticsEnabled()) {
      return false;
    }
    var now = nowMs();
    if (now - lastHapticAt < 16) {
      return false;
    }
    var cooldown = preset.cooldown || 0;
    var lastPresetAt = lastHapticByPreset[name] || 0;
    if (cooldown > 0 && now - lastPresetAt < cooldown) {
      return false;
    }
    lastHapticByPreset[name] = now;
    lastHapticAt = now;
    return true;
  }
  function tryInvoke(target, methodName, argSets) {
    if (!target || typeof target[methodName] !== "function") {
      return false;
    }
    for (var i = 0; i < argSets.length; i++) {
      try {
        target[methodName].apply(target, argSets[i]);
        return true;
      } catch (error) {
      }
    }
    return false;
  }
  function resolveCordovaHapticEngine() {
    if (typeof window === "undefined") {
      return null;
    }
    if (window.TapticEngine) {
      return window.TapticEngine;
    }
    if (window.plugins) {
      return window.plugins.tapticEngine || window.plugins.hapticFeedback || window.plugins.hapticfeedback || null;
    }
    return null;
  }
  function tryCordovaEngine(preset) {
    var engine = resolveCordovaHapticEngine();
    if (!engine) {
      return false;
    }
    if (preset.tapticNotification) {
      if (tryInvoke(engine, "notification", [
        [{ type: preset.tapticNotification }],
        [preset.tapticNotification]
      ])) {
        return true;
      }
      if (tryInvoke(engine, "notificationOccurred", [
        [String(preset.tapticNotification).toUpperCase()],
        [preset.tapticNotification]
      ])) {
        return true;
      }
    }
    if (preset.tapticKind === "selection") {
      if (tryInvoke(engine, "selection", [[]]) || tryInvoke(engine, "selectionChanged", [[]])) {
        return true;
      }
    }
    if (preset.tapticImpact) {
      if (tryInvoke(engine, "impact", [
        [{ style: preset.tapticImpact }],
        [preset.tapticImpact],
        []
      ])) {
        return true;
      }
      if (tryInvoke(engine, "impactOccurred", [
        [String(preset.tapticImpact).toUpperCase()],
        [preset.tapticImpact],
        []
      ])) {
        return true;
      }
    }
    return tryInvoke(engine, "vibrate", [[]]);
  }
  function tryCordovaNotificationVibrate(preset) {
    if (typeof window === "undefined" || !window.cordova || typeof navigator === "undefined") {
      return false;
    }
    var notification = navigator.notification;
    if (!notification || typeof notification.vibrate !== "function") {
      return false;
    }
    var payload = resolveBrowserVibration(preset);
    return tryInvoke(notification, "vibrate", [[payload], [preset.duration]]);
  }
  function tryNavigatorVibrate(preset) {
    if (typeof navigator === "undefined") {
      return false;
    }
    var vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;
    if (typeof vibrate !== "function") {
      return false;
    }
    try {
      return !!vibrate.call(navigator, resolveBrowserVibration(preset));
    } catch (error) {
      return false;
    }
  }
  function getGamepadActuators(gamepad) {
    var actuators = [];
    if (!gamepad) {
      return actuators;
    }
    if (gamepad.vibrationActuator) {
      actuators.push(gamepad.vibrationActuator);
    }
    if (gamepad.hapticActuators && gamepad.hapticActuators.length) {
      for (var i = 0; i < gamepad.hapticActuators.length; i++) {
        actuators.push(gamepad.hapticActuators[i]);
      }
    }
    return actuators;
  }
  function buildGamepadEffect(effectType, preset) {
    var effect = {
      startDelay: 0,
      duration: preset.duration,
      weakMagnitude: preset.weakMagnitude,
      strongMagnitude: preset.strongMagnitude
    };
    if (effectType === "trigger-rumble") {
      effect.leftTrigger = preset.strongMagnitude;
      effect.rightTrigger = preset.weakMagnitude;
    }
    return effect;
  }
  function triggerActuator(actuator, preset) {
    if (!actuator) {
      return false;
    }
    if (typeof actuator.playEffect === "function") {
      var effectType = "dual-rumble";
      if (Array.isArray(actuator.effects) && actuator.effects.length > 0) {
        effectType = actuator.effects.indexOf("dual-rumble") >= 0 ? "dual-rumble" : actuator.effects[0];
      } else if (typeof actuator.type === "string" && actuator.type) {
        effectType = actuator.type;
      }
      try {
        var result = actuator.playEffect(effectType, buildGamepadEffect(effectType, preset));
        if (result && typeof result.catch === "function") {
          result.catch(function() {
          });
        }
        return true;
      } catch (error) {
      }
    }
    if (typeof actuator.pulse === "function") {
      try {
        actuator.pulse(Math.max(preset.weakMagnitude, preset.strongMagnitude), preset.duration);
        return true;
      } catch (error) {
      }
    }
    return false;
  }
  function tryGamepadHaptics(preset) {
    if (typeof navigator === "undefined" || typeof navigator.getGamepads !== "function") {
      return false;
    }
    var pads;
    try {
      pads = navigator.getGamepads();
    } catch (error) {
      return false;
    }
    if (!pads || !pads.length) {
      return false;
    }
    var triggered = false;
    for (var i = 0; i < pads.length; i++) {
      var actuators = getGamepadActuators(pads[i]);
      for (var j = 0; j < actuators.length; j++) {
        triggered = triggerActuator(actuators[j], preset) || triggered;
      }
    }
    return triggered;
  }
  function triggerHaptic(name) {
    var presetName = name || "ui";
    var preset = resolvePreset(presetName);
    if (!shouldTriggerPreset(presetName, preset)) {
      return false;
    }
    var triggered = false;
    var usedCordovaDevice = tryCordovaEngine(preset) || tryCordovaNotificationVibrate(preset);
    triggered = usedCordovaDevice || triggered;
    if (!usedCordovaDevice) {
      triggered = tryNavigatorVibrate(preset) || triggered;
    }
    triggered = tryGamepadHaptics(preset) || triggered;
    return triggered;
  }

  // ../2019-es7/src/phaser/game-objects/Shadow.js
  function createShadow(scene, sprite, frameKey, shadowReverse, shadowOffsetY, textureKey) {
    var shadow = scene.add.sprite(sprite.x, sprite.y, textureKey || "game_asset", frameKey);
    shadow.setOrigin(0.5);
    shadow.setTint(0).setTintMode(Phaser.TintModes.FILL);
    shadow.setAlpha(0.5);
    shadow.setDepth((sprite.depth || 0) - 1);
    if (shadowReverse) {
      shadow.setScale(1, -1);
    }
    shadow.setData("shadowReverse", shadowReverse);
    shadow.setData("shadowOffsetY", shadowOffsetY);
    return shadow;
  }
  function updateShadowPosition(shadow, sprite) {
    shadow.x = sprite.x;
    var offsetY = shadow.getData("shadowOffsetY") || 0;
    shadow.y = sprite.y + sprite.height - offsetY;
  }

  // ../2019-es7/src/phaser/game-objects/Player.js
  var GW = GAME_DIMENSIONS.WIDTH;
  var GH = GAME_DIMENSIONS.HEIGHT;
  var GCX = GAME_DIMENSIONS.CENTER_X;
  function clamp(v, lo, hi) {
    return v < lo ? lo : v > hi ? hi : v;
  }
  function pointerId(pointer) {
    if (!pointer) return null;
    if (pointer.id !== void 0 && pointer.id !== null) return pointer.id;
    if (pointer.pointerId !== void 0 && pointer.pointerId !== null) return pointer.pointerId;
    return null;
  }
  function createPlayer(scene) {
    var pd = scene.recipe.playerData;
    var playerFrames = pd && Array.isArray(pd.texture) && pd.texture.length > 0 ? pd.texture.slice() : ["player00.gif", "player01.gif", "player02.gif", "player03.gif", "player04.gif", "player05.gif"];
    var firstFrame = playerFrames[0] || "player00.gif";
    scene.playerSprite = scene.add.sprite(GCX, GH - 80, "game_asset", firstFrame);
    scene.playerSprite.setOrigin(0.5);
    scene.playerSprite.setDepth(50);
    scene.playerHitAreaHalfWidth = (scene.playerSprite.width - 14) / 2;
    if (!isFinite(scene.playerHitAreaHalfWidth) || scene.playerHitAreaHalfWidth <= 0) {
      scene.playerHitAreaHalfWidth = 16;
    }
    scene.playerUnitX = scene.playerSprite.x;
    scene.playerUnitY = scene.playerSprite.y;
    scene.playerHp = gameState.playerHp || pd.maxHp;
    scene.playerMaxHp = gameState.playerMaxHp || pd.maxHp;
    if (scene.anims.exists("player-idle")) {
      scene.anims.remove("player-idle");
    }
    scene.anims.create({
      key: "player-idle",
      frames: playerFrames.map(function(f) {
        return { key: "game_asset", frame: f };
      }),
      frameRate: 6,
      repeat: -1
    });
    scene.playerSprite.play("player-idle");
    scene.playerShadow = createShadow(scene, scene.playerSprite, firstFrame, true, 5, "game_asset");
    scene.playerShadow.play("player-idle");
    updateShadowPosition(scene.playerShadow, scene.playerSprite);
    scene.barrierActive = false;
    scene.barrierTimer = 0;
    scene.barrierSprite = null;
  }
  function createDragArea(scene) {
    scene.dragArea = scene.add.zone(0, 0, GW, GH);
    scene.dragArea.setOrigin(0, 0);
    scene.dragArea.setInteractive(new Phaser.Geom.Rectangle(0, 0, GW, GH), Phaser.Geom.Rectangle.Contains);
    scene.dragArea.on("pointerdown", function(pointer) {
      onScreenDragStart(scene, pointer);
    });
    scene.dragArea.on("pointermove", function(pointer) {
      onScreenDragMove(scene, pointer);
    });
    scene.dragArea.on("pointerup", function(pointer) {
      onScreenDragEnd(scene, pointer);
    });
  }
  function clampPlayerX(scene, x) {
    return clamp(x, scene.playerHitAreaHalfWidth, GW - scene.playerHitAreaHalfWidth);
  }
  function onScreenDragStart(scene, pointer) {
    if (!scene.gameStarted || scene.playerDead) return;
    if (pointer.rightButtonDown()) {
      scene.onSpFire();
      return;
    }
    scene.playerUnitX = pointer.x;
    scene.isDragging = true;
    scene.dragPointerId = pointerId(pointer);
  }
  function onScreenDragEnd(scene, pointer) {
    var activePointerId = pointerId(pointer);
    if (scene.dragPointerId !== null && activePointerId !== null && activePointerId !== scene.dragPointerId) return;
    scene.isDragging = false;
    scene.dragPointerId = null;
  }
  function onScreenDragMove(scene, pointer) {
    if (!scene.isDragging || !scene.gameStarted || scene.playerDead || scene.theWorldFlg) return;
    if (scene.dragPointerId !== null && pointerId(pointer) !== scene.dragPointerId) return;
    scene.playerUnitX = clampPlayerX(scene, pointer.x);
  }
  function handleKeyboardInput(scene) {
    if (!scene.gameStarted || scene.playerDead || scene.theWorldFlg) return;
    var gp = pollGamepads();
    var moveX = 0;
    var moveY = 0;
    if (scene.cursors && scene.cursors.left.isDown || scene.wasd && scene.wasd.left.isDown || gp.left) {
      moveX = -scene.keyMoveSpeed;
    } else if (scene.cursors && scene.cursors.right.isDown || scene.wasd && scene.wasd.right.isDown || gp.right) {
      moveX = scene.keyMoveSpeed;
    }
    if (scene.cursors && scene.cursors.up.isDown || scene.wasd && scene.wasd.up.isDown || gp.up) {
      moveY = -scene.keyMoveSpeed;
    } else if (scene.cursors && scene.cursors.down.isDown || scene.wasd && scene.wasd.down.isDown || gp.down) {
      moveY = scene.keyMoveSpeed;
    }
    if (moveX !== 0 || moveY !== 0) {
      scene.playerUnitX = clampPlayerX(scene, scene.playerUnitX + moveX);
      scene.playerSprite.y = clamp(scene.playerSprite.y + moveY, 50, GH - 20);
      scene.playerUnitY = scene.playerSprite.y;
    }
    if (scene.wasd && scene.wasd.sp && Phaser.Input.Keyboard.JustDown(scene.wasd.sp) || gp.sp) {
      scene.onSpFire();
    }
  }
  function playerDamage(scene, amount) {
    if (scene.barrierActive) return;
    if (scene.damageAnimationFlg) return;
    scene.damageAnimationFlg = true;
    scene.playerHp -= amount;
    if (scene.playerHp <= 0) {
      scene.playerHp = 0;
      playerDie(scene);
    }
    scene.hpBar.setScale(Math.max(0, scene.playerHp / scene.playerMaxHp), 1);
    triggerHaptic("damage");
    scene.playSound("se_damage", 0.15);
    scene.playSound("g_damage_voice", 0.5);
    scene.cameras.main.shake(150, 0.01);
    scene.tweens.add({
      targets: scene.hudBg,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 2
    });
    var sprite = scene.playerSprite;
    var baseY = sprite.y;
    var steps = [
      // Cycle 1: down+red
      { y: baseY + 2, alpha: 0.2, tint: 16744576, dur: 150, delay: 0 },
      { y: baseY - 2, alpha: 1, tint: null, dur: 150, delay: 150 },
      // Cycle 2: down+red (50ms gap)
      { y: baseY + 2, alpha: 0.2, tint: 16744576, dur: 150, delay: 350 },
      { y: baseY - 2, alpha: 1, tint: null, dur: 150, delay: 500 },
      // Cycle 3: down+red (50ms gap)
      { y: baseY + 2, alpha: 0.2, tint: 16744576, dur: 150, delay: 700 },
      { y: baseY, alpha: 1, tint: null, dur: 150, delay: 850 },
      // Cycle 4: down+red (50ms gap)
      { y: baseY + 2, alpha: 0.2, tint: 16744576, dur: 150, delay: 1050 },
      { y: baseY, alpha: 1, tint: null, dur: 150, delay: 1200 }
    ];
    for (var i = 0; i < steps.length; i++) {
      (function(step, isLast) {
        scene.tweens.add({
          targets: sprite,
          y: step.y,
          alpha: step.alpha,
          duration: step.dur,
          delay: step.delay,
          onStart: function() {
            if (step.tint != null) {
              sprite.setTint(step.tint);
            } else {
              sprite.clearTint();
            }
          },
          onComplete: isLast ? function() {
            scene.damageAnimationFlg = false;
          } : void 0
        });
      })(steps[i], i === steps.length - 1);
    }
  }
  function playerDie(scene) {
    if (scene.playerDead) return;
    scene.playerDead = true;
    scene.gameStarted = false;
    triggerHaptic("death");
    scene.showExplosion(scene.playerSprite.x, scene.playerSprite.y);
    scene.playerSprite.setVisible(false);
    if (scene.playerShadow) scene.playerShadow.setVisible(false);
    gameState.maxCombo = Math.max(gameState.maxCombo || 0, scene.maxCombo);
    var game = scene.game;
    scene.time.delayedCall(2e3, function() {
      gameState.score = scene.scoreCount;
      gameState.spgage = scene.spGauge;
      scene.stopAllSounds();
      setTimeout(function() {
        game.scene.stop("PhaserGameScene");
        game.scene.start("PhaserContinueScene");
      }, 50);
    });
  }
  function updateBarrier(scene, step) {
    if (!scene.barrierActive) return;
    scene.barrierTimer -= step / 1e3;
    if (scene.barrierTimer <= 0) {
      scene.barrierActive = false;
      if (scene.barrierSprite) {
        scene.barrierSprite.destroy();
        scene.barrierSprite = null;
      }
      scene.playSound("se_barrier_end", 0.9);
    } else if (scene.barrierSprite) {
      scene.barrierSprite.x = scene.playerSprite.x;
      scene.barrierSprite.y = scene.playerSprite.y;
    }
  }
  function collectItem(scene, itemName) {
    triggerHaptic("pickup");
    scene.playSound("g_powerup_voice", 0.55);
    switch (itemName) {
      case PLAYER_STATES.SHOOT_SPEED_HIGH:
        scene.shootSpeed = "speed_high";
        break;
      case PLAYER_STATES.BARRIER:
        scene.barrierActive = true;
        scene.barrierTimer = 4;
        scene.playSound("se_barrier_start", 0.9);
        if (scene.barrierSprite) scene.barrierSprite.destroy();
        scene.barrierSprite = scene.add.sprite(scene.playerSprite.x, scene.playerSprite.y, "game_asset", "barrier0.gif");
        scene.barrierSprite.setOrigin(0.5);
        scene.barrierSprite.setDepth(51);
        scene.barrierSprite.setAlpha(0.6);
        break;
      case PLAYER_STATES.SHOOT_NAME_BIG:
        scene.shootMode = "big";
        scene.shootSpeed = "speed_normal";
        break;
      case PLAYER_STATES.SHOOT_NAME_3WAY:
        scene.shootMode = "3way";
        scene.shootSpeed = "speed_normal";
        break;
      default:
        scene.shootMode = "normal";
        break;
    }
  }

  // ../2019-es7/src/phaser/game-objects/Enemy.js
  var GW2 = GAME_DIMENSIONS.WIDTH;
  var GH2 = GAME_DIMENSIONS.HEIGHT;
  function resolveFrame(scene, atlasKey, frameName) {
    var atlas = scene.textures.get(atlasKey);
    if (!atlas) return frameName;
    if (atlas.has(frameName)) return frameName;
    var alt = null;
    if (frameName.endsWith(".gif")) alt = frameName.replace(/\.gif$/, ".png");
    else if (frameName.endsWith(".png")) alt = frameName.replace(/\.png$/, ".gif");
    if (alt && atlas.has(alt)) return alt;
    return frameName;
  }
  function resolveFrames(scene, atlasKey, frames) {
    var result = [];
    for (var i = 0; i < frames.length; i++) {
      result.push(resolveFrame(scene, atlasKey, frames[i]));
    }
    return result;
  }
  function createEnemy(scene, data, x, y, itemName) {
    var frames = resolveFrames(scene, "game_asset", data.texture || []);
    var frameKey = frames[0] || "soliderA0.gif";
    var enemy = scene.add.sprite(x, y, "game_asset", frameKey);
    enemy.setOrigin(0.5);
    enemy.setDepth(40);
    enemy.setData("type", "enemy");
    enemy.setData("name", data.name || "");
    enemy.setData("hp", data.hp || 1);
    enemy.setData("maxHp", data.hp || 1);
    enemy.setData("speed", data.speed || 0.8);
    enemy.setData("score", data.score || 100);
    enemy.setData("spgage", data.spgage || 1);
    enemy.setData("interval", data.interval || 300);
    enemy.setData("shootCnt", 0);
    enemy.setData("itemName", itemName || null);
    enemy.setData("spawnX", x);
    enemy.setData("frames", frames);
    enemy.setData("animIdx", 0);
    enemy.setData("animTimer", 0);
    enemy.setData("projData", data.bulletData || data.projectileData || null);
    enemy.setData("enemyKey", data._enemyKey || null);
    var shadowReverse = data.shadowReverse !== false;
    var shadowOffsetY = data.shadowOffsetY || 10;
    var enemyNameLower = String(data.name || "").toLowerCase();
    var shadow = createShadow(scene, enemy, frameKey, shadowReverse, shadowOffsetY);
    if (enemyNameLower === "baraa" || enemyNameLower === "barab") {
      shadow.setVisible(false);
    }
    enemy.setData("shadow", shadow);
    updateShadowPosition(shadow, enemy);
    scene.enemies.push(enemy);
    return enemy;
  }
  function enemyWave(scene) {
    if (scene.waveCount >= scene.stageEnemyPositionList.length) {
      scene.bossAdd();
      return;
    }
    var row = scene.stageEnemyPositionList[scene.waveCount] || [];
    for (var i = 0; i < row.length; i++) {
      var code = String(row[i]);
      if (code === "00") continue;
      var enemyType = code.substr(0, 1);
      var itemCode = code.substr(1, 1);
      var dataKey = "enemy" + enemyType;
      var enemyData = scene.recipe.enemyData ? scene.recipe.enemyData[dataKey] : null;
      if (!enemyData) continue;
      enemyData._enemyKey = enemyType;
      var itemName = null;
      switch (itemCode) {
        case "1":
          itemName = PLAYER_STATES.SHOOT_NAME_BIG;
          break;
        case "2":
          itemName = PLAYER_STATES.SHOOT_NAME_3WAY;
          break;
        case "3":
          itemName = PLAYER_STATES.SHOOT_SPEED_HIGH;
          break;
        case "9":
          itemName = PLAYER_STATES.BARRIER;
          break;
      }
      createEnemy(scene, enemyData, 32 * i + 16, -16, itemName);
    }
    scene.waveCount++;
  }
  function enemyShoot(scene, enemy) {
    var projData = enemy.getData("projData");
    if (!projData) return;
    var frames = resolveFrames(scene, "game_asset", projData.texture || []);
    var frameKey = frames[0] || "normalProjectile0.gif";
    var speed = projData.speed || 1;
    var bullet = scene.add.sprite(enemy.x, enemy.y + enemy.height / 2, "game_asset", frameKey);
    bullet.setOrigin(0.5);
    bullet.setDepth(41);
    bullet.setData("speed", speed);
    bullet.setData("damage", projData.damage || 1);
    bullet.setData("hp", projData.hp || 1);
    bullet.setData("score", projData.score || 0);
    bullet.setData("spgage", projData.spgage || 0);
    bullet.setData("frames", frames);
    bullet.setData("animIdx", 0);
    bullet.setData("animTimer", 0);
    if (projData.frameRate) bullet.setData("frameRate", projData.frameRate);
    var enemyName = String(enemy.getData("name") || "").toLowerCase();
    var projName = String(projData && projData.name || "").toLowerCase();
    var enemyKey = String(enemy.getData("enemyKey") || "");
    var isSoldierB = enemyName === "soliderb" || enemyName === "soldierb" || enemyKey === "B";
    if (isSoldierB && !gameState.secondLoop) {
      bullet.setData("rotX", 0);
      bullet.setData("rotY", 1);
    } else if (isSoldierB && gameState.secondLoop || projName === "beam" || projName === "smoke" || projName === "meka" || projName === "psychofield") {
      var dx = scene.playerSprite.x - enemy.x;
      var dy = scene.playerSprite.y - enemy.y;
      var dist = Math.sqrt(dx * dx + dy * dy) || 1;
      bullet.setData("rotX", dx / dist);
      bullet.setData("rotY", dy / dist);
    } else {
      bullet.setData("rotX", 0);
      bullet.setData("rotY", 1);
    }
    scene.enemyBullets.push(bullet);
  }
  function enemyDie(scene, enemy, isSp) {
    if (!enemy || !enemy.active) return;
    var score = enemy.getData("score") || 100;
    var spgage = enemy.getData("spgage") || 1;
    scene.comboCount++;
    if (scene.comboCount > scene.maxCombo) {
      scene.maxCombo = scene.comboCount;
    }
    var ratio = Math.max(1, Math.ceil(scene.comboCount / 10));
    scene.scoreCount += score * ratio;
    scene.comboTimeCnt = 100;
    if (!isSp) {
      scene.spGauge = Math.min(100, scene.spGauge + spgage);
      scene.updateSpGauge();
      if (scene.spGauge >= 100) {
        scene.spBtn.setAlpha(1);
      }
    }
    var itemName = enemy.getData("itemName");
    if (itemName) {
      scene.dropItem(enemy.x, enemy.y, itemName);
    }
    triggerHaptic("kill");
    scene.showExplosion(enemy.x, enemy.y);
    scene.showScorePopup(enemy.x, enemy.y, score, ratio);
    scene.playSound("se_explosion", 0.175);
    var idx = scene.enemies.indexOf(enemy);
    if (idx >= 0) scene.enemies.splice(idx, 1);
    var eShadow = enemy.getData("shadow");
    if (eShadow && eShadow.active) eShadow.destroy();
    enemy.destroy();
  }
  function updateEnemy(scene, enemy, step) {
    var speed = enemy.getData("speed") || 0.8;
    enemy.y += speed;
    var enemyName = enemy.getData("name");
    var enemyKey = enemy.getData("enemyKey");
    var isTypeA = enemyKey === "A" || enemyName === "soliderA";
    var isTypeB = enemyKey === "B" || enemyName === "soliderB";
    if (isTypeA) {
      if (enemy.y >= GH2 / 1.5 && scene.playerSprite) {
        enemy.x += 5e-3 * (scene.playerSprite.x - enemy.x);
      }
    } else if (isTypeB) {
      if (!enemy.getData("posName")) {
        if ((enemy.getData("spawnX") || 0) >= GW2 / 2) {
          enemy.x = GW2;
          enemy.setData("posName", "right");
        } else {
          enemy.x = -enemy.width;
          enemy.setData("posName", "left");
        }
      }
      if (enemy.y >= GH2 / 3) {
        if (enemy.getData("posName") === "right") {
          enemy.x -= 1;
        } else {
          enemy.x += 1;
        }
      }
    }
    var eShadow = enemy.getData("shadow");
    if (eShadow && eShadow.active) {
      updateShadowPosition(eShadow, enemy);
    }
    var shootCnt = enemy.getData("shootCnt") + 1;
    enemy.setData("shootCnt", shootCnt);
    var shootInterval = enemy.getData("interval") || 300;
    if (shootInterval > 0 && shootCnt >= shootInterval) {
      enemy.setData("shootCnt", shootCnt - shootInterval);
      if (enemy.y < scene.playerSprite.y - 20) {
        enemyShoot(scene, enemy);
      }
    }
  }
  function animateEnemy(enemy, step) {
    var animFrames = enemy.getData("frames");
    if (animFrames && animFrames.length > 1) {
      var animTimer = enemy.getData("animTimer") + step;
      enemy.setData("animTimer", animTimer);
      if (animTimer > 150) {
        enemy.setData("animTimer", 0);
        var animIdx = (enemy.getData("animIdx") + 1) % animFrames.length;
        enemy.setData("animIdx", animIdx);
        try {
          enemy.setFrame(animFrames[animIdx]);
        } catch (err) {
        }
        var eShadow = enemy.getData("shadow");
        if (eShadow && eShadow.active) {
          try {
            eShadow.setFrame(animFrames[animIdx]);
          } catch (err2) {
          }
        }
      }
    }
  }

  // ../2019-es7/src/phaser/game-objects/Bullet.js
  var GW3 = GAME_DIMENSIONS.WIDTH;
  function attachAnim(bullet, frames, frameRate) {
    bullet.setData("frames", frames);
    bullet.setData("animIdx", 0);
    bullet.setData("animTimer", 0);
    bullet.setData("frameRate", frameRate);
  }
  function shootBullets(scene) {
    if (!scene.gameStarted || scene.playerDead || scene.theWorldFlg) {
      return;
    }
    var pd = scene.recipe.playerData;
    var shootData;
    switch (scene.shootMode) {
      case "big":
        shootData = pd.shootBig;
        break;
      case "3way":
        shootData = pd.shoot3way;
        break;
      default:
        shootData = pd.shootNormal;
        break;
    }
    var rawFrames = shootData.texture && shootData.texture.length ? shootData.texture : ["shot00.gif"];
    var atlas = scene.textures.get("game_asset");
    var atlasFrames = atlas && atlas.frames ? atlas.frames : null;
    var frames = rawFrames;
    if (atlasFrames) {
      var present = rawFrames.filter(function(f) {
        return !!atlasFrames[f];
      });
      if (present.length === 0) {
        frames = ["shot00.gif"];
      } else {
        frames = present;
      }
      if (present.length !== rawFrames.length) {
        scene._bulletWarnSeen = scene._bulletWarnSeen || {};
        var warnKey = scene.shootMode + ":" + rawFrames.join(",");
        if (!scene._bulletWarnSeen[warnKey]) {
          scene._bulletWarnSeen[warnKey] = true;
          var missing = rawFrames.filter(function(f) {
            return !atlasFrames[f];
          });
          console.warn("Bullet[" + scene.shootMode + "]: dropping missing frames", missing, "kept", frames);
        }
      }
    }
    var frameKey = frames[0];
    var frameRate = shootData.frameRate || 6;
    if (scene.shootMode === "3way") {
      for (var a = -1; a <= 1; a++) {
        var b = scene.add.sprite(scene.playerSprite.x + a * 10, scene.playerSprite.y - 16, "game_asset", frameKey);
        b.setOrigin(0.5);
        b.setDepth(50);
        b.setData("damage", shootData.damage);
        b.setData("hp", shootData.hp);
        b.setData("angle", a * 0.15);
        b.setData("bulletId", scene.bulletIdCnt++);
        b.setRotation(-Math.PI / 2 + a * 0.2);
        attachAnim(b, frames, frameRate);
        scene.playerBullets.push(b);
      }
    } else {
      var bullet = scene.add.sprite(scene.playerSprite.x, scene.playerSprite.y - 16, "game_asset", frameKey);
      bullet.setOrigin(0.5);
      bullet.setDepth(50);
      bullet.setData("damage", shootData.damage);
      bullet.setData("hp", shootData.hp);
      bullet.setData("angle", 0);
      bullet.setData("bulletId", scene.bulletIdCnt++);
      bullet.setRotation(-Math.PI / 2);
      if (scene.shootMode === "big") {
        bullet.setScale(1.5);
      }
      attachAnim(bullet, frames, frameRate);
      scene.playerBullets.push(bullet);
    }
    scene.playSound("se_shoot", 0.3);
  }
  function updatePlayerBullets(scene, step) {
    var stepMs = step || 0;
    for (var b = scene.playerBullets.length - 1; b >= 0; b--) {
      var bullet = scene.playerBullets[b];
      if (!bullet.active) {
        scene.playerBullets.splice(b, 1);
        continue;
      }
      var tintTimer = bullet.getData("_tintTimer") || 0;
      if (tintTimer > 0) {
        tintTimer--;
        bullet.setData("_tintTimer", tintTimer);
        if (tintTimer <= 0) {
          bullet.clearTint();
        }
      }
      var bFrames = bullet.getData("frames");
      if (bFrames && bFrames.length > 1 && stepMs > 0) {
        var bRate = bullet.getData("frameRate") || 6;
        var bThreshold = 1e3 / bRate;
        var bTimer = (bullet.getData("animTimer") || 0) + stepMs;
        while (bTimer >= bThreshold) {
          bTimer -= bThreshold;
          var bIdx = ((bullet.getData("animIdx") || 0) + 1) % bFrames.length;
          bullet.setData("animIdx", bIdx);
          try {
            bullet.setFrame(bFrames[bIdx]);
          } catch (e) {
          }
        }
        bullet.setData("animTimer", bTimer);
      }
      var angle = bullet.getData("angle") || 0;
      bullet.y -= 3.5;
      bullet.x += angle * 3.5;
      if (bullet.y < -20) {
        bullet.destroy();
        scene.playerBullets.splice(b, 1);
      }
    }
  }

  // ../2019-es7/src/phaser/effects/Explosions.js
  var GW4 = GAME_DIMENSIONS.WIDTH;
  var GH3 = GAME_DIMENSIONS.HEIGHT;
  function showExplosion(scene, x, y) {
    if (!scene.anims.exists("explosion_anim")) {
      scene.anims.create({
        key: "explosion_anim",
        frames: scene.anims.generateFrameNames("game_asset", {
          prefix: "explosion",
          start: 0,
          end: 6,
          zeroPad: 2,
          suffix: ".gif"
        }),
        frameRate: 18,
        //48,
        repeat: 0
      });
    }
    var ex = scene.add.sprite(x, y, "game_asset", "explosion00.gif");
    ex.setOrigin(0.5);
    ex.setDepth(60);
    ex.play("explosion_anim");
    ex.once("animationcomplete", function() {
      ex.destroy();
    });
  }
  function spExplosions(scene) {
    if (!scene.anims.exists("sp_explosion_anim")) {
      scene.anims.create({
        key: "sp_explosion_anim",
        frames: scene.anims.generateFrameNames("game_asset", {
          prefix: "spExplosion",
          start: 0,
          end: 7,
          zeroPad: 2,
          suffix: ".gif"
        }),
        frameRate: 24,
        repeat: 0
      });
    }
    for (var n = 0; n < 64; n++) {
      (function(idx) {
        scene.time.delayedCall(10 * idx, function() {
          var col = idx % 8;
          var row = Math.floor(idx / 8);
          var startX = row % 2 === 0 ? -30 : -45;
          var x = startX + col * 30;
          var y = GH3 - 45 * (row + 1) - 120;
          if (x < 0) x += GW4;
          if (x > GW4) x -= GW4;
          var explosion = scene.add.sprite(x, y, "game_asset", "spExplosion00.gif");
          explosion.setOrigin(0.5);
          explosion.setDepth(140);
          explosion.play("sp_explosion_anim");
          explosion.once("animationcomplete", function() {
            explosion.destroy();
          });
          if (idx % 16 === 0) {
            scene.playSound("se_sp_explosion", 0.15);
          }
        });
      })(n);
    }
  }
  function showHitImpact(scene, x, y, isGuard) {
    var animKey = isGuard ? "guard_impact_anim" : "hit_impact_anim";
    if (!scene.anims.exists(animKey)) {
      var prefix = isGuard ? "guard" : "hit";
      scene.anims.create({
        key: animKey,
        frames: scene.anims.generateFrameNames("game_asset", {
          prefix,
          start: 0,
          end: 4,
          suffix: ".gif"
        }),
        frameRate: 48,
        repeat: 0
      });
    }
    var frameKey = isGuard ? "guard0.gif" : "hit0.gif";
    var impact = scene.add.sprite(x, y - 10, "game_asset", frameKey);
    impact.setOrigin(0.5);
    impact.setDepth(60);
    impact.setScale(1.2);
    impact.play(animKey);
    impact.once("animationcomplete", function() {
      impact.destroy();
    });
  }
  function flashEnemyTint(scene, enemy) {
    if (!enemy || !enemy.active) return;
    var existing = enemy.getData("_tintTween");
    if (existing) existing.stop();
    enemy.setTint(16744576);
    var tw = scene.tweens.addCounter({
      from: 0,
      to: 1,
      duration: 100,
      delay: 100,
      onComplete: function() {
        if (enemy && enemy.active) {
          enemy.clearTint();
          enemy.setData("_tintTween", null);
        }
      }
    });
    enemy.setData("_tintTween", tw);
  }
  function flashBossTint(scene, boss) {
    if (!boss || !boss.active) return;
    var existing = boss.getData("_tintTween");
    if (existing) existing.stop();
    boss.setTint(16744576);
    var tw = scene.tweens.addCounter({
      from: 0,
      to: 1,
      duration: 100,
      delay: 200,
      onComplete: function() {
        if (boss && boss.active) {
          boss.clearTint();
          boss.setData("_tintTween", null);
        }
      }
    });
    boss.setData("_tintTween", tw);
  }
  function showBossExplosion(scene, x, y) {
    if (!scene.anims.exists("boss_explosion_anim")) {
      scene.anims.create({
        key: "boss_explosion_anim",
        frames: scene.anims.generateFrameNames("game_asset", {
          prefix: "explosion",
          start: 0,
          end: 6,
          zeroPad: 2,
          suffix: ".gif"
        }),
        frameRate: 18,
        repeat: 0
      });
    }
    var ex = scene.add.sprite(x, y, "game_asset", "explosion00.gif");
    ex.setOrigin(0.5);
    ex.setDepth(60);
    ex.play("boss_explosion_anim");
    ex.once("animationcomplete", function() {
      ex.destroy();
    });
  }

  // ../2019-es7/src/phaser/bosses/BossBison.js
  var GW5 = GAME_DIMENSIONS.WIDTH;
  var GH4 = GAME_DIMENSIONS.HEIGHT;

  // ../2019-es7/src/phaser/bosses/BossBarlog.js
  var GW6 = GAME_DIMENSIONS.WIDTH;
  var GH5 = GAME_DIMENSIONS.HEIGHT;
  function clamp2(v, lo, hi) {
    return v < lo ? lo : v > hi ? hi : v;
  }
  function bossPatternBarlog(scene, seed) {
    var boss = scene.bossSprite;
    var baseY = scene.bossBaseY || GH5 / 4;
    var diveY = GH5 - 40;
    if (seed < 0.3) {
      var rx = clamp2(Math.random() * GW6, 30, GW6 - 30);
      var ry = clamp2(60 + Math.random() * 120, 60, 200);
      scene.tweens.add({
        targets: boss,
        x: rx,
        y: ry,
        duration: 600,
        onComplete: function() {
          if (!scene._bossAlive()) return;
          scene.bossShootStraight(scene.bossProjData);
          scene.time.delayedCall(600, function() {
            scene.bossShootStart();
          });
        }
      });
    } else if (seed < 0.8) {
      var px = clamp2(scene.playerSprite.x, 30, GW6 - 30);
      scene.tweens.add({
        targets: boss,
        x: px,
        duration: 300,
        onComplete: function() {
          if (!scene._bossAlive()) return;
          scene.time.delayedCall(400, function() {
            if (!scene._bossAlive()) return;
            scene.bossShootStraight(scene.bossProjData);
            scene.time.delayedCall(500, function() {
              scene.bossShootStart();
            });
          });
        }
      });
    } else {
      var px2 = clamp2(scene.playerSprite.x, 30, GW6 - 30);
      scene.tweens.add({
        targets: boss,
        x: px2,
        duration: 500,
        onComplete: function() {
          if (!scene._bossAlive()) return;
          scene.bossShootStraight(scene.bossProjData);
          scene.tweens.add({
            targets: boss,
            y: baseY - 70,
            duration: 300,
            onComplete: function() {
              if (!scene._bossAlive()) return;
              scene.tweens.add({
                targets: boss,
                y: diveY,
                duration: 600,
                onComplete: function() {
                  if (!scene._bossAlive()) return;
                  scene.tweens.add({
                    targets: boss,
                    y: baseY,
                    duration: 200,
                    onComplete: function() {
                      scene.time.delayedCall(500, function() {
                        scene.bossShootStart();
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
  }

  // ../2019-es7/src/phaser/bosses/BossSagat.js
  var GW7 = GAME_DIMENSIONS.WIDTH;
  var GH6 = GAME_DIMENSIONS.HEIGHT;
  function clamp3(v, lo, hi) {
    return v < lo ? lo : v > hi ? hi : v;
  }
  function bossPatternSagat(scene, seed) {
    var boss = scene.bossSprite;
    var baseY = scene.bossBaseY || GH6 / 4;
    var diveY = GH6 - 40;
    var projA = scene.bossProjDataA || scene.bossProjData;
    var projB = scene.bossProjDataB || scene.bossProjData;
    if (seed < 0.3) {
      var positions = [-20, 10, 50, 100, 150, 200];
      var pi = 0;
      var sweepStep = function() {
        if (!scene._bossAlive() || pi >= positions.length) {
          if (scene._bossAlive()) {
            scene.time.delayedCall(500, function() {
              scene.bossShootStart();
            });
          }
          return;
        }
        var px = clamp3(positions[pi], 20, GW7 - 20);
        pi++;
        scene.tweens.add({
          targets: boss,
          x: px,
          duration: 250,
          onComplete: function() {
            if (!scene._bossAlive()) return;
            scene.bossShootStraight(projA);
            scene.time.delayedCall(250, sweepStep);
          }
        });
      };
      sweepStep();
    } else if (seed < 0.6) {
      var px3 = clamp3(Math.random() * GW7, 30, GW7 - 30);
      scene.tweens.add({
        targets: boss,
        x: px3,
        duration: 250,
        onComplete: function() {
          if (!scene._bossAlive()) return;
          var shotCount = 0;
          scene.time.addEvent({
            delay: 200,
            repeat: 6,
            callback: function() {
              if (!scene._bossAlive()) return;
              scene.bossShootStraight(projA);
              shotCount++;
              if (shotCount >= 7) {
                scene.time.delayedCall(500, function() {
                  scene.bossShootStart();
                });
              }
            }
          });
        }
      });
    } else if (seed < 0.8) {
      var px4 = clamp3(Math.random() * GW7, 30, GW7 - 30);
      scene.tweens.add({
        targets: boss,
        x: px4,
        duration: 250,
        onComplete: function() {
          if (!scene._bossAlive()) return;
          scene.time.delayedCall(500, function() {
            if (!scene._bossAlive()) return;
            scene.bossShootStraight(projB);
            scene.time.delayedCall(800, function() {
              scene.bossShootStart();
            });
          });
        }
      });
    } else {
      var px5 = clamp3(scene.playerSprite.x, 30, GW7 - 30);
      scene.tweens.add({
        targets: boss,
        x: px5,
        y: baseY - 20,
        duration: 400,
        onComplete: function() {
          if (!scene._bossAlive()) return;
          scene.bossShootStraight(projA);
          scene.time.delayedCall(500, function() {
            if (!scene._bossAlive()) return;
            scene.tweens.add({
              targets: boss,
              y: diveY,
              duration: 300,
              onComplete: function() {
                if (!scene._bossAlive()) return;
                scene.tweens.add({
                  targets: boss,
                  y: baseY,
                  duration: 200,
                  onComplete: function() {
                    scene.time.delayedCall(400, function() {
                      scene.bossShootStart();
                    });
                  }
                });
              }
            });
          });
        }
      });
    }
  }

  // ../2019-es7/src/phaser/bosses/BossVega.js
  var GW8 = GAME_DIMENSIONS.WIDTH;
  var GH7 = GAME_DIMENSIONS.HEIGHT;
  var GCX2 = GAME_DIMENSIONS.CENTER_X;
  function clamp4(v, lo, hi) {
    return v < lo ? lo : v > hi ? hi : v;
  }
  function _setBossAnim(scene, boss, frames) {
    if (!frames || frames.length === 0 || !boss || !boss.active) return;
    boss.setData("frames", frames);
    boss.setData("animIdx", 0);
    boss.setData("animTimer", 0);
    try {
      boss.setFrame(frames[0]);
    } catch (e) {
    }
    var shadow = boss.getData("shadow");
    if (shadow && shadow.active) {
      try {
        shadow.setFrame(frames[0]);
      } catch (e) {
      }
    }
  }
  function bossPatternVega(scene, seed) {
    var boss = scene.bossSprite;
    var baseY = scene.bossBaseY || GH7 / 4;
    var diveY = GH7 - 20;
    var projA = scene.bossProjDataA || scene.bossProjData;
    var projB = scene.bossProjDataB || scene.bossProjData;
    if (seed < 0.1) {
      var warpPositions = [
        30,
        GW8 - 30,
        clamp4(Math.random() * GW8, 30, GW8 - 30)
      ];
      var wi = 0;
      scene.playSound("boss_vega_voice_warp", 0.7);
      var warpStep = function() {
        if (!scene._bossAlive() || wi >= warpPositions.length) {
          if (scene._bossAlive()) {
            scene.time.delayedCall(500, function() {
              scene.bossShootStart();
            });
          }
          return;
        }
        scene.tweens.add({
          targets: boss,
          alpha: 0,
          duration: 100,
          onComplete: function() {
            if (!scene._bossAlive()) return;
            boss.x = warpPositions[wi++];
            scene.tweens.add({
              targets: boss,
              alpha: 1,
              duration: 100,
              onComplete: function() {
                scene.time.delayedCall(200, warpStep);
              }
            });
          }
        });
      };
      warpStep();
    } else if (seed < 0.4) {
      var shotPositions = [30, GW8 - 60, 50, GCX2, GW8 - 40, 60, GCX2];
      var si = 0;
      var psychoStep = function() {
        if (!scene._bossAlive() || si >= shotPositions.length) {
          if (scene._bossAlive()) {
            scene.time.delayedCall(800, function() {
              scene.bossShootStart();
            });
          }
          return;
        }
        scene.tweens.add({
          targets: boss,
          alpha: 0,
          duration: 100,
          onComplete: function() {
            if (!scene._bossAlive()) return;
            boss.x = shotPositions[si];
            if (si === 0 || si === 3 || si === 6) {
              scene.playSound("boss_vega_voice_projectile", 0.7);
            }
            si++;
            scene.tweens.add({
              targets: boss,
              alpha: 1,
              duration: 100,
              onComplete: function() {
                if (!scene._bossAlive()) return;
                scene.bossShootAimed(projA);
                scene.time.delayedCall(300, psychoStep);
              }
            });
          }
        });
      };
      psychoStep();
    } else if (seed < 0.7) {
      scene.tweens.add({
        targets: boss,
        x: GCX2,
        y: baseY + 10,
        duration: 300,
        onComplete: function() {
          if (!scene._bossAlive()) return;
          _setBossAnim(scene, boss, scene.vegaAnimShoot);
          scene.playSound("boss_vega_voice_shoot", 0.7);
          var fieldCount = 0;
          scene.time.delayedCall(500, function fireField() {
            if (!scene._bossAlive()) return;
            scene.bossShootRadial(projB, 12);
            fieldCount++;
            if (fieldCount >= 5) {
              _setBossAnim(scene, boss, scene.vegaAnimIdle);
              scene.time.delayedCall(800, function() {
                scene.bossShootStart();
              });
            } else {
              scene.time.delayedCall(1e3, fireField);
            }
          });
        }
      });
    } else {
      var px6 = clamp4(scene.playerSprite.x, 30, GW8 - 30);
      scene.tweens.add({
        targets: boss,
        alpha: 0,
        duration: 100,
        onComplete: function() {
          if (!scene._bossAlive()) return;
          boss.x = px6;
          scene.tweens.add({
            targets: boss,
            alpha: 1,
            y: baseY - 20,
            duration: 200,
            onComplete: function() {
              if (!scene._bossAlive()) return;
              _setBossAnim(scene, boss, scene.vegaAnimAttack);
              scene.playSound("boss_vega_voice_crusher", 0.7);
              scene.bossShootSpread(projA, 3, 30);
              scene.tweens.add({
                targets: boss,
                y: diveY,
                duration: 900,
                onComplete: function() {
                  if (!scene._bossAlive()) return;
                  _setBossAnim(scene, boss, scene.vegaAnimIdle);
                  boss.x = GCX2;
                  boss.y = -50;
                  scene.tweens.add({
                    targets: boss,
                    y: baseY,
                    duration: 1e3,
                    onComplete: function() {
                      scene.time.delayedCall(500, function() {
                        scene.bossShootStart();
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
  }

  // ../2019-es7/src/phaser/bosses/BossFang.js
  var GW9 = GAME_DIMENSIONS.WIDTH;
  function clamp5(v, lo, hi) {
    return v < lo ? lo : v > hi ? hi : v;
  }
  function _setBossAnim2(scene, boss, frames) {
    if (!frames || frames.length === 0 || !boss || !boss.active) return;
    boss.setData("frames", frames);
    boss.setData("animIdx", 0);
    boss.setData("animTimer", 0);
    try {
      boss.setFrame(frames[0]);
    } catch (e) {
    }
    var shadow = boss.getData("shadow");
    if (shadow && shadow.active) {
      try {
        shadow.setFrame(frames[0]);
      } catch (e) {
      }
    }
  }
  function bossPatternFang(scene, seed) {
    var boss = scene.bossSprite;
    var projA = scene.bossProjDataA || scene.bossProjData;
    var projB = scene.bossProjDataB || scene.bossProjData;
    var projC = scene.bossProjDataC || scene.bossProjData;
    if (seed < 0.3) {
      var beamAngles = [105, 90, 75];
      var beamIdx = 0;
      _setBossAnim2(scene, boss, scene.fangAnimCharge);
      scene.time.delayedCall(500, function beamStep() {
        if (!scene._bossAlive() || beamIdx >= 3) {
          if (scene._bossAlive()) {
            _setBossAnim2(scene, boss, scene.fangAnimIdle);
            scene.time.delayedCall(1e3, function() {
              scene.bossShootStart();
            });
          }
          return;
        }
        _setBossAnim2(scene, boss, scene.fangAnimShoot);
        scene.playSound("boss_fang_voice_beam0", 0.7);
        scene.bossShootBeam(projA, beamAngles[beamIdx]);
        beamIdx++;
        scene.time.delayedCall(500, beamStep);
      });
    } else if (seed < 0.7) {
      scene.bossShootRadial(projC || projA, 8);
      scene.time.delayedCall(1500, function() {
        scene.bossShootStart();
      });
    } else {
      var smokeCount = 0;
      var smokeTotal = 12;
      scene.time.addEvent({
        delay: 300,
        repeat: smokeTotal - 1,
        callback: function() {
          if (!scene._bossAlive()) return;
          boss.x = clamp5(boss.x + (Math.random() - 0.5) * 20, 30, GW9 - 30);
          scene.bossShootAimed(projB || projA);
          smokeCount++;
          if (smokeCount >= smokeTotal) {
            scene.time.delayedCall(1e3, function() {
              scene.bossShootStart();
            });
          }
        }
      });
    }
  }

  // ../2019-es7/src/phaser/bosses/BossGoki.js
  var GW10 = GAME_DIMENSIONS.WIDTH;
  var GH8 = GAME_DIMENSIONS.HEIGHT;
  function clamp6(v, lo, hi) {
    return v < lo ? lo : v > hi ? hi : v;
  }
  function _setBossAnim3(scene, boss, frames) {
    if (!frames || frames.length === 0 || !boss || !boss.active) return;
    boss.setData("frames", frames);
    boss.setData("animIdx", 0);
    boss.setData("animTimer", 0);
    try {
      boss.setFrame(frames[0]);
    } catch (e) {
    }
    var shadow = boss.getData("shadow");
    if (shadow && shadow.active) {
      try {
        shadow.setFrame(frames[0]);
      } catch (e) {
      }
    }
  }
  function bossPatternGoki(scene, seed) {
    var boss = scene.bossSprite;
    var projA = scene.bossProjDataA || scene.bossProjData;
    var projB = scene.bossProjDataB || scene.bossProjData;
    if (seed < 0.35) {
      var px = clamp6(scene.playerSprite.x, 30, GW10 - 30);
      scene.tweens.add({
        targets: boss,
        x: px,
        duration: 400,
        onComplete: function() {
          if (!scene._bossAlive()) return;
          var volleys = 0;
          var shootStep = function() {
            if (!scene._bossAlive() || volleys >= 6) {
              if (scene._bossAlive()) {
                _setBossAnim3(scene, boss, scene.gokiAnimIdle);
                scene.time.delayedCall(300, function() {
                  scene.bossShootStart();
                });
              }
              return;
            }
            _setBossAnim3(scene, boss, scene.gokiAnimShootA);
            if (volleys % 2 === 0) {
              scene.playSound("boss_goki_voice_projectile0", 0.7);
            }
            volleys++;
            scene.time.delayedCall(200, function() {
              if (!scene._bossAlive()) return;
              scene.bossShootStraight(projA);
              scene.time.delayedCall(120, shootStep);
            });
          };
          shootStep();
        }
      });
    } else if (seed < 0.65) {
      var px2 = clamp6(scene.playerSprite.x, 30, GW10 - 30);
      scene.tweens.add({
        targets: boss,
        x: px2,
        duration: 400,
        onComplete: function() {
          if (!scene._bossAlive()) return;
          _setBossAnim3(scene, boss, scene.gokiAnimShootB);
          scene.playSound("boss_goki_voice_projectile1", 0.7);
          scene.time.delayedCall(500, function() {
            if (!scene._bossAlive()) return;
            scene.bossShootStraight(projB);
            scene.time.delayedCall(800, function() {
              _setBossAnim3(scene, boss, scene.gokiAnimIdle);
              scene.bossShootStart();
            });
          });
        }
      });
    } else if (seed < 0.9) {
      _setBossAnim3(scene, boss, scene.gokiAnimSyngoku);
      scene.playSound("boss_goki_voice_ashura", 0.7);
      scene.tweens.add({
        targets: boss,
        y: GH8 - 20,
        duration: 1200,
        onComplete: function() {
          if (!scene._bossAlive()) return;
          var nx = Math.random() * (GW10 - 60) + 30;
          boss.x = nx;
          boss.y = -50;
          scene.tweens.add({
            targets: boss,
            y: scene.bossBaseY || GH8 / 4,
            duration: 700,
            onComplete: function() {
              _setBossAnim3(scene, boss, scene.gokiAnimIdle);
              scene.time.delayedCall(300, function() {
                scene.bossShootStart();
              });
            }
          });
        }
      });
    } else {
      _setBossAnim3(scene, boss, scene.gokiAnimSyngoku);
      scene.playSound("boss_goki_voice_ashura", 0.7);
      var nx2 = Math.random() * (GW10 - 60) + 30;
      var ny = Math.random() > 0.5 ? 60 : scene.bossBaseY || GH8 / 4;
      scene.tweens.add({
        targets: boss,
        x: nx2,
        y: ny,
        duration: 700,
        onComplete: function() {
          _setBossAnim3(scene, boss, scene.gokiAnimIdle);
          scene.time.delayedCall(300, function() {
            scene.bossShootStart();
          });
        }
      });
    }
  }

  // ../2019-es7/src/phaser/bosses/BossPyramid.js
  var GW11 = GAME_DIMENSIONS.WIDTH;
  var GH9 = GAME_DIMENSIONS.HEIGHT;
  var GCX3 = GAME_DIMENSIONS.CENTER_X;
  function _setBossAnim4(scene, boss, frames) {
    if (!frames || frames.length === 0 || !boss || !boss.active) return;
    boss.setData("frames", frames);
    boss.setData("animIdx", 0);
    boss.setData("animTimer", 0);
    try {
      boss.setFrame(frames[0]);
    } catch (e) {
    }
    var shadow = boss.getData("shadow");
    if (shadow && shadow.active) {
      try {
        shadow.setFrame(frames[0]);
      } catch (e) {
      }
    }
  }
  function bossPatternPyramid(scene, seed) {
    var boss = scene.bossSprite;
    var baseY = scene.bossBaseY || GH9 / 4;
    var projA = scene.bossProjDataA || scene.bossProjData;
    var projB = scene.bossProjDataB || scene.bossProjData;
    var halfW = boss.width / 2;
    var animIdle = scene.pyramidAnimIdle || [];
    var animAttack = scene.pyramidAnimAttack && scene.pyramidAnimAttack.length ? scene.pyramidAnimAttack : animIdle;
    var animShoot = scene.pyramidAnimShoot && scene.pyramidAnimShoot.length ? scene.pyramidAnimShoot : animIdle;
    var animWarp = scene.pyramidAnimWarp && scene.pyramidAnimWarp.length ? scene.pyramidAnimWarp : animIdle;
    if (seed < 0.1) {
      _setBossAnim4(scene, boss, animWarp);
      var warpPositions = [
        0 + halfW,
        GW11 - boss.width + halfW,
        Math.floor(Math.random() * (GW11 - boss.width)) + halfW
      ];
      var wi = 0;
      var warpStep = function() {
        if (!scene._bossAlive() || wi >= warpPositions.length) {
          if (scene._bossAlive()) {
            _setBossAnim4(scene, boss, animIdle);
            scene.time.delayedCall(500, function() {
              scene.bossShootStart();
            });
          }
          return;
        }
        boss.x = warpPositions[wi++];
        warpStep();
      };
      warpStep();
    } else if (seed < 0.4) {
      _setBossAnim4(scene, boss, animShoot);
      var shotPositions = [
        0 + halfW,
        160 + halfW,
        16 + halfW,
        128 + halfW,
        32 + halfW,
        96 + halfW,
        GCX3
      ];
      for (var si = 0; si < shotPositions.length; si++) {
        boss.x = shotPositions[si];
        scene.bossShootStraight(projA);
      }
      boss.x = GCX3;
      scene.time.delayedCall(4e3, function() {
        if (!scene._bossAlive()) return;
        _setBossAnim4(scene, boss, animIdle);
        scene.bossShootStart();
      });
    } else if (seed < 0.7) {
      scene.tweens.add({
        targets: boss,
        x: GCX3,
        y: baseY + 10,
        duration: 300,
        onComplete: function() {
          if (!scene._bossAlive()) return;
          _setBossAnim4(scene, boss, animShoot);
          var fieldCount = 0;
          scene.time.delayedCall(800, function fireField() {
            if (!scene._bossAlive()) return;
            scene.bossShootRadial(projB, 72);
            fieldCount++;
            if (fieldCount >= 5) {
              _setBossAnim4(scene, boss, animIdle);
              scene.time.delayedCall(3e3, function() {
                scene.bossShootStart();
              });
            } else {
              scene.time.delayedCall(1e3, fireField);
            }
          });
        }
      });
    } else {
      var px = scene.playerSprite.x;
      boss.x = px;
      _setBossAnim4(scene, boss, animAttack);
      scene.tweens.add({
        targets: boss,
        y: baseY - 20,
        duration: 200,
        onComplete: function() {
          if (!scene._bossAlive()) return;
          scene.tweens.add({
            targets: boss,
            y: GH9 - 15,
            duration: 900,
            onComplete: function() {
              if (!scene._bossAlive()) return;
              _setBossAnim4(scene, boss, animIdle);
              boss.x = GCX3;
              boss.y = -boss.height;
              scene.tweens.add({
                targets: boss,
                y: baseY,
                duration: 1e3,
                onComplete: function() {
                  scene.time.delayedCall(1e3, function() {
                    scene.bossShootStart();
                  });
                }
              });
            }
          });
        }
      });
    }
  }

  // ../2019-es7/src/phaser/game-objects/Boss.js
  var GW12 = GAME_DIMENSIONS.WIDTH;
  var GH10 = GAME_DIMENSIONS.HEIGHT;
  var GCX4 = GAME_DIMENSIONS.CENTER_X;
  var GCY = GAME_DIMENSIONS.CENTER_Y;
  var BOSS_BALLOON_OFFSETS = [
    { x: 0, y: 20 },
    // bison
    { x: 30, y: 20 },
    // barlog
    { x: 0, y: 0 },
    // sagat (no offset set in original)
    { x: 0, y: 15 },
    // vega
    { x: 70, y: 40 }
    // fang
  ];
  var GOKI_BALLOON_OFFSET = { x: 5, y: 20 };
  function bossAdd(scene) {
    if (scene.bossActive) return;
    scene.bossActive = true;
    scene.bossReached = true;
    scene.bossEntering = true;
    scene.enemyWaveFlg = false;
    var stageId = gameState.stageId || 0;
    scene.bossStageId = stageId;
    scene.gokiFlg = false;
    scene.bossIsGoki = false;
    var isGokiStage = stageId === 3 && Number(gameState.continueCnt || 0) === 0 || gameState.forceBossName === "goki" && stageId === 3;
    if (isGokiStage) {
      scene.gokiFlg = true;
    }
    var bossData = scene.recipe.bossData ? scene.recipe.bossData["boss" + String(stageId)] : null;
    if (!bossData) {
      scene.stageClear();
      return;
    }
    scene.bossHp = bossData.hp || 100;
    scene.bossMaxHp = scene.bossHp;
    scene.bossScore = bossData.score || 5e3;
    scene.bossInterval = bossData.interval || 60;
    scene.bossIntervalCnt = 0;
    scene.bossIntervalCounter = 0;
    scene.bossName = bossData.name || "boss";
    scene.bossProjCnt = 0;
    scene.bossProjDataA = bossData.bulletDataA || bossData.projectileDataA || null;
    scene.bossProjDataB = bossData.bulletDataB || bossData.projectileDataB || null;
    scene.bossProjDataC = bossData.bulletDataC || bossData.projectileDataC || null;
    scene.bossProjData = bossData.bulletData || bossData.projectileData || scene.bossProjDataA;
    triggerHaptic("bossEnter");
    var bossFrames = bossData.anim && bossData.anim.idle || bossData.texture || [];
    var bossFrame = bossFrames[0] || "bison_idle0.gif";
    scene.bossSprite = scene.add.sprite(GCX4, -50, "game_asset", bossFrame);
    scene.bossSprite.setOrigin(0.5);
    scene.bossSprite.setDepth(45);
    scene.bossSprite.setData("type", "boss");
    scene.bossSprite.setData("hp", scene.bossHp);
    scene.bossSprite.setData("frames", bossFrames);
    scene.bossSprite.setData("animIdx", 0);
    scene.bossSprite.setData("animTimer", 0);
    scene.bossSprite.setData("projData", scene.bossProjData);
    scene.bossSprite.setData("score", scene.bossScore);
    scene.bossSprite.setData("spgage", bossData.spgage || 5);
    var bossShadowReverse = bossData.shadowReverse !== false;
    var bossShadowOffsetY = bossData.shadowOffsetY || 10;
    scene.bossShadow = createShadow(scene, scene.bossSprite, bossFrame, bossShadowReverse, bossShadowOffsetY);
    scene.bossSprite.setData("shadow", scene.bossShadow);
    if (stageId === 3 && bossData.anim) {
      scene.vegaAnimIdle = bossData.anim.idle || [];
      scene.vegaAnimShoot = bossData.anim.shoot || [];
      scene.vegaAnimAttack = bossData.anim.attack || [];
    }
    if (stageId === 4 && bossData.anim) {
      scene.fangAnimIdle = bossData.anim.idle || [];
      scene.fangAnimWait = bossData.anim.wait || [];
      scene.fangAnimCharge = bossData.anim.charge || [];
      scene.fangAnimShoot = bossData.anim.shoot || [];
    }
    if (bossData.anim) {
      scene.pyramidAnimIdle = bossData.anim.idle || [];
      scene.pyramidAnimAttack = bossData.anim.attack || [];
      scene.pyramidAnimShoot = bossData.anim.shoot || [];
      scene.pyramidAnimWarp = bossData.anim.warp || [];
    }
    scene.enemies.push(scene.bossSprite);
    var bossNames = ["bison", "barlog", "sagat", "vega", "fang"];
    var voiceKey = "boss_" + (bossNames[stageId] || "bison") + "_voice_add";
    scene.playSound(voiceKey, 0.7);
    var pixiRestY = stageId === 4 ? 48 : GH10 / 4;
    var entryY = pixiRestY + scene.bossSprite.height / 2;
    scene.bossBaseY = entryY;
    scene.tweens.add({
      targets: scene.bossSprite,
      y: entryY,
      duration: 2e3,
      ease: "Quint.easeOut",
      onComplete: function() {
        scene.bossEntering = false;
        scene.bossTimerCountDown = 99;
        scene.bossTimerFrameCnt = 0;
        if (scene.gokiFlg) {
          scene.time.delayedCall(1500, function() {
            _startGokiSequence(scene);
          });
        } else {
          scene.time.delayedCall(1500, function() {
            bossShootStart(scene);
          });
        }
        scene.time.delayedCall(3e3, function() {
          scene.bossTimerStartFlg = true;
          scene.bossTimerLabel.setVisible(true);
          scene.bossTimerNum.container.setVisible(true);
          scene.spBtn.setAlpha(1);
        });
      }
    });
    scene.stageEndBg.setVisible(true);
    scene.bossAppearBgFlg = true;
    scene.bossAppearBgScroll = 0;
  }
  function _startGokiSequence(scene) {
    scene.theWorldFlg = true;
    scene.spBtn.setAlpha(0);
    for (var pb = scene.playerBullets.length - 1; pb >= 0; pb--) {
      if (scene.playerBullets[pb] && scene.playerBullets[pb].active) {
        scene.playerBullets[pb].destroy();
      }
    }
    scene.playerBullets = [];
    var preBoss = scene.bossSprite;
    var gokiData = scene.recipe.bossData ? scene.recipe.bossData.bossExtra : null;
    if (!gokiData) {
      scene.gokiFlg = false;
      bossShootStart(scene);
      return;
    }
    var gokiFrames = gokiData.anim && gokiData.anim.idle || [];
    var gokiFrame = gokiFrames[0] || "goki_idle0.gif";
    var gokiSprite = scene.add.sprite(GW12 + 50, GH10 / 4, "game_asset", gokiFrame);
    gokiSprite.setOrigin(0.5);
    gokiSprite.setDepth(45);
    scene.playSound("boss_goki_voice_add", 0.7);
    scene.tweens.add({
      targets: gokiSprite,
      x: GCX4 + 30,
      duration: 1e3,
      onComplete: function() {
        scene.playSound("boss_goki_voice_syungokusatu0", 0.9);
        var blackout = scene.add.rectangle(GCX4, GCY, GW12, GH10, 0);
        blackout.setDepth(200);
        var flash = scene.add.rectangle(GCX4, GCY, GW12, GH10, 16777215);
        flash.setDepth(201);
        flash.setAlpha(0);
        var bossX = preBoss.x;
        var bossY = preBoss.y;
        var bossW = preBoss.width || 80;
        var bossH = (preBoss.height || 80) / 2;
        var hitCount = 0;
        scene.time.addEvent({
          delay: 50,
          repeat: 9,
          callback: function() {
            scene.playSound("se_damage", 0.3);
            var hx = bossX + Math.random() * bossW - bossW / 2;
            var hy = bossY + Math.random() * bossH - bossH / 2;
            showHitImpact(scene, hx, hy, false);
            flash.setAlpha(0.2);
            scene.time.delayedCall(60, function() {
              flash.setAlpha(0);
            });
            hitCount++;
          }
        });
        scene.time.delayedCall(1200, function() {
          scene.playSound("boss_goki_voice_syungokusatu1", 0.9);
          scene.tweens.add({
            targets: blackout,
            alpha: 0,
            duration: 300,
            onComplete: function() {
              blackout.destroy();
              flash.destroy();
            }
          });
          if (scene.bossShadow && scene.bossShadow.active) {
            scene.bossShadow.destroy();
          }
          var idx = scene.enemies.indexOf(preBoss);
          if (idx >= 0) scene.enemies.splice(idx, 1);
          if (preBoss.dangerBalloon && preBoss.dangerBalloon.active) {
            preBoss.dangerBalloon.destroy();
          }
          preBoss.destroy();
          scene.bossSprite = gokiSprite;
          scene.bossSprite.setData("type", "boss");
          scene.bossIsGoki = true;
          scene.bossStageId = 3;
          scene.gokiFlg = false;
          scene.bossHp = gokiData.hp || 350;
          scene.bossMaxHp = scene.bossHp;
          scene.bossScore = gokiData.score || 8e3;
          scene.bossInterval = gokiData.interval || 200;
          scene.bossName = gokiData.name || "goki";
          scene.bossProjDataA = gokiData.bulletDataA || null;
          scene.bossProjDataB = gokiData.bulletDataB || null;
          scene.bossProjDataC = null;
          scene.bossProjData = scene.bossProjDataA;
          scene.bossSprite.setData("hp", scene.bossHp);
          scene.bossSprite.setData("frames", gokiFrames);
          scene.bossSprite.setData("animIdx", 0);
          scene.bossSprite.setData("animTimer", 0);
          scene.bossSprite.setData("projData", scene.bossProjData);
          scene.bossSprite.setData("score", scene.bossScore);
          scene.bossSprite.setData("spgage", gokiData.spgage || 30);
          scene.gokiAnimIdle = gokiData.anim && gokiData.anim.idle || [];
          scene.gokiAnimSyngoku = gokiData.anim && gokiData.anim.syngoku || [];
          scene.gokiAnimShootA = gokiData.anim && gokiData.anim.shootA || [];
          scene.gokiAnimShootB = gokiData.anim && gokiData.anim.shootB || [];
          scene.gokiAnimSyngokuFinish = gokiData.anim && gokiData.anim.syngokuFinish || [];
          scene.gokiAnimSyngokuFinishTen = gokiData.anim && gokiData.anim.syngokuFinishTen || [];
          if (scene.gokiAnimSyngoku.length > 0) {
            scene.bossSprite.setData("frames", scene.gokiAnimSyngoku);
            scene.bossSprite.setData("animIdx", 0);
            scene.bossSprite.setData("animTimer", 0);
            scene.bossSprite.setFrame(scene.gokiAnimSyngoku[0]);
          }
          var gokiShadowReverse = gokiData.shadowReverse !== false;
          var gokiShadowOffsetY = gokiData.shadowOffsetY || 10;
          scene.bossShadow = createShadow(scene, gokiSprite, gokiFrame, gokiShadowReverse, gokiShadowOffsetY);
          scene.bossSprite.setData("shadow", scene.bossShadow);
          scene.enemies.push(scene.bossSprite);
          scene.bossDangerShown = false;
          scene.bossHpBarBg.setVisible(false);
          scene.bossHpBarFg.setVisible(false);
          try {
            var oldBgm = scene.sound.get(scene.stageBgmName);
            if (oldBgm && oldBgm.isPlaying) oldBgm.stop();
          } catch (e) {
          }
          scene.stageBgmName = "boss_goki_bgm";
          scene.playBgm("boss_goki_bgm", 0.4);
          var gokiRestY = GH10 / 4 + gokiSprite.height / 2;
          scene.bossBaseY = gokiRestY;
          scene.tweens.add({
            targets: gokiSprite,
            x: GCX4,
            y: gokiRestY,
            duration: 1e3,
            onComplete: function() {
              scene.theWorldFlg = false;
              scene.spBtn.setAlpha(1);
              bossShootStart(scene);
            }
          });
        });
      }
    });
  }
  function _bossAlive(scene) {
    return scene.bossSprite && scene.bossSprite.active && !scene.stageCleared && !scene.playerDead;
  }
  function bossShootStart(scene) {
    if (!_bossAlive(scene) || scene.theWorldFlg) {
      if (scene.theWorldFlg && _bossAlive(scene)) {
        scene.time.delayedCall(500, function() {
          bossShootStart(scene);
        });
      }
      return;
    }
    var seed = Math.random();
    if (scene.bossIsGoki) {
      bossPatternGoki(scene, seed);
      return;
    }
    var patternKey = null;
    var currentBossData = scene.recipe.bossData ? scene.recipe.bossData["boss" + String(scene.bossStageId)] : null;
    if (currentBossData && currentBossData.attackPattern) {
      var m = currentBossData.attackPattern.match(/boss(\d+)/);
      if (m) patternKey = Number(m[1]);
    }
    var patternId = patternKey !== null ? patternKey : scene.bossStageId;
    switch (patternId) {
      case 0:
        bossPatternPyramid(scene, seed);
        break;
      case 1:
        bossPatternBarlog(scene, seed);
        break;
      case 2:
        bossPatternSagat(scene, seed);
        break;
      case 3:
        bossPatternVega(scene, seed);
        break;
      case 4:
        bossPatternFang(scene, seed);
        break;
      default:
        bossPatternPyramid(scene, seed);
        break;
    }
  }
  function bossShootStraight(scene, projData) {
    if (!projData || !scene.bossSprite) return;
    var frames = projData.texture || [];
    var frameKey = frames[0] || "normalProjectile0.gif";
    var speed = projData.speed || 1;
    var bullet = scene.add.sprite(scene.bossSprite.x, scene.bossSprite.y + 20, "game_asset", frameKey);
    bullet.setOrigin(0.5);
    bullet.setDepth(47);
    bullet.setData("speed", speed);
    bullet.setData("damage", projData.damage || 1);
    bullet.setData("hp", projData.hp || 1);
    bullet.setData("score", projData.score || 0);
    bullet.setData("spgage", projData.spgage || 0);
    bullet.setData("rotX", 0);
    bullet.setData("rotY", 1);
    if (frames.length > 1) {
      bullet.setData("frames", frames);
      bullet.setData("animIdx", 0);
      bullet.setData("animTimer", 0);
      if (projData.frameRate) bullet.setData("frameRate", projData.frameRate);
    }
    scene.enemyBullets.push(bullet);
  }
  function bossShootAimed(scene, projData) {
    if (!projData || !scene.bossSprite) return;
    var frames = projData.texture || [];
    var frameKey = frames[0] || "normalProjectile0.gif";
    var speed = projData.speed || 1;
    var bullet = scene.add.sprite(scene.bossSprite.x, scene.bossSprite.y + 20, "game_asset", frameKey);
    bullet.setOrigin(0.5);
    bullet.setDepth(47);
    bullet.setData("speed", speed);
    bullet.setData("damage", projData.damage || 1);
    bullet.setData("hp", projData.hp || 1);
    bullet.setData("score", projData.score || 0);
    bullet.setData("spgage", projData.spgage || 0);
    var dx = scene.playerSprite.x - scene.bossSprite.x;
    var dy = scene.playerSprite.y - scene.bossSprite.y;
    var dist = Math.sqrt(dx * dx + dy * dy) || 1;
    bullet.setData("rotX", dx / dist);
    bullet.setData("rotY", dy / dist);
    if (frames.length > 1) {
      bullet.setData("frames", frames);
      bullet.setData("animIdx", 0);
      bullet.setData("animTimer", 0);
      if (projData.frameRate) bullet.setData("frameRate", projData.frameRate);
    }
    scene.enemyBullets.push(bullet);
  }
  function bossShootBeam(scene, projData, degree) {
    if (!projData || !scene.bossSprite) return;
    var frames = projData.texture || [];
    var frameKey = frames[0] || "normalProjectile0.gif";
    var speed = projData.speed || 1;
    var rad = degree * Math.PI / 180;
    for (var i = 0; i < 2; i++) {
      var offsetX = i === 0 ? -10 : 10;
      var bullet = scene.add.sprite(scene.bossSprite.x + offsetX, scene.bossSprite.y + 20, "game_asset", frameKey);
      bullet.setOrigin(0.5);
      bullet.setDepth(47);
      bullet.setRotation(rad);
      bullet.setData("speed", speed);
      bullet.setData("damage", projData.damage || 1);
      bullet.setData("hp", projData.hp || 1);
      bullet.setData("score", projData.score || 0);
      bullet.setData("spgage", projData.spgage || 0);
      bullet.setData("rotX", Math.cos(rad));
      bullet.setData("rotY", Math.sin(rad));
      if (frames.length > 1) {
        bullet.setData("frames", frames);
        bullet.setData("animIdx", 0);
        bullet.setData("animTimer", 0);
      }
      scene.enemyBullets.push(bullet);
    }
  }
  function bossShootSpread(scene, projData, count, angleDeg) {
    if (!projData || !scene.bossSprite) return;
    var frames = projData.texture || [];
    var frameKey = frames[0] || "normalProjectile0.gif";
    var speed = projData.speed || 1;
    var dx = scene.playerSprite.x - scene.bossSprite.x;
    var dy = scene.playerSprite.y - scene.bossSprite.y;
    var baseAngle = Math.atan2(dy, dx);
    var spreadRad = angleDeg * Math.PI / 180;
    var half = Math.floor(count / 2);
    for (var i = 0; i < count; i++) {
      var offset = (i - half) * (spreadRad / Math.max(count - 1, 1));
      var angle = baseAngle + offset;
      var bullet = scene.add.sprite(scene.bossSprite.x, scene.bossSprite.y + 20, "game_asset", frameKey);
      bullet.setOrigin(0.5);
      bullet.setDepth(47);
      bullet.setData("speed", speed);
      bullet.setData("damage", projData.damage || 1);
      bullet.setData("hp", projData.hp || 1);
      bullet.setData("score", projData.score || 0);
      bullet.setData("spgage", projData.spgage || 0);
      bullet.setData("rotX", Math.cos(angle));
      bullet.setData("rotY", Math.sin(angle));
      if (frames.length > 1) {
        bullet.setData("frames", frames);
        bullet.setData("animIdx", 0);
        bullet.setData("animTimer", 0);
      }
      scene.enemyBullets.push(bullet);
    }
  }
  function bossShootRadial(scene, projData, count) {
    if (!projData || !scene.bossSprite) return;
    var frames = projData.texture || [];
    var frameKey = frames[0] || "normalProjectile0.gif";
    var speed = (projData.speed || 1) * 0.8;
    for (var i = 0; i < count; i++) {
      var angle = i / count * Math.PI * 2;
      var bullet = scene.add.sprite(scene.bossSprite.x, scene.bossSprite.y, "game_asset", frameKey);
      bullet.setOrigin(0.5);
      bullet.setDepth(47);
      bullet.setData("speed", speed);
      bullet.setData("damage", projData.damage || 1);
      bullet.setData("hp", projData.hp || 1);
      bullet.setData("score", projData.score || 0);
      bullet.setData("spgage", projData.spgage || 0);
      bullet.setData("rotX", Math.cos(angle));
      bullet.setData("rotY", Math.sin(angle));
      if (frames.length > 1) {
        bullet.setData("frames", frames);
        bullet.setData("animIdx", 0);
        bullet.setData("animTimer", 0);
      }
      scene.enemyBullets.push(bullet);
    }
  }
  function checkBossDanger(scene) {
    if (scene.bossDangerShown || !scene.bossSprite || !scene.bossSprite.active) return;
    var spDamage = scene.recipe.playerData.spDamage || 50;
    if (scene.bossHp <= spDamage) {
      scene.bossDangerShown = true;
      triggerHaptic("warning");
      var stageId = scene.bossStageId || 0;
      var offsets = scene.bossIsGoki ? GOKI_BALLOON_OFFSET : BOSS_BALLOON_OFFSETS[stageId] || BOSS_BALLOON_OFFSETS[0];
      var relX = offsets.x - scene.bossSprite.width / 2;
      var relY = offsets.y - scene.bossSprite.height / 2;
      var dangerBalloon = scene.add.sprite(
        scene.bossSprite.x + relX,
        scene.bossSprite.y + relY,
        "game_asset",
        "boss_dengerous0.gif"
      );
      dangerBalloon.setOrigin(0, 1);
      dangerBalloon.setDepth(46);
      dangerBalloon.setScale(0);
      dangerBalloon.setData("relX", relX);
      dangerBalloon.setData("relY", relY);
      scene.bossSprite.dangerBalloon = dangerBalloon;
      scene.tweens.add({
        targets: dangerBalloon,
        scaleX: 1,
        scaleY: 1,
        duration: 1e3,
        ease: "Back.easeOut"
      });
      var dangerFrame = 0;
      scene.time.addEvent({
        delay: 250,
        loop: true,
        callback: function() {
          if (!dangerBalloon || !dangerBalloon.active) return;
          dangerFrame = (dangerFrame + 1) % 3;
          dangerBalloon.setFrame("boss_dengerous" + dangerFrame + ".gif");
        }
      });
    }
  }
  function syncBossVisuals(scene) {
    if (!scene.bossSprite || !scene.bossSprite.active) return;
    if (scene.bossShadow && scene.bossShadow.active) {
      updateShadowPosition(scene.bossShadow, scene.bossSprite);
    }
    var balloon = scene.bossSprite.dangerBalloon;
    if (balloon && balloon.active) {
      balloon.x = scene.bossSprite.x + (balloon.getData("relX") || 0);
      balloon.y = scene.bossSprite.y + (balloon.getData("relY") || 0);
    }
  }
  function bossDie(scene, boss) {
    if (scene.stageCleared) return;
    var isAkebono = !!scene.spFired;
    if (!isAkebono && scene.bossShadow && scene.bossShadow.active) {
      scene.bossShadow.destroy();
      scene.bossShadow = null;
    }
    scene.bossTimerStartFlg = false;
    scene.bossTimerLabel.setVisible(false);
    scene.bossTimerNum.container.setVisible(false);
    scene.theWorldFlg = true;
    scene.comboCount++;
    if (scene.comboCount > scene.maxCombo) {
      scene.maxCombo = scene.comboCount;
    }
    var ratio = Math.max(1, Math.ceil(scene.comboCount / 10));
    scene.scoreCount += scene.bossScore * ratio;
    scene.showScorePopup(boss.x, boss.y, scene.bossScore, ratio);
    for (var pb = scene.playerBullets.length - 1; pb >= 0; pb--) {
      if (scene.playerBullets[pb] && scene.playerBullets[pb].active) {
        scene.playerBullets[pb].destroy();
      }
    }
    scene.playerBullets = [];
    var startX = boss.x;
    var startY = boss.y;
    var bw = boss.width || 80;
    var bh = boss.height || 80;
    for (var ei = 0; ei < 5; ei++) {
      (function(i) {
        scene.time.delayedCall(250 * i, function() {
          var ex = startX + Math.random() * bw - bw / 2;
          var ey = startY + Math.random() * bh - bh / 2;
          showBossExplosion(scene, ex, ey);
          scene.playSound("se_explosion", 0.175);
        });
      })(ei);
    }
    var shakeOffsets = [
      { x: 4, y: -2 },
      { x: -3, y: 1 },
      { x: 2, y: -1 },
      { x: -2, y: 1 },
      { x: 1, y: 1 },
      { x: 0, y: 0 },
      { x: 4, y: -2 },
      { x: -3, y: 1 },
      { x: 2, y: -1 },
      { x: -2, y: 1 },
      { x: 1, y: 1 },
      { x: 0, y: 0 }
    ];
    var shakeDelays = [0, 80, 70, 50, 50, 40, 0, 80, 70, 50, 50, 40];
    var cumDelay = 0;
    for (var si = 0; si < shakeOffsets.length; si++) {
      cumDelay += shakeDelays[si];
      (function(off, delay) {
        scene.time.delayedCall(delay, function() {
          if (!boss || !boss.active) return;
          boss.x = startX + off.x;
          boss.y = startY + off.y;
        });
      })(shakeOffsets[si], cumDelay);
    }
    if (!isAkebono) {
      scene.tweens.add({
        targets: boss,
        alpha: 0,
        duration: 1e3,
        delay: cumDelay + 500,
        onComplete: function() {
          if (boss && boss.active) boss.destroy();
        }
      });
    }
    var bossNames = ["bison", "barlog", "sagat", "vega", "fang"];
    var stageId = gameState.stageId || 0;
    var bossVoiceName = scene.bossIsGoki ? "goki" : bossNames[stageId] || "bison";
    var voiceKey = "boss_" + bossVoiceName + "_voice_ko";
    triggerHaptic("bossDefeat");
    scene.playSound(voiceKey, 0.9);
    scene.playSound("se_finish_akebono", 0.9);
    if (isAkebono) {
      scene.showAkebonoFinish();
    }
    if (!isAkebono && boss.dangerBalloon && boss.dangerBalloon.active) {
      boss.dangerBalloon.destroy();
    }
    var idx = scene.enemies.indexOf(boss);
    if (idx >= 0) scene.enemies.splice(idx, 1);
    scene.bossSprite = null;
    scene.bossActive = false;
    scene.bossDangerShown = false;
    scene.bossHpBarBg.setVisible(false);
    scene.bossHpBarFg.setVisible(false);
    for (var eb = scene.enemyBullets.length - 1; eb >= 0; eb--) {
      if (scene.enemyBullets[eb] && scene.enemyBullets[eb].active) {
        scene.enemyBullets[eb].destroy();
      }
    }
    scene.enemyBullets = [];
    scene.time.delayedCall(2500, function() {
      scene.stageClear();
    });
  }
  function gokiPlayerAttack(scene) {
    scene.theWorldFlg = true;
    scene.spBtn.setAlpha(0);
    for (var pb = scene.playerBullets.length - 1; pb >= 0; pb--) {
      if (scene.playerBullets[pb] && scene.playerBullets[pb].active) {
        scene.playerBullets[pb].destroy();
      }
    }
    scene.playerBullets = [];
    scene.playerSprite.setAlpha(0);
    var boss = scene.bossSprite;
    if (boss && boss.active && scene.gokiAnimSyngoku && scene.gokiAnimSyngoku.length > 0) {
      boss.setData("frames", scene.gokiAnimSyngoku);
      boss.setData("animIdx", 0);
      boss.setData("animTimer", 0);
      try {
        boss.setFrame(scene.gokiAnimSyngoku[0]);
      } catch (e) {
      }
      var shadow = boss.getData("shadow");
      if (shadow && shadow.active) {
        try {
          shadow.setFrame(scene.gokiAnimSyngoku[0]);
        } catch (e) {
        }
      }
    }
    scene.playSound("boss_goki_voice_syungokusatu0", 0.9);
    var blackout = scene.add.rectangle(GCX4, GCY, GW12, GH10, 0);
    blackout.setDepth(200);
    var flash = scene.add.rectangle(GCX4, GCY, GW12, GH10, 16777215);
    flash.setDepth(201);
    flash.setAlpha(0);
    var playerX = scene.playerSprite.x;
    var playerY = scene.playerSprite.y;
    scene.time.addEvent({
      delay: 50,
      repeat: 9,
      callback: function() {
        scene.playSound("se_damage", 0.3);
        var hx = playerX + Math.random() * 32 - 16;
        var hy = playerY + Math.random() * 16 - 8;
        showHitImpact(scene, hx, hy, false);
        flash.setAlpha(0.2);
        scene.time.delayedCall(60, function() {
          flash.setAlpha(0);
        });
      }
    });
    scene.time.delayedCall(700, function() {
      if (boss && boss.active && scene.gokiAnimSyngokuFinishTen && scene.gokiAnimSyngokuFinishTen.length > 0) {
        boss.setData("frames", scene.gokiAnimSyngokuFinishTen);
        boss.setData("animIdx", 0);
        boss.setData("animTimer", 0);
        try {
          boss.setFrame(scene.gokiAnimSyngokuFinishTen[0]);
        } catch (e) {
        }
        var shadow2 = boss.getData("shadow");
        if (shadow2 && shadow2.active) {
          try {
            shadow2.setFrame(scene.gokiAnimSyngokuFinishTen[0]);
          } catch (e) {
          }
        }
      }
    });
    scene.time.delayedCall(1800, function() {
      scene.playerSprite.setAlpha(1);
    });
    scene.time.delayedCall(1900, function() {
      scene.playSound("boss_goki_voice_syungokusatu1", 0.9);
      scene.tweens.add({
        targets: blackout,
        alpha: 0,
        duration: 300,
        onComplete: function() {
          blackout.destroy();
          flash.destroy();
        }
      });
      if (!scene.anims.exists("akebono_bg_anim")) {
        scene.anims.create({
          key: "akebono_bg_anim",
          frames: scene.anims.generateFrameNames("game_ui", {
            prefix: "akebonoBg",
            start: 0,
            end: 2,
            suffix: ".gif"
          }),
          frameRate: 17,
          repeat: -1
        });
      }
      var akebonoBg = scene.add.sprite(0, 0, "game_ui", "akebonoBg0.gif");
      akebonoBg.setOrigin(0, 0);
      akebonoBg.setDepth(5);
      akebonoBg.play("akebono_bg_anim");
      var tenX = 27;
      var tenY = 113;
      var tenSprite = scene.add.sprite(tenX, tenY, "game_ui", "akebonoTen.gif");
      var tenW = tenSprite.width;
      var tenH = tenSprite.height;
      tenSprite.destroy();
      var akebonoTen = scene.add.sprite(tenX + tenW / 2, tenY + tenH / 2, "game_ui", "akebonoTen.gif");
      akebonoTen.setOrigin(0.5);
      akebonoTen.setDepth(6);
      akebonoTen.setScale(1.2);
      var akebonoTenShock = scene.add.sprite(tenX + tenW / 2, tenY + tenH / 2, "game_ui", "akebonoTen.gif");
      akebonoTenShock.setOrigin(0.5);
      akebonoTenShock.setDepth(6);
      akebonoTenShock.setAlpha(0);
      scene.tweens.add({
        targets: akebonoTen,
        scaleX: 1,
        scaleY: 1,
        duration: 300,
        ease: "Quint.easeIn",
        onComplete: function() {
          akebonoTenShock.setAlpha(1);
          scene.tweens.add({
            targets: akebonoTenShock,
            alpha: 0,
            duration: 600,
            ease: "Quint.easeOut"
          });
          scene.tweens.add({
            targets: akebonoTenShock,
            scaleX: 1.5,
            scaleY: 1.5,
            duration: 400,
            ease: "Quint.easeOut"
          });
          scene.tweens.add({
            targets: akebonoTen,
            alpha: 0,
            duration: 300,
            delay: 200,
            ease: "Quint.easeOut"
          });
        }
      });
    });
    scene.time.delayedCall(2700, function() {
      scene.playerDamage(100);
    });
    scene.time.delayedCall(3e3, function() {
      scene.showAkebonoFinish();
      if (boss && boss.active && scene.gokiAnimIdle && scene.gokiAnimIdle.length > 0) {
        boss.setData("frames", scene.gokiAnimIdle);
        boss.setData("animIdx", 0);
        boss.setData("animTimer", 0);
        try {
          boss.setFrame(scene.gokiAnimIdle[0]);
        } catch (e) {
        }
        var shadow3 = boss.getData("shadow");
        if (shadow3 && shadow3.active) {
          try {
            shadow3.setFrame(scene.gokiAnimIdle[0]);
          } catch (e) {
          }
        }
      }
    });
  }

  // ../2019-es7/src/phaser/effects/AkebonoFinish.js
  var GCX5 = GAME_DIMENSIONS.CENTER_X;
  var GCY2 = GAME_DIMENSIONS.CENTER_Y;
  function showAkebonoFinish(scene) {
    if (!scene.anims.exists("akebono_bg_anim")) {
      scene.anims.create({
        key: "akebono_bg_anim",
        frames: scene.anims.generateFrameNames("game_ui", {
          prefix: "akebonoBg",
          start: 0,
          end: 2,
          suffix: ".gif"
        }),
        frameRate: 17,
        repeat: -1
      });
    }
    var akebonoBg = scene.add.sprite(0, 0, "game_ui", "akebonoBg0.gif");
    akebonoBg.setOrigin(0, 0);
    akebonoBg.setDepth(5);
    akebonoBg.play("akebono_bg_anim");
    scene.akebonoBgSprite = akebonoBg;
    var koK = scene.add.sprite(GCX5 - 41, GCY2, "game_ui", "knockoutK.gif");
    koK.setOrigin(0.5);
    koK.setDepth(200);
    koK.setScale(0);
    var koO = scene.add.sprite(GCX5 + 41, GCY2, "game_ui", "knockoutO.gif");
    koO.setOrigin(0.5);
    koO.setDepth(200);
    koO.setScale(0);
    scene.tweens.add({
      targets: koK,
      scaleX: 1,
      scaleY: 1,
      duration: 400,
      ease: "Back.easeOut"
    });
    scene.tweens.add({
      targets: koO,
      scaleX: 1,
      scaleY: 1,
      duration: 400,
      delay: 150,
      ease: "Back.easeOut"
    });
    scene.playSound("voice_ko", 0.7);
  }

  // ../2019-es7/src/phaser/ui/ScorePopup.js
  function showScorePopup(scene, x, y, score, ratio) {
    var container = scene.add.container(0, 0);
    container.setDepth(110);
    var scoreStr = String(Math.floor(score));
    var cx = 0;
    for (var i = 0; i < scoreStr.length; i++) {
      var sp = scene.add.image(cx, 0, "game_ui", "smallNum" + scoreStr[i] + ".gif");
      sp.setOrigin(0, 0);
      container.add(sp);
      cx = i * (sp.width - 2) + sp.width;
    }
    cx = (scoreStr.length - 1) * (8 - 2) + 8;
    var kakeru = scene.add.image(cx, 0, "game_ui", "smallNumKakeru.gif");
    kakeru.setOrigin(0, 0);
    container.add(kakeru);
    var ratioStr = String(Math.max(1, Math.floor(ratio)));
    var rx = kakeru.x + kakeru.width + 1;
    for (var j = 0; j < ratioStr.length; j++) {
      var rsp = scene.add.image(rx + j * (8 - 1), 0, "game_ui", "smallNum" + ratioStr[j] + ".gif");
      rsp.setOrigin(0, 0);
      container.add(rsp);
    }
    var bounds = container.getBounds();
    container.x = Math.floor(x - bounds.width / 2);
    container.y = Math.floor(y - bounds.height);
    scene.tweens.add({
      targets: container,
      y: container.y - 20,
      duration: 800,
      onComplete: function() {
        container.destroy();
      }
    });
  }

  // ../2019-es7/src/phaser/GameScene.js
  var GW13 = GAME_DIMENSIONS.WIDTH;
  var GH11 = GAME_DIMENSIONS.HEIGHT;
  var GCX6 = GAME_DIMENSIONS.CENTER_X;
  var GCY3 = GAME_DIMENSIONS.CENTER_Y;
  function recipeData() {
    return gameState._phaserRecipe || null;
  }
  function rectOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }
  var PhaserGameScene = class extends Phaser.Scene {
    constructor() {
      super({ key: "PhaserGameScene" });
    }
    // === Thin wrappers so boss-pattern modules can call scene.xxx() ===
    _bossAlive() {
      return _bossAlive(this);
    }
    bossShootStart() {
      bossShootStart(this);
    }
    bossShootStraight(projData) {
      bossShootStraight(this, projData);
    }
    bossShootAimed(projData) {
      bossShootAimed(this, projData);
    }
    bossShootBeam(projData, degree) {
      bossShootBeam(this, projData, degree);
    }
    bossShootSpread(projData, count, angleDeg) {
      bossShootSpread(this, projData, count, angleDeg);
    }
    bossShootRadial(projData, count) {
      bossShootRadial(this, projData, count);
    }
    checkBossDanger() {
      checkBossDanger(this);
    }
    bossDie(boss) {
      bossDie(this, boss);
    }
    bossAdd() {
      bossAdd(this);
    }
    enemyDie(enemy, isSp) {
      enemyDie(this, enemy, isSp);
    }
    showExplosion(x, y) {
      showExplosion(this, x, y);
    }
    showHitImpact(x, y, isGuard) {
      showHitImpact(this, x, y, isGuard);
    }
    flashEnemyTint(enemy) {
      flashEnemyTint(this, enemy);
    }
    flashBossTint(boss) {
      flashBossTint(this, boss);
    }
    showAkebonoFinish() {
      showAkebonoFinish(this);
    }
    showScorePopup(x, y, score, ratio) {
      showScorePopup(this, x, y, score, ratio);
    }
    // =================================================================
    // create
    // =================================================================
    create() {
      this.recipe = recipeData();
      if (!this.recipe) {
        var game = this.game;
        setTimeout(function() {
          game.scene.stop("PhaserGameScene");
          game.scene.start("PhaserTitleScene");
        }, 50);
        return;
      }
      this.frameCnt = 0;
      this.waveCount = 0;
      this.waveInterval = 80;
      this.enemyWaveFlg = false;
      this.theWorldFlg = false;
      this.sceneSwitch = 0;
      this.bossActive = false;
      this.bossReached = false;
      this.bossTimerCountDown = 99;
      this.bossTimerFrameCnt = 0;
      this.bossTimerStartFlg = false;
      this.gameStarted = false;
      this.stageCleared = false;
      this.playerDead = false;
      this.damageAnimationFlg = false;
      this.bossEntering = false;
      this.scoreCount = gameState.score || 0;
      this.comboCount = 0;
      this.maxCombo = gameState.maxCombo || 0;
      this.comboTimeCnt = 0;
      this.spGauge = gameState.spgage || 0;
      this.spFired = false;
      this.spFiredDuringBoss = false;
      this.spReadyHapticPlayed = false;
      var stageId = gameState.stageId || 0;
      this.stageKey = "stage" + String(stageId);
      var enemyList = this.recipe[this.stageKey] ? this.recipe[this.stageKey].enemylist : [];
      this.stageEnemyPositionList = (enemyList || []).slice().reverse();
      if (gameState.shortFlg) {
        this.stageEnemyPositionList = [];
      }
      var bgSuffix = gameState.hasCustomEnemies ? "stage_loop_c" : "stage_loop";
      var bgEndSuffix = gameState.hasCustomEnemies ? "stage_end_c" : "stage_end";
      this.stageBg = this.add.tileSprite(0, 0, GW13, GH11, bgSuffix + stageId);
      this.stageBg.setOrigin(0, 0);
      this.stageEndBg = this.add.image(0, 0, bgEndSuffix + stageId);
      this.stageEndBg.setOrigin(0, 0);
      this.stageEndBg.y = -this.stageEndBg.height;
      this.stageEndBg.setVisible(false);
      this.unitGroup = this.add.group();
      this.bulletGroup = this.add.group();
      this.enemyBulletGroup = this.add.group();
      this.itemGroup = this.add.group();
      this.enemies = [];
      this.playerBullets = [];
      this.enemyBullets = [];
      this.items = [];
      this.bulletIdCnt = 0;
      this.isDragging = false;
      this.dragPointerId = null;
      createPlayer(this);
      createDragArea(this);
      this.createHUD();
      this.createCover();
      this.boss = null;
      this.bossSprite = null;
      this.bossHp = 0;
      this.bossMaxHp = 0;
      this.bossScore = 0;
      this.bossInterval = 0;
      this.bossIntervalCnt = 0;
      this.bossIntervalCounter = 0;
      this.bossName = "";
      this.bossStageId = stageId;
      this.bossProjCnt = 0;
      this.bossDangerShown = false;
      this.showTitle();
      this.input.setTopOnly(true);
      this.input.on("pointerup", function(pointer) {
        var _pointerId = pointer && (pointer.id !== void 0 ? pointer.id : pointer.pointerId);
        if (this.dragPointerId !== null && _pointerId !== null && _pointerId !== this.dragPointerId) return;
        this.isDragging = false;
        this.dragPointerId = null;
      }, this);
      this.shootTimer = 0;
      this.shootInterval = this.recipe.playerData.shootNormal.interval || 23;
      this.shootMode = gameState.shootMode || "normal";
      this.shootSpeed = gameState.shootSpeed || "speed_normal";
      this.enemyWaveFrameCounter = 0;
      this.cursors = null;
      this.wasd = null;
      try {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
          up: Phaser.Input.Keyboard.KeyCodes.W,
          down: Phaser.Input.Keyboard.KeyCodes.S,
          left: Phaser.Input.Keyboard.KeyCodes.A,
          right: Phaser.Input.Keyboard.KeyCodes.D,
          sp: Phaser.Input.Keyboard.KeyCodes.SPACE
        });
      } catch (e) {
      }
      this.keyMoveSpeed = 3;
      this.stageBgmName = "";
      this.playBossBgm(stageId);
      var self = this;
      this.time.delayedCall(2600, function() {
        self.playSound("g_stage_voice_" + String(stageId), 0.7);
      });
    }
    // =================================================================
    // HUD (kept inline — number-display helpers are scene-specific)
    // =================================================================
    createHUD() {
      this.hudBg = this.add.sprite(0, 0, "game_ui", "hudBg0.gif");
      this.hudBg.setOrigin(0, 0);
      this.hudBg.setDepth(100);
      this.hpBar = this.add.sprite(49, 7, "game_ui", "hpBar.gif");
      this.hpBar.setOrigin(0, 0);
      this.hpBar.setDepth(101);
      this.hpBar.setScale(this.playerHp / this.playerMaxHp, 1);
      this.scoreLabel = this.add.sprite(30, 25, "game_ui", "smallScoreTxt.gif");
      this.scoreLabel.setOrigin(0, 0);
      this.scoreLabel.setDepth(101);
      this.scoreSmallNum = this._initSmallNum(10);
      this.scoreSmallNum.container.x = this.scoreLabel.x + this.scoreLabel.width + 2;
      this.scoreSmallNum.container.y = 25;
      this.scoreSmallNum.container.setDepth(101);
      this._setSmallNum(this.scoreSmallNum, this.scoreCount);
      this.worldBestText = this.add.text(
        30,
        40,
        getWorldBestLabel() + " " + String(getDisplayedHighScore()),
        { fontFamily: "Arial", fontSize: "9px", fontStyle: "bold", color: "#ffffff", stroke: "#000000", strokeThickness: 2 }
      );
      this.worldBestText.setDepth(101);
      this.comboLabel = this.add.sprite(149, 32, "game_ui", "comboBar.gif");
      this.comboLabel.setOrigin(0, 0);
      this.comboLabel.setDepth(101);
      this.comboLabel.setScale(0, 1);
      this.comboNumContainer = this.add.container(194, 19);
      this.comboNumContainer.setDepth(101);
      this._comboNumSprites = [];
      this._lastComboNum = -1;
      this._setComboNum(0);
      this.spBtnWrap = this.add.container(GW13 - 70, GCY3 + 15);
      this.spBtnWrap.setDepth(103);
      this.spBtnPulse = this.add.sprite(32, 32, "game_ui", "hudCabtnBg1.gif");
      this.spBtnPulse.setOrigin(0.5);
      this.spBtnPulse.setAlpha(0);
      this.spBtnReadyBg = this.add.sprite(-18, -18, "game_ui", "hudCabtnBg0.gif");
      this.spBtnReadyBg.setOrigin(0, 0);
      this.spBtnReadyBg.setAlpha(0);
      this.spBtnBarBg = this.add.sprite(0, 0, "game_ui", "hudCabtn100per.gif");
      this.spBtnBarBg.setOrigin(0, 0);
      this.spBtnBar = this.add.sprite(0, 0, "game_ui", "hudCabtn0per.gif");
      this.spBtnBar.setOrigin(0, 0);
      this.spBtnWrap.add([this.spBtnPulse, this.spBtnReadyBg, this.spBtnBarBg, this.spBtnBar]);
      this.spBtnWrap.setSize(this.spBtnBarBg.width, this.spBtnBarBg.height);
      this.spBtnBarBg.setInteractive(
        new Phaser.Geom.Circle(
          this.spBtnBarBg.width / 2,
          this.spBtnBarBg.height / 2,
          Math.min(this.spBtnBarBg.width, this.spBtnBarBg.height) / 2 - 5
        ),
        Phaser.Geom.Circle.Contains
      );
      this.spBtnBarBg.on("pointerover", function() {
        if (this.game && this.game.canvas) this.game.canvas.style.cursor = "pointer";
      }, this);
      this.spBtnBarBg.on("pointerout", function() {
        if (this.game && this.game.canvas) this.game.canvas.style.cursor = "default";
      }, this);
      this.spBtnBarBg.on("pointerup", this.onSpFire, this);
      this.spBtn = this.spBtnWrap;
      this.spReadyTween = null;
      this.updateSpGauge();
      this.bossTimerLabel = this.add.sprite(GCX6 - 42, 58, "game_ui", "timeTxt.gif");
      this.bossTimerLabel.setOrigin(0, 0);
      this.bossTimerLabel.setDepth(101);
      this.bossTimerLabel.setVisible(false);
      this.bossTimerNum = this._initBigNum(2);
      this.bossTimerNum.container.x = this.bossTimerLabel.x + 42 + 3;
      this.bossTimerNum.container.y = 56;
      this.bossTimerNum.container.setDepth(101);
      this.bossTimerNum.container.setVisible(false);
      this._setBigNum(this.bossTimerNum, 99);
      this.bossHpBarBg = this.add.graphics();
      this.bossHpBarBg.setDepth(101);
      this.bossHpBarBg.setVisible(false);
      this.bossHpBarFg = this.add.graphics();
      this.bossHpBarFg.setDepth(101);
      this.bossHpBarFg.setVisible(false);
    }
    createCover() {
      if (!this.textures.getFrame("game_asset", "stagebgOver.gif")) {
        this.coverOverlay = null;
        return;
      }
      this.coverOverlay = this.add.container(0, 0);
      this.coverOverlay.setDepth(99);
      var frameH = 256;
      for (var ty = 0; ty < GH11; ty += frameH) {
        var tile = this.add.sprite(0, ty, "game_asset", "stagebgOver.gif");
        tile.setOrigin(0, 0);
        this.coverOverlay.add(tile);
      }
    }
    // =================================================================
    // Title / game flow
    // =================================================================
    showTitle() {
      var stageId = gameState.stageId || 0;
      var self = this;
      var preDelay = 0;
      var preOverlay = null;
      if (stageId === 4) {
        preOverlay = this.add.rectangle(GCX6, GCY3, GW13, GH11, 0);
        preOverlay.setDepth(202);
        preOverlay.setAlpha(1);
        this.playSound("voice_another_fighter", 0.7);
        preDelay = 3e3;
      }
      this.time.delayedCall(preDelay, function() {
        if (preOverlay) {
          self.tweens.add({
            targets: preOverlay,
            alpha: 0,
            duration: 300,
            onComplete: function() {
              preOverlay.destroy();
            }
          });
        }
        var bg = self.add.graphics();
        bg.fillStyle(16777215, 0.2);
        bg.fillRect(0, 0, GW13, GH11);
        bg.setDepth(200);
        bg.setAlpha(0);
        var stageNumIdx = Math.min(stageId + 1, 4);
        var stageNumSprite = self.add.image(0, GCY3 - 20, "game_ui", "stageNum" + String(stageNumIdx) + ".gif");
        stageNumSprite.setOrigin(0, 0);
        stageNumSprite.setDepth(201);
        stageNumSprite.setAlpha(0);
        var fightSprite = self.add.image(GCX6, GCY3 + 12, "game_ui", "stageFight.gif");
        fightSprite.setOrigin(0.5);
        fightSprite.setDepth(201);
        fightSprite.setAlpha(0);
        fightSprite.setScale(1.2);
        self.tweens.add({ targets: bg, alpha: 1, duration: 300 });
        self.time.delayedCall(300, function() {
          self.playSound("voice_round" + String(Math.min(stageId, 3)), 0.7);
          self.tweens.add({ targets: stageNumSprite, alpha: 1, duration: 300 });
        });
        self.time.delayedCall(1600, function() {
          self.tweens.add({ targets: stageNumSprite, alpha: 0, duration: 100 });
          self.tweens.add({ targets: fightSprite, alpha: 1, duration: 200 });
          self.tweens.add({ targets: fightSprite, scaleX: 1, scaleY: 1, duration: 200 });
        });
        self.time.delayedCall(1800, function() {
          self.playSound("voice_fight", 0.7);
        });
        self.time.delayedCall(2200, function() {
          self.tweens.add({ targets: fightSprite, scaleX: 1.5, scaleY: 1.5, duration: 200 });
          self.tweens.add({ targets: fightSprite, alpha: 0, duration: 200 });
        });
        self.time.delayedCall(2300, function() {
          self.tweens.add({
            targets: bg,
            alpha: 0,
            duration: 200,
            onComplete: function() {
              bg.destroy();
              stageNumSprite.destroy();
              fightSprite.destroy();
              self.startGame();
            }
          });
        });
      });
    }
    startGame() {
      this.gameStarted = true;
      this.stageBgAmountMove = 0.7;
      this.enemyWaveFlg = true;
      this.frameCnt = 0;
      this.waveCount = 0;
      this.playerUnitX = this.playerSprite.x;
      this.playerUnitY = this.playerSprite.y;
    }
    stageClear() {
      if (this.stageCleared) return;
      this.stageCleared = true;
      this.gameStarted = false;
      gameState.score = this.scoreCount;
      gameState.playerHp = this.playerMaxHp;
      gameState.playerMaxHp = this.playerMaxHp;
      gameState.spgage = this.spGauge;
      gameState.maxCombo = Math.max(gameState.maxCombo || 0, this.maxCombo);
      gameState.shootMode = this.shootMode;
      gameState.shootSpeed = this.shootSpeed;
      if (this.spFiredDuringBoss) {
        gameState.akebonoCnt = (gameState.akebonoCnt || 0) + 1;
      }
      var self = this;
      triggerHaptic("stageClear");
      var clearBg = this.add.graphics();
      clearBg.fillStyle(16777215, 0.4);
      clearBg.fillRect(0, 0, GW13, GH11);
      clearBg.setDepth(200);
      clearBg.setAlpha(0);
      var clearSprite = this.add.sprite(GCX6, GCY3 - 44, "game_ui", "stageclear.gif");
      clearSprite.setOrigin(0.5);
      clearSprite.setDepth(201);
      clearSprite.setAlpha(0);
      this.tweens.add({
        targets: [clearBg, clearSprite],
        alpha: 1,
        duration: 500,
        delay: 300
      });
      var game = this.game;
      this.time.delayedCall(2500, function() {
        var urls = gameState.bgmSourceURLs;
        var currentKey = self.stageBgmName;
        var nextStageId = gameState.stageId + 1;
        var bossNames = ["bison", "barlog", "sagat", "vega", "fang"];
        var nextBossName = bossNames[nextStageId] || "";
        var nextKey = nextBossName ? "boss_" + nextBossName + "_bgm" : "";
        var sameBgm = urls && currentKey && nextKey && urls[currentKey] && urls[nextKey] && urls[currentKey] === urls[nextKey];
        if (sameBgm) {
          try {
            var sounds = self.sound.getAll();
            for (var si = 0; si < sounds.length; si++) {
              if (sounds[si].key === currentKey) {
                sounds[si].pause();
              } else if (sounds[si].isPlaying) {
                sounds[si].stop();
              }
            }
          } catch (e) {
            self.stopAllSounds();
          }
          gameState.bgmContinuityActive = true;
          gameState.currentBgmKey = currentKey;
        } else {
          self.stopAllSounds();
          gameState.bgmContinuityActive = false;
        }
        gameState.stageId++;
        setTimeout(function() {
          game.scene.stop("PhaserGameScene");
          game.scene.start("PhaserAdvScene");
        }, 50);
      });
    }
    timeoverComplete() {
      gameState.bgmContinuityActive = false;
      gameState.currentBgmKey = null;
      gameState.score = this.scoreCount;
      gameState.maxCombo = Math.max(gameState.maxCombo || 0, this.maxCombo);
      var timeOverText = this.add.text(GCX6, GCY3, "TIME OVER", {
        fontFamily: "sans-serif",
        fontSize: "22px",
        fontStyle: "bold",
        color: "#ff4444",
        stroke: "#000000",
        strokeThickness: 3
      });
      timeOverText.setOrigin(0.5);
      timeOverText.setDepth(200);
      this.gameStarted = false;
      var self = this;
      var game = this.game;
      this.time.delayedCall(2500, function() {
        self.stopAllSounds();
        setTimeout(function() {
          game.scene.stop("PhaserGameScene");
          game.scene.start("PhaserContinueScene");
        }, 50);
      });
    }
    // =================================================================
    // SP fire (orchestrates cutin, explosions, damage — touches many subsystems)
    // =================================================================
    onSpFire() {
      if (this.spGauge < 100 || this.spFired || !this.gameStarted) return;
      this.doSpFire();
    }
    doSpFire() {
      this.spFired = true;
      this.spFiredDuringBoss = this.bossActive;
      this.spGauge = 0;
      this.updateSpGauge();
      triggerHaptic("special");
      this.playSound("se_sp", 0.8);
      this.playSound("g_sp_voice", 0.7);
      this.theWorldFlg = true;
      for (var i = this.playerBullets.length - 1; i >= 0; i--) {
        this.playerBullets[i].destroy();
      }
      this.playerBullets = [];
      for (var eb = this.enemyBullets.length - 1; eb >= 0; eb--) {
        if (this.enemyBullets[eb] && this.enemyBullets[eb].active) {
          this.enemyBullets[eb].destroy();
        }
      }
      this.enemyBullets = [];
      var self = this;
      var cutinBg = this.add.graphics();
      cutinBg.setDepth(160);
      cutinBg.fillStyle(0, 0.9);
      cutinBg.fillRect(0, 0, GW13, GH11);
      cutinBg.setAlpha(0);
      var cutinSprite = this.add.sprite(0, GCY3 - 71, "game_asset", "cutin0.gif");
      cutinSprite.setOrigin(0, 0);
      cutinSprite.setDepth(161);
      cutinSprite.setAlpha(0);
      var cutinFlash = this.add.graphics();
      cutinFlash.setDepth(162);
      cutinFlash.fillStyle(15658734, 1);
      cutinFlash.fillRect(0, 0, GW13, GH11);
      cutinFlash.setAlpha(0);
      this.tweens.add({ targets: cutinBg, alpha: 1, duration: 250 });
      var cutinFrames = [
        { frame: "cutin0.gif", delay: 0 },
        { frame: "cutin1.gif", delay: 80 },
        { frame: "cutin2.gif", delay: 160 },
        { frame: "cutin3.gif", delay: 240 },
        { frame: "cutin4.gif", delay: 320 },
        { frame: "cutin5.gif", delay: 400 },
        { frame: "cutin6.gif", delay: 700 },
        { frame: "cutin7.gif", delay: 800 },
        { frame: "cutin8.gif", delay: 900 }
      ];
      this.time.delayedCall(250, function() {
        cutinSprite.setAlpha(1);
        for (var cf = 0; cf < cutinFrames.length; cf++) {
          (function(f) {
            self.time.delayedCall(f.delay, function() {
              if (cutinSprite.active) cutinSprite.setFrame(f.frame);
            });
          })(cutinFrames[cf]);
        }
      });
      this.time.delayedCall(550, function() {
        cutinFlash.setAlpha(1);
        self.tweens.add({ targets: cutinFlash, alpha: 0, duration: 300 });
      });
      this.time.delayedCall(1700, function() {
        self.tweens.add({
          targets: [cutinBg, cutinSprite],
          alpha: 0,
          duration: 200,
          onComplete: function() {
            cutinBg.destroy();
            cutinSprite.destroy();
            cutinFlash.destroy();
          }
        });
      });
      if (this.bossActive && this.bossSprite && this.bossSprite.active) {
        var bossX = this.bossSprite.x;
        var bossY = this.bossSprite.y;
        var bossW = this.bossSprite.width || 80;
        var bossH = this.bossSprite.height || 80;
        var spFlash = this.add.graphics();
        spFlash.setDepth(163);
        spFlash.fillStyle(16777215, 1);
        spFlash.fillRect(0, 0, GW13, GH11);
        spFlash.setAlpha(0);
        for (var fi = 0; fi < 10; fi++) {
          (function(idx) {
            self.time.delayedCall(400 + 50 * idx, function() {
              var ix = bossX + Math.random() * bossW - bossW / 2;
              var iy = bossY + Math.random() * (bossH / 2) - bossH / 4;
              showHitImpact(self, ix, iy, false);
              self.playSound("se_damage", 0.3);
            });
            self.time.delayedCall(400 + 50 * idx + 10, function() {
              spFlash.setAlpha(0.2);
            });
            self.time.delayedCall(400 + 50 * idx + 70, function() {
              spFlash.setAlpha(0);
            });
          })(fi);
        }
        this.time.delayedCall(1700, function() {
          spFlash.destroy();
        });
      }
      var spLine = this.add.graphics();
      spLine.setDepth(150);
      spLine.fillStyle(16711680, 1);
      spLine.fillRect(this.playerSprite.x - 1, 0, 3, GH11);
      this.tweens.add({
        targets: spLine,
        alpha: 0,
        duration: 600,
        onComplete: function() {
          spLine.destroy();
        }
      });
      this.time.delayedCall(300, function() {
        spExplosions(self);
      });
      this.time.delayedCall(1100, function() {
        var spDamage = self.recipe.playerData.spDamage || 50;
        var enemySnap = self.enemies.slice();
        for (var e = enemySnap.length - 1; e >= 0; e--) {
          var en = enemySnap[e];
          if (en && en.active) {
            var ex = en.x, ey = en.y, ew = en.width || 0;
            if (ex < -ew / 2 || ex > GW13 || ey < 20 || ey > GH11) continue;
            var isBoss = en.getData("type") === "boss";
            if (isBoss) {
              var ehp = en.getData("hp") - spDamage;
              en.setData("hp", ehp);
              self.bossHp = ehp;
              self.checkBossDanger();
              if (ehp <= 0) {
                self.bossDie(en);
              }
            } else {
              self.enemyDie(en, true);
            }
          }
        }
      });
      this.time.delayedCall(2500, function() {
        self.theWorldFlg = false;
        self.spFired = false;
      });
    }
    // =================================================================
    // SP gauge
    // =================================================================
    updateSpGauge() {
      if (!this.spBtnBar) return;
      var ratio = Math.min(this.spGauge / 100, 1);
      if (ratio <= 0) {
        this.spBtnBar.setCrop(0, 0, 0, 0);
      } else {
        var cropY = Math.round(8 * ratio);
        var cropH = Math.round(50 * ratio);
        this.spBtnBar.setCrop(8, cropY, 51, cropH);
      }
      if (ratio >= 1) {
        this.spBtnReadyBg.setAlpha(1);
        if (!this.spReadyHapticPlayed) {
          triggerHaptic("ready");
          this.spReadyHapticPlayed = true;
        }
        if (!this.spReadyTween) {
          this.spReadyTween = this.tweens.add({
            targets: this.spBtnPulse,
            alpha: 1,
            duration: 400,
            yoyo: true,
            repeat: -1
          });
        }
      } else {
        this.spReadyHapticPlayed = false;
        this.spBtnReadyBg.setAlpha(0);
        this.spBtnPulse.setAlpha(0);
        if (this.spReadyTween) {
          this.spReadyTween.stop();
          this.spReadyTween = null;
        }
      }
    }
    updateBossHpBar() {
      this.bossHpBarBg.setVisible(false);
      this.bossHpBarFg.setVisible(false);
    }
    // =================================================================
    // Items
    // =================================================================
    dropItem(x, y, itemName) {
      var frameMap = {
        big: "powerupBig0.gif",
        "3way": "powerup3way0.gif",
        speed_high: "speedupItem0.gif",
        barrier: "barrierItem0.gif"
      };
      var frameKey = frameMap[itemName] || "powerupBig0.gif";
      var item = this.add.sprite(x, y, "game_asset", frameKey);
      item.setOrigin(0.5);
      item.setDepth(55);
      item.setData("itemName", itemName);
      this.items.push(item);
    }
    collectItem(itemName) {
      collectItem(this, itemName);
    }
    playerDamage(amount) {
      playerDamage(this, amount);
    }
    // =================================================================
    // Sound
    // =================================================================
    playBossBgm(stageId) {
      var bossNames = ["bison", "barlog", "sagat", "vega", "fang"];
      var name = bossNames[stageId] || "bison";
      var key = "boss_" + name + "_bgm";
      this.stageBgmName = key;
      if (gameState.bgmContinuityActive && gameState.currentBgmKey) {
        try {
          var paused = this.sound.get(gameState.currentBgmKey);
          if (paused && paused.isPaused) {
            paused.resume();
            this.stageBgmName = gameState.currentBgmKey;
            gameState.bgmContinuityActive = false;
            gameState.currentBgmKey = null;
            return;
          }
        } catch (e) {
        }
        gameState.bgmContinuityActive = false;
        gameState.currentBgmKey = null;
      }
      this.playBgm(key, 0.4);
    }
    playSound(key, volume) {
      if (gameState.lowModeFlg) return;
      try {
        var vol = typeof volume === "number" ? volume : 0.7;
        if (this.cache.audio.exists(key)) {
          var existing = this.sound.get(key);
          if (existing) {
            this.sound.play(key, { volume: vol });
          } else {
            this.sound.add(key).play({ volume: vol });
          }
        }
      } catch (e) {
      }
    }
    playBgm(key, volume) {
      if (gameState.lowModeFlg) return;
      try {
        if (this.cache.audio.exists(key)) {
          var existing = this.sound.get(key);
          if (existing) {
            if (existing.isPlaying) existing.stop();
            existing.play({ volume: volume || 0.4, loop: true });
          } else {
            this.sound.add(key, { loop: true, volume: volume || 0.4 }).play();
          }
        }
      } catch (e) {
      }
    }
    stopAllSounds() {
      try {
        this.sound.stopAll();
      } catch (e) {
      }
    }
    // =================================================================
    // Fixed-timestep game loop
    // =================================================================
    update(time, delta) {
      var STEP = 8.333333;
      this._accumulator = (this._accumulator || 0) + Math.min(delta, 66.67);
      while (this._accumulator >= STEP) {
        this._accumulator -= STEP;
        this.fixedUpdate(time, STEP);
      }
    }
    fixedUpdate(time, step) {
      if (this.stageBg && !this.playerDead && !this.stageCleared) {
        if (!this.bossActive && !this.bossReached) {
          var bgMove = this.gameStarted ? this.stageBgAmountMove || 0.7 : 0.7;
          this.stageBg.tilePositionY -= bgMove;
        }
        if (this.bossAppearBgFlg) {
          var scrollAmt = this.stageBgAmountMove || 0.7;
          this.stageBg.y += scrollAmt;
          this.stageEndBg.y += scrollAmt;
          this.bossAppearBgScroll = (this.bossAppearBgScroll || 0) + scrollAmt;
          if (this.bossAppearBgScroll >= 214 || this.stageEndBg.y >= 42) {
            this.bossAppearBgFlg = false;
          }
        }
      }
      if (!this.gameStarted) return;
      if (this.playerDead || this.stageCleared) return;
      handleKeyboardInput(this);
      this.playerSprite.x += 0.09 * (this.playerUnitX - this.playerSprite.x);
      if (this.playerShadow && this.playerShadow.active) {
        updateShadowPosition(this.playerShadow, this.playerSprite);
        if (this.playerSprite.frame && this.playerShadow.frame.name !== this.playerSprite.frame.name) {
          try {
            this.playerShadow.setFrame(this.playerSprite.frame.name);
          } catch (e2) {
          }
        }
      }
      if (this.theWorldFlg) {
        this.updateHUD();
        this.updateBossHpBar();
        return;
      }
      this.shootTimer += 1;
      var interval = this.shootSpeed === "speed_high" ? Math.floor(this.shootInterval * 0.6) : this.shootInterval;
      if (this.shootTimer >= interval) {
        this.shootTimer = 0;
        shootBullets(this);
      }
      updatePlayerBullets(this, step);
      for (var e = this.enemies.length - 1; e >= 0; e--) {
        var enemy = this.enemies[e];
        if (!enemy || !enemy.active) {
          this.enemies.splice(e, 1);
          continue;
        }
        var isBoss = enemy.getData("type") === "boss";
        if (!isBoss) {
          updateEnemy(this, enemy, step);
        } else {
          if (!this.bossSprite || !this.bossSprite.active) {
            this.enemies.splice(e, 1);
            continue;
          }
          syncBossVisuals(this);
        }
        animateEnemy(enemy, step);
        var eRect = { x: enemy.x - enemy.width / 2, y: enemy.y - enemy.height / 2, w: enemy.width, h: enemy.height };
        for (var bb = this.playerBullets.length - 1; bb >= 0; bb--) {
          var pb = this.playerBullets[bb];
          if (!pb || !pb.active) continue;
          var bRect = { x: pb.x - pb.width / 2, y: pb.y - pb.height / 2, w: pb.width, h: pb.height };
          if (isBoss && this.bossEntering) continue;
          if (enemy.y >= 40 && rectOverlap(eRect, bRect)) {
            pb.setTint(16773120);
            pb.setData("_tintTimer", 5);
            var applyDamage = true;
            if (this.shootMode === "big") {
              var bid = pb.getData("bulletId");
              var bkey = "bulletid_" + bid;
              var bfkey = "bulletframeCnt_" + bid;
              var prevHit = enemy.getData(bkey);
              if (prevHit == null) {
                enemy.setData(bkey, 0);
                enemy.setData(bfkey, 0);
              } else {
                var fc = (enemy.getData(bfkey) || 0) + 1;
                enemy.setData(bfkey, fc);
                if (fc % 15 === 0) {
                  var hitCnt = (enemy.getData(bkey) || 0) + 1;
                  enemy.setData(bkey, hitCnt);
                  if (hitCnt > 1) applyDamage = false;
                } else {
                  applyDamage = false;
                }
              }
            }
            if (applyDamage) {
              var dmg = pb.getData("damage") || 1;
              var hpBefore = enemy.getData("hp");
              var isGuard = hpBefore === "infinity";
              if (!isGuard) {
                var ehp = hpBefore - dmg;
                enemy.setData("hp", ehp);
                if (isBoss) {
                  this.bossHp = ehp;
                  this.checkBossDanger();
                }
                this.showHitImpact(pb.x, pb.y, false);
                this.playSound("se_damage", 0.15);
                if (ehp <= 0) {
                  if (isBoss) {
                    this.bossDie(enemy);
                  } else {
                    this.enemyDie(enemy, false);
                  }
                  break;
                }
                if (isBoss) {
                  this.flashBossTint(enemy);
                } else {
                  this.flashEnemyTint(enemy);
                }
              } else {
                this.showHitImpact(pb.x, pb.y, true);
                this.playSound("se_guard", 0.2);
                if (isBoss) {
                  this.flashBossTint(enemy);
                } else {
                  this.flashEnemyTint(enemy);
                }
              }
            }
            if (this.shootMode !== "big") {
              pb.destroy();
              this.playerBullets.splice(bb, 1);
            }
          }
        }
        if (!enemy.active) continue;
        if (this.barrierActive && this.barrierSprite) {
          var barRect = { x: this.barrierSprite.x - 20, y: this.barrierSprite.y - 20, w: 40, h: 40 };
          if (rectOverlap(eRect, barRect) && !isBoss) {
            this.enemyDie(enemy, false);
            continue;
          }
        }
        var pRect = { x: this.playerSprite.x - 8, y: this.playerSprite.y - 16, w: 16, h: 32 };
        if (rectOverlap(eRect, pRect) && !isBoss) {
          this.playerDamage(1);
          this.enemyDie(enemy, false);
          continue;
        }
        if (isBoss && rectOverlap(eRect, pRect)) {
          if (this.bossIsGoki) {
            gokiPlayerAttack(this);
          } else {
            var now = this.time.now;
            if (!this._lastBossContactTime || now - this._lastBossContactTime > 1e3) {
              this._lastBossContactTime = now;
              this.playerDamage(1);
            }
          }
        }
        if (!isBoss && (enemy.y > GH11 + 20 || enemy.x < -40 || enemy.x > GW13 + 40)) {
          var idx = this.enemies.indexOf(enemy);
          if (idx >= 0) this.enemies.splice(idx, 1);
          var osShadow = enemy.getData("shadow");
          if (osShadow && osShadow.active) osShadow.destroy();
          enemy.destroy();
        }
      }
      for (var eb = this.enemyBullets.length - 1; eb >= 0; eb--) {
        var eBullet = this.enemyBullets[eb];
        if (!eBullet || !eBullet.active) {
          this.enemyBullets.splice(eb, 1);
          continue;
        }
        var rotX = eBullet.getData("rotX") || 0;
        var rotY = eBullet.getData("rotY") || 1;
        var spd = eBullet.getData("speed") || 1;
        eBullet.x += rotX * spd;
        eBullet.y += rotY * spd;
        var ebFrames = eBullet.getData("frames");
        if (ebFrames && ebFrames.length > 1) {
          var ebFrameRate = eBullet.getData("frameRate");
          var ebThreshold = ebFrameRate ? 1e3 / ebFrameRate : 150;
          var ebAnimTimer = (eBullet.getData("animTimer") || 0) + step;
          eBullet.setData("animTimer", ebAnimTimer);
          if (ebAnimTimer > ebThreshold) {
            eBullet.setData("animTimer", 0);
            var ebAnimIdx = ((eBullet.getData("animIdx") || 0) + 1) % ebFrames.length;
            eBullet.setData("animIdx", ebAnimIdx);
            try {
              eBullet.setFrame(ebFrames[ebAnimIdx]);
            } catch (e2) {
            }
          }
        }
        if (eBullet.y > GH11 + 20 || eBullet.y < -20 || eBullet.x < -20 || eBullet.x > GW13 + 20) {
          eBullet.destroy();
          this.enemyBullets.splice(eb, 1);
          continue;
        }
        if (this.barrierActive && this.barrierSprite) {
          var barRect2 = { x: this.barrierSprite.x - 20, y: this.barrierSprite.y - 20, w: 40, h: 40 };
          var ebRect0 = { x: eBullet.x - eBullet.width / 2, y: eBullet.y - eBullet.height / 2, w: eBullet.width, h: eBullet.height };
          if (rectOverlap(ebRect0, barRect2)) {
            this.playSound("se_guard", 0.3);
            eBullet.destroy();
            this.enemyBullets.splice(eb, 1);
            continue;
          }
        }
        var ebDestroyed = false;
        var ebRect1 = { x: eBullet.x - eBullet.width / 2, y: eBullet.y - eBullet.height / 2, w: eBullet.width, h: eBullet.height };
        var ebHp = eBullet.getData("hp") || 1;
        for (var pbb = this.playerBullets.length - 1; pbb >= 0; pbb--) {
          var pb2 = this.playerBullets[pbb];
          if (!pb2 || !pb2.active) continue;
          var pb2Rect = { x: pb2.x - pb2.width / 2, y: pb2.y - pb2.height / 2, w: pb2.width, h: pb2.height };
          if (rectOverlap(pb2Rect, ebRect1)) {
            pb2.setTint(16773120);
            pb2.setData("_tintTimer", 5);
            var pb2dmg = pb2.getData("damage") || 1;
            ebHp -= pb2dmg;
            eBullet.setData("hp", ebHp);
            if (this.shootMode !== "big") {
              pb2.destroy();
              this.playerBullets.splice(pbb, 1);
            }
            if (ebHp <= 0) {
              triggerHaptic("deflect");
              var ebScore = eBullet.getData("score") || 0;
              var ebSpgage = eBullet.getData("spgage") || 0;
              if (ebScore > 0) {
                this.comboCount++;
                if (this.comboCount > this.maxCombo) this.maxCombo = this.comboCount;
                var ebRatio = Math.max(1, Math.ceil(this.comboCount / 10));
                this.scoreCount += ebScore * ebRatio;
                this.comboTimeCnt = 100;
                this.spGauge = Math.min(100, this.spGauge + ebSpgage);
                this.updateSpGauge();
                this.showScorePopup(eBullet.x, eBullet.y, ebScore, ebRatio);
              }
              this.showExplosion(eBullet.x, eBullet.y);
              this.playSound("se_explosion", 0.175);
              eBullet.destroy();
              this.enemyBullets.splice(eb, 1);
              ebDestroyed = true;
            }
            break;
          }
        }
        if (ebDestroyed) continue;
        var ebRect = { x: eBullet.x - eBullet.width / 2, y: eBullet.y - eBullet.height / 2, w: eBullet.width, h: eBullet.height };
        var pRect2 = { x: this.playerSprite.x - 8, y: this.playerSprite.y - 16, w: 16, h: 32 };
        if (rectOverlap(ebRect, pRect2)) {
          var edamage = eBullet.getData("damage") || 1;
          this.playerDamage(edamage);
          eBullet.destroy();
          this.enemyBullets.splice(eb, 1);
        }
      }
      for (var it = this.items.length - 1; it >= 0; it--) {
        var item = this.items[it];
        if (!item || !item.active) {
          this.items.splice(it, 1);
          continue;
        }
        item.y += 1;
        var iRect = { x: item.x - item.width / 2, y: item.y - item.height / 2, w: item.width, h: item.height };
        var pRect3 = { x: this.playerSprite.x - 12, y: this.playerSprite.y - 20, w: 24, h: 40 };
        if (rectOverlap(iRect, pRect3)) {
          var iname = item.getData("itemName");
          this.collectItem(iname);
          item.destroy();
          this.items.splice(it, 1);
          continue;
        }
        if (item.y > GH11) {
          item.destroy();
          this.items.splice(it, 1);
        }
      }
      if (this.enemyWaveFlg) {
        this.enemyWaveFrameCounter += 1;
        if (this.enemyWaveFrameCounter >= this.waveInterval) {
          this.enemyWaveFrameCounter -= this.waveInterval;
          enemyWave(this);
        }
      }
      if (this.bossTimerStartFlg) {
        this.bossTimerFrameCnt += step;
        if (this.bossTimerFrameCnt >= 1e3) {
          this.bossTimerFrameCnt -= 1e3;
          this.bossTimerCountDown--;
          if (this.bossTimerCountDown <= 0) {
            this.bossTimerStartFlg = false;
            this.timeoverComplete();
          }
        }
        this._setBigNum(this.bossTimerNum, Math.max(0, this.bossTimerCountDown));
      }
      this.comboTimeCnt -= 0.1;
      if (this.comboTimeCnt <= 0) {
        this.comboTimeCnt = 0;
        this.comboCount = 0;
      }
      updateBarrier(this, step);
      this.updateHUD();
      this.updateBossHpBar();
    }
    // =================================================================
    // HUD update + number display helpers
    // =================================================================
    updateHUD() {
      this._setSmallNum(this.scoreSmallNum, this.scoreCount);
      this._setComboNum(this.comboCount);
      if (this.comboLabel) {
        this.comboLabel.setScale(this.comboTimeCnt / 100, 1);
      }
      if (this.worldBestText) {
        var best = Math.max(getDisplayedHighScore(), this.scoreCount);
        this.worldBestText.setText(getWorldBestLabel() + " " + String(best));
      }
    }
    _setComboNum(num) {
      if (!this.comboNumContainer || !this._comboNumSprites) return;
      if (this._lastComboNum === num) return;
      this._lastComboNum = num;
      for (var i = 0; i < this._comboNumSprites.length; i++) {
        this.comboNumContainer.remove(this._comboNumSprites[i], true);
      }
      this._comboNumSprites = [];
      var text = String(num);
      var x = 0;
      for (var j = 0; j < text.length; j++) {
        var frame = "comboNum" + text[j] + ".gif";
        try {
          var sprite = this.add.image(x, 0, "game_ui", frame);
          sprite.setOrigin(0, 0);
          this.comboNumContainer.add(sprite);
          this._comboNumSprites.push(sprite);
          x += sprite.width;
        } catch (e) {
        }
      }
    }
    _initSmallNum(maxDigit) {
      var container = this.add.container(0, 0);
      var sprites = [];
      for (var n = 0; n < maxDigit; n++) {
        var sp = this.add.image((maxDigit - 1 - n) * 6, 0, "game_ui", "smallNum0.gif");
        sp.setOrigin(0, 0);
        container.add(sp);
        sprites.push(sp);
      }
      return { container, sprites, _lastVal: -1 };
    }
    _setSmallNum(smallNum, val) {
      if (!smallNum || !smallNum.sprites) return;
      val = Math.max(0, Math.floor(val));
      if (smallNum._lastVal === val) return;
      smallNum._lastVal = val;
      var text = String(val);
      var sprites = smallNum.sprites;
      for (var i = 0; i < sprites.length; i++) {
        var digit = text.length > i ? text[text.length - 1 - i] : "0";
        try {
          sprites[i].setFrame("smallNum" + digit + ".gif");
        } catch (e) {
        }
        sprites[i].setAlpha(i < text.length ? 1 : 0.5);
      }
    }
    _initBigNum(maxDigit) {
      var container = this.add.container(0, 0);
      var sprites = [];
      for (var n = 0; n < maxDigit; n++) {
        var sp = this.add.image((maxDigit - 1 - n) * 11, 0, "game_ui", "bigNum0.gif");
        sp.setOrigin(0, 0);
        container.add(sp);
        sprites.push(sp);
      }
      return { container, sprites, _lastVal: -1 };
    }
    _setBigNum(bigNum, val) {
      if (!bigNum || !bigNum.sprites) return;
      val = Math.max(0, Math.floor(val));
      if (bigNum._lastVal === val) return;
      bigNum._lastVal = val;
      var text = String(val);
      var sprites = bigNum.sprites;
      for (var i = 0; i < sprites.length; i++) {
        var digit = text.length > i ? text[text.length - 1 - i] : "0";
        try {
          sprites[i].setFrame("bigNum" + digit + ".gif");
        } catch (e) {
        }
      }
    }
  };

  // ../2019-es7/src/firebaseScores.js
  var DEFAULT_DATABASE_PATH = "leaderboards/globalHighScore";
  var databaseRef = null;
  function getFirebaseConfig() {
    const config = globalThis.__FIREBASE_CONFIG__;
    if (!config || typeof config !== "object") {
      return null;
    }
    if (!config.apiKey || !config.databaseURL) {
      return null;
    }
    return config;
  }
  function getDatabasePath() {
    const path = typeof globalThis.__FIREBASE_DATABASE_PATH__ === "string" ? globalThis.__FIREBASE_DATABASE_PATH__ : DEFAULT_DATABASE_PATH;
    return path.replace(/^\/+/, "").replace(/\/+$/, "") || DEFAULT_DATABASE_PATH;
  }
  function getFirebaseNamespace() {
    return globalThis.firebase || null;
  }
  function extractScore(value) {
    if (value && typeof value === "object" && value.value !== void 0) {
      return normalizeScore(value.value);
    }
    return normalizeScore(value);
  }
  function createScorePayload(firebaseNamespace, score) {
    return {
      value: normalizeScore(score),
      updatedAt: firebaseNamespace.database.ServerValue.TIMESTAMP
    };
  }
  function ensureDatabaseRef() {
    if (databaseRef) {
      return databaseRef;
    }
    const firebaseNamespace = getFirebaseNamespace();
    const config = getFirebaseConfig();
    if (!firebaseNamespace || !config) {
      return null;
    }
    if (typeof firebaseNamespace.initializeApp !== "function" || typeof firebaseNamespace.database !== "function") {
      return null;
    }
    if (!firebaseNamespace.apps || firebaseNamespace.apps.length === 0) {
      firebaseNamespace.initializeApp(config);
    }
    databaseRef = firebaseNamespace.database().ref(getDatabasePath());
    return databaseRef;
  }
  function syncRemoteScoreToState(remoteScore) {
    const mergedHighScore = Math.max(
      normalizeScore(gameState.localHighScore),
      normalizeScore(gameState.highScore),
      normalizeScore(remoteScore)
    );
    setHighScore(remoteScore, "remote");
    setHighScore(mergedHighScore, "merged");
    saveHighScore();
    setScoreSyncStatus("ready");
    return mergedHighScore;
  }
  function submitHighScore(score) {
    const candidate = normalizeScore(score);
    const ref = ensureDatabaseRef();
    const firebaseNamespace = getFirebaseNamespace();
    if (candidate > 0) {
      setHighScore(candidate, "local");
      saveHighScore();
    }
    if (!ref || !firebaseNamespace) {
      if (!getFirebaseConfig()) {
        setScoreSyncStatus("disabled", "Firebase config missing.");
      } else {
        setScoreSyncStatus("error", "Firebase SDK unavailable.");
      }
      return Promise.resolve(normalizeScore(gameState.highScore));
    }
    setScoreSyncStatus("saving");
    return ref.transaction((currentValue) => {
      const currentScore = extractScore(currentValue);
      if (candidate <= currentScore) {
        return currentValue;
      }
      return createScorePayload(firebaseNamespace, candidate);
    }).then((result) => {
      const nextScore = extractScore(result && result.snapshot ? result.snapshot.val() : candidate);
      return syncRemoteScoreToState(Math.max(candidate, nextScore));
    }).catch((error) => {
      setScoreSyncStatus("error", error && error.message ? error.message : "Firebase write failed.");
      return normalizeScore(gameState.highScore);
    });
  }

  // ../2019-es7/src/phaser/ui/BigNumberDisplay.js
  var BigNumberDisplay = class {
    constructor(scene, maxDigit) {
      this.scene = scene;
      this.container = scene.add.container(0, 0);
      this.sprites = [];
      this._lastVal = -1;
      for (var n = 0; n < maxDigit; n++) {
        var sp = scene.add.image((maxDigit - 1 - n) * 11, 0, "game_ui", "bigNum0.gif");
        sp.setOrigin(0, 0);
        this.container.add(sp);
        this.sprites.push(sp);
      }
    }
    setValue(val) {
      val = Math.max(0, Math.floor(val));
      if (this._lastVal === val) return;
      this._lastVal = val;
      var text = String(val);
      for (var i = 0; i < this.sprites.length; i++) {
        var digit = text.length > i ? text[text.length - 1 - i] : "0";
        try {
          this.sprites[i].setFrame("bigNum" + digit + ".gif");
        } catch (e) {
        }
      }
    }
  };

  // ../2019-es7/src/phaser/ContinueScene.js
  var GW14 = GAME_DIMENSIONS.WIDTH;
  var GH12 = GAME_DIMENSIONS.HEIGHT;
  var GCX7 = GAME_DIMENSIONS.CENTER_X;
  var GCY4 = GAME_DIMENSIONS.CENTER_Y;
  function buildTweetUrl() {
    var score = Number(gameState.score || 0);
    var highScore = Number(gameState.highScore || 0);
    var url, hashtags, text;
    if (LANG === "ja") {
      url = encodeURIComponent("https://game.capcom.com/cfn/sfv/aprilfool/2019/?lang=ja");
      hashtags = encodeURIComponent("シャド研,SFVAE,aprilfool,エイプリルフール");
      text = encodeURIComponent("エイプリルフール 2019 世界大統領がSTGやってみた\n今回のSCORE:" + score + "\nHISCORE:" + highScore + "\n");
    } else {
      url = encodeURIComponent("https://game.capcom.com/cfn/sfv/aprilfool/2019/?lang=en");
      hashtags = encodeURIComponent("ShadalooCRI, SFVAE, aprilfool");
      text = encodeURIComponent("APRIL FOOL 2019 WORLD PRESIDENT CHALLENGES A STG\nSCORE:" + score + "\nBEST:" + highScore + "\n");
    }
    return "https://twitter.com/intent/tweet?url=" + url + "&hashtags=" + hashtags + "&text=" + text;
  }
  function openUrl(url) {
    if (!url || typeof window === "undefined") return;
    try {
      window.open(url, "_blank");
    } catch (e) {
    }
  }
  function pickContinueComment() {
    var recipe = gameState._phaserRecipe;
    if (!recipe) return "";
    var key = LANG === "ja" ? "continueComment" : "continueCommentEn";
    var list = Array.isArray(recipe[key]) ? recipe[key] : [];
    if (!list.length) return "";
    return String(list[Math.floor(Math.random() * list.length)] || "");
  }
  var PhaserContinueScene = class extends Phaser.Scene {
    constructor() {
      super({ key: "PhaserContinueScene" });
    }
    create() {
      this.sceneSwitch = 0;
      this.countDown = 9;
      this.countActive = true;
      this.add.rectangle(GCX7, GCY4, GW14, GH12, 0);
      this.continueTitle = this.add.sprite(0, 70, "game_ui", "continueTitle.gif");
      this.continueTitle.setOrigin(0, 0);
      if (!this.anims.exists("continue_face_idle")) {
        this.anims.create({
          key: "continue_face_idle",
          frames: this.anims.generateFrameNames("game_ui", {
            prefix: "continueFace",
            start: 0,
            end: 1,
            suffix: ".gif"
          }),
          frameRate: 3,
          repeat: -1
        });
      }
      this.loseFace = this.add.sprite(20, this.continueTitle.y + this.continueTitle.height + 38, "game_ui", "continueFace0.gif");
      this.loseFace.setOrigin(0, 0);
      this.loseFace.play("continue_face_idle");
      this.cntTextBg = this.add.sprite(
        this.loseFace.x + this.loseFace.width + 20,
        this.continueTitle.y + this.continueTitle.height + 30,
        "game_ui",
        "countdownBg.gif"
      );
      this.cntTextBg.setOrigin(0, 0);
      this.cntText = this.add.sprite(
        this.cntTextBg.x,
        this.cntTextBg.y,
        "game_ui",
        "countdown9.gif"
      );
      this.cntText.setOrigin(0, 0);
      this.cntText.setAlpha(0);
      var self = this;
      this.yesBtn = this.add.sprite(0, 0, "game_ui", "continueYes.gif");
      this.yesBtn.setOrigin(0, 0);
      this.yesBtn.x = GCX7 - this.yesBtn.width / 2 - 50;
      this.yesBtn.y = GCY4 - this.yesBtn.height / 2 + 70;
      this.noBtn = this.add.sprite(0, 0, "game_ui", "continueNo.gif");
      this.noBtn.setOrigin(0, 0);
      this.noBtn.x = GCX7 - this.noBtn.width / 2 + 50;
      this.noBtn.y = GCY4 - this.noBtn.height / 2 + 70;
      this.setupContinueButton(this.yesBtn, "continueYes", function() {
        self.selectYes();
      });
      this.setupContinueButton(this.noBtn, "continueNo", function() {
        self.selectNo();
      });
      this.commentText = this.add.text(
        GCX7,
        GH12 - 100,
        pickContinueComment(),
        {
          fontFamily: "sans-serif",
          fontSize: "14px",
          fontStyle: "bold",
          color: "#ffffff",
          wordWrap: { width: 230 },
          align: "center"
        }
      );
      this.commentText.setOrigin(0.5);
      this.yKey = null;
      this.nKey = null;
      this.enterKey = null;
      try {
        this.yKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Y);
        this.nKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.N);
        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
      } catch (e) {
      }
      this.playBgm("bgm_continue", 0.25);
      this.countdownTimer = this.time.addEvent({
        delay: 1200,
        repeat: 10,
        // 11 total calls: 10 for digits 9→0, 1 more to trigger selectNo
        callback: this.onCountDown,
        callbackScope: this
      });
    }
    setupContinueButton(button, framePrefix, onPress) {
      button.setInteractive({ useHandCursor: true });
      button.on("pointerover", function() {
        button.setFrame(framePrefix + "Over.gif");
      });
      button.on("pointerout", function() {
        button.setFrame(framePrefix + ".gif");
      });
      button.on("pointerdown", function() {
        button.setFrame(framePrefix + "Down.gif");
      });
      button.on("pointerup", function() {
        button.setFrame(framePrefix + "Over.gif");
        onPress();
      });
    }
    onCountDown() {
      if (!this.countActive) return;
      if (this.countDown < 0) {
        this.selectNo();
        return;
      }
      var frameKey = "countdown" + String(this.countDown) + ".gif";
      try {
        this.cntText.setFrame(frameKey);
      } catch (e) {
      }
      this.cntText.setAlpha(1);
      this.playSound("voice_countdown" + String(this.countDown), 0.7);
      this.countDown--;
    }
    selectYes() {
      if (!this.countActive) return;
      this.countActive = false;
      if (this.countdownTimer) {
        this.countdownTimer.remove();
      }
      this.playSound("g_continue_yes_voice" + String(Math.floor(Math.random() * 3)), 0.7);
      this.sceneSwitch = 1;
      try {
        this.loseFace.setFrame("continueFace3.gif");
      } catch (e) {
      }
      this.goNext();
    }
    selectNo() {
      if (!this.countActive) return;
      this.countActive = false;
      if (this.countdownTimer) {
        this.countdownTimer.remove();
      }
      this.playSound("voice_gameover", 0.7);
      this.playSound("bgm_gameover", 0.4);
      try {
        this.cntText.setFrame("countdown0.gif");
        this.cntText.setAlpha(0.2);
        this.loseFace.setFrame("continueFace2.gif");
      } catch (e) {
      }
      if (this.commentText) {
        this.commentText.setVisible(false);
      }
      if (this.yesBtn) {
        this.yesBtn.setVisible(false);
      }
      if (this.noBtn) {
        this.noBtn.setVisible(false);
      }
      this.gameOverTxt = this.add.sprite(
        GCX7,
        GCY4 - 35,
        "game_ui",
        "continueGameOver.gif"
      );
      this.gameOverTxt.setOrigin(0.5);
      this.gameOverTxt.setAlpha(0);
      var self = this;
      this.flashRect = this.add.rectangle(GCX7, GCY4, GW14, GH12, 0).setDepth(-1);
      var shakeSteps = [
        { dy: 10, color: 7798784 },
        { dy: -5, color: 0 },
        { dy: 3, color: 7798784 },
        { dy: 0, color: 0 }
      ];
      var stepIndex = 0;
      var shakeTimer = this.time.addEvent({
        delay: 70,
        repeat: shakeSteps.length - 1,
        callback: function() {
          var step = shakeSteps[stepIndex];
          self.cameras.main.setScroll(0, -step.dy);
          self.flashRect.setFillStyle(step.color);
          stepIndex++;
          if (stepIndex >= shakeSteps.length) {
            self.cameras.main.setScroll(0, 0);
          }
        }
      });
      this.tweens.add({
        targets: this.gameOverTxt,
        alpha: 1,
        duration: 1e3,
        delay: 580,
        onComplete: function() {
          var voiceIndex = Math.floor(Math.random() * 2);
          self.playSound("g_continue_no_voice" + String(voiceIndex), 0.7);
          self.showGameOverPanel();
        }
      });
      if (Number(gameState.score || 0) >= Number(gameState.highScore || 0) || gameState.scoreSyncStatus === "loading" || gameState.scoreSyncStatus === "error") {
        submitHighScore(Number(gameState.score || 0)).catch(function() {
        });
      }
    }
    showGameOverPanel() {
      if (Number(gameState.score || 0) > Number(gameState.highScore || 0)) {
        gameState.highScore = Number(gameState.score || 0);
        saveHighScore();
        this.add.sprite(
          0,
          this.loseFace.y + this.loseFace.height + 10,
          "game_ui",
          "continueNewrecord.gif"
        ).setOrigin(0, 0);
      }
      var scoreTitleTxt = this.add.sprite(
        32,
        this.loseFace.y + this.loseFace.height + 30,
        "game_ui",
        "scoreTxt.gif"
      );
      scoreTitleTxt.setOrigin(0, 0);
      var bigNumDisplay = new BigNumberDisplay(this, 10);
      bigNumDisplay.container.x = scoreTitleTxt.x + scoreTitleTxt.width + 3;
      bigNumDisplay.container.y = scoreTitleTxt.y - 2;
      bigNumDisplay.setValue(Number(gameState.score || 0));
      this.worldBestText = this.add.text(
        scoreTitleTxt.x,
        scoreTitleTxt.y + 22,
        getWorldBestLabel() + " " + String(getDisplayedHighScore()),
        {
          fontFamily: "Arial",
          fontSize: "10px",
          fontStyle: "bold",
          color: "#ffffff",
          stroke: "#000000",
          strokeThickness: 2
        }
      );
      var syncTint = getHighScoreSyncTint();
      this.scoreSyncText = this.add.text(
        scoreTitleTxt.x,
        scoreTitleTxt.y + 22 + 14,
        getHighScoreSyncText(),
        {
          fontFamily: "Arial",
          fontSize: "8px",
          fontStyle: "bold",
          color: "#" + syncTint.toString(16).padStart(6, "0"),
          stroke: "#000000",
          strokeThickness: 2
        }
      );
      var self = this;
      this.tweetBtn = this.add.sprite(GCX7, 0, "game_ui", "twitterBtn0.gif");
      this.tweetBtn.setOrigin(0.5);
      this.tweetBtn.y = this.scoreSyncText.y + this.tweetBtn.height / 2 + 16;
      this.tweetBtn.setInteractive({ useHandCursor: true });
      this.tweetBtn.on("pointerover", function() {
        self.tweetBtn.setFrame("twitterBtn1.gif");
      });
      this.tweetBtn.on("pointerout", function() {
        self.tweetBtn.setFrame("twitterBtn0.gif");
      });
      this.tweetBtn.on("pointerdown", function() {
        self.tweetBtn.setFrame("twitterBtn2.gif");
      });
      this.tweetBtn.on("pointerup", function() {
        self.tweetBtn.setFrame("twitterBtn1.gif");
        openUrl(buildTweetUrl());
      });
      this.gotoTitleBtn = this.add.sprite(0, 0, "game_ui", "gotoTitleBtn0.gif");
      this.gotoTitleBtn.setOrigin(0.5);
      this.gotoTitleBtn.x = GCX7;
      this.gotoTitleBtn.y = this.tweetBtn.y + this.tweetBtn.height / 2 + this.gotoTitleBtn.height / 2 + 6;
      this.gotoTitleBtn.setInteractive({ useHandCursor: true });
      this.gotoTitleBtn.on("pointerover", function() {
        self.gotoTitleBtn.setFrame("gotoTitleBtn1.gif");
        self.playSound("se_over", 0.7);
      });
      this.gotoTitleBtn.on("pointerout", function() {
        self.gotoTitleBtn.setFrame("gotoTitleBtn0.gif");
      });
      this.gotoTitleBtn.on("pointerdown", function() {
        self.gotoTitleBtn.setFrame("gotoTitleBtn2.gif");
      });
      this.gotoTitleBtn.on("pointerup", function() {
        self.gotoTitleBtn.setFrame("gotoTitleBtn0.gif");
        self.playSound("se_correct", 0.7);
        self.gotoTitle();
      });
      this._gotoTitleReady = true;
    }
    gotoTitle() {
      if (this._gotoTitleDone) return;
      this._gotoTitleDone = true;
      if (this.gotoTitleBtn) {
        this.gotoTitleBtn.disableInteractive();
      }
      gameState.secondLoop = true;
      gameState.bgmContinuityActive = false;
      gameState.currentBgmKey = null;
      this.stopAllSounds();
      var game = this.game;
      setTimeout(function() {
        game.scene.stop("PhaserContinueScene");
        game.scene.start("PhaserTitleScene");
      }, 50);
    }
    goNext() {
      gameState.bgmContinuityActive = false;
      gameState.currentBgmKey = null;
      var self = this;
      this.tweens.add({
        targets: this.cameras.main,
        alpha: 0,
        duration: 1500,
        onComplete: function() {
          self.stopAllSounds();
          var nextScene;
          if (self.sceneSwitch === 1) {
            var recipe = gameState._phaserRecipe;
            if (recipe && recipe.playerData) {
              gameState.playerMaxHp = recipe.playerData.maxHp;
              gameState.playerHp = gameState.playerMaxHp;
              gameState.shootMode = recipe.playerData.defaultShootName;
              gameState.shootSpeed = recipe.playerData.defaultShootSpeed;
            }
            gameState.stageId = 0;
            gameState.continueCnt = Number(gameState.continueCnt || 0) + 1;
            gameState.score = gameState.continueCnt;
            nextScene = "PhaserGameScene";
          } else {
            nextScene = "PhaserTitleScene";
          }
          var game = self.game;
          setTimeout(function() {
            game.scene.stop("PhaserContinueScene");
            game.scene.start(nextScene);
          }, 50);
        }
      });
    }
    playSound(key, volume) {
      if (gameState.lowModeFlg) return;
      try {
        var vol = typeof volume === "number" ? volume : 0.7;
        if (this.cache.audio.exists(key)) {
          var existing = this.sound.get(key);
          if (existing) {
            this.sound.play(key, { volume: vol });
          } else {
            this.sound.add(key).play({ volume: vol });
          }
        }
      } catch (e) {
      }
    }
    playBgm(key, volume) {
      if (gameState.lowModeFlg) return;
      try {
        if (this.cache.audio.exists(key)) {
          var existing = this.sound.get(key);
          if (existing) {
            if (existing.isPlaying) existing.stop();
            existing.play({ volume: volume || 0.25, loop: true });
          } else {
            this.sound.add(key, { loop: true, volume: volume || 0.25 }).play();
          }
        }
      } catch (e) {
      }
    }
    stopAllSounds() {
      try {
        this.sound.stopAll();
      } catch (e) {
      }
    }
    update() {
      if (this.worldBestText) {
        this.worldBestText.setText(getWorldBestLabel() + " " + String(getDisplayedHighScore()));
      }
      if (this.scoreSyncText) {
        this.scoreSyncText.setText(getHighScoreSyncText());
        var syncTint = getHighScoreSyncTint();
        var syncColor = "#" + syncTint.toString(16).padStart(6, "0");
        if (this.scoreSyncText.style.color !== syncColor) {
          this.scoreSyncText.setColor(syncColor);
        }
      }
      var gp = pollGamepads();
      if (this.countActive) {
        if (this.yKey && Phaser.Input.Keyboard.JustDown(this.yKey) || this.enterKey && Phaser.Input.Keyboard.JustDown(this.enterKey) || gp.enter || gp.sp) {
          this.selectYes();
        } else if (this.nKey && Phaser.Input.Keyboard.JustDown(this.nKey)) {
          this.selectNo();
        }
      }
      if (this._gotoTitleReady && !this._gotoTitleDone) {
        if (this.enterKey && Phaser.Input.Keyboard.JustDown(this.enterKey)) {
          this.gotoTitle();
        }
        try {
          var pads = navigator.getGamepads ? navigator.getGamepads() : [];
          var anyPressed = false;
          for (var p = 0; p < pads.length; p++) {
            var pad = pads[p];
            if (!pad) continue;
            var btnIndices = [0, 1, 2, 3, 8, 9];
            for (var b = 0; b < btnIndices.length; b++) {
              var btn = pad.buttons[btnIndices[b]];
              if (btn && btn.pressed) {
                anyPressed = true;
                if (!this._gamepadTitlePressed) {
                  this._gamepadTitlePressed = true;
                  this.gotoTitle();
                }
                break;
              }
            }
          }
          if (!anyPressed) {
            this._gamepadTitlePressed = false;
          }
        } catch (e) {
        }
      }
    }
  };

  // ../2019-es7/src/phaser/EndingScene.js
  var GW15 = GAME_DIMENSIONS.WIDTH;
  var GH13 = GAME_DIMENSIONS.HEIGHT;
  var GCX8 = GAME_DIMENSIONS.CENTER_X;
  var GCY5 = GAME_DIMENSIONS.CENTER_Y;
  function buildTweetUrl2() {
    var score = Number(gameState.score || 0);
    var highScore = Number(gameState.highScore || 0);
    var url, hashtags, text;
    if (LANG === "ja") {
      url = encodeURIComponent("https://game.capcom.com/cfn/sfv/aprilfool/2019/?lang=ja");
      hashtags = encodeURIComponent("シャド研,SFVAE,aprilfool,エイプリルフール");
      text = encodeURIComponent("エイプリルフール 2019 世界大統領がSTGやってみた\n今回のSCORE:" + score + "\nHISCORE:" + highScore + "\n");
    } else {
      url = encodeURIComponent("https://game.capcom.com/cfn/sfv/aprilfool/2019/?lang=en");
      hashtags = encodeURIComponent("ShadalooCRI, SFVAE, aprilfool");
      text = encodeURIComponent("APRIL FOOL 2019 WORLD PRESIDENT CHALLENGES A STG\nSCORE:" + score + "\nBEST:" + highScore + "\n");
    }
    return "https://twitter.com/intent/tweet?url=" + url + "&hashtags=" + hashtags + "&text=" + text;
  }
  function openUrl2(url) {
    if (!url || typeof window === "undefined") return;
    try {
      window.open(url, "_blank");
    } catch (e) {
    }
  }
  var PhaserEndingScene = class extends Phaser.Scene {
    constructor() {
      super({ key: "PhaserEndingScene" });
    }
    create() {
      var self = this;
      var game = this.game;
      this.add.rectangle(GCX8, GCY5, GW15, GH13, 0);
      this.continueFlg = false;
      if (Number(gameState.score || 0) > Number(gameState.highScore || 0)) {
        gameState.highScore = Number(gameState.score || 0);
        saveHighScore();
        this.continueFlg = true;
      }
      if (Number(gameState.score || 0) >= Number(gameState.highScore || 0) || gameState.scoreSyncStatus === "loading" || gameState.scoreSyncStatus === "error") {
        submitHighScore(Number(gameState.score || 0)).catch(function() {
        });
      }
      if (!this.anims.exists("congra_bg_anim")) {
        this.anims.create({
          key: "congra_bg_anim",
          frames: this.anims.generateFrameNames("game_ui", {
            prefix: "congraBg",
            start: 0,
            end: 2,
            suffix: ".gif"
          }),
          frameRate: 6,
          repeat: -1
        });
      }
      this.bg = this.add.sprite(0, 0, "game_ui", "congraBg0.gif");
      this.bg.setOrigin(0, 0);
      this.bg.setAlpha(0);
      this.bg.play("congra_bg_anim");
      this.congraInfoBg = this.add.sprite(0, 210, "game_ui", "congraInfoBg.gif");
      this.congraInfoBg.setOrigin(0, 0.5);
      this.congraInfoBg.setAlpha(0);
      if (!this.anims.exists("congra_txt_anim")) {
        this.anims.create({
          key: "congra_txt_anim",
          frames: this.anims.generateFrameNames("game_ui", {
            prefix: "congraTxt",
            start: 0,
            end: 2,
            suffix: ".gif"
          }),
          frameRate: 12,
          repeat: -1
        });
      }
      this.congraTxt = this.add.sprite(0, 0, "game_ui", "congraTxt0.gif");
      this.congraTxt.setOrigin(0.5);
      this.congraTxt.play("congra_txt_anim");
      this.congraTxt.setScale(5);
      this.congraTxt.x = GW15 + this.congraTxt.displayWidth / 2;
      this.congraTxt.y = GCY5 - 32;
      var slideTargetX = -(this.congraTxt.displayWidth - GW15);
      this.congraTxtEffect = this.add.sprite(0, 0, "game_ui", "congraTxt0.gif");
      this.congraTxtEffect.setOrigin(0.5);
      this.congraTxtEffect.setVisible(false);
      if (this.continueFlg) {
        this.continueNewrecord = this.add.sprite(0, GCY5 - 40, "game_ui", "continueNewrecord.gif");
        this.continueNewrecord.setOrigin(0, 0);
        this.continueNewrecord.setScale(1, 0);
      } else {
        this.continueNewrecord = null;
      }
      this.scoreContainer = this.add.container(32, GCY5 - 23);
      this.scoreContainer.setScale(1, 0);
      this.scoreTitleTxt = this.add.sprite(0, 0, "game_ui", "scoreTxt.gif");
      this.scoreTitleTxt.setOrigin(0, 0);
      this.scoreContainer.add(this.scoreTitleTxt);
      this.bigNumDisplay = new BigNumberDisplay(this, 10);
      this.bigNumDisplay.container.x = this.scoreTitleTxt.width + 3;
      this.bigNumDisplay.container.y = -2;
      this.bigNumDisplay.setValue(Number(gameState.score || 0));
      this.scoreContainer.add(this.bigNumDisplay.container);
      this.worldBestText = this.add.text(
        32,
        GCY5 - 23 + 28,
        getWorldBestLabel() + " " + String(getDisplayedHighScore()),
        {
          fontFamily: "Arial",
          fontSize: "11px",
          fontStyle: "bold",
          color: "#ffffff",
          stroke: "#000000",
          strokeThickness: 2
        }
      );
      var syncTint = getHighScoreSyncTint();
      this.scoreSyncText = this.add.text(
        32,
        GCY5 - 23 + 28 + 16,
        getHighScoreSyncText(),
        {
          fontFamily: "Arial",
          fontSize: "8px",
          fontStyle: "bold",
          color: "#" + syncTint.toString(16).padStart(6, "0"),
          stroke: "#000000",
          strokeThickness: 2
        }
      );
      this.tweetBtn = this.createFrameButton(GCX8, GCY5 + 28, "twitterBtn");
      this.tweetBtn.setOrigin(0.5);
      this.tweetBtn.setScale(0);
      this.tweetBtn.on("pointerup", function() {
        openUrl2(buildTweetUrl2());
      });
      this.gotoTitleBtn = this.add.sprite(0, 0, "game_ui", "gotoTitleBtn0.gif");
      this.gotoTitleBtn.setOrigin(0, 0);
      this.gotoTitleBtn.x = GCX8 - this.gotoTitleBtn.width / 2;
      this.gotoTitleBtn.y = GH13 - this.gotoTitleBtn.height - 13;
      this.gotoTitleBtn.setInteractive({ useHandCursor: true });
      this.gotoTitleBtn.on("pointerover", function() {
        self.gotoTitleBtn.setFrame("gotoTitleBtn1.gif");
      });
      this.gotoTitleBtn.on("pointerout", function() {
        self.gotoTitleBtn.setFrame("gotoTitleBtn0.gif");
      });
      this.gotoTitleBtn.on("pointerdown", function() {
        self.gotoTitleBtn.setFrame("gotoTitleBtn2.gif");
      });
      this.gotoTitleBtn.on("pointerup", function() {
        self.gotoTitleBtn.setFrame("gotoTitleBtn1.gif");
        self.gotoTitleBtn.disableInteractive();
        self.cameras.main.fadeOut(1500, 0, 0, 0);
        self.cameras.main.once("camerafadeoutcomplete", function() {
          gameState.bgmContinuityActive = false;
          gameState.currentBgmKey = null;
          gameState.stageId = 0;
          self.stopAllSounds();
          setTimeout(function() {
            game.scene.stop("PhaserEndingScene");
            game.scene.start("PhaserTitleScene");
          }, 50);
        });
      });
      this.tweens.add({
        targets: this.congraTxt,
        x: slideTargetX,
        duration: 2500,
        ease: "Linear"
      });
      this.time.delayedCall(500, function() {
        self.playSound("voice_congra", 0.7);
      });
      this.time.delayedCall(2200, function() {
        self.tweens.add({
          targets: self.bg,
          alpha: 1,
          duration: 800
        });
      });
      this.time.delayedCall(3e3, function() {
        self.playSound("se_sp", 0.7);
        self.congraTxt.x = GCX8;
        self.congraTxt.y = GCY5 - 60;
        self.congraTxt.setScale(3);
        self.congraTxtEffect.x = GCX8;
        self.congraTxtEffect.y = GCY5 - 60;
        self.tweens.add({
          targets: self.congraTxt,
          scaleX: 1,
          scaleY: 1,
          duration: 500,
          ease: "Expo.easeIn"
        });
      });
      this.time.delayedCall(3500, function() {
        self.congraTxtEffect.setVisible(true);
        self.congraTxtEffect.setAlpha(1);
        self.congraTxtEffect.setScale(1);
        self.tweens.add({
          targets: self.congraTxtEffect,
          scaleX: 1.5,
          scaleY: 1.5,
          duration: 1e3,
          ease: "Expo.easeOut"
        });
        self.tweens.add({
          targets: self.congraTxtEffect,
          alpha: 0,
          duration: 1e3,
          ease: "Expo.easeOut"
        });
      });
      this.time.delayedCall(4e3, function() {
        self.tweens.add({
          targets: self.congraInfoBg,
          alpha: 1,
          duration: 300
        });
      });
      var t = 4300;
      if (this.continueFlg && this.continueNewrecord) {
        this.time.delayedCall(t, function() {
          self.tweens.add({
            targets: self.continueNewrecord,
            scaleY: 1,
            duration: 500,
            ease: "Elastic.easeOut"
          });
        });
        t += 250;
      }
      this.time.delayedCall(t, function() {
        self.tweens.add({
          targets: self.scoreContainer,
          scaleX: 1,
          scaleY: 1,
          duration: 500,
          ease: "Elastic.easeOut"
        });
      });
      t += 250;
      this.time.delayedCall(t, function() {
        self.tweens.add({
          targets: self.tweetBtn,
          scaleX: 1,
          scaleY: 1,
          duration: 500,
          ease: "Elastic.easeOut"
        });
      });
    }
    createFrameButton(x, y, framePrefix) {
      var button = this.add.sprite(x, y, "game_ui", framePrefix + "0.gif");
      button.setInteractive({ useHandCursor: true });
      button.on("pointerover", function() {
        button.setFrame(framePrefix + "1.gif");
      });
      button.on("pointerout", function() {
        button.setFrame(framePrefix + "0.gif");
      });
      button.on("pointerdown", function() {
        button.setFrame(framePrefix + "2.gif");
      });
      button.on("pointerup", function() {
        button.setFrame(framePrefix + "1.gif");
      });
      return button;
    }
    showStaffRoll() {
      if (this.staffRollContainer) return;
      var self = this;
      this.staffRollContainer = this.add.container(0, 0);
      this.staffRollContainer.setDepth(500);
      var bg = this.add.rectangle(GCX8, GCY5, GW15, GH13, 0, 0.92);
      this.staffRollContainer.add(bg);
      var staffG = this.add.sprite(GCX8, 55, "game_ui", "staffrollG0.gif");
      staffG.setOrigin(0.5);
      this.staffRollContainer.add(staffG);
      try {
        if (!this.anims.exists("staffroll_waking")) {
          this.anims.create({
            key: "staffroll_waking",
            frames: this.anims.generateFrameNames("game_ui", {
              prefix: "staffrollG",
              start: 0,
              end: 7,
              suffix: ".gif"
            }),
            frameRate: 8,
            repeat: -1
          });
        }
        staffG.play("staffroll_waking");
      } catch (e) {
      }
      try {
        var namePanel = this.add.sprite(15, 90, "game_ui", "staffrollName.gif");
        namePanel.setOrigin(0, 0);
        this.staffRollContainer.add(namePanel);
      } catch (e) {
      }
      var closeText = this.add.text(GCX8, GH13 - 30, "TAP TO CLOSE", {
        fontFamily: "sans-serif",
        fontSize: "12px",
        fontStyle: "bold",
        color: "#888888"
      });
      closeText.setOrigin(0.5);
      this.staffRollContainer.add(closeText);
      this.staffRollContainer.setAlpha(0);
      this.tweens.add({
        targets: this.staffRollContainer,
        alpha: 1,
        duration: 400
      });
      bg.setInteractive();
      bg.on("pointerup", function() {
        self.tweens.add({
          targets: self.staffRollContainer,
          alpha: 0,
          duration: 300,
          onComplete: function() {
            self.staffRollContainer.destroy();
            self.staffRollContainer = null;
          }
        });
      });
    }
    playSound(key, volume) {
      if (gameState.lowModeFlg) return;
      try {
        var vol = typeof volume === "number" ? volume : 0.7;
        if (this.cache.audio.exists(key)) {
          var existing = this.sound.get(key);
          if (existing) {
            this.sound.play(key, { volume: vol });
          } else {
            this.sound.add(key).play({ volume: vol });
          }
        }
      } catch (e) {
      }
    }
    stopAllSounds() {
      try {
        this.sound.stopAll();
      } catch (e) {
      }
    }
    update() {
      if (this.worldBestText) {
        this.worldBestText.setText(getWorldBestLabel() + " " + String(getDisplayedHighScore()));
      }
      if (this.scoreSyncText) {
        this.scoreSyncText.setText(getHighScoreSyncText());
        var syncTint = getHighScoreSyncTint();
        this.scoreSyncText.setColor("#" + syncTint.toString(16).padStart(6, "0"));
      }
    }
  };

  // ../2019-es7/src/forge/slug.js
  function slugify(name) {
    return String(name || "").toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 30) || "level";
  }
  function packageIdFor(name) {
    return "com.easierbycode." + slugify(name);
  }

  // ../2019-es7/src/forge/fetch-level.js
  var FIREBASE_DB_URL = "https://evil-invaders-default-rtdb.firebaseio.com";
  var LEVELS_PATH = "levels";
  async function fetchLevel(levelName) {
    const url = FIREBASE_DB_URL + "/" + LEVELS_PATH + "/" + encodeURIComponent(levelName) + ".json";
    const res = await fetch(url);
    if (!res.ok) {
      const err = new Error("HTTP " + res.status + " for " + url);
      err.code = "HTTP_ERROR";
      throw err;
    }
    const data = await res.json();
    if (!data || !data.enemylist) {
      const err = new Error('Level "' + levelName + '" not found');
      err.code = "LEVEL_NOT_FOUND";
      throw err;
    }
    return data;
  }

  // ../2019-es7/src/forge/merge-atlas.js
  function fbKeyDecode(name) {
    return String(name).replace(/․/g, ".");
  }
  function loadImage(src) {
    return new Promise(function(resolve, reject) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = function() {
        resolve(img);
      };
      img.onerror = function() {
        reject(new Error("Failed to load image: " + src.slice(0, 80)));
      };
      img.src = src;
    });
  }
  function canvasToBlob(canvas, type) {
    return new Promise(function(resolve, reject) {
      canvas.toBlob(function(b) {
        if (b) resolve(b);
        else reject(new Error("toBlob returned null"));
      }, type || "image/png");
    });
  }
  async function loadJson(url) {
    const r = await fetch(url);
    if (!r.ok) throw new Error("Failed to load " + url + ": " + r.status);
    return r.json();
  }
  async function loadLocalAtlas(baseUrl) {
    const candidates = [
      { img: "assets/img/_game_asset.png", json: "assets/_game_asset.json" },
      { img: "assets/img/game_asset.png", json: "assets/game_asset.json" }
    ];
    for (const c of candidates) {
      try {
        const head = await fetch(baseUrl + c.json, { method: "HEAD" });
        if (!head.ok) continue;
        const json = await loadJson(baseUrl + c.json);
        const img = await loadImage(baseUrl + c.img);
        return { json, img, imgUrl: baseUrl + c.img };
      } catch (e) {
      }
    }
    throw new Error("Could not load any local game_asset atlas");
  }
  function buildMergedFrameMap(localJson, levelData, localH, mergedW, mergedH) {
    const frames = Object.assign({}, localJson.frames || {});
    const fbFrames = levelData.atlasFrames || {};
    for (const rawName of Object.keys(fbFrames)) {
      const fd = fbFrames[rawName];
      if (!fd || !fd.frame) continue;
      const name = fbKeyDecode(rawName);
      const fw = fd.frame.w;
      const fh = fd.frame.h;
      const entry = {
        frame: { x: fd.frame.x, y: fd.frame.y + localH, w: fw, h: fh },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: fw, h: fh },
        sourceSize: { w: fw, h: fh }
      };
      frames[name] = entry;
      let alt = null;
      if (name.endsWith(".png")) alt = name.slice(0, -4) + ".gif";
      else if (name.endsWith(".gif")) alt = name.slice(0, -4) + ".png";
      if (alt && frames[alt]) frames[alt] = entry;
    }
    return {
      frames,
      meta: Object.assign({}, localJson.meta || {}, {
        app: "forge/merge-atlas.js",
        size: { w: mergedW, h: mergedH },
        scale: "1"
      })
    };
  }
  async function bakeMergedAtlas(opts) {
    const baseUrl = opts.baseUrl || "./";
    const levelData = opts.levelData;
    const local = await loadLocalAtlas(baseUrl);
    if (!levelData.atlasImageDataURL || !levelData.atlasFrames) {
      const fetched = await fetch(local.imgUrl);
      const blob = await fetched.blob();
      return { pngBlob: blob, json: local.json, merged: false };
    }
    const fbImg = await loadImage(levelData.atlasImageDataURL);
    const localH = local.img.naturalHeight;
    const fbH = fbImg.naturalHeight;
    const width = Math.max(local.img.naturalWidth, fbImg.naturalWidth);
    const height = localH + fbH;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(local.img, 0, 0);
    ctx.drawImage(fbImg, 0, localH);
    const pngBlob = await canvasToBlob(canvas, "image/png");
    const mergedJson = buildMergedFrameMap(local.json, levelData, localH, width, height);
    return { pngBlob, json: mergedJson, merged: true, localH, fbH };
  }

  // ../2019-es7/src/forge/download-bgm.js
  async function sha1Hex(str) {
    const enc = new TextEncoder().encode(str);
    const buf = await crypto.subtle.digest("SHA-1", enc);
    const arr = new Uint8Array(buf);
    let hex = "";
    for (let i = 0; i < arr.length; i++) {
      hex += arr[i].toString(16).padStart(2, "0");
    }
    return hex;
  }
  async function downloadBgmForLevel(levelData, onProgress) {
    if (!levelData || !levelData.customAudioURLs) {
      return { manifest: {}, blobs: /* @__PURE__ */ new Map() };
    }
    const urls = levelData.customAudioURLs;
    const keys = Object.keys(urls).filter(function(k) {
      return urls[k] && typeof urls[k] === "string";
    });
    const manifest = {};
    const urlToFile = {};
    const blobs = /* @__PURE__ */ new Map();
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const url = urls[key];
      if (urlToFile[url]) {
        manifest[key] = urlToFile[url];
        continue;
      }
      const filename = (await sha1Hex(url)).slice(0, 16) + ".mp3";
      if (onProgress) onProgress(i, keys.length, key);
      try {
        const res = await fetch(url, { redirect: "follow" });
        if (!res.ok) throw new Error("HTTP " + res.status);
        const blob = await res.blob();
        blobs.set(filename, blob);
        urlToFile[url] = filename;
        manifest[key] = filename;
      } catch (e) {
        console.warn("forge: skip " + key + ": " + (e && e.message));
      }
    }
    return { manifest, blobs };
  }

  // ../2019-es7/src/forge/stage-www.js
  var KEEP_DIRS = [
    "assets/img/stage",
    "assets/img/loading",
    "assets/fonts",
    "assets/sounds"
  ];
  var KEEP_FILES = [
    "lib/phaser.min.js",
    "lib/boot.bundle.js",
    "assets/img/title_bg.jpg",
    "assets/game.json",
    "assets/img/game_ui.png",
    "assets/game_ui.json",
    "assets/img/title_ui.png",
    "assets/title_ui.json"
  ];
  var UI_ATLAS_FALLBACKS = [
    { from: "assets/img/_game_ui.png", to: "assets/img/game_ui.png" },
    { from: "assets/_game_ui.json", to: "assets/game_ui.json" },
    { from: "assets/img/_title_ui.png", to: "assets/img/title_ui.png" },
    { from: "assets/_title_ui.json", to: "assets/title_ui.json" }
  ];
  async function fetchBlobIfPresent(url) {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      return await res.blob();
    } catch (e) {
      return null;
    }
  }
  async function listDirIndex(baseUrl, dirRel) {
    const idxUrl = baseUrl + dirRel + "/index.json";
    try {
      const r = await fetch(idxUrl);
      if (!r.ok) return null;
      return await r.json();
    } catch (e) {
      return null;
    }
  }
  async function stageWww(opts) {
    const baseUrl = opts.baseUrl || "./";
    const map = /* @__PURE__ */ new Map();
    for (const rel of KEEP_FILES) {
      const blob = await fetchBlobIfPresent(baseUrl + rel);
      if (blob) map.set(rel, blob);
    }
    for (const fb of UI_ATLAS_FALLBACKS) {
      if (map.has(fb.to)) continue;
      const blob = await fetchBlobIfPresent(baseUrl + fb.from);
      if (blob) map.set(fb.to, blob);
    }
    for (const dir of KEEP_DIRS) {
      const idx = await listDirIndex(baseUrl, dir);
      if (!idx || !Array.isArray(idx.files)) continue;
      for (const name of idx.files) {
        const rel = dir + "/" + name;
        const blob = await fetchBlobIfPresent(baseUrl + rel);
        if (blob) map.set(rel, blob);
      }
    }
    return map;
  }
  function buildOfflineLevelRecord(levelData) {
    const rec = Object.assign({}, levelData);
    delete rec.atlasImageDataURL;
    delete rec.atlasFrames;
    delete rec.frameThumbnails;
    return rec;
  }

  // ../2019-es7/src/forge/rebrand-html.js
  function xmlEscape(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
  }
  async function loadSourceHtml(baseUrl) {
    const r = await fetch((baseUrl || "./") + "phaser-game.html");
    if (!r.ok) throw new Error("Could not load phaser-game.html: " + r.status);
    return r.text();
  }
  function rebrandPhaserGameHtml(srcHtml, levelName, offlineLevel) {
    let html = srcHtml;
    html = html.replace(
      /<title>[\s\S]*?<\/title>/,
      "<title>" + xmlEscape(levelName) + "</title>"
    );
    html = html.replace(
      /<script\s+src="\.\/lib\/firebase-app-compat\.js"><\/script>\s*/g,
      ""
    );
    html = html.replace(
      /<script\s+src="\.\/lib\/firebase-database-compat\.js"><\/script>\s*/g,
      ""
    );
    html = html.replace(
      /<script\s+type="module">[\s\S]*?<\/script>/,
      '<script src="./lib/boot.bundle.js"><\/script>'
    );
    const inject = "<script>window.__OFFLINE_LEVEL_NAME__=" + JSON.stringify(String(levelName)) + ";window.__OFFLINE_LEVEL__=" + JSON.stringify(offlineLevel) + ";<\/script>";
    html = html.replace(/<body>/, "<body>\n" + inject);
    return html;
  }

  // ../2019-es7/src/forge/forge-driver.js
  function blobToBase64(blob) {
    return new Promise(function(resolve, reject) {
      const r = new FileReader();
      r.onloadend = function() {
        const s = String(r.result || "");
        const i = s.indexOf(",");
        resolve(i >= 0 ? s.slice(i + 1) : "");
      };
      r.onerror = function() {
        reject(r.error);
      };
      r.readAsDataURL(blob);
    });
  }
  function strToBlob(s, type) {
    return new Blob([s], { type: type || "text/plain" });
  }
  function jsonToBlob(obj) {
    return new Blob([JSON.stringify(obj)], { type: "application/json" });
  }
  function callPlugin(method, opts) {
    return new Promise(function(resolve, reject) {
      if (!window.ApkForge) return reject(new Error("ApkForge plugin not loaded"));
      window.ApkForge[method](
        opts,
        function(res) {
          resolve(res);
        },
        function(err) {
          reject(new Error(String(err && err.message || err)));
        }
      );
    });
  }
  async function writeStaged(workDir, relPath, blob, onProgress, idx, total) {
    const b64 = await blobToBase64(blob);
    if (onProgress) onProgress({
      phase: "upload",
      percent: Math.round(40 + 30 * idx / total),
      message: "Uploading " + relPath + " (" + (idx + 1) + "/" + total + ")"
    });
    await callPlugin("writeStagedFile", { workDir, relPath, base64: b64 });
  }
  async function forgeLevel(opts) {
    const onProgress = opts.onProgress || function() {
    };
    const levelName = String(opts.levelName || "").trim();
    if (!levelName) throw new Error("levelName is required");
    const slug = slugify(levelName);
    const packageId = opts.packageId || packageIdFor(levelName);
    onProgress({ phase: "fetch", percent: 5, message: "Fetching level from Firebase" });
    const levelData = await fetchLevel(levelName);
    onProgress({ phase: "stage", percent: 12, message: "Staging www tree" });
    const wwwBlobs = await stageWww({ baseUrl: "./" });
    onProgress({ phase: "atlas", percent: 18, message: "Merging atlas" });
    const merged = await bakeMergedAtlas({ baseUrl: "./", levelData });
    wwwBlobs.set("assets/img/game_asset.png", merged.pngBlob);
    wwwBlobs.set("assets/game_asset.json", jsonToBlob(merged.json));
    if (!opts.skipBgm) {
      onProgress({ phase: "bgm", percent: 24, message: "Downloading custom BGM" });
      const bgm = await downloadBgmForLevel(levelData, function(i, n, key) {
        onProgress({
          phase: "bgm",
          percent: 24 + Math.round(8 * i / Math.max(1, n)),
          message: "BGM: " + key + " (" + (i + 1) + "/" + n + ")"
        });
      });
      for (const [name, blob] of bgm.blobs) {
        wwwBlobs.set("assets/custom-bgm/" + name, blob);
      }
      wwwBlobs.set("assets/custom-bgm/manifest.json", jsonToBlob(bgm.manifest));
    }
    onProgress({ phase: "rebrand", percent: 33, message: "Rebranding HTML" });
    const offlineLevel = buildOfflineLevelRecord(levelData);
    wwwBlobs.set("assets/level-data.json", jsonToBlob(offlineLevel));
    const srcHtml = await loadSourceHtml("./");
    const rebranded = rebrandPhaserGameHtml(srcHtml, levelName, offlineLevel);
    wwwBlobs.set("phaser-game.html", strToBlob(rebranded, "text/html"));
    onProgress({ phase: "workdir", percent: 38, message: "Preparing native workdir" });
    const workDir = await callPlugin("prepareWorkdir", { workDir: slug });
    const relPaths = Array.from(wwwBlobs.keys());
    for (let i = 0; i < relPaths.length; i++) {
      const rel = relPaths[i];
      await writeStaged(workDir, rel, wwwBlobs.get(rel), onProgress, i, relPaths.length);
    }
    onProgress({ phase: "build", percent: 75, message: "Patching shell APK" });
    return await new Promise(function(resolve, reject) {
      window.ApkForge.build({
        workDir,
        packageId,
        displayName: levelName,
        slug,
        outFilename: slug + ".apk"
      }, function(ev) {
        onProgress(ev);
        if (ev && ev.phase === "done") resolve(ev);
      }, function(err) {
        reject(new Error(String(err && err.message || err)));
      });
    });
  }
  function isAvailable() {
    return !!(typeof window !== "undefined" && window.ApkForge && window.ApkForge.isAvailable && window.ApkForge.isAvailable());
  }

  // ../2019-es7/src/phaser/ForgeScene.js
  var PhaserForgeScene = class extends Phaser.Scene {
    constructor() {
      super({ key: "PhaserForgeScene" });
    }
    init(data) {
      this.initialLevelName = data && data.levelName || "";
      this.busy = false;
      this.lastResult = null;
    }
    create() {
      const W = GAME_DIMENSIONS.WIDTH;
      const H = GAME_DIMENSIONS.HEIGHT;
      this.add.rectangle(0, 0, W, H, 0).setOrigin(0, 0);
      this.add.text(W / 2, 24, "BUILD APK", {
        fontFamily: "Arial",
        fontSize: "20px",
        fontStyle: "bold",
        color: "#0f0",
        stroke: "#000",
        strokeThickness: 3
      }).setOrigin(0.5, 0);
      this.add.text(W / 2, 56, "Enter Firebase level name:", {
        fontFamily: "Arial",
        fontSize: "10px",
        color: "#fff"
      }).setOrigin(0.5, 0);
      this.levelText = this.add.text(W / 2, 80, this.initialLevelName || "(tap to type)", {
        fontFamily: "Arial",
        fontSize: "14px",
        color: "#9be37f",
        stroke: "#000",
        strokeThickness: 2,
        backgroundColor: "#111",
        padding: { left: 8, right: 8, top: 4, bottom: 4 }
      }).setOrigin(0.5, 0);
      this.levelText.setInteractive({ useHandCursor: true });
      const self = this;
      this.levelText.on("pointerup", function() {
        self.promptForLevelName();
      });
      this.statusText = this.add.text(W / 2, 130, "", {
        fontFamily: "Arial",
        fontSize: "10px",
        color: "#fff",
        wordWrap: { width: W - 24 },
        align: "center"
      }).setOrigin(0.5, 0);
      this.progressBg = this.add.rectangle(W / 2, 200, W - 32, 12, 2236962).setOrigin(0.5);
      this.progressBg.setStrokeStyle(1, 6710886);
      this.progressBar = this.add.rectangle(16, 194, 0, 12, 240).setOrigin(0, 0);
      this.buildBtn = this.makeButton(W / 2, H - 200, "BUILD", 160, function() {
        self.startBuild();
      });
      this.installBtn = this.makeButton(W / 2, H - 150, "INSTALL", 108, function() {
        self.installLast();
      });
      this.installBtn.setVisible(false);
      this.backBtn = this.makeButton(W / 2, H - 60, "BACK", 1092, function() {
        if (!self.busy) self.scene.start("PhaserTitleScene");
      });
      if (!isAvailable()) {
        this.statusText.setText("APK Forge requires the Cordova Android build.\nThis feature is unavailable in the browser.");
        this.buildBtn.setAlpha(0.3);
        this.buildBtn.removeInteractive();
      } else {
        this.statusText.setText("Ready.");
      }
    }
    makeButton(x, y, label, fill, onUp) {
      const w = 140;
      const h = 36;
      const g = this.add.rectangle(x, y, w, h, fill).setStrokeStyle(2, 16777215);
      const t = this.add.text(x, y, label, {
        fontFamily: "Arial",
        fontSize: "14px",
        fontStyle: "bold",
        color: "#fff"
      }).setOrigin(0.5);
      g.setInteractive({ useHandCursor: true });
      g.on("pointerup", onUp);
      g.on("pointerover", function() {
        g.setFillStyle(fill, 0.85);
      });
      g.on("pointerout", function() {
        g.setFillStyle(fill, 1);
      });
      g.label = t;
      return g;
    }
    promptForLevelName() {
      const cur = this.levelText.text === "(tap to type)" ? "" : this.levelText.text;
      const v = window.prompt("Firebase level name:", cur);
      if (v === null) return;
      const trimmed = String(v).trim();
      if (!trimmed) return;
      this.levelText.setText(trimmed);
    }
    setProgress(percent) {
      const max = GAME_DIMENSIONS.WIDTH - 32;
      const w = Math.max(0, Math.min(100, percent || 0)) / 100 * max;
      this.progressBar.width = w;
    }
    startBuild() {
      if (this.busy || !isAvailable()) return;
      const name = this.levelText.text;
      if (!name || name === "(tap to type)") {
        this.statusText.setText("Enter a level name first.");
        return;
      }
      this.busy = true;
      this.installBtn.setVisible(false);
      this.lastResult = null;
      this.setProgress(0);
      const self = this;
      const ensurePerm = function() {
        return new Promise(function(resolve) {
          if (!window.ApkForge) return resolve(false);
          window.ApkForge.checkInstallPermission(function(allowed) {
            if (allowed) return resolve(true);
            self.statusText.setText("Allow installs from this app, then tap BUILD again.");
            window.ApkForge.requestInstallPermission(function() {
            }, function() {
            });
            resolve(false);
          }, function() {
            resolve(false);
          });
        });
      };
      ensurePerm().then(function(ok) {
        if (!ok) {
          self.busy = false;
          return;
        }
        return forgeLevel({
          levelName: name,
          onProgress: function(ev) {
            if (typeof ev.percent === "number") self.setProgress(ev.percent);
            if (ev.message) self.statusText.setText(ev.message);
          }
        }).then(function(res) {
          self.busy = false;
          self.lastResult = res;
          self.setProgress(100);
          const sizeMb = (res.size / (1024 * 1024)).toFixed(1);
          self.statusText.setText("Built " + name + ".apk (" + sizeMb + " MB)\nReady to install.");
          self.installBtn.setVisible(true);
        }).catch(function(err) {
          self.busy = false;
          self.statusText.setText("FAILED: " + (err && err.message || err));
        });
      });
    }
    installLast() {
      if (!this.lastResult || !window.ApkForge) return;
      const uri = this.lastResult.uri;
      if (!uri) {
        this.statusText.setText("No content URI returned; open Files app to install.");
        return;
      }
      window.ApkForge.install({ uri }, function() {
      }, function(e) {
        console.error("install error", e);
      });
    }
  };

  // scripts/2028-ai/boot-entry.js
  var ASSET_BASE = "/games/2028-ai/";
  var LEVEL_DATA_URL = "https://cmg.easierbycode.deno.net/games/2028-ai/foo.json";
  var LEVEL_DATA_FALLBACK_URL = ASSET_BASE + "foo.json";
  function primeGameStateForStage2(recipe, stageId) {
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
    gameState.stageId = parseStageId(stageId, DEFAULTS.maxStage);
    gameState.continueCnt = 0;
    gameState.akebonoCnt = 0;
    gameState.shortFlg = false;
  }
  var PluginBootScene = class extends BootScene {
    preload() {
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
          try {
            const p = new URLSearchParams(location.search);
            if (p.get("boss") === "goki") {
              gameState.forceBossName = "goki";
              if (p.get("stage") == null) stageId = 3;
              bossRush = true;
            }
          } catch (_e) {
          }
          primeGameStateForStage2(recipe, stageId);
          if (bossRush) gameState.shortFlg = true;
        }
      }).then((result) => {
        if (result.bgmSourceURLs) {
          gameState.bgmSourceURLs = result.bgmSourceURLs;
        }
        return initSceneScripts({ recipe: gameState._phaserRecipe }).then(() => {
          let nextScene = result.showTitle ? "PhaserTitleScene" : "PhaserGameScene";
          if (nextScene === "PhaserGameScene") {
            if (hasSceneScript("title")) nextScene = "PhaserTitleScene";
            else if (hasSceneScript("adv")) nextScene = "PhaserAdvScene";
          }
          console.log("[2028.Ai] level loaded via plugin — source=" + result.source + " stage=" + result.stageId + " → " + nextScene);
          setTimeout(() => {
            game.scene.stop("BootScene");
            game.scene.start(nextScene);
          }, 50);
        });
      });
    }
  };
  var ScriptedTitleScene = class extends PhaserTitleScene {
    _ssOpts() {
      return {
        Phaser: globalThis.Phaser,
        state: gameState,
        next: () => {
          if (this.__ssAdvanced) return;
          this.__ssAdvanced = true;
          if (isSceneScriptReplaced(this)) super.goToAdvScene();
          else super.titleStart();
        }
      };
    }
    create() {
      this.__ssAdvanced = false;
      if (runSceneScriptCreate("title", this, this._ssOpts())) return;
      super.create();
      runSceneScriptStart("title", this, this._ssOpts());
    }
    titleStart() {
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
  };
  var ScriptedAdvScene = class extends PhaserAdvScene {
    _ssOpts() {
      return {
        Phaser: globalThis.Phaser,
        state: gameState,
        next: () => {
          if (this.__ssAdvanced) return;
          this.__ssAdvanced = true;
          if (this.endingFlg === void 0) {
            this.endingFlg = gameState.stageId === 5 || gameState.stageId === 4 && !(gameState.akebonoCnt >= 4 && gameState.continueCnt === 0);
          }
          super.goToNextScene();
        }
      };
    }
    create() {
      this.__ssAdvanced = false;
      if (runSceneScriptCreate("adv", this, this._ssOpts())) return;
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
  };
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
        context: window.__phaserAudioContext || void 0
      },
      plugins: {
        scene: [levelLoaderScenePluginConfig({ mapping: "levelLoader" })]
      },
      scene: [
        PluginBootScene,
        ScriptedTitleScene,
        ScriptedAdvScene,
        PhaserGameScene,
        PhaserContinueScene,
        PhaserEndingScene,
        PhaserForgeScene
      ]
    };
    const game = new Phaser.Game(config);
    globalThis.__PHASER_4_GAME__ = game;
    console.log("[2028.Ai] Phaser game started");
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
  async function fetchLevel2(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error("HTTP " + res.status + " for " + url);
    return res.json();
  }
  async function main() {
    try {
      globalThis.__OFFLINE_LEVEL__ = await fetchLevel2(LEVEL_DATA_URL);
    } catch (err) {
      console.warn("[2028.Ai] foo.json fetch failed (" + LEVEL_DATA_URL + ") — trying fallback", err);
      try {
        globalThis.__OFFLINE_LEVEL__ = await fetchLevel2(LEVEL_DATA_FALLBACK_URL);
      } catch (err2) {
        console.warn("[2028.Ai] fallback foo.json fetch failed — using base recipe", err2);
      }
    }
    whenPhaserReady(create2028Game);
  }
  main();
})();
