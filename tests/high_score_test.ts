// HI SCORE in an exported level app: it must survive the run, and survive a
// relaunch.
//
// Two bugs made an exported APK read "HI SCORE 0 / WORLD BEST STANDBY" after
// the player beat it:
//
//   1. tools/build-level bakes the editor's GOD MODE toggle into the shell, and
//      the god gate suppressed the LOCAL high score too — not just the shared
//      leaderboard write. An exported app ships no Firebase config, so it has
//      no leaderboard to protect; the gate only cost the player their own best.
//   2. cmg's boot entry never called initializeFirebaseScores(), so the cookie
//      saveHighScore() writes at the end of every run was never read back.
//      loadHighScore was tree-shaken clean out of game.bundle.js.
//
// The scenes live in the sibling 2019-es7 checkout (scripts/build-2028-ai.ts
// bundles them from there), so the behaviour tests skip on a fresh clone that
// lacks it. The bundle assertion at the bottom needs no sibling — it catches
// "fixed the source, forgot to rebuild".

import { assert, assertEquals, assertMatch, assertStringIncludes } from "@std/assert";
import { fileURLToPath } from "node:url";
import { join } from "@std/path";

const es7Root = Deno.env.get("CMG_ES7_ROOT") ??
  fileURLToPath(new URL("../../2019-es7", import.meta.url));

function haveEs7(): boolean {
  try {
    return Deno.statSync(join(es7Root, "src", "gameState.js")).isFile;
  } catch {
    return false;
  }
}

function moduleUrl(name: string): string {
  return "file:///" + join(es7Root, "src", name).replaceAll("\\", "/");
}

// deno-lint-ignore no-explicit-any
type Mod = any;
// deno-lint-ignore no-explicit-any
const g = globalThis as any;

// The WebView's persistent cookie store. It survives the "relaunch" below,
// which is the whole point of that test.
let jar = new Map<string, string>();

g.window = g;
g.document = {
  get cookie() {
    return [...jar].map(([k, v]) => `${k}=${v}`).join("; ");
  },
  set cookie(v: string) {
    const [pair] = v.split(";");
    const i = pair.indexOf("=");
    jar.set(pair.slice(0, i).trim(), pair.slice(i + 1));
  },
};
g.__GAME_STATE__ = {};

// One gameState instance for the whole file, mirroring the page: the module is
// a singleton over globalThis.__GAME_STATE__, and firebaseScores.js imports it
// by an un-suffixed specifier — so a cache-busted second copy would leave the
// two halves writing to different state objects.
const gs: Mod = haveEs7() ? await import(moduleUrl("gameState.js")) : null;

// One app launch: zeroed score state and a fresh firebaseScores instance. That
// module memoizes its init promise and database ref, and clearing those is
// exactly what closing and reopening the app does. `keepCookies` is what
// separates a relaunch from a fresh install.
async function launch(
  opts: { exported: boolean; god: boolean; keepCookies?: boolean },
  nonce: number,
): Promise<Mod> {
  if (!opts.keepCookies) jar = new Map();
  g.window.__EXPORTED_LEVEL_APP__ = opts.exported;
  gs.gameState.godFlg = opts.god;
  gs.gameState.score = 0;
  gs.gameState.highScore = 0;
  gs.gameState.localHighScore = 0;
  gs.gameState.remoteHighScore = 0;
  gs.setScoreSyncStatus("idle");
  return await import(moduleUrl("firebaseScores.js") + "?launch=" + nonce);
}

Deno.test({
  name: "exported app with god mode baked in still keeps a local high score",
  ignore: !haveEs7(),
  fn: async () => {
    const scores = await launch({ exported: true, god: true }, 1);
    assert(gs.scoreCountsAsRecord(), "an exported cartridge's god run is a record");

    await scores.submitHighScore(54321);
    assertEquals(gs.gameState.highScore, 54321);
    // Local only — the shared leaderboard is still off limits for a god run.
    assertEquals(gs.gameState.scoreSyncStatus, "disabled");
  },
});

