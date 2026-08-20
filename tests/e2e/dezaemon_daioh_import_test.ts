// E2E: the Guide's level editor imports a *whole* Dezaemon 2 game — every
// stage, every enemy type, every spawn.
//
// The Ramsie test next door proves the import path works end to end. This one
// proves it does not ration: DAIOH's second save is nine stages deep, redefines
// all sixty enemy slots separately in every stage, and places nearly 3,500
// enemies. The importer used to keep 5 stages, 26 enemy types and drop the
// rest; the assertions below are the counts the decoder measures from the save
// itself, so a regression that starts trimming again fails here loudly.
//
// The fixture is the 1 MB hardware-style cart dump in the sibling 2019-es7
// checkout — too big to commit here, and this repo already depends on that
// checkout for `deno task dezaemon:vendor`. When it is absent the test skips
// rather than failing a fresh clone.
//
// Run with: deno task test:e2e
// Set CHROME_PATH to use an installed Chrome — astral's bundled win64 build
// fails to spawn on some Windows hosts.

import { launch } from "@astral/astral";
import { serveDir } from "@std/http/file-server";
import { assert, assertEquals, assertGreaterOrEqual } from "@std/assert";
import { fileURLToPath } from "node:url";
import { join } from "@std/path";

// Ambient view of the editor page's top-level `let` bindings — these resolve
// lexically inside page.evaluate callbacks.
// deno-lint-ignore no-explicit-any
declare let gameData: any;
// deno-lint-ignore no-explicit-any
declare let atlasData: any;

const PORT = 8821;
const cmgRoot = fileURLToPath(new URL("../../static", import.meta.url));
const es7Root = Deno.env.get("CMG_ES7_ROOT") ??
  fileURLToPath(new URL("../../../2019-es7", import.meta.url));
const FIXTURE = join(es7Root, "dev-fixtures", "Dezaemon 2 (DAIOH).sav");

