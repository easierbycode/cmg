// E2E: saving a multi-stage game from the Guide's level editor keeps every
// stage, and loading it back restores every stage.
//
// A cloud record used to hold one stage: whichever the editor happened to have
// open. Saving a nine-stage Dezaemon 2 import kept stage 0 and threw the rest
// away, so launching any other stage fell through to the base recipe's stage of
// that number — the stock game's enemies over the stock backdrop, with no
// warning. level_loader_stages_test.ts covers the runtime half (mergeRecipe
// applying every stage a record carries); this covers the editor half that has
// to write them in the first place.
//
// Firebase is stood up in-page rather than over the network — level_editor_
// firebase_test.ts already covers the real RTDB round-trip, and this needs a
// nine-stage payload that has no business in the shared database. The stub
// keeps the semantics that bite: update() merges at the top level only, null
// deletes, undefined is an error, and keys are charset-checked.
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
declare let currentGrid: string[][];
declare let currentStageKey: string;

const PORT = 8823;
const cmgRoot = fileURLToPath(new URL("../../static", import.meta.url));
const es7Root = Deno.env.get("CMG_ES7_ROOT") ??
  fileURLToPath(new URL("../../../2019-es7", import.meta.url));
const FIXTURE = join(es7Root, "dev-fixtures", "Dezaemon 2 (DAIOH).sav");

const SLOT = 1; // the 2nd save: DEZA2____02, nine stages
const LEVEL = "daioh-multistage-test";
const STAGES = 9;
const GRID_COLS = 20;
// DAIOH's own numbers, measured from the save by the decoder.
const STAGE0_WAVES = 160;
const STAGE3_WAVES = 196;
const STAGE3_BG_ROWS = 577;

// deno-lint-ignore no-explicit-any
type Page = any;

