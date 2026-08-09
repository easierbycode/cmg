// E2E: RTDB level "foo" (2019-es7's default level) converts to a Voxel 3D
// build that is served at a real URL and plays in both view modes.
//
// Three stages, mirroring the user flow:
//   1. Load level "foo" in 2019-es7 — the source game (vendored Phaser,
//      phaser-game.html) boots straight into PhaserGameScene from the RTDB
//      record (an explicit ?level= skips the title screen), with foo's custom
//      atlas frames merged into game_asset.
//   2. Convert — open /editor/?level=foo and run saveAsVoxel3D(): every atlas
//      frame is voxelized through the Pixel Composer engine (pitch/yaw 10) and
//      the Phaser 4.2.1 dual-mode build is POSTed to /api/games/voxel.
//   3. Play by URL — GET /games/voxel-foo/ (no blob, no download), boot the
//      published game, and drive it in BOTH modes: 2d vertical shooter and 3d
//      super scaler.
//
// Run with: deno task test:e2e   (needs network: Firebase SDK + RTDB + the
// 2019-es7 sibling checkout for stage 1, which is skipped when absent)

import { launch } from "@astral/astral";
import { serveDir } from "@std/http/file-server";
import { assert, assertEquals } from "@std/assert";
import { fileURLToPath } from "node:url";

// Ambient views of the editor page's global lexical bindings (top-level `let`
// in static/editor/index.html) — see level_editor_firebase_test.ts for why
// these must be read as bare identifiers inside page.evaluate.
// deno-lint-ignore no-explicit-any
declare let gameData: any;
// deno-lint-ignore no-explicit-any
declare let atlasData: any;
// deno-lint-ignore no-explicit-any
declare let atlasImage: any;
// deno-lint-ignore no-explicit-any
declare let extraSprites: any[];
// deno-lint-ignore no-explicit-any
declare let replacedFrames: Record<string, any>;
declare let customFrameKeys: Set<string>;

const RTDB = "https://evil-invaders-default-rtdb.firebaseio.com";
const LEVEL = "foo";
const CMG_PORT = 8808;
const ES7_PORT = 8809;
const cmgRoot = fileURLToPath(new URL("../../static", import.meta.url));
const es7Root = Deno.env.get("ES7_DIR") ??
  fileURLToPath(new URL("../../../2019-es7", import.meta.url));
const hasEs7 = (() => {
  try {
    return Deno.statSync(`${es7Root}/phaser-game.html`).isFile;
  } catch (_e) {
    return false;
  }
})();

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
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error(
    `Timed out waiting for ${label} (last: ${Deno.inspect(last)})`,
  );
}

