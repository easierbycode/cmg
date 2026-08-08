// E2E: the level editor a player reaches from the Guide imports a Dezaemon 2
// (Sega Saturn) .sav and builds a playable game out of it.
//
// Two things are asserted together, because either alone would be misleading:
//
//   1. THE FEATURE IS IN *THIS* EDITOR. The Guide's "Edit Levels" row resolves
//      to /editor/?game=<id> (svelte-src/Dashboard.svelte sanitizeLevelEditor),
//      which is served from static/editor/. So the test drives that exact URL —
//      not a copy in the 2019-es7 checkout, which is where the importer is
//      developed and could drift out of sync.
//   2. THE IMPORT ACTUALLY PRODUCES A GAME. Slots list, decode summary, sprite
//      previews, then Import into editor -> real stages, a real enemy roster,
//      and grid cells drawing the save's own art rather than the default
//      textures. It also proves importing does not push atlas downloads at the
//      user (a regression that shipped once already).
//
// The fixture is a genuine Mednafen-style gzipped cart image (the .bcr the
// importer documents) of the Ramsie sample game — 176 KB instead of the 1 MB
// raw dump, decoding through exactly the same path.
//
// Run with: deno task test:e2e   (no network needed)
// Set CHROME_PATH to use an installed Chrome — astral's bundled win64 build
// fails to spawn on some Windows hosts.

import { launch } from "@astral/astral";
import { serveDir } from "@std/http/file-server";
import { assert, assertEquals, assertGreaterOrEqual } from "@std/assert";
import { fileURLToPath } from "node:url";
import { dirname, fromFileUrl, join } from "@std/path";

// Ambient views of the editor page's top-level `let` bindings. They resolve
// lexically inside page.evaluate callbacks; these declarations only keep this
// file type-checkable.
// deno-lint-ignore no-explicit-any
declare let gameData: any;
// deno-lint-ignore no-explicit-any
declare let atlasData: any;

const PORT = 8819;
const cmgRoot = fileURLToPath(new URL("../../static", import.meta.url));
const FIXTURE = join(
  dirname(fromFileUrl(import.meta.url)),
  "fixtures",
  "dezaemon-ramsie.bcr",
);
// Served by the same origin as the editor, so the URL-import path is exercised
// without needing CORS or the network.
const SAV_URL = `http://127.0.0.1:${PORT}/__fixtures__/dezaemon-ramsie.bcr`;

// deno-lint-ignore no-explicit-any
type Page = any;

