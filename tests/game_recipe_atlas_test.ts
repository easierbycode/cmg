// The shipped 2028.Ai recipe and the atlas it is drawn from have to agree.
//
// They drifted once and it was invisible until you pressed play: the recipe's
// player was changed to Duke while game_asset still only held the old ship's
// frames, so every level that does not pin its own playerData flew an
// unrenderable character. Nothing in the build catches that — the atlas is a
// data file, the recipe is a data file, and neither references the other.
//
// Levels can and do override these records, but the recipe is the floor: it is
// what a level without its own playerData/enemyData falls back to, so every
// frame it names must exist.

import { assertEquals, assertGreater } from "jsr:@std/assert@^1.0.14";
import { fromFileUrl, join } from "jsr:@std/path@^1.1.2";

const ROOT = fromFileUrl(new URL("../", import.meta.url));
const GAME_DIR = join(ROOT, "static", "games", "2028-ai", "assets");

// deno-lint-ignore no-explicit-any
function readJson(...parts: string[]): any {
  return JSON.parse(Deno.readTextFileSync(join(GAME_DIR, ...parts)));
}

function atlasFrameNames(): Set<string> {
  const atlas = readJson("game_asset.json");
  const frames = atlas.frames;
  return new Set(
    Array.isArray(frames)
      // deno-lint-ignore no-explicit-any
      ? frames.map((f: any) => f.filename)
      : Object.keys(frames),
  );
}

// Every texture array anywhere under `node`, so a record that grows a new
// animation slot is covered without this test being edited.
// deno-lint-ignore no-explicit-any
function texturesOf(node: any, out: string[] = []): string[] {
  if (!node || typeof node !== "object") return out;
  for (const [key, value] of Object.entries(node)) {
    if (Array.isArray(value)) {
      // `_texture` is the convention for a disabled/previous frame list.
      if (key.startsWith("_")) continue;
      for (const v of value) if (typeof v === "string") out.push(v);
    } else if (value && typeof value === "object") {
      texturesOf(value, out);
    }
  }
  return out;
}

Deno.test("every frame the shipped recipe's player names is in the atlas", () => {
  const recipe = readJson("game.json");
  const frames = atlasFrameNames();
  const referenced = texturesOf(recipe.playerData);
  assertGreater(referenced.length, 0, "the recipe names some player frames");
  assertEquals(
    referenced.filter((f) => !frames.has(f)),
    [],
    "player frames missing from game_asset — the ship or its shots would draw as nothing",
  );
});

Deno.test("the shipped recipe's enemies and bosses resolve too", () => {
  const recipe = readJson("game.json");
  const frames = atlasFrameNames();
  for (const section of ["enemyData", "bossData"]) {
    const referenced = texturesOf(recipe[section]);
    assertEquals(
      referenced.filter((f) => !frames.has(f)),
      [],
      `${section} frames missing from game_asset`,
    );
  }
});

Deno.test("the recipe's player is the same character the level editor seeds", async () => {
  // static/editor/dezaemon/lib is vendored from 2019-es7 and is what "New Game"
  // and a .sav import both hand the editor. If the two disagree, a brand-new
  // game plays as a different character than the one the game ships with.
  const { DUKE_PLAYER } = await import(
    new URL("../static/editor/dezaemon/lib/player-art.js", import.meta.url).href
  );
  const recipe = readJson("game.json");
  for (const key of ["texture"] as const) {
    assertEquals(recipe.playerData[key], DUKE_PLAYER[key]);
  }
  for (const shoot of ["shootNormal", "shootBig", "shoot3way"] as const) {
    assertEquals(
      recipe.playerData[shoot].texture,
      DUKE_PLAYER[shoot].texture,
      `${shoot} differs between the shipped recipe and the editor default`,
    );
  }
  assertEquals(recipe.playerData.barrier.texture, DUKE_PLAYER.barrier.texture);
});
