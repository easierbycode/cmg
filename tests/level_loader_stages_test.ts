// The level-loader plugin has to rebuild a whole game from a level record, not
// just the one stage the editor had open when it was saved.
//
// A Dezaemon 2 .sav import is 5-14 stages, each with its own enemylist,
// waveRows and background tile grid. The record used to carry only the open
// stage in its flat fields, and mergeRecipe rebuilt exactly that one — so
// launching ?stage=3 fell through to the BASE recipe's third stage: the stock
// game's enemies over the stock backdrop, with no warning. The record now
// carries a `stages` map beside the flat fields, and this covers mergeRecipe
// applying every entry of it (plus the soundtrack, which never travelled at
// all).
//
// mergeRecipe is pure data work, so it runs here against a stub Phaser and a
// stub scene rather than a browser: createLevelLoaderPlugin only needs
// Phaser.Plugins.ScenePlugin to extend, and the texture lookup is already
// guarded for scenes that have no atlas.

import assert from "node:assert/strict";
import { createLevelLoaderPlugin } from "../static/phaser-plugins/level-loader.js";

class StubScenePlugin {
  scene: unknown;
  constructor(scene: unknown, _pluginManager: unknown, _pluginKey: unknown) {
    this.scene = scene;
  }
}

const StubPhaser = { Plugins: { ScenePlugin: StubScenePlugin } };

// A scene with no atlas: mergeRecipe's texture-fallback lookup is wrapped in a
// try/catch precisely for this, and skips the per-frame fixups.
// deno-lint-ignore no-explicit-any
function makeLoader(): any {
  // deno-lint-ignore no-explicit-any
  const LevelLoaderPlugin = createLevelLoaderPlugin(StubPhaser as any);
  // deno-lint-ignore no-explicit-any
  return new (LevelLoaderPlugin as any)(
    { textures: null },
    null,
    "levelLoader",
  );
}

function grid(rows: number, cols: number, cell: string) {
  return Array.from({ length: rows }, () => Array(cols).fill(cell));
}

// The stock game's floor: five 8-wide stages, no scenery, no soundtrack.
function baseRecipe() {
  const recipe: Record<string, unknown> = { enemyData: {}, bossData: {} };
  for (let i = 0; i < 5; i++) {
    recipe["stage" + i] = { enemylist: grid(8, 8, "A0") };
  }
  return recipe;
}

// The shape saveToFirebase() writes for a nine-stage import: the open stage in
// the flat fields, every stage in `stages`, one shared cell list, one BGM table.
function multiStageLevel() {
  const stages: Record<string, unknown> = {};
  for (let i = 0; i < 9; i++) {
    stages["stage" + i] = {
      enemylist: grid(100 + i, 20, "AB" + i),
      waveRows: Array.from({ length: 100 + i }, (_, w) => w * 2),
      waveInterval: 6,
      background: { cols: 14, rows: 500 + i, tiles: [i] },
    };
  }
  return {
    stageKey: "stage0",
    enemylist: (stages.stage0 as { enemylist: string[][] }).enemylist,
    waveRows: (stages.stage0 as { waveRows: number[] }).waveRows,
    waveInterval: 6,
    background: { cols: 14, rows: 500, tiles: [0] },
    backgroundCells: [{ w: 16, h: 16 }, { w: 16, h: 16 }],
    stages,
    dezaemonBgm: {
      sfxSet: 1,
      stages: [[3, 4], [5, 6], [7, 8], [9, 10], [11, 12]],
      songs: { 9: "c29uZw==", 10: "Ym9zcw==" },
    },
  };
}