function server(port: number, fsRoot: string, sav: Uint8Array) {
  return Deno.serve(
    { port, hostname: "127.0.0.1", onListen: () => {} },
    (req) => {
      const { pathname } = new URL(req.url);
      if (pathname === "/__fixtures__/dezaemon-ramsie.bcr") {
        // Copy into a plain ArrayBuffer — Response rejects Uint8Array<ArrayBufferLike>.
        return new Response(sav.slice().buffer as ArrayBuffer, {
          headers: {
            "content-type": "application/octet-stream",
            "access-control-allow-origin": "*",
          },
        });
      }
      return serveDir(req, { fsRoot, enableCors: true, quiet: true });
    },
  );
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

// The browser test above hardcodes /editor/?game=2028-ai. That is only the
// right thing to test for as long as the Guide still sends players there, so
// pin the contract at its source: if someone re-points "Edit Levels", this
// fails and says so, instead of the .sav feature quietly living in an editor
// nobody reaches.
Deno.test("the Guide's 'Edit Levels' row resolves to the editor this feature ships in", async () => {
  const root = dirname(dirname(dirname(fromFileUrl(import.meta.url))));
  const dashboard = await Deno.readTextFile(
    join(root, "svelte-src", "Dashboard.svelte"),
  );

  // The row exists and activates openLevelEditor().
  assert(
    /key:\s*'leveleditor'/.test(dashboard),
    "Dashboard still offers a 'leveleditor' OSD row",
  );
  assert(
    /it\.key === 'leveleditor'\s*\)\s*\{\s*openLevelEditor\(\)/.test(dashboard),
    "activating the row calls openLevelEditor()",
  );
  // ...whose URL is derived as /editor/?game=<id> and guarded to /editor…
  assert(
    /url = '\/editor\/' \+ \(g \? \('\?game=' \+ encodeURIComponent\(g\)\) : ''\)/
      .test(dashboard),
    "the editor URL is still derived as /editor/?game=<id>",
  );
  assert(
    /\^\\\/editor\(\\\/\|\\\?\|\$\)/.test(dashboard),
    "only a root-relative /editor… path is accepted",
  );

  // ...and the game the browser test opens actually opts in.
  const games = JSON.parse(
    await Deno.readTextFile(join(root, "data", "games.json")),
  );
  const entry = (games.games ?? games).find((g: { id?: string }) =>
    g.id === "games/2028-ai" || g.id === "2028-ai"
  );
  assert(entry, "2028-ai is in data/games.json");
  assert(
    entry.levelEditor,
    "2028-ai opts into the level editor (levelEditor flag)",
  );
});

Deno.test("the Guide's level editor imports a Dezaemon 2 .sav into a playable game", async () => {
  const sav = await Deno.readFile(FIXTURE);
  const srv = server(PORT, cmgRoot, sav);
  const chrome = Deno.env.get("CHROME_PATH");
  const browser = await launch({
    headless: true,
    args: ["--no-sandbox"],
    ...(chrome ? { path: chrome } : {}),
  });

  try {
    // The exact URL the Guide's "Edit Levels" row navigates to.
    const page: Page = await browser.newPage(
      `http://127.0.0.1:${PORT}/editor/?game=2028-ai`,
    );

    // The vendored importer must actually load from /editor/dezaemon/lib/.
    // If someone forgets `deno task dezaemon:vendor`, this is what fails, and
    // the page records why in window.DezaemonLoadError.
    const loaded = await waitFor(async () =>
      await page.evaluate(() => {
        // deno-lint-ignore no-explicit-any
        const g = globalThis as any;
        if (g.Dezaemon) return "ok";
        if (g.DezaemonLoadError) {
          return "err:" + (g.DezaemonLoadError.message ?? g.DezaemonLoadError);
        }
        return false;
      }), "the Dezaemon importer module to load");
    assertEquals(
      loaded,
      "ok",
      "the importer must load from /editor/dezaemon/lib/",
    );

    // The .sav entry points are present in this editor's menu.
    const ui = await page.evaluate(() => ({
      fileInput: !!document.getElementById("deza-file-input"),
      urlInput: !!document.getElementById("deza-url-input"),
      urlBtn: !!document.getElementById("deza-url-btn"),
      modal: !!document.getElementById("dezaemon-import-modal"),
      // themed with the editor's own classes, not hardcoded colours
      modalThemed: !!document.querySelector(
        "#dezaemon-import-modal .picker-panel",
      ),
    }));
    assert(ui.fileInput, "#deza-file-input");
    assert(ui.urlInput, "#deza-url-input");
    assert(ui.urlBtn, "#deza-url-btn");
    assert(ui.modal, "#dezaemon-import-modal");
    assert(ui.modalThemed, "the import sheet reuses the themed .picker-panel");

    // Wait for the base game + atlas so the import has something to merge into.
    await waitFor(async () =>
      await page.evaluate(() => {
        try {
          return !!(gameData && atlasData && atlasData.frames &&
            Object.keys(atlasData.frames).length > 0);
        } catch (_e) {
          return false;
        }
      }), "editor to auto-load base game + atlas");

    // Import from URL, exactly as a user would.
    const listed = await page.evaluate(async (url: string) => {
      // deno-lint-ignore no-explicit-any
      const g = globalThis as any;
      (document.getElementById("deza-url-input") as HTMLInputElement).value =
        url;
      await g.importDezaemonFromUrlInput();
      const cards = document.querySelectorAll("#deza-slot-list .deza-slot");
      return {
        modalOpen: !document.getElementById("dezaemon-import-modal")!
          .classList.contains("hidden"),
        slots: cards.length,
        kind: document.getElementById("deza-container-kind")!.textContent ?? "",
        firstSlotText: cards[0]?.textContent ?? "",
      };
    }, { args: [SAV_URL] });
    assert(listed.modalOpen, "the import sheet opens on the slot list");
    assertEquals(listed.slots, 1, "the Ramsie cart holds one game slot");
    assert(listed.kind.includes("gzip"), `container kind: ${listed.kind}`);
    assert(listed.firstSlotText.includes("DEZA2"), listed.firstSlotText);

    // Select the slot: the decode summary and sprite previews come from the
    // save itself.
    const detail = await page.evaluate(() => {
      (document.querySelector("#deza-slot-list .deza-slot") as HTMLElement)
        .click();
      return {
        summary: document.getElementById("deza-decoded-summary")!.textContent ??
          "",
        previews:
          document.querySelectorAll("#deza-sprite-preview canvas").length,
        hex: (document.getElementById("deza-hex-preview")!.textContent ?? "")
          .slice(0, 8),
        detailShown: !document.getElementById("deza-slot-detail")!
          .classList.contains("hidden"),
      };
    });
    assert(detail.detailShown, "slot detail opens");
    assert(detail.summary.includes("STAGES"), detail.summary);
    assert(detail.summary.includes("SPRITES"), detail.summary);
    assertGreaterOrEqual(detail.previews, 100, "sprite frames previewed");
    assertEquals(detail.hex, "00000000", "hex dump renders");

    // Import into the editor. Suppress the notes alert and record any attempt
    // to download the atlas — importing must never hand the user files.
    const applied = await page.evaluate(async () => {
      // deno-lint-ignore no-explicit-any
      const g = globalThis as any;
      const downloads: string[] = [];
      const origClick = HTMLAnchorElement.prototype.click;
      HTMLAnchorElement.prototype.click = function (this: HTMLAnchorElement) {
        if (this.download) {
          downloads.push(this.download);
          return;
        }
        return origClick.apply(this, arguments as never);
      };
      const notes: string[] = [];
      const origAlert = g.alert;
      g.alert = (m: string) => notes.push(String(m));
      try {
        await g.applyDezaemonImport();
      } finally {
        g.alert = origAlert;
        HTMLAnchorElement.prototype.click = origClick;
      }
      const state = g.__editorState();
      const cells = [...document.querySelectorAll(".grid-cell.occupied")];
      const withArt = cells.filter((c) => c.querySelector("img.enemy-img"));
      return {
        state,
        downloads,
        notes: notes.join("\n"),
        modalHidden: document.getElementById("dezaemon-import-modal")!
          .classList.contains("hidden"),
        occupied: cells.length,
        withArt: withArt.length,
        distinctArt: new Set(
          withArt.map((c) =>
            (c.querySelector("img.enemy-img") as HTMLImageElement).src
          ),
        ).size,
        textures: Object.values(gameData.enemyData)
          // deno-lint-ignore no-explicit-any
          .map((e: any) => (e.texture || [])[0]),
        spawns: state.stageKeys.reduce(
          (n: number, k: string) =>
            n +
            gameData[k].enemylist.reduce(
              (m: number, row: string[]) =>
                m + row.filter((c) => c !== "00").length,
              0,
            ),
          0,
        ),
        unresolved: state.stageKeys.flatMap((k: string) =>
          gameData[k].enemylist.flat()
        ).filter((c: string) =>
          c !== "00" && !gameData.enemyData["enemy" + c.slice(0, -1)]
        ).length,
        // The 18-byte definitions ride along verbatim — the attribute field
        // names are still open, so carrying the bytes is what keeps them.
        withAttributes: Object.values(gameData.enemyData)
          // deno-lint-ignore no-explicit-any
          .filter((e: any) => e.dezaemon && e.dezaemon.attributes).length,
      };
    });

    // The save's own structure replaced the base game.
    assert(applied.modalHidden, "the sheet closes on import");
    assertEquals(applied.state.stageKeys.length, 5, "Ramsie's five stages");
    // The whole roster: one enemy per (stage, record) pair the save places.
    // Grid cells carry multi-letter keys past enemyZ, so there is no 26-type
    // ceiling to trim it to any more.
    assertEquals(
      applied.state.enemyKeys.length,
      153,
      "every enemy type the save defines, not the first 26",
    );
    assertEquals(applied.state.enemyKeys[26], "enemyAA");
    assertEquals(
      applied.state.gridCols,
      20,
      "the grid is the Saturn placement grid's own width",
    );
    assertEquals(
      applied.spawns,
      2308,
      "every placement in the save reached the grid",
    );
    assertEquals(applied.unresolved, 0, "no spawn points at a missing enemy");
    assertGreaterOrEqual(
      applied.state.waveCount,
      50,
      "stage0 carries real waves",
    );
    assert(
      String(applied.state.status).includes("DEZA2"),
      `status: ${applied.state.status}`,
    );

    // Enemies are textured from the save's CG pages, and those frames made it
    // into the atlas rather than being stranded in extraSprites.
    const fromSave = applied.textures.filter((t: string) =>
      /^deza\d+_\d+_\d+\.gif$/.test(t)
    );
    assertGreaterOrEqual(
      fromSave.length,
      applied.textures.length - 20,
      `most enemies use save art (got ${fromSave.length}/${applied.textures.length})`,
    );
    assertGreaterOrEqual(
      applied.state.spriteFrameCount,
      100,
      "atlas holds the save's frames",
    );
    assertEquals(
      applied.state.extraSpriteCount,
      0,
      "no sprite is left unpacked",
    );

    // ...so the grid draws them.
    assertGreaterOrEqual(applied.occupied, 1, "the grid has placed enemies");
    assertEquals(
      applied.withArt,
      applied.occupied,
      "every placed cell draws a sprite",
    );
    assertGreaterOrEqual(
      applied.distinctArt,
      2,
      "the cells are not all one sprite",
    );

    // Importing is not allowed to download anything.
    assertEquals(
      applied.downloads,
      [],
      "no atlas files were pushed at the user",
    );
    assert(
      applied.notes.includes(
        "sprites from the save were packed into the atlas",
      ),
      applied.notes,
    );
    assert(
      applied.notes.includes("nothing dropped"),
      applied.notes,
    );
    assertEquals(
      applied.withAttributes,
      applied.state.enemyKeys.length,
      "every enemy carries its own definition bytes",
    );
  } finally {
    await browser.close();
    await srv.shutdown();
  }
});