Deno.test({
  name: "hosted ?god=1 run is still not a record",
  ignore: !haveEs7(),
  fn: async () => {
    const scores = await launch({ exported: false, god: true }, 2);
    assert(!gs.scoreCountsAsRecord(), "a URL cheat on the hosted game is not a record");

    await scores.submitHighScore(54321);
    assertEquals(gs.gameState.highScore, 0);
    assertEquals(gs.gameState.scoreSyncStatus, "idle", "nothing was submitted");
    assertEquals(jar.size, 0, "and nothing was persisted");
  },
});

Deno.test({
  name: "a normal run is a record",
  ignore: !haveEs7(),
  fn: async () => {
    const scores = await launch({ exported: false, god: false }, 3);
    await scores.submitHighScore(54321);
    assertEquals(gs.gameState.highScore, 54321);
  },
});

Deno.test({
  name: "high score survives a relaunch",
  ignore: !haveEs7(),
  fn: async () => {
    const first = await launch({ exported: true, god: true }, 4);
    await first.submitHighScore(54321);
    assertEquals(jar.get("afc2019_highScore"), "54321", "the run wrote the cookie");

    // Close the app, open it again. Without the boot-time restore the title
    // reads 0 here — exactly the "beat the game, HI SCORE still 0" report.
    const second = await launch({ exported: true, god: true, keepCookies: true }, 5);
    assertEquals(gs.gameState.highScore, 0, "nothing is restored until boot runs");

    await second.initializeFirebaseScores();
    assertEquals(gs.gameState.highScore, 54321);
    // "LOCAL CACHE ONLY", not the "WORLD BEST STANDBY" of a sync that never ran.
    assertEquals(gs.gameState.scoreSyncStatus, "disabled");
  },
});

Deno.test({
  name: "each game scores to its own board, all-time and daily",
  ignore: !haveEs7(),
  fn: async () => {
    const scores = await launch({ exported: true, god: false }, 6);
    g.__GAME_ID__ = "ramsie-3f9a2c71";
    try {
      const paths = scores.getBoardPaths();
      assertEquals(paths.allTime, "leaderboards/ramsie-3f9a2c71/allTime");
      assertEquals(paths.meta, "leaderboards/ramsie-3f9a2c71/meta");
      assertMatch(paths.daily, /^leaderboards\/ramsie-3f9a2c71\/daily\/\d{4}-\d{2}-\d{2}$/);

      // UTC, so the board rolls over at the same instant for every player.
      assertEquals(scores.dailyBoardKey(new Date("2026-08-24T23:59:59Z")), "2026-08-24");
      assertEquals(scores.dailyBoardKey(new Date("2026-08-25T00:00:01Z")), "2026-08-25");
    } finally {
      delete g.__GAME_ID__;
    }
  },
});

Deno.test({
  name: "a game with no identity keeps the legacy shared board",
  ignore: !haveEs7(),
  fn: async () => {
    const scores = await launch({ exported: false, god: false }, 7);
    delete g.__GAME_ID__;
    delete g.__OFFLINE_LEVEL__;
    const paths = scores.getBoardPaths();
    // Moving this would strand the 2028.Ai world best that is already there.
    assertEquals(paths.allTime, "leaderboards/globalHighScore");
    assertEquals(paths.daily, null);
  },
});

Deno.test({
  name: "the hosted player derives its board from the loaded level",
  ignore: !haveEs7(),
  fn: async () => {
    const scores = await launch({ exported: false, god: false }, 8);
    delete g.__GAME_ID__;
    g.__OFFLINE_LEVEL__ = { name: "Ramsie" };
    try {
      assertEquals(scores.getBoardPaths().allTime, "leaderboards/ramsie-cae9647a/allTime");
    } finally {
      delete g.__OFFLINE_LEVEL__;
    }
  },
});

// The shipped bundle is what an export copies, so the wiring has to be in it —
// rebuild with `deno run -A scripts/build-2028-ai.ts` after touching the entry.
Deno.test("the shipped 2028-ai bundle restores the high score at boot", () => {
  const bundle = Deno.readTextFileSync(
    fileURLToPath(new URL("../static/games/2028-ai/game.bundle.js", import.meta.url)),
  );
  assertStringIncludes(bundle, "initializeFirebaseScores");
  assertStringIncludes(bundle, "loadHighScore");
});