const SLOT = 1; // the 2nd save: DEZA2____02
const STAGES = 9;
const ENEMY_TYPES = 340; // distinct (stage, record) pairs placed
const SPAWNS = 3497; // zako placements across all nine stages
const BOSS_STAGES = 6; // stages 0-4 and 6 place a boss
const GRID_COLS = 20; // the save's own placement grid

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
    "the level editor imports every stage, enemy type and spawn of a nine-stage save",
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

      // Feed the save in through the importer's own byte path, then pick the
      // SECOND entry rather than whichever one happens to be first.
      const bytes = await Deno.readFile(FIXTURE);
      const listed = await page.evaluate(async (data: number[]) => {
        // deno-lint-ignore no-explicit-any
        const g = globalThis as any;
        await g.ingestDezaemonBytes(
          new Uint8Array(data),
          "Dezaemon 2 (DAIOH).sav",
        );
        const cards = document.querySelectorAll("#deza-slot-list .deza-slot");
        return {
          slots: cards.length,
          kind: document.getElementById("deza-container-kind")!.textContent ??
            "",
          names: [...cards].map((c) => c.textContent ?? ""),
        };
      }, { args: [[...bytes]] });
      assertEquals(listed.slots, 3, "the DAIOH cart holds three game slots");
      assert(
        listed.kind.toLowerCase().includes("interleaved"),
        `container kind: ${listed.kind}`,
      );
      assert(
        listed.names[SLOT].includes("DEZA2____02"),
        `slot ${SLOT} is the second save: ${listed.names[SLOT]}`,
      );

      const detail = await page.evaluate((slot: number) => {
        const cards = document.querySelectorAll("#deza-slot-list .deza-slot");
        (cards[slot] as HTMLElement).click();
        return {
          summary:
            document.getElementById("deza-decoded-summary")!.textContent ?? "",
          shown: !document.getElementById("deza-slot-detail")!
            .classList.contains("hidden"),
        };
      }, { args: [SLOT] });
      assert(detail.shown, "slot detail opens for the second save");
      assert(
        detail.summary.includes(String(STAGES)),
        `summary reports the stage count: ${detail.summary.slice(0, 300)}`,
      );

      const applied = await page.evaluate(async () => {
        // deno-lint-ignore no-explicit-any
        const g = globalThis as any;
        const notes: string[] = [];
        const origAlert = g.alert;
        g.alert = (m: string) => notes.push(String(m));
        try {
          await g.applyDezaemonImport();
        } finally {
          g.alert = origAlert;
        }
        const state = g.__editorState();
        const stageKeys: string[] = state.stageKeys;
        const cells = [...document.querySelectorAll(".grid-cell.occupied")];
        const withArt = cells.filter((c) => c.querySelector("img.enemy-img"));
        return {
          state,
          notes: notes.join("\n"),
          spawns: stageKeys.reduce(
            (n: number, k: string) =>
              n +
              gameData[k].enemylist.reduce(
                (m: number, row: string[]) =>
                  m + row.filter((c) => c !== "00").length,
                0,
              ),
            0,
          ),
          unresolved: stageKeys.flatMap((k: string) =>
            gameData[k].enemylist.flat()
          ).filter((c: string) =>
            c !== "00" && !gameData.enemyData["enemy" + c.slice(0, -1)]
          ).length,
          raggedRows: stageKeys.reduce((n: number, k: string) => {
            const list = gameData[k].enemylist;
            return n + list.filter((r: string[]) => r.length !== list[0].length)
              .length;
          }, 0),
          // Identity is the (stage, record) pair — the same slot number means a
          // different enemy in every stage that uses it.
          pairs: new Set(
            // deno-lint-ignore no-explicit-any
            Object.values(gameData.enemyData).map((e: any) =>
              e.dezaemon ? `${e.dezaemon.stage}:${e.dezaemon.record}` : null
            ).filter(Boolean),
          ).size,
          // deno-lint-ignore no-explicit-any
          withAttributes: Object.values(gameData.enemyData).filter((e: any) =>
            e.dezaemon && typeof e.dezaemon.attributes === "string" &&
            e.dezaemon.attributes.length === 36
          ).length,
          // deno-lint-ignore no-explicit-any
          bossesFromSave: Object.values(gameData.bossData).filter((b: any) =>
            b && b.dezaemon
          ).length,
          bossTotal: Object.keys(gameData.bossData).length,
          pacing: stageKeys.every((k: string) =>
            Array.isArray(gameData[k].waveRows) &&
            gameData[k].waveRows.length === gameData[k].enemylist.length &&
            gameData[k].waveInterval > 0
          ),
          occupied: cells.length,
          withArt: withArt.length,
          validation: g.Dezaemon.validateGameJson(g.buildRuntimeRecipe()),
          // A save carries no player, so the import supplies the Duke
          // character — and its frames are not in the stock game_asset atlas,
          // so they only resolve if the import carried the pixels in too.
          player: (() => {
            const pd = gameData.playerData;
            // The import folds its sprites into the atlas before the first
            // paint, so this is the frame set the runtime would see.
            const packed = new Set([
              ...Object.keys((atlasData && atlasData.frames) || {}),
            ]);
            const referenced = [
              ...pd.texture,
              ...pd.shootNormal.texture,
              ...pd.shootBig.texture,
              ...pd.shoot3way.texture,
              ...pd.barrier.texture,
            ];
            return {
              texture: pd.texture,
              shootNormal: pd.shootNormal.texture,
              shootBig: pd.shootBig.texture,
              barrierFrames: pd.barrier.texture.length,
              missing: referenced.filter((f: string) =>
                !packed.has(f)
              ),
            };
          })(),
        };
      });

      // Nothing dropped, on any axis.
      assertEquals(
        applied.state.stageKeys,
        Array.from({ length: STAGES }, (_, i) => `stage${i}`),
        "all nine stages",
      );
      assertEquals(
        applied.state.enemyKeys.length,
        ENEMY_TYPES,
        "every enemy type, not the first 26",
      );
      assertEquals(applied.pairs, ENEMY_TYPES, "each is a distinct save slot");
      assertEquals(applied.spawns, SPAWNS, "every placement reached the grid");
      assertEquals(applied.unresolved, 0, "no spawn points at a missing enemy");
      assertEquals(applied.raggedRows, 0, "every row in a stage is one width");
      assertEquals(applied.state.gridCols, GRID_COLS, "the save's own width");
      assertEquals(
        applied.withAttributes,
        ENEMY_TYPES,
        "every enemy carries its own 18-byte definition",
      );
      assert(applied.pacing, "every stage keeps the scroll row of each wave");
      assertEquals(applied.bossTotal, STAGES, "every stage can still end");
      assertEquals(
        applied.bossesFromSave,
        BOSS_STAGES,
        "the stages that place a boss use the save's own",
      );

      // ...and what came out is a valid, playable game whose grid draws.
      assertEquals(applied.validation.errors, [], "game.json validates");
      assert(applied.validation.ok);
      assertGreaterOrEqual(applied.occupied, 1, "the grid has placed enemies");
      assertEquals(
        applied.withArt,
        applied.occupied,
        "every placed cell draws a sprite",
      );
      assert(applied.notes.includes("nothing dropped"), applied.notes);

      // Attributes decoded from the engine's field map, and the save's own
      // scenery — same axes the 2019-es7 spec locks, through the vendored lib.
      const decoded = await page.evaluate(() => {
        const HP = [60, 30, 15, 10, 5, 3, 2, 1];
        // deno-lint-ignore no-explicit-any
        const recs = Object.values(gameData.enemyData) as any[];
        const stageKeys = Object.keys(gameData).filter((k) =>
          /^stage\d+$/.test(k)
        );
        return {
          withBehavior: recs.filter((e) =>
            e.dezaemon && e.dezaemon.behavior
          ).length,
          hpFromTable: recs.filter((e) => HP.includes(e.hp)).length,
          withTransforms: recs.filter((e) => {
            const b = e.dezaemon && e.dezaemon.behavior;
            return b && (b.rotation.enabled || b.scale.enabled ||
              b.direction.enabled || b.speedChange.enabled);
          }).length,
          bgStages: stageKeys.filter((k) => gameData[k].background).length,
          bgCells: (gameData.backgroundCells || []).length,
        };
      });
      assertEquals(decoded.withBehavior, ENEMY_TYPES);
      assertEquals(decoded.hpFromTable, ENEMY_TYPES);
      assertGreaterOrEqual(decoded.withTransforms, 100);
      assertEquals(decoded.bgStages, 8); // stage 8's background is empty
      assertEquals(decoded.bgCells, 250);

      // The player the save does not have: the Duke character, art and all.
      assertEquals(applied.player.texture, [
        "duke_0",
        "duke_1",
        "duke_2",
        "duke_3",
      ]);
      assertEquals(applied.player.shootNormal, [
        "bigProjectile_0.png",
        "bigProjectile_1.png",
        "bigProjectile_2.png",
        "bigProjectile_3.png",
      ]);
      assertEquals(applied.player.shootBig, [
        "bigProjectile0.png",
        "bigProjectile1.png",
        "bigProjectile2.png",
      ]);
      assertEquals(applied.player.barrierFrames, 10);
      assertEquals(
        applied.player.missing,
        [],
        "every frame the player references reached the atlas",
      );
      assert(
        applied.notes.includes("Player and bullets: the Duke character"),
        applied.notes,
      );
    } finally {
      await browser.close();
      await srv.shutdown();
    }
  },
});
