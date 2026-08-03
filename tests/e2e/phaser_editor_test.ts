// E2E: the Guide's "Edit Game" button starts Phaser Editor 2D for a game whose
// project directory carries a phasereditor2d.config.json.
//
// Walks exactly what a developer does:
//   1. the real dashboard boots (static/dashboard.bundle.js) with the catalog
//      row for evil-invaders-phaser4 — the Mutoid entry from data/games.json,
//      query string and all, so the launcher's id → project-name normalisation
//      is genuinely exercised,
//   2. the game is launched and the Guide opened,
//   3. "Edit Game" is there (it isn't for games with no such project) and is
//      clicked,
//   4. the real PhaserEditor2D binary is spawned against the real project
//      directory and the game frame lands on the same-origin proxy, showing
//      the actual Phaser Editor workbench.
//
// Nothing is stubbed on the launcher side: the routes under test are the
// shipped handlers, and the editor really runs. Two things are faked, both
// outside this repo's code: Chrome's DNS is pointed at a dead address for
// easierbycode.com / the deploy origin (so the catalog comes from the test's
// own manifest and the game frame never reaches the internet), and the catalog
// itself is served by the test rather than fetched OTA.
//
// The project it edits is the evil-invaders-phaser4 checkout when it sits next
// to this repo (the developer layout the feature is built for); otherwise a
// throwaway project directory of the same name stands in, so the test still
// runs on a machine that only has cmg.
//
// Run with: deno task test:e2e   (no network needed)
// Prerequisites — the test skips itself, loudly, without them:
//   deno task phasereditor:vendor   (the editor binary; not committed)
//   deno task dashboard:build       (static/dashboard.bundle.js; not committed)
// Set CHROME_PATH to use an installed Chrome instead of the one astral
// downloads — astral's bundled win64 build fails to spawn on some Windows
// hosts ("side-by-side configuration is incorrect").

import { launch } from "@astral/astral";
import { serveDir } from "@std/http/file-server";
import { assert, assertEquals, assertStringIncludes } from "@std/assert";
import { fromFileUrl, join } from "@std/path";

const PORT = 8815;
const PROJECT_NAME = "evil-invaders-phaser4";
// The Mutoid row from data/games.json — id carries a trailing path + query, so
// resolving it to a bare project directory name is part of what's under test.
const GAME_ID = `${PROJECT_NAME}/?scene=MutoidScene&loop=2`;
const GAME_TITLE = "MUTOID";
const EDITOR_MOUNT = `/phaser-editor/${PROJECT_NAME}/index.html`;

const repoRoot = fromFileUrl(new URL("../../", import.meta.url));
const staticRoot = join(repoRoot, "static");

// A sibling checkout is the layout lib/phaser-editor.ts looks in by default;
// when it isn't there, a stand-in project is created and pointed at with
// CMG_PHASER_PROJECT_DIRS (read per call, so setting it here is enough).
let tempRoot: string | null = null;
const sibling = join(repoRoot, "..", PROJECT_NAME);
if (!await fileExists(join(sibling, "phasereditor2d.config.json"))) {
  tempRoot = await Deno.makeTempDir({ prefix: "cmg-phaser-e2e-" });
  const dir = join(tempRoot, PROJECT_NAME);
  await Deno.mkdir(join(dir, "src"), { recursive: true });
  await Deno.writeTextFile(
    join(dir, "phasereditor2d.config.json"),
    JSON.stringify({ skip: ["node_modules", "dist"] }, null, 2),
  );
  await Deno.writeTextFile(join(dir, "src", "Game.ts"), "// e2e stand-in\n");
  Deno.env.set("CMG_PHASER_PROJECT_DIRS", tempRoot);
}

// Imported after the env seam above, mirroring protocol_add_github_button_test.ts.
const { handler: apiHandler } = await import(
  "../../routes/api/phaser-editor.ts"
);
const { handler: proxyHandler } = await import(
  "../../routes/phaser-editor/[...path].ts"
);
const { findEditorExec, stopAllEditors } = await import(
  "../../lib/phaser-editor.ts"
);

const editorExec = await findEditorExec();
const haveBundle = await fileExists(join(staticRoot, "dashboard.bundle.js"));

async function fileExists(p: string): Promise<boolean> {
  try {
    return (await Deno.stat(p)).isFile;
  } catch {
    return false;
  }
}

// The dashboard shell, matching routes/index.tsx: the bundle mounts itself into
// #app-root. Web fonts are left out so the page needs no network.
const SHELL = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>code monkey — dashboard</title>
    <link rel="stylesheet" href="/dashboard.css">
  </head>
  <body>
    <div id="app-root"></div>
    <script src="/gamepad-compatibility-plugin.js"></script>
    <script type="module" src="/dashboard.bundle.js"></script>
  </body>
