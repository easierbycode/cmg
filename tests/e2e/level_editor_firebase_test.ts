// E2E: the ported level editor authors a custom "Game" and saves it to Firebase.
//
// Mirrors the flow the user runs by hand: open /editor/?game=2028-ai, edit
// stage0, name the Game, and hit Save Game — which writes /levels/<name> to the
// evil-invaders RTDB. The test drives the real editor page in headless Chrome
// (the same build a player uses), then reads the record straight back from RTDB
// to prove the round-trip, and finally deletes the throwaway record.
//
// A second, opt-in check (set EXPORT_APK=1) runs this repo's own
// tools/build-level pipeline in --stage-only mode against the saved record and
// asserts the staged offline foo.json carries the exact custom wave — i.e. the
// editor → Firebase → APK-export data path is intact end to end. It's gated
// because it needs a network fetch.
//
// Run with: deno task test:e2e   (needs network for the Firebase SDK + RTDB)

import { launch } from "@astral/astral";
import { serveDir } from "@std/http/file-server";
import { assert, assertEquals } from "@std/assert";
import { fileURLToPath } from "node:url";

// Ambient views of the editor page's global lexical bindings (top-level `let`
// in static/editor/index.html). They exist only inside page.evaluate callbacks
// — the stringified callbacks resolve them lexically in the browser — but the
// declarations keep this file type-checkable.
// deno-lint-ignore no-explicit-any
declare let gameData: any;
// deno-lint-ignore no-explicit-any
declare let atlasData: any;
declare let currentGrid: string[][];
declare let currentStageKey: string;

const CMG_PORT = 8804;
const cmgRoot = fileURLToPath(new URL("../../static", import.meta.url));
// Distinctive stage0 marker wave — a full row of enemyA carrying the Big drop.
const MARKER_WAVE = ["A1", "A1", "A1", "A1", "A1", "A1", "A1", "A1"];

function staticServer(port: number, fsRoot: string) {
  return Deno.serve(
    { port, hostname: "127.0.0.1", onListen: () => {} },
    (req) => serveDir(req, { fsRoot, enableCors: true, quiet: true }),
  );
}

// deno-lint-ignore no-explicit-any
type Page = any;