Deno.test("mergeRecipe applies every stage a level carries, not just the open one", () => {
  const loader = makeLoader();
  const level = multiStageLevel();
  const recipe = loader.mergeRecipe(baseRecipe(), level, "game_asset");

  const stageKeys = Object.keys(recipe).filter((k) => /^stage\d+$/.test(k));
  assert.equal(stageKeys.length, 9, "all nine stages reached the recipe");

  // Stage 3 is its own stage, not the base recipe's third.
  const s3 = recipe.stage3;
  assert.equal(s3.enemylist.length, 103);
  assert.equal(s3.enemylist[0].length, 20);
  assert.equal(s3.waveRows.length, 103, "its pacing came with it");
  assert.equal(s3.waveInterval, 6);
  assert.equal(s3.background.rows, 503, "its own scenery, at its own height");
  // ...and it is genuinely a different stage from the one the flat fields hold.
  assert.notDeepEqual(s3.enemylist, recipe.stage0.enemylist);
  assert.notEqual(s3.background.rows, recipe.stage0.background.rows);

  // The cell list every stage's tile grid indexes into, and the soundtrack.
  assert.equal(recipe.backgroundCells.length, 2);
  assert.equal(recipe.dezaemonBgm.sfxSet, 1);
  assert.deepEqual(recipe.dezaemonBgm.stages[3], [9, 10]);
});

Deno.test("a level saved before multi-stage still lands its one stage, leaving the rest alone", () => {
  const loader = makeLoader();
  const base = baseRecipe();
  const recipe = loader.mergeRecipe(base, {
    stageKey: "stage2",
    enemylist: grid(40, 20, "C1"),
    waveRows: Array.from({ length: 40 }, (_, w) => w * 3),
    waveInterval: 7,
    background: { cols: 14, rows: 300, tiles: [0] },
    backgroundCells: [{ w: 16, h: 16 }],
  }, "game_asset");

  const stageKeys = Object.keys(recipe).filter((k) => /^stage\d+$/.test(k));
  assert.equal(stageKeys.length, 5, "the base game's stages are untouched");
  assert.equal(recipe.stage2.enemylist.length, 40);
  assert.equal(recipe.stage2.waveRows.length, 40);
  assert.equal(recipe.stage2.waveInterval, 7);
  assert.equal(recipe.stage2.background.rows, 300);
  assert.equal(recipe.backgroundCells.length, 1);
  // Every other stage is still the stock 8-wide one.
  assert.equal(recipe.stage0.enemylist[0].length, 8);
  assert.equal(recipe.stage3.background, undefined);
  assert.equal(recipe.dezaemonBgm, undefined);
});

Deno.test("a carried stage with stale waveRows arrives without them, not mismatched", () => {
  const loader = makeLoader();
  const recipe = loader.mergeRecipe(baseRecipe(), {
    stageKey: "stage0",
    enemylist: grid(12, 20, "A0"),
    stages: {
      stage0: { enemylist: grid(12, 20, "A0") },
      // Past the base game's five stages, so it can only have come from
      // `stages` — and its rows are stale: the grid was edited down to 9
      // waves after the import, which retires the pacing rather than leaving
      // the runtime a mismatched pair.
      stage5: {
        enemylist: grid(9, 20, "B0"),
        waveRows: [0, 1, 2],
        waveInterval: 6,
      },
    },
  }, "game_asset");

  assert.equal(recipe.stage5.enemylist.length, 9);
  assert.equal(recipe.stage5.waveRows, undefined);
  assert.equal(recipe.stage5.waveInterval, undefined);
});

Deno.test("mergeRecipe transfers godMode from levelData to recipe when present", () => {
  const loader = makeLoader();

  const recipeGodOn = loader.mergeRecipe(baseRecipe(), {
    stageKey: "stage0",
    enemylist: grid(8, 8, "A0"),
    godMode: true,
  }, "game_asset");
  assert.equal(recipeGodOn.godMode, true);

  const recipeGodOff = loader.mergeRecipe(baseRecipe(), {
    stageKey: "stage0",
    enemylist: grid(8, 8, "A0"),
    godMode: false,
  }, "game_asset");
  assert.equal(recipeGodOff.godMode, false);

  const recipeGodUnset = loader.mergeRecipe(baseRecipe(), {
    stageKey: "stage0",
    enemylist: grid(8, 8, "A0"),
  }, "game_asset");
  assert.equal(recipeGodUnset.godMode, undefined);
});
