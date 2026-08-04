// E2E: 2019-turbo's src/sound.js replaced by the embedded AZ Legend player.
//
// Serves two static roots — the CMG launcher (harness page, sound.js shim,
// the six boss_{NAME}_bgm.mp3 files) and the azlegend player (player.html) —
// then drives the harness exactly like 2019-turbo's scenes drive sound.js:
// bgmPlay(key) / stopBgm(key) for every boss BGM, asserting each track
// actually loads and plays inside the embedded player.
//
// Run with: deno task test:e2e
// Prerequisite — the test skips itself, loudly, without it: the azlegend
// checkout next to this repo (override: AZLEGEND_DIR).

import { launch } from "@astral/astral";
import { serveDir } from "@std/http/file-server";
import { assert, assertEquals } from "@std/assert";
import { fromFileUrl } from "@std/path";

const CMG_PORT = 8802;
const PLAYER_PORT = 8803;

const BOSS_KEYS = [
  "boss_bison_bgm",
  "boss_barlog_bgm",
  "boss_sagat_bgm",
  "boss_vega_bgm",
  "boss_goki_bgm",
  "boss_fang_bgm",
];

// fromFileUrl, not .pathname — the latter yields "/C:/…" on Windows, which
// Deno.stat and serveDir reject.
const cmgRoot = fromFileUrl(new URL("../../static", import.meta.url));
const azlegendRoot = Deno.env.get("AZLEGEND_DIR")
  ? `${Deno.env.get("AZLEGEND_DIR")}/static`
  : fromFileUrl(new URL("../../../azlegend/static", import.meta.url));

// Prerequisite — the test skips itself, loudly, without it: the azlegend
// checkout next to this repo (or wherever AZLEGEND_DIR points).
const haveAzlegend =
  (await Deno.stat(`${azlegendRoot}/player.html`).catch(() => null))?.isFile ??
    false;

if (!haveAzlegend) {
  console.log(
    `[music-player e2e] skipped: azlegend player not found at ${azlegendRoot} — check out azlegend next to this repo or set AZLEGEND_DIR`,
  );
}

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
  timeoutMs = 20000,
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

function playerState(page: Page) {
  return page.evaluate(() => {
    // deno-lint-ignore no-explicit-any
    return (globalThis as any).Sound.getPlayerState();
  });
}

Deno.test({
  name:
    "sound.js replacement loads and plays all 6 boss BGMs through the embedded player",
  ignore: !haveAzlegend,
  async fn() {
    for (const key of BOSS_KEYS) {
      assert(
        (await Deno.stat(`${cmgRoot}/games/2028-ai/assets/sounds/${key}.mp3`)
          .catch(() => null))
          ?.isFile,
        `missing mp3 for ${key}`,
      );
    }

    const cmgServer = staticServer(CMG_PORT, cmgRoot);
    const playerServer = staticServer(PLAYER_PORT, azlegendRoot);

    // CHROME_PATH escape hatch as in scene_script_gist_picker_test.ts —
    // astral's bundled win64 Chrome fails to spawn on some Windows hosts.
    const chrome = Deno.env.get("CHROME_PATH");
    const browser = await launch({
      headless: true,
      args: [
        "--autoplay-policy=no-user-gesture-required",
        "--mute-audio",
        "--no-sandbox",
      ],
      ...(chrome ? { path: chrome } : {}),
    });

    try {
      const playerUrl = `http://127.0.0.1:${PLAYER_PORT}/player.html`;
      const harnessUrl =
        `http://127.0.0.1:${CMG_PORT}/tests/music-player/index.html?eager=1&player=${
          encodeURIComponent(playerUrl)
        }`;

      const page = await browser.newPage(harnessUrl);

      // initSound() resolves once the player iframe announced itself and
      // accepted the boss BGM album sent over postMessage.
      // deno-lint-ignore no-explicit-any
      const album = await page.evaluate(() => (globalThis as any).soundReady);
      assertEquals(album.tracks.length, 6, "album should hold all 6 boss BGMs");
      assertEquals(
        album.tracks.map((t: { id: string }) => t.id).sort(),
        [...BOSS_KEYS].sort(),
      );

      // The harness fired bgmPlay("boss_bison_bgm") synchronously after
      // initSound(), before the player was ready — the shim must have queued
      // it and started playback once the album was accepted.
      await waitFor(async () => {
        const state = await playerState(page);
        return state &&
            state.currentTrackId === "boss_bison_bgm" &&
            state.paused === false &&
            state.currentTime > 0.1
          ? state
          : false;
      }, "eager (pre-ready) boss_bison_bgm to play");

      for (const key of BOSS_KEYS) {
        await page.evaluate(
          // deno-lint-ignore no-explicit-any
          (k: string) => (globalThis as any).Sound.bgmPlay(k),
          { args: [key] },
        );

        // "handled" = the player switched to the track, the mp3 decoded, and
        // playback is advancing.
        const playing = await waitFor(async () => {
          const state = await playerState(page);
          return state &&
              state.currentTrackId === key &&
              state.paused === false &&
              state.currentTime > 0.1
            ? state
            : false;
        }, `${key} to play`);
        assert(playing.duration > 1, `${key} should have a real duration`);
        assertEquals(playing.currentAlbumId, "2019-boss-bgm");

        await page.evaluate(
          // deno-lint-ignore no-explicit-any
          (k: string) => (globalThis as any).Sound.stopBgm(k),
          { args: [key] },
        );

        await waitFor(async () => {
          const state = await playerState(page);
          return state && state.paused === true && state.currentTime === 0
            ? state
            : false;
        }, `${key} to stop`);
      }

      // stopAll parity with the original module: nothing left playing.
      // deno-lint-ignore no-explicit-any
      await page.evaluate(() => (globalThis as any).Sound.stopAll());
      const finalState = await playerState(page);
      assertEquals(finalState.paused, true);
    } finally {
      await browser.close();
      await cmgServer.shutdown();
      await playerServer.shutdown();
    }
  },
});