function haveFixture() {
  try {
    return Deno.statSync(FIXTURE).isFile;
  } catch {
    return false;
  }
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
  name:
    "saving a nine-stage game to the cloud keeps every stage, and loading it back restores them",
  ignore: !haveFixture(),
  fn: async () => {
    const srv = Deno.serve(
      { port: PORT, hostname: "127.0.0.1", onListen: () => {} },
      (req) =>
        serveDir(req, { fsRoot: cmgRoot, enableCors: true, quiet: true }),
    );
    const chrome = Deno.env.get("CHROME_PATH");
    const browser = await launch({
      headless: true,
      args: ["--no-sandbox"],
      ...(chrome ? { path: chrome } : {}),
    });

    try {
      const page: Page = await browser.newPage(
        `http://127.0.0.1:${PORT}/editor/?game=2028-ai`,
      );
      await waitFor(async () =>
        await page.evaluate(() => {
          // deno-lint-ignore no-explicit-any
          const g = globalThis as any;
          if (g.Dezaemon) return "ok";
          if (g.DezaemonLoadError) {
            return "err:" +
              (g.DezaemonLoadError.message ?? g.DezaemonLoadError);
          }
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

      // The base game the editor opens with — five stock stages, eight columns
      // wide. Anything nine-deep later can only have come from the import.
      const stock = await page.evaluate(() => ({
        stages: Object.keys(gameData).filter((k) =>
          /^stage\d+$/.test(k)
        ).length,
        cols: gameData.stage0.enemylist[0].length,
      }));
      assertEquals(stock.stages, 5, "the stock game has five stages");
      assertEquals(stock.cols, 8);

      // Import DAIOH's second save.
      const bytes = await Deno.readFile(FIXTURE);
      await page.evaluate(async (data: number[]) => {
        // deno-lint-ignore no-explicit-any
        const g = globalThis as any;
        await g.ingestDezaemonBytes(
          new Uint8Array(data),
          "Dezaemon 2 (DAIOH).sav",
        );
      }, { args: [[...bytes]] });
      await page.evaluate((slot: number) => {
        const cards = document.querySelectorAll("#deza-slot-list .deza-slot");
        (cards[slot] as HTMLElement).click();
      }, { args: [SLOT] });
      const imported = await page.evaluate(async () => {
        // deno-lint-ignore no-explicit-any
        const g = globalThis as any;
        const origAlert = g.alert;
        g.alert = () => {};
        try {
          await g.applyDezaemonImport();
        } finally {
          g.alert = origAlert;
        }
        return {
          stages: Object.keys(gameData).filter((k) => /^stage\d+$/.test(k))
            .length,
          cols: gameData.stage0.enemylist[0].length,
          hasBgm: !!gameData.dezaemonBgm,
        };
      });
      assertEquals(imported.stages, STAGES);
      assertEquals(imported.cols, GRID_COLS);
      assert(imported.hasBgm, "the import carries its own soundtrack");

      // A stand-in for the Realtime Database, installed over the editor's own
      // handle so saveToFirebase()/loadFromFirebase() run unmodified.
      await page.evaluate(() => {
        // deno-lint-ignore no-explicit-any
        const g = globalThis as any;
        // RTDB's own key charset: everything but . # $ / [ ] and control
        // chars. The control range is the point, not an accident.
        // deno-lint-ignore no-control-regex
        const BAD_KEY = new RegExp("[.#$/\\[\\]]|[\\x00-\\x1f\\x7f]");
        const store: Record<string, unknown> = (g.__cloud = {});
        // deno-lint-ignore no-explicit-any
        const scrub = (v: any, at: string): any => {
          if (v === null) return null;
          if (v === undefined) throw new Error("undefined value at " + at);
          if (typeof v === "number" && !isFinite(v)) {
            throw new Error("non-finite number at " + at);
          }
          if (Array.isArray(v)) return v.map((x, i) => scrub(x, at + "/" + i));
          if (typeof v !== "object") return v;
          // deno-lint-ignore no-explicit-any
          const out: any = {};
          for (const k of Object.keys(v)) {
            if (k === "" || BAD_KEY.test(k)) {
              throw new Error("illegal RTDB key at " + at + ": " + k);
            }
            const sv = scrub(v[k], at + "/" + k);
            // a null child simply is not stored
            if (sv !== null) out[k] = sv;
          }
          return out;
        };
        const nodeFor = (refPath: string) => {
          const key = String(refPath).replace(/^.*\//, "");
          // deno-lint-ignore no-explicit-any
          return (store[key] as any) || (store[key] = {});
        };
        g.firebaseDb = null;
        g.firebase = {
          apps: [],
          initializeApp() {
            this.apps = [{}];
            return this.apps[0];
          },
          database: Object.assign(
            () => ({
              ref: (refPath: string) => ({
                // deno-lint-ignore no-explicit-any
                update(payload: any) {
                  const rec = nodeFor(refPath);
                  // Sanitize everything before touching the store, so a
                  // rejected payload leaves no half-write behind.
                  // deno-lint-ignore no-explicit-any
                  const clean: any = {};
                  for (const k of Object.keys(payload)) {
                    clean[k] = scrub(payload[k], k);
                  }
                  for (const k of Object.keys(clean)) {
                    if (clean[k] === null) delete rec[k];
                    else rec[k] = clean[k];
                  }
                  return Promise.resolve();
                },
                once() {
                  const snap = JSON.parse(JSON.stringify(nodeFor(refPath)));
                  return Promise.resolve({ val: () => snap });
                },
              }),
            }),
            { ServerValue: { TIMESTAMP: 1700000000000 } },
          ),
        };
      });

      // Save the whole game.
      const stored = await page.evaluate(async (levelName: string) => {
        // deno-lint-ignore no-explicit-any
        const g = globalThis as any;
        (document.getElementById("firebase-level-name") as HTMLInputElement)
          .value = levelName;
        const origAlert = g.alert;
        const alerts: string[] = [];
        g.alert = (m: string) => alerts.push(String(m));
        try {
          await g.saveToFirebase();
        } finally {
          g.alert = origAlert;
        }
        const rec = g.__cloud[levelName];
        const s3 = rec.stages && rec.stages["stage3"];
        return {
          alerts,
          // the flat single-stage fields every existing reader keys off
          hasFlatEnemylist: Array.isArray(rec.enemylist),
          stageKey: rec.stageKey,
          flatWaves: (rec.enemylist || []).length,
          stageKeys: Object.keys(rec.stages || {}).sort(),
          s3Waves: s3 ? s3.enemylist.length : 0,
          s3Cols: s3 ? s3.enemylist[0].length : 0,
          s3WaveRows: s3 && s3.waveRows ? s3.waveRows.length : 0,
          s3BgRows: s3 && s3.background ? s3.background.rows : 0,
          s3DiffersFromFlat: s3
            ? JSON.stringify(s3.enemylist) !== JSON.stringify(rec.enemylist)
            : false,
          cells: (rec.backgroundCells || []).length,
          bgmSfxSet: rec.dezaemonBgm ? rec.dezaemonBgm.sfxSet : null,
          bgmStages: rec.dezaemonBgm ? rec.dezaemonBgm.stages.length : 0,
        };
      }, { args: [LEVEL] });

      assert(
        !stored.alerts.some((a: string) => a.startsWith("Save failed")),
        `save reported: ${stored.alerts.join(" | ")}`,
      );
      // The record still leads with the flat fields, so a reader written
      // against the old shape sees exactly what it always did.
      assert(stored.hasFlatEnemylist, "flat enemylist is still there");
      assertEquals(stored.stageKey, "stage0");
      assertEquals(stored.flatWaves, STAGE0_WAVES);
      // ...and every stage of the game rides along beside them.
      assertEquals(stored.stageKeys.length, STAGES);
      assertEquals(stored.s3Waves, STAGE3_WAVES);
      assertEquals(stored.s3Cols, GRID_COLS);
      assertEquals(stored.s3WaveRows, STAGE3_WAVES, "stage 3 kept its pacing");
      assertEquals(stored.s3BgRows, STAGE3_BG_ROWS, "and its own scenery");
      assert(stored.s3DiffersFromFlat, "stage 3 is not a copy of stage 0");
      assert(stored.cells > 0, "the cell list its tile grid indexes into");
      assertEquals(stored.bgmSfxSet, 1);
      assertEquals(stored.bgmStages, STAGES, "a song pair for every stage");

      // Throw the imported game away, back to the stock five, so anything the
      // editor shows after the load can only have come from the record.
      const reset = await page.evaluate(async () => {
        // deno-lint-ignore no-explicit-any
        await (globalThis as any).autoLoadFromServer();
        return Object.keys(gameData).filter((k) => /^stage\d+$/.test(k)).length;
      });
      assertEquals(reset, 5, "back to the stock five stages");

      const reloaded = await page.evaluate(async (levelName: string) => {
        // deno-lint-ignore no-explicit-any
        const g = globalThis as any;
        const origAlert = g.alert;
        g.alert = () => {};
        let ok = false;
        try {
          ok = await g.loadFromFirebase(levelName);
        } finally {
          g.alert = origAlert;
        }
        return {
          ok,
          stages: Object.keys(gameData).filter((k) => /^stage\d+$/.test(k))
            .length,
          currentStageKey,
          currentWaves: currentGrid.length,
          stage3Waves: gameData.stage3.enemylist.length,
          stage3Cols: gameData.stage3.enemylist[0].length,
          stage3BgRows: gameData.stage3.background
            ? gameData.stage3.background.rows
            : 0,
          cells: (gameData.backgroundCells || []).length,
          hasBgm: !!gameData.dezaemonBgm,
          pills: document.querySelectorAll("#stage-pills .tb-pill:not(.add)")
            .length,
        };
      }, { args: [LEVEL] });

      assert(reloaded.ok, "the level loaded");
      assertEquals(reloaded.stages, STAGES, "all nine stages came back");
      assertEquals(reloaded.pills, STAGES, "and the editor shows all nine");
      // The record's own open stage is what the editor lands on...
      assertEquals(reloaded.currentStageKey, "stage0");
      assertEquals(reloaded.currentWaves, STAGE0_WAVES);
      // ...and stage 3 came back whole, not as the stock stage it replaced.
      assertEquals(reloaded.stage3Waves, STAGE3_WAVES);
      assertEquals(reloaded.stage3Cols, GRID_COLS);
      assertEquals(reloaded.stage3BgRows, STAGE3_BG_ROWS);
      assert(reloaded.cells > 0);
      assert(reloaded.hasBgm, "the soundtrack came back too");
    } finally {
      await browser.close();
      await srv.shutdown();
    }
  },
});
