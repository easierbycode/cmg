// E2E: two things the editor got wrong when its own timing slipped.
//
// 1. The importer arrives through dynamic import()s inside a module script with
//    a top-level await, and that does not hold up window.onload. Entry points
//    that sampled window.Dezaemon once would blame a module that was merely
//    late — "the Dezaemon importer is unavailable" against a module that
//    finished loading a moment afterwards, with no retry. Clicking Import on a
//    cold cache was enough. (?sav= was already safe here: it runs off the
//    dezaemon-ready event rather than off onload.)
//
// 2. The missing-texture panel only ever went up. Nothing lowered it once the
//    frames it named were resolved, so importing a save over a level whose art
//    was level-only left the panel accusing frames the import had replaced.
//
// The module delay is applied by this file's own static server rather than by
// browser-side interception, so the ordering is deterministic instead of a race
// we have to hope for.
//
// The fixture is the 1 MB cart dump in the sibling 2019-es7 checkout — too big
// to commit here. When it is absent the test skips rather than failing a fresh
// clone.
//
// Run with: deno task test:e2e
// Set CHROME_PATH to use an installed Chrome — astral's bundled win64 build
// fails to spawn on some Windows hosts.

import { launch } from "@astral/astral";
import { serveDir } from "@std/http/file-server";
import { assert, assertEquals } from "@std/assert";
import { fileURLToPath } from "node:url";
import { join } from "@std/path";

// Ambient views of the editor page's top-level `let` bindings — these resolve
// lexically inside page.evaluate callbacks.
// deno-lint-ignore no-explicit-any
declare let gameData: any;
// deno-lint-ignore no-explicit-any
declare let atlasData: any;
// deno-lint-ignore no-explicit-any
declare let enemyData: any;

const PORT = 8825;
const cmgRoot = fileURLToPath(new URL("../../static", import.meta.url));
const es7Root = Deno.env.get("CMG_ES7_ROOT") ??
  fileURLToPath(new URL("../../../2019-es7", import.meta.url));
const FIXTURE = join(es7Root, "dev-fixtures", "Dezaemon 2 (DAIOH).sav");

// Long enough that the module cannot possibly win the race against onload.
const MODULE_DELAY_MS = 4000;
const BOGUS_FRAME = "levelOnlyEnemy0.gif";

// deno-lint-ignore no-explicit-any
type Page = any;

function haveFixture() {
  try {
    return Deno.statSync(FIXTURE).isFile;
  } catch {
    return false;
  }
}

// Serves static/ as usual, optionally holding back the importer modules so they
// land well after the page's load event.
function serveEditor(port: number, delayModulesMs = 0) {
  return Deno.serve(
    { port, hostname: "127.0.0.1", onListen: () => {} },
    async (req) => {
      if (
        delayModulesMs > 0 &&
        new URL(req.url).pathname.startsWith("/editor/dezaemon/lib/")
      ) {
        await new Promise((r) => setTimeout(r, delayModulesMs));
      }
      return await serveDir(req, {
        fsRoot: cmgRoot,
        enableCors: true,
        quiet: true,
      });
    },
  );
}

async function launchBrowser() {
  const chrome = Deno.env.get("CHROME_PATH");
  return await launch({
    headless: true,
    args: ["--no-sandbox"],
    ...(chrome ? { path: chrome } : {}),
  });
}

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
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(
    `Timed out waiting for ${label} (last: ${Deno.inspect(last)})`,
  );
}

Deno.test({
  name: "a slow importer module is waited for, not blamed",
  ignore: !haveFixture(),
  fn: async () => {
    const srv = serveEditor(PORT, MODULE_DELAY_MS);
    const browser = await launchBrowser();

    try {
      const page: Page = await browser.newPage(
        `http://127.0.0.1:${PORT}/editor/?game=2028-ai`,
      );

      // The premise: the page is usable while the importer is still in flight.
      // If this ever reads true the delay stopped working and the rest of the
      // test would be proving nothing.
      const early = await page.evaluate(() => {
        // deno-lint-ignore no-explicit-any
        const g = globalThis as any;
        return {
          hasDeza: !!g.Dezaemon,
          hasIngest: typeof g.ingestDezaemonBytes === "function",
        };
      });
      assertEquals(early.hasDeza, false, "importer is still loading");
      assert(early.hasIngest, "but the page's own script is live");

      // Hand it a save anyway, exactly as the file picker does.
      const bytes = await Deno.readFile(FIXTURE);
      const result = await page.evaluate(async (data: number[]) => {
        // deno-lint-ignore no-explicit-any
        const g = globalThis as any;
        const alerts: string[] = [];
        const origAlert = g.alert;
        g.alert = (m: string) => alerts.push(String(m));
        let ok: boolean;
        try {
          ok = await g.ingestDezaemonBytes(
            new Uint8Array(data),
            "Dezaemon 2 (DAIOH).sav",
          );
        } finally {
          g.alert = origAlert;
        }
        return {
          ok,
          alerts,
          hasDeza: !!g.Dezaemon,
          modalHidden: document.getElementById("dezaemon-import-modal")!
            .classList.contains("hidden"),
          slots: document.querySelectorAll("#deza-slot-list .deza-slot").length,
        };
      }, { args: [[...bytes]] });

      // It waited for the module and then went through, rather than reporting
      // an importer that was on its way.
      assertEquals(result.alerts, [], "nothing was blamed");
      assertEquals(result.ok, true);
      assertEquals(result.hasDeza, true);
      assertEquals(result.modalHidden, false, "the slot list opened");
      assertEquals(result.slots, 3, "the DAIOH cart's three entries");
    } finally {
      await browser.close();
      await srv.shutdown();
    }
  },
});