</html>`;

const MANIFEST = JSON.stringify({
  version: "e2e",
  generatedAt: new Date(0).toISOString(),
  games: [{
    id: GAME_ID,
    name: "Mutoid",
    title: GAME_TITLE,
    sub: "Phaser 4 // e2e",
    icon: null,
    size: "— MB",
    date: "e2e",
  }],
  demos: [],
});

// The launcher, assembled from its own route handlers. Fresh's fsRoutes() needs
// the Vite plugin to discover routes, so the two under test are mounted by hand
// — they are the shipped modules, called with the same { req } they get in
// production.
function launcher(port: number) {
  return Deno.serve(
    { port, hostname: "127.0.0.1", onListen: () => {} },
    async (req) => {
      const { pathname } = new URL(req.url);
      if (pathname === "/") {
        return new Response(SHELL, {
          headers: { "content-type": "text/html; charset=utf-8" },
        });
      }
      if (pathname === "/games.manifest.json") {
        return new Response(MANIFEST, {
          headers: { "content-type": "application/json" },
        });
      }
      // Present but empty — the dashboard merges locally-added games from here.
      if (pathname === "/api/games/local") {
        return Response.json({ ok: true, games: [] });
      }
      if (pathname === "/api/phaser-editor") {
        // deno-lint-ignore no-explicit-any
        const byMethod = apiHandler as any;
        const fn = byMethod[req.method];
        if (!fn) return new Response("Method Not Allowed", { status: 405 });
        return await fn({ req });
      }
      if (pathname.startsWith("/phaser-editor/")) {
        // deno-lint-ignore no-explicit-any
        const fn = (proxyHandler as any)[req.method];
        if (!fn) return new Response("Method Not Allowed", { status: 405 });
        return await fn({ req });
      }
      return serveDir(req, { fsRoot: staticRoot, quiet: true });
    },
  );
}

// deno-lint-ignore no-explicit-any
type Page = any;

async function waitFor<T>(
  check: () => Promise<T | null | false>,
  label: string,
  timeoutMs = 60000,
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

if (!editorExec) {
  console.log(
    "[phaser-editor e2e] skipped: no editor binary — run `deno task phasereditor:vendor`",
  );
}
if (!haveBundle) {
  console.log(
    "[phaser-editor e2e] skipped: no static/dashboard.bundle.js — run `deno task dashboard:build`",
  );
}

Deno.test({
  name: 'Guide "Edit Game" starts Phaser Editor for evil-invaders-phaser4',
  ignore: !editorExec || !haveBundle,
  // The editor runs as a child process for the length of the test; Deno's op /
  // resource sanitizers can't see it settle before the check runs.
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    const server = launcher(PORT);
    const chrome = Deno.env.get("CHROME_PATH");
    const browser = await launch({
      headless: true,
      args: [
        "--no-sandbox",
        // Keep the run hermetic: the dashboard tries the deploy's manifest
        // before the same-origin one, and this catalog row's game is hosted on
        // easierbycode.com. Both resolve to a dead port, so the catalog comes
        // from MANIFEST above and the game frame never leaves the machine.
        "--host-resolver-rules=MAP cmg.easierbycode.deno.net 127.0.0.1:1," +
        "MAP easierbycode.com 127.0.0.1:1",
      ],
      ...(chrome ? { path: chrome } : {}),
    });

    try {
      const page: Page = await browser.newPage(`http://127.0.0.1:${PORT}/`);

      // --- the launcher agrees this game has a project to edit --------------
      const probe = await waitFor(
        async () => {
          const r = await fetch(
            `http://127.0.0.1:${PORT}/api/phaser-editor?game=${
              encodeURIComponent(GAME_ID)
            }`,
          );
          return r.ok ? await r.json() : null;
        },
        "the availability probe",
      );
      assert(probe.available, "the project should be detected");
      assertEquals(probe.name, PROJECT_NAME);
      assertEquals(probe.url, EDITOR_MOUNT);
      assertEquals(probe.running, false, "nothing should be running yet");
      // A game with no such project must not offer the button.
      const other = await (await fetch(
        `http://127.0.0.1:${PORT}/api/phaser-editor?game=shmup-party-phaser3`,
      )).json();
      assertEquals(other.available, false);

      // --- open the game from the Games list --------------------------------
      await waitFor(
        () =>
          page.evaluate(
            (title: string) =>
              [...document.querySelectorAll(".games-screen .game-row")].some((
                el,
              ) => (el as HTMLElement).innerText.startsWith(title)),
            {
              args: [GAME_TITLE],
            },
          ),
        "the games list to render",
      );
      // Straight to the Games screen, then the row — the same clicks a player
      // makes with a mouse.
      await page.evaluate(() => {
        const menu = [...document.querySelectorAll(".menu .item")]
          .find((el) => /games/i.test((el as HTMLElement).innerText));
        (menu as HTMLElement).click();
      });
      await waitFor(
        () =>
          page.evaluate(() => !!document.querySelector(".games-screen.shown")),
        "the Games screen to open",
      );
      await page.evaluate((title: string) => {
        const row = [...document.querySelectorAll(".games-screen .game-row")]
          .find((el) => (el as HTMLElement).innerText.startsWith(title));
        (row as HTMLElement).click();
      }, { args: [GAME_TITLE] });
      await waitFor(
        () => page.evaluate(() => !!document.getElementById("gameframe")),
        "the game frame to mount",
      );

      // --- open the Guide ---------------------------------------------------
      // ` / Esc is the keyboard stand-in for the SELECT + Down pad chord; the
      // dashboard listens for it on window, which is where a real key press
      // lands too.
      await page.evaluate(() =>
        globalThis.dispatchEvent(
          new KeyboardEvent("keydown", {
            code: "Backquote",
            key: "`",
            keyCode: 192,
            bubbles: true,
          }),
        )
      );
      const rows: string[] = await waitFor(
        async () => {
          const list = await page.evaluate(() => {
            const panel = document.querySelector(".osd-panel, .osd-blades");
            if (!panel) return null;
            return [...panel.querySelectorAll(".osd-row")].map((el) =>
              (el as HTMLElement).innerText.trim().split("\n")[0]
            );
          });
          return list && list.length ? list : null;
        },
        "the Guide to open",
      );
      assert(
        rows.includes("Edit Game"),
        `Guide should offer "Edit Game", got ${Deno.inspect(rows)}`,
      );

      // --- press it ---------------------------------------------------------
      await page.evaluate(() => {
        const row = [...document.querySelectorAll(".osd-row")].find((el) =>
          (el as HTMLElement).innerText.trim().startsWith("Edit Game")
        );
        (row as HTMLElement).click();
      });

      // The frame swaps to the same-origin proxy…
      await waitFor(
        async () =>
          await page.evaluate(() =>
            document.getElementById("gameframe")?.getAttribute("src") ?? ""
          ) === EDITOR_MOUNT,
        "the frame to swap to the editor",
      );
      // …and the editor that answers there is the real workbench, reachable as
      // same-origin (which is what keeps the launcher's marker and the in-frame
      // Guide gesture working over it).
      const frame = await waitFor<
        { title: string; inLauncher: boolean; parts: string[] }
      >(
        () =>
          page.evaluate((project: string) => {
            const f = document.getElementById(
              "gameframe",
            ) as HTMLIFrameElement | null;
            const doc = f?.contentDocument;
            if (!doc || !doc.body) return null;
            const text = doc.body.innerText;
            if (!/Outline/.test(text) || !/Blocks/.test(text)) return null;
            // The editor titles itself before it has opened the project; wait
            // for the project name so this is the loaded workbench, not the
            // splash that just swapped in.
            if (!doc.title.includes(project)) return null;
            return {
              title: doc.title,
              inLauncher: doc.documentElement.classList.contains("inLauncher"),
              parts: text.split("\n").map((s) => s.trim()).filter(Boolean),
            };
          }, { args: [PROJECT_NAME] }),
        "the Phaser Editor workbench to load in the frame",
      );
      assertStringIncludes(frame.title, "Phaser Editor 2D");
      assert(
        frame.inLauncher,
        "a same-origin editor frame should carry the launcher marker",
      );
      for (
        const part of ["Outline", "Files", "Assets", "Blocks", "Inspector"]
      ) {
        assert(
          frame.parts.includes(part),
          `workbench should show the ${part} part, got ${
            Deno.inspect(frame.parts)
          }`,
        );
      }

      // The proxy rebases the editor's absolute /editor/… URLs onto the mount;
      // without it the boot fetch would land on the launcher's own /editor/
      // (the level editor) and the workbench would never come up.
      const bundle = await (await fetch(
        `http://127.0.0.1:${PORT}/phaser-editor/${PROJECT_NAME}/app/plugins/product.all/product.all.js`,
      )).text();
      assertStringIncludes(
        bundle,
        `/phaser-editor/${PROJECT_NAME}/product.json`,
      );
      assert(
        !bundle.includes("`/editor/product.json`"),
        "no absolute /editor/ URL should survive the proxy",
      );

      // While an editor is up its files are on the launcher's origin, which
      // answers every request with a wildcard CORS header — a cross-site caller
      // must be turned away at both the probe and the proxy.
      for (
        const path of [
          `/api/phaser-editor?game=${encodeURIComponent(GAME_ID)}`,
          `/phaser-editor/${PROJECT_NAME}/index.html`,
        ]
      ) {
        const r = await fetch(`http://127.0.0.1:${PORT}${path}`, {
          headers: { "sec-fetch-site": "cross-site" },
        });
        await r.body?.cancel();
        assertEquals(r.status, 403, `${path} should refuse cross-site reads`);
      }

      // A second press reuses the same server rather than starting another.
      const after = await (await fetch(
        `http://127.0.0.1:${PORT}/api/phaser-editor?game=${
          encodeURIComponent(GAME_ID)
        }`,
      )).json();
      assertEquals(after.running, true);
    } finally {
      await browser.close();
      stopAllEditors();
      await server.shutdown();
      if (tempRoot) await Deno.remove(tempRoot, { recursive: true });
    }
  },
});