async function waitFor<T>(
  check: () => Promise<T | null | false>,
  label: string,
  timeoutMs = 30000,
): Promise<T> {
  const deadline = Date.now() + timeoutMs;
  let last: unknown;
  while (Date.now() < deadline) {
    try {
      const value = await check();
      if (value) return value;
      last = value;
    } catch (error) {
      last = error;
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(
    `Timed out waiting for ${label} (last: ${Deno.inspect(last)})`,
  );
}

Deno.test("level editor saves a custom stage0 Game to Firebase and it round-trips", async () => {
  const server = staticServer(CMG_PORT, cmgRoot);
  const browser = await launch({
    headless: true,
    args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required"],
  });
  // Unique name so parallel/repeat runs never collide, and cleanup is safe.
  const levelName = `e2e-2019-turbo-stage0-${Date.now()}`;

  try {
    const page: Page = await browser.newPage(
      `http://127.0.0.1:${CMG_PORT}/editor/?game=2028-ai`,
    );

    // The editor auto-loads the base game (game.json + atlas) on boot.
    // NB: the editor declares its state (gameData, atlasData, currentGrid, …)
    // with top-level `let` in a classic script — global LEXICAL bindings that
    // never appear as globalThis properties. Evaluated scripts share that
    // lexical scope, so read/write them as bare identifiers, never via
    // `globalThis.x` (reads come back undefined, writes create a shadowed
    // property the editor code never sees).
    await waitFor(async () => {
      return await page.evaluate(() => {
        try {
          // deno-lint-ignore no-explicit-any
          const g = globalThis as any;
          return !!(gameData && atlasData && atlasData.frames &&
            Object.keys(atlasData.frames).length > 0 &&
            typeof g.firebase !== "undefined");
        } catch (_e) {
          return false; // bindings don't exist until the editor script runs
        }
      });
    }, "editor to auto-load base game + Firebase SDK");

    // Edit stage0, name the Game, Save (suppressing the editor's blocking
    // alert), then read the record back from RTDB.
    const result = await page.evaluate(
      async (name: string) => {
        // deno-lint-ignore no-explicit-any
        const g = globalThis as any;
        const origAlert = g.alert;
        g.alert = function () {};
        try {
          currentStageKey = "stage0";
          currentGrid[0] = ["A1", "A1", "A1", "A1", "A1", "A1", "A1", "A1"];
          (document.getElementById("firebase-level-name") as HTMLInputElement)
            .value = name;
          await g.saveToFirebase();
          const snap = await g.firebase.database().ref("levels/" + name).once(
            "value",
          );
          const d = snap.val() || {};
          return {
            saved: !!d.enemylist,
            name: d.name,
            stageKey: d.stageKey,
            firstWave: d.enemylist ? d.enemylist[0] : null,
            hasEnemyData: !!d.enemyData,
          };
        } finally {
          g.alert = origAlert;
        }
      },
      { args: [levelName] },
    );

    assert(result.saved, "record should have been written with an enemylist");
    assertEquals(result.name, levelName);
    assertEquals(result.stageKey, "stage0");
    assertEquals(result.firstWave, MARKER_WAVE);
    assert(result.hasEnemyData, "Game record should carry enemyData");

    // Clean up the throwaway record.
    await page.evaluate(async (name: string) => {
      // deno-lint-ignore no-explicit-any
      const g = globalThis as any;
      await g.firebase.database().ref("levels/" + name).remove();
    }, { args: [levelName] });
  } finally {
    await browser.close();
    await server.shutdown();
  }
});

// Opt-in: prove the saved record survives the APK export pipeline (fetch →
// stage), without running the multi-minute cordova compile. Uses this repo's
// own tools/build-level (which bakes cmg's in-repo 2028-ai game) — no external
// 2019-es7 checkout. Skips when the flag is absent.
Deno.test({
  name:
    "custom stage0 export stages the exact wave into the offline app (EXPORT_APK=1)",
  ignore: Deno.env.get("EXPORT_APK") !== "1",
  async fn() {
    // NB: the module-level `cmgRoot` is actually the static/ doc root; the tool
    // and its build output live at the true repo root.
    const repoRoot = fileURLToPath(new URL("../../", import.meta.url));
    const tool = `${repoRoot}tools/build-level`;
    assert(
      (await Deno.stat(tool).catch(() => null))?.isDirectory,
      `build tool not found at ${tool}`,
    );

    // Author a record via the editor first (reuse the same page flow, minimal).
    const server = staticServer(CMG_PORT + 1, cmgRoot);
    const browser = await launch({ headless: true, args: ["--no-sandbox"] });
    const levelName = `e2e-export-stage0-${Date.now()}`;
    try {
      const page: Page = await browser.newPage(
        `http://127.0.0.1:${CMG_PORT + 1}/editor/?game=2028-ai`,
      );
      await waitFor(
        () =>
          page.evaluate(() => {
            // Bare identifiers on purpose — see the lexical-binding note above.
            try {
              // deno-lint-ignore no-explicit-any
              const g = globalThis as any;
              return !!(gameData && atlasData &&
                Object.keys(atlasData.frames || {}).length && g.firebase);
            } catch (_e) {
              return false;
            }
          }),
        "editor ready",
      );
      await page.evaluate(async (name: string) => {
        // deno-lint-ignore no-explicit-any
        const g = globalThis as any;
        g.alert = function () {};
        currentStageKey = "stage0";
        currentGrid[0] = ["A1", "A1", "A1", "A1", "A1", "A1", "A1", "A1"];
        (document.getElementById("firebase-level-name") as HTMLInputElement)
          .value = name;
        await g.saveToFirebase();
      }, { args: [levelName] });

      // Stage the app from that record.
      const build = await new Deno.Command("node", {
        args: ["tools/build-level", levelName, "android", "--stage-only"],
        cwd: repoRoot,
        stdout: "piped",
        stderr: "piped",
      }).output();
      const log = new TextDecoder().decode(build.stdout) +
        new TextDecoder().decode(build.stderr);
      assert(build.code === 0, `build-level --stage-only failed:\n${log}`);

      const slug = levelName.toLowerCase().replace(/[^a-z0-9]/g, "").slice(
        0,
        30,
      );
      // The tool writes the full level record as www/foo.json (the runtime
      // level-loader plugin merges its atlas in the browser).
      const dataPath = `${repoRoot}build/${slug}/www/foo.json`;
      const staged = JSON.parse(await Deno.readTextFile(dataPath));
      assertEquals(staged.name, levelName);
      assertEquals(staged.stageKey, "stage0");
      assertEquals(staged.enemylist[0], MARKER_WAVE);

      // Cleanup: RTDB record + build dir.
      await page.evaluate(async (name: string) => {
        // deno-lint-ignore no-explicit-any
        await (globalThis as any).firebase.database().ref("levels/" + name)
          .remove();
      }, { args: [levelName] });
      await Deno.remove(`${repoRoot}build/${slug}`, { recursive: true }).catch(
        () => {},
      );
    } finally {
      await browser.close();
      await server.shutdown();
    }
  },
});
