// A game's leaderboard identity.
//
// Scores live at leaderboards/<gameId>/…, and that id is resolved in TWO
// places: the browser runtime (2019-es7/src/gameIdentity.js, an ES module in
// the game bundle) and the export tool (tools/build-level/lib/game-id.js, CJS,
// deliberately standalone so a build needs no 2019-es7 checkout). If they ever
// disagree, an exported APK silently scores to a different board than the
// hosted player — so the last test here runs both over the same inputs.

import { assert, assertEquals, assertNotEquals } from "@std/assert";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { join } from "@std/path";

const require = createRequire(import.meta.url);
const cjs = require("../tools/build-level/lib/game-id.js");

const es7Root = Deno.env.get("CMG_ES7_ROOT") ??
  fileURLToPath(new URL("../../2019-es7", import.meta.url));

function haveEs7(): boolean {
  try {
    return Deno.statSync(join(es7Root, "src", "gameIdentity.js")).isFile;
  } catch {
    return false;
  }
}

Deno.test("an explicit gameId wins over the level name", () => {
  assertEquals(cjs.gameIdForLevel({ name: "Ramsie", gameId: "ramsie-3f9a2c71" }), "ramsie-3f9a2c71");
});

Deno.test("a level saved before gameId still gets a stable id", () => {
  const first = cjs.gameIdForLevel({ name: "Ramsie" });
  assertEquals(first, cjs.gameIdForLevel({ name: "Ramsie" }), "same name, same board, every time");
  assert(first && first.startsWith("ramsie-"), "readable in the RTDB console: " + first);
});

Deno.test("names that slugify alike stay on separate boards", () => {
  // Both slugify to "ramsie" — only the digest keeps them apart.
  assertNotEquals(cjs.gameIdForLevel({ name: "Ramsie" }), cjs.gameIdForLevel({ name: "ramsie" }));
  assertNotEquals(cjs.gameIdForLevel({ name: "Ramsie" }), cjs.gameIdForLevel({ name: "Ramsie!" }));
});

Deno.test("ids never contain a character RTDB rejects in a key", () => {
  const id = cjs.gameIdForLevel({ name: 'a/b.c$d#e[f]\u0007' });
  assert(id, "a level with a name gets an id");
  for (const bad of [".", "$", "#", "[", "]", "/"]) {
    assert(!id.includes(bad), "id " + id + " must not contain " + bad);
  }
  assert(!/[\u0000-\u001f\u007f]/.test(id), "no control characters");
});

Deno.test("a nameless record has no board", () => {
  assertEquals(cjs.gameIdForLevel({}), null);
  assertEquals(cjs.gameIdForLevel(null), null);
  assertEquals(cjs.gameIdForLevel({ name: "   " }), null);
});

// The whole point of the CJS mirror existing.
Deno.test({
  name: "the export tool and the runtime derive the same id",
  ignore: !haveEs7(),
  fn: async () => {
    const esm = await import(
      "file:///" + join(es7Root, "src", "gameIdentity.js").replaceAll("\\", "/")
    );

    const levels = [
      { name: "Ramsie" },
      { name: "ramsie" },
      { name: "Ramsie!" },
      { name: "Daioh P!" },
      { name: "2028-stage0" },
      { name: "  spaced  out  " },
      { name: 'a/b.c$d#e[f]' },
      { name: "x".repeat(80) },
      { name: "Ramsie", gameId: "ramsie-3f9a2c71" },
      { name: "" },
      {},
    ];

    for (const level of levels) {
      assertEquals(
        cjs.gameIdForLevel(level),
        esm.gameIdForLevel(level),
        "diverged on " + JSON.stringify(level),
      );
    }
  },
});