Deno.test("RTDB level foo loads in 2019-es7 and converts to a URL-served Voxel 3D build playable in 2D and 3D", async () => {
  // ---- Stage 0: the RTDB record is what 2019-es7's BootScene would accept.
  const rec = await (await fetch(`${RTDB}/levels/${LEVEL}.json?shallow=true`))
    .json();
  assert(rec && rec.enemylist, "levels/foo must exist with an enemylist");

  // Publishes land in a throwaway GAMES_DIR; set the env BEFORE the route
  // modules are imported (GAMES_DIR is a module-level const).
  const gamesDir = await Deno.makeTempDir({ prefix: "cmg-voxel-e2e-" });
  Deno.env.set("CMG_GAMES_DIR", gamesDir);
  const { handler: voxelHandler } = await import(
    "../../routes/api/games/voxel.ts"
  );
  const { handler: gamesHandler } = await import(
    "../../routes/games/[...path].ts"
  );

  // cmg server: static/ plus the two real route handlers under test.
  const server = Deno.serve(
    { port: CMG_PORT, hostname: "127.0.0.1", onListen: () => {} },
    async (req) => {
      const url = new URL(req.url);
      if (req.method === "POST" && url.pathname === "/api/games/voxel") {
        // deno-lint-ignore no-explicit-any
        return await (voxelHandler as any).POST({ req });
      }
      const m = /^\/games\/(voxel-.*)$/.exec(url.pathname);
      if (req.method === "GET" && m) {
        // deno-lint-ignore no-explicit-any
        return await (gamesHandler as any).GET({
          req,
          params: { path: decodeURIComponent(m[1]) },
        });
      }
      return serveDir(req, { fsRoot: cmgRoot, enableCors: true, quiet: true });
    },
  );
  const es7Server = hasEs7
    ? Deno.serve(
      { port: ES7_PORT, hostname: "127.0.0.1", onListen: () => {} },
      (req) =>
        serveDir(req, { fsRoot: es7Root, enableCors: true, quiet: true }),
    )
    : null;

  // CHROME_PATH escape hatch as in scene_script_gist_picker_test.ts —
  // astral's bundled win64 Chrome fails to spawn on some Windows hosts.
  const chrome = Deno.env.get("CHROME_PATH");
  const browser = await launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--autoplay-policy=no-user-gesture-required",
      "--mute-audio",
    ],
    ...(chrome ? { path: chrome } : {}),
  });

  try {
    // ---- Stage 1: 2019-es7 boots level foo from RTDB.
    if (es7Server) {
      const es7: Page = await browser.newPage(
        `http://127.0.0.1:${ES7_PORT}/phaser-game.html?level=${LEVEL}&lowmode=1`,
      );
      await waitFor(
        () =>
          es7.evaluate(() => {
            // deno-lint-ignore no-explicit-any
            const g = globalThis as any;
            const game = g.__PHASER_4_GAME__;
            if (!game) return false;
            const active = game.scene.scenes
              // deno-lint-ignore no-explicit-any
              .filter((s: any) => s.scene.isActive())
              // deno-lint-ignore no-explicit-any
              .map((s: any) => s.scene.key);
            return active.includes("PhaserGameScene");
          }),
        "2019-es7 to boot level foo into PhaserGameScene",
        120000,
      );
      // foo's custom atlas frames were merged into game_asset.
      const hasCustomFrame = await es7.evaluate(() => {
        // deno-lint-ignore no-explicit-any
        const g = globalThis as any;
        const tex = g.__PHASER_4_GAME__.textures.get("game_asset");
        if (!tex) return false;
        try {
          if (typeof tex.has === "function") {
            return tex.has("asteroidFace0.png");
          }
          return !!g.__PHASER_4_GAME__.textures.getFrame(
            "game_asset",
            "asteroidFace0.png",
          );
        } catch (_e) {
          return false;
        }
      });
      assert(
        hasCustomFrame,
        "foo's custom frame (asteroidFace0.png) should be merged into game_asset",
      );
      await es7.close();
    }

    // ---- Stage 2: editor loads foo and converts it.
    const page: Page = await browser.newPage(
      `http://127.0.0.1:${CMG_PORT}/editor/?level=${LEVEL}`,
    );
    await waitFor(
      () =>
        page.evaluate(() => {
          try {
            // deno-lint-ignore no-explicit-any
            const g = globalThis as any;
            const input = document.getElementById(
              "firebase-level-name",
            ) as HTMLInputElement | null;
            return !!(gameData && atlasData && atlasImage &&
              atlasImage.complete &&
              Object.keys(atlasData.frames || {}).length > 0 &&
              input && input.value === "foo" &&
              // foo's custom art arrived from Firebase AND was folded into the
              // atlas. Waiting on extraSprites/replacedFrames instead would be
              // waiting on the staging arrays, which the fold drains — and art
              // left sitting there is exactly the bug: only atlasData is
              // published to the viewers and to PLAY.
              customFrameKeys.size > 0 &&
              !!atlasData.frames["asteroidFace0.png"] &&
              typeof g.saveAsVoxel3D === "function" &&
              typeof g.VOXEL3D_RUNTIME === "function");
          } catch (_e) {
            return false;
          }
        }),
      "editor to load base game + Firebase level foo",
      120000,
    );

    // Kick the conversion off detached — voxelizing every atlas frame takes
    // minutes, far beyond a single evaluate's comfort zone — then poll.
    await page.evaluate(() => {
      // deno-lint-ignore no-explicit-any
      const g = globalThis as any;
      g.alert = function () {};
      g.open = function () {
        return null;
      };
      g.__voxResult = null;
      g.saveAsVoxel3D().then(
        // deno-lint-ignore no-explicit-any
        (r: any) => {
          g.__voxResult = r || { ok: false, error: "null result" };
        },
        // deno-lint-ignore no-explicit-any
        (e: any) => {
          g.__voxResult = { ok: false, error: String(e) };
        },
      );
    });
    // deno-lint-ignore no-explicit-any
    const published = await waitFor<any>(
      // deno-lint-ignore no-explicit-any
      () => page.evaluate(() => (globalThis as any).__voxResult || false),
      "voxel conversion + publish to finish",
      10 * 60 * 1000,
    );
    assert(published.ok, `publish failed: ${published.error}`);
    assertEquals(published.id, "voxel-foo");
    assertEquals(published.url, "/games/voxel-foo");

    // The publish physically landed in GAMES_DIR.
    const filed = await Deno.readTextFile(`${gamesDir}/voxel-foo/index.html`);
    assert(filed.includes("VOXEL3D_DATA"), "published HTML embeds the data");
    assert(
      filed.includes("VOXEL3D_RUNTIME"),
      "published HTML embeds the runtime",
    );

    // ---- Stage 3: the URL serves a playable dual-mode game.
    const res = await fetch(`http://127.0.0.1:${CMG_PORT}/games/voxel-foo`);
    assertEquals(res.status, 200);
    const body = await res.text();
    assert(body.includes("VOXEL3D_RUNTIME"), "URL serves the voxel build");

    const play: Page = await browser.newPage(
      `http://127.0.0.1:${CMG_PORT}/games/voxel-foo`,
    );
    // deno-lint-ignore no-explicit-any
    const title = await waitFor<any>(
      () =>
        play.evaluate(() => {
          // deno-lint-ignore no-explicit-any
          const g = globalThis as any;
          if (!g.__VOXEL3D__) return false;
          const s = g.__VOXEL3D__.getState();
          return s.mode === "title" && s.phaser ? s : false;
        }),
      "published voxel game to reach the title screen",
      120000,
    );
    assert(title.phaser, "Phaser game should be running");

    // 2D vertical shooter mode.
    await play.evaluate(() => {
      // deno-lint-ignore no-explicit-any
      const g = globalThis as any;
      g.__VOXEL3D__.setMode("2d");
      g.__VOXEL3D__.start();
    });
    // deno-lint-ignore no-explicit-any
    const in2d = await waitFor<any>(
      () =>
        play.evaluate(() => {
          // deno-lint-ignore no-explicit-any
          const s = (globalThis as any).__VOXEL3D__.getState();
          return s.mode === "game" && s.viewMode === "2d" && s.enemies > 0
            ? s
            : false;
        }),
      "2D mode gameplay with spawned enemies",
      30000,
    );
    assert(in2d.playerHp > 0, "player alive in 2D mode");

    // 3D super scaler mode, mid-game.
    const in3d = await play.evaluate(() => {
      // deno-lint-ignore no-explicit-any
      const g = globalThis as any;
      g.__VOXEL3D__.setMode("3d");
      return g.__VOXEL3D__.getState();
    });
    assertEquals(in3d.viewMode, "3d");
    assertEquals(in3d.mode, "game");
  } finally {
    await browser.close();
    await server.shutdown();
    if (es7Server) await es7Server.shutdown();
    await Deno.remove(gamesDir, { recursive: true }).catch(() => {});
  }
});
