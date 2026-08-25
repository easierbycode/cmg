// tools/build-level staging flags: every export bakes the exported-app marker
// into the offline shell (the runtime hides TWEET and the in-app BUILD APK
// forge when it sees it), and a level record saved with the editor's GOD MODE
// toggle on pre-seeds gameState so the app plays invincible. Pure-local — the
// CJS tool loads via createRequire and stages against a minimal fake game dir,
// no network and no cordova.

import { assert, assertStringIncludes } from "@std/assert";
import { join } from "@std/path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { renderShell } = require("../tools/build-level/lib/shell-template.js");
const { stageWww } = require("../tools/build-level/lib/stage.js");

const EXPORT_MARKER = "window.__EXPORTED_LEVEL_APP__ = true;";
const GOD_SEED = "window.__GAME_STATE__ = { godFlg: true };";

Deno.test("renderShell always bakes the exported-app marker", () => {
  const html = renderShell({ levelName: "someLevel" });
  assertStringIncludes(html, EXPORT_MARKER);
  assert(!html.includes("godFlg"), "no god seed unless godMode is set");
});

Deno.test("renderShell seeds godFlg only when godMode is on", () => {
  assertStringIncludes(
    renderShell({ levelName: "g", godMode: true }),
    GOD_SEED,
  );
  assert(!renderShell({ levelName: "g", godMode: false }).includes("godFlg"));
});

Deno.test("renderShell bakes the leaderboard id and SDK only with a gameId", () => {
  const board = renderShell({ levelName: "Ramsie", gameId: "ramsie-3f9a2c71" });
  assertStringIncludes(board, 'window.__GAME_ID__ = "ramsie-3f9a2c71";');
  assertStringIncludes(board, '<script src="firebase-config.js"></script>');
  // Deferred, never blocking: an offline app must boot at full speed and fall
  // back to its local high-score cache.
  assertStringIncludes(board, '<script defer src="https://www.gstatic.com/firebasejs/');

  // No board to reach means the SDK would be dead weight.
  const none = renderShell({ levelName: "Ramsie" });
  assert(!none.includes("firebase"), "no SDK without a gameId");
  assert(!none.includes("__GAME_ID__"), "no id without a gameId");
});

// The id is interpolated into an inline <script>, and level names are
// user-supplied all the way down.
Deno.test("renderShell cannot be broken out of by a hostile gameId", () => {
  const html = renderShell({ levelName: "x", gameId: '</script><img src=x onerror=alert(1)>' });
  assert(!html.includes("</script><img"), "the id must not close the script element");
  assertStringIncludes(html, "\u003c");
});

// The marker/seed scripts must run before the bundle evaluates its gameState
// module, or the pre-seeded state arrives too late to be picked up.
Deno.test("renderShell puts the flags ahead of game.bundle.js", () => {
  const html = renderShell({ levelName: "order", godMode: true });
  assert(
    html.indexOf(GOD_SEED) < html.indexOf('src="game.bundle.js"'),
    "flags script must precede the game bundle",
  );
});

// End to end through stageWww: the record's own godMode flag (saved by the
// editor right before an export) is what turns the seed on.
Deno.test("stageWww honors the level record's godMode", () => {
  const tmp = Deno.makeTempDirSync({ prefix: "build-level-shell-" });
  try {
    // Minimal fake game dir: the two files stageWww copies plus a bundle
    // carrying the exact OFFLINE_PATCHES anchor lines.
    const gameDir = join(tmp, "game");
    Deno.mkdirSync(join(gameDir, "assets"), { recursive: true });
    Deno.mkdirSync(join(gameDir, "lib"), { recursive: true });
    Deno.writeTextFileSync(join(gameDir, "lib", "phaser.min.js"), "// phaser");
    Deno.writeTextFileSync(
      join(gameDir, "game.bundle.js"),
      'var ASSET_BASE = "/games/2028-ai/";\n' +
        'var LEVEL_DATA_URL = "https://cmg.easierbycode.deno.net/games/2028-ai/foo.json";\n',
    );

    for (const godMode of [true, false]) {
      const wwwRoot = join(tmp, godMode ? "www-god" : "www-plain");
      stageWww({
        gameDir,
        wwwRoot,
        levelName: "shell-test",
        levelData: godMode
          ? { name: "shell-test", godMode: true }
          : { name: "shell-test" },
      });
      const shell = Deno.readTextFileSync(join(wwwRoot, "phaser-game.html"));
      assertStringIncludes(shell, EXPORT_MARKER);
      if (godMode) {
        assertStringIncludes(shell, GOD_SEED);
      } else {
        assert(
          !shell.includes("godFlg"),
          "no god seed without the record flag",
        );
      }
    }
  } finally {
    Deno.removeSync(tmp, { recursive: true });
  }
});