Deno.test({
  name:
    "the missing-texture panel comes down once an import resolves the frames",
  ignore: !haveFixture(),
  fn: async () => {
    const srv = serveEditor(PORT + 1);
    const browser = await launchBrowser();

    try {
      const page: Page = await browser.newPage(
        `http://127.0.0.1:${PORT + 1}/editor/?game=2028-ai`,
      );
      await waitFor(async () =>
        await page.evaluate(() => {
          // deno-lint-ignore no-explicit-any
          const g = globalThis as any;
          if (g.Dezaemon) return "ok";
          if (g.DezaemonLoadError) return "err";
          return false;
        }), "the Dezaemon importer module to load");
      await waitFor(async () =>
        await page.evaluate(() => {
          try {
            return !!(gameData && atlasData && atlasData.frames &&
              Object.keys(atlasData.frames).length > 0);
          } catch (_e) {
            return false;
          }
        }), "editor to auto-load base game + atlas");

      // Point an enemy at art no atlas has and let the check finish: the panel
      // is up, naming that frame.
      const raised = await page.evaluate(async (frame: string) => {
        // deno-lint-ignore no-explicit-any
        const g = globalThis as any;
        const firstKey = Object.keys(enemyData)[0];
        enemyData[firstKey].texture = [frame];
        await g.checkMissingTextures();
        return {
          hidden: document.getElementById("missing-tex-overlay")!.classList
            .contains("hidden"),
          list: [
            ...document.querySelectorAll("#missing-tex-list .missing-tex-name"),
          ]
            .map((e) => e.textContent),
        };
      }, { args: [BOGUS_FRAME] });
      assertEquals(raised.hidden, false, "the panel went up");
      assertEquals(raised.list, [BOGUS_FRAME]);

      // Import a save, which replaces the enemy roster wholesale — the frame
      // the panel was complaining about is gone from the game entirely.
      const bytes = await Deno.readFile(FIXTURE);
      await page.evaluate(async (data: number[]) => {
        // deno-lint-ignore no-explicit-any
        const g = globalThis as any;
        await g.ingestDezaemonBytes(
          new Uint8Array(data),
          "Dezaemon 2 (DAIOH).sav",
        );
      }, { args: [[...bytes]] });
      const after = await page.evaluate(async () => {
        // deno-lint-ignore no-explicit-any
        const g = globalThis as any;
        const cards = document.querySelectorAll("#deza-slot-list .deza-slot");
        (cards[1] as HTMLElement).click();
        const origAlert = g.alert;
        g.alert = () => {};
        try {
          await g.applyDezaemonImport();
        } finally {
          g.alert = origAlert;
        }
        return {
          hidden: document.getElementById("missing-tex-overlay")!.classList
            .contains("hidden"),
          usesSaveArt: Object.values(enemyData).every((d) =>
            // deno-lint-ignore no-explicit-any
            !((d as any).texture || []).includes("levelOnlyEnemy0.gif")
          ),
        };
      });
      assert(after.usesSaveArt, "the import replaced the enemy roster");
      assertEquals(after.hidden, true, "so the panel came back down");

      // A stale answer must not raise it again: the import's own check is the
      // last word, and an older overlapping run is dropped.
      await new Promise((r) => setTimeout(r, 2000));
      const settled = await page.evaluate(() =>
        document.getElementById("missing-tex-overlay")!.classList.contains(
          "hidden",
        )
      );
      assertEquals(settled, true);
    } finally {
      await browser.close();
      await srv.shutdown();
    }
  },
});
