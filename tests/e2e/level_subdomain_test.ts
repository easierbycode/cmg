// E2E: a subdomain's root, followed by a real browser.
//
// tests/level_subdomain_test.ts pins the routing rules as pure functions. This
// file pins the two halves a unit test cannot see:
//
// 1. The redirect is RELATIVE, so the browser stays on the host the visitor
//    typed — `gs.localhost:<port>/?god=1` ends up on that same host's
//    /games/2028-ai?level=gs&god=1, not on the apex.
//
// 2. The editor's side of NEW GAME. `my-first-game.localhost:<port>/` lands on
//    /editor/?new=my-first-game, and the editor has to open a blank game and
//    name it — which depends on the importer module that supplies the blank
//    game, and that module trails window.onload (see
//    level_editor_module_race_test.ts). It is held back here so the hand-off
//    is proven to wait for it rather than win a race.
//
// The server is this file's own: the real redirect (lib/level-subdomain.ts)
// over a fixed catalog, in front of static/. No database, no fixture.
// *.localhost resolves to loopback in Chrome without any DNS.
//
// Run with: deno task test:e2e
// Set CHROME_PATH to use an installed Chrome — astral's bundled win64 build
// fails to spawn on some Windows hosts.

import { launch } from "@astral/astral";
import { serveDir } from "@std/http/file-server";
import { assert, assertEquals } from "@std/assert";
import { fileURLToPath } from "node:url";
import { siteHosts, subdomainRedirect } from "../../lib/level-subdomain.ts";

// Ambient view of the editor page's top-level `let` binding — it resolves
// lexically inside page.evaluate callbacks.
// deno-lint-ignore no-explicit-any
declare let gameData: any;

const PORT = 8827;
const cmgRoot = fileURLToPath(new URL("../../static", import.meta.url));

// The catalog the redirect is given: `gs` is a game, nothing else is.
const KEYS = ["gs", "2019-PS2"];
// Only the built-in site: what a checkout with nothing configured serves.
const SITES = siteHosts(null);

// Long enough that the importer cannot win the race against onload.
const MODULE_DELAY_MS = 2500;

// deno-lint-ignore no-explicit-any
type Page = any;

function serveSite(port: number) {
  return Deno.serve(
    { port, hostname: "127.0.0.1", onListen: () => {} },
    async (req) => {
      const redirect = subdomainRedirect(req, KEYS, {}, SITES);
      if (redirect) return redirect;
      const path = new URL(req.url).pathname;
      // The game is a Fresh route, not a static file; a stand-in page is all
      // the redirect's destination needs to be here.
      if (path === "/games/2028-ai") {
        return new Response("<!doctype html><title>game</title>", {
          headers: { "content-type": "text/html; charset=utf-8" },
        });
      }
      if (path.startsWith("/editor/dezaemon/lib/")) {
        await new Promise((r) => setTimeout(r, MODULE_DELAY_MS));
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

Deno.test("a game's subdomain opens the game on the host the visitor typed", async () => {
  const srv = serveSite(PORT);
  const browser = await launchBrowser();
  try {
    const page: Page = await browser.newPage(
      `http://gs.localhost:${PORT}/?god=1&level=other`,
    );
    const where = await waitFor(
      async () =>
        await page.evaluate(() =>
          document.title === "game"
            ? { host: location.host, path: location.pathname + location.search }
            : false
        ),
      "the redirect to the game",
    );
    assertEquals(where, {
      host: `gs.localhost:${PORT}`,
      path: "/games/2028-ai?level=gs&god=1",
    });
  } finally {
    await browser.close();
    await srv.shutdown();
  }
});

Deno.test("an unclaimed subdomain opens the editor on a blank game named for it", async () => {
  const srv = serveSite(PORT + 1);
  const browser = await launchBrowser();
  try {
    const page: Page = await browser.newPage(
      `http://my-first-game.localhost:${PORT + 1}/?theme=dark`,
    );
    const named = await waitFor(async () =>
      await page.evaluate(() => {
        const input = document.getElementById(
          "firebase-level-name",
        ) as HTMLInputElement | null;
        if (!input || input.value !== "my-first-game") return false;
        // deno-lint-ignore no-explicit-any
        const g = globalThis as any;
        return {
          host: location.host,
          path: location.pathname + location.search,
          status: document.getElementById("status")!.textContent,
          hasDeza: !!g.Dezaemon,
          stageKeys: Object.keys(gameData).filter((k) => /^stage\d+$/.test(k)),
          waves: gameData.stage0.enemylist.length,
          placed: gameData.stage0.enemylist.flat().filter((c: string) =>
            c !== "00"
          ).length,
        };
      }), "the editor to open the named new game");

    assertEquals(named.host, `my-first-game.localhost:${PORT + 1}`);
    assertEquals(named.path, "/editor/?new=my-first-game&theme=dark");
    assertEquals(named.status, 'STATUS: NEW GAME "my-first-game" (UNSAVED)');
    // It waited for the importer and took its blank game: one empty stage,
    // not the five stock stages a plain /editor/ visit loads.
    assert(named.hasDeza, "the importer module had loaded");
    assertEquals(named.stageKeys, ["stage0"]);
    assert(named.waves > 0, "the blank stage has waves to fill");
    assertEquals(named.placed, 0, "and nothing placed in them");
  } finally {
    await browser.close();
    await srv.shutdown();
  }
});

Deno.test("a plain editor visit is still the stock game, with no name", async () => {
  const srv = serveSite(PORT + 2);
  const browser = await launchBrowser();
  try {
    const page: Page = await browser.newPage(
      `http://localhost:${PORT + 2}/editor/`,
    );
    const stages = await waitFor(async () =>
      await page.evaluate(() => {
        // deno-lint-ignore no-explicit-any
        const g = globalThis as any;
        // Past the point where ?new= would have acted: the importer is in.
        if (!g.Dezaemon) return false;
        try {
          const keys = Object.keys(gameData).filter((k) =>
            /^stage\d+$/.test(k)
          );
          return keys.length ? keys : false;
        } catch (_e) {
          return false;
        }
      }), "the editor to auto-load the base game");
    assert(stages.length > 1, "the stock game's stages, not a blank one");
    const name = await page.evaluate(() =>
      (document.getElementById("firebase-level-name") as HTMLInputElement).value
    );
    assertEquals(name, "");
  } finally {
    await browser.close();
    await srv.shutdown();
  }
});
