// Shared harness for the launcher gamepad E2E tests
// (launcher_gamepad_nav_test.ts, controller_configurator_pad_test.ts).
//
// It stands up the same self-hosted launcher phaser_editor_test.ts uses — the
// dashboard shell from routes/index.tsx (web fonts left out so the page needs
// no network) over the shipped static/ assets, so the real committed
// games.manifest.json is the catalog — and wires a fake-gamepad pipeline into
// the page:
//
//   a fresh copy of the REAL static/gamepad-compatibility-plugin.js is
//   evaluated against a shim root whose navigator.getGamepads() returns plain
//   test-authored pad objects, and the page's navigator.getGamepads is
//   repointed at the shim. The launcher's own polling (gamepad-support.js on
//   the real rAF loop) then sees normalized pads exactly as in production —
//   nothing in the input path is stubbed except the pads themselves.
//
// Chrome's DNS maps the deploy origin to a dead address so the catalog comes
// from the same-origin manifest and nothing leaves the machine.

import { launch } from "@astral/astral";
import { serveDir } from "@std/http/file-server";
import { fromFileUrl, join } from "@std/path";

// Astral pages and the browser globals are driven untyped, matching
// tests/e2e/gist_picker_flow.ts.
// deno-lint-ignore no-explicit-any
export type Page = any;
// deno-lint-ignore no-explicit-any
export type Win = any;

export const repoRoot = fromFileUrl(new URL("../../", import.meta.url));
export const staticRoot = join(repoRoot, "static");

async function fileExists(p: string): Promise<boolean> {
  try {
    return (await Deno.stat(p)).isFile;
  } catch {
    return false;
  }
}

// static/dashboard.bundle.js is generated (deno task dashboard:build), not
// committed — tests skip loudly without it.
export const haveBundle = await fileExists(
  join(staticRoot, "dashboard.bundle.js"),
);
export const BUNDLE_SKIP_NOTE =
  "skipped: no static/dashboard.bundle.js — run `deno task dashboard:build`";

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
    <script type="module" src="/gamepad-support.js"></script>
    <script type="module" src="/controller-configurator.js"></script>
    <script type="module" src="/controller-mapping-wizard.js"></script>
  </body>
</html>`;

/** The launcher over the shipped static assets; the real committed
 * games.manifest.json (with its local /demos/ entries) is the catalog. */
export function launcher(port: number) {
  return Deno.serve(
    { port, hostname: "127.0.0.1", onListen: () => {} },
    (req) => {
      const { pathname } = new URL(req.url);
      if (pathname === "/") {
        return new Response(SHELL, {
          headers: { "content-type": "text/html; charset=utf-8" },
        });
      }
      // Present but empty — the dashboard merges locally-added games from here.
      if (pathname === "/api/games/local") {
        return Response.json({ ok: true, games: [] });
      }
      return serveDir(req, { fsRoot: staticRoot, quiet: true });
    },
  );
}

/** Headless Chrome, hermetic: the dashboard tries the deploy's manifest before
 * the same-origin one, so both remote origins resolve to a dead port. Set
 * CHROME_PATH to use an installed Chrome instead of the one astral downloads —
 * astral's bundled win64 build fails to spawn on some Windows hosts. */
export function launchBrowser() {
  const chrome = Deno.env.get("CHROME_PATH");
  return launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-gpu",
      "--host-resolver-rules=MAP cmg.easierbycode.deno.net 127.0.0.1:1," +
      "MAP easierbycode.com 127.0.0.1:1",
    ],
    ...(chrome ? { path: chrome } : {}),
  });
}

export async function waitFor<T>(
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

export const sleep = (ms: number) =>
  new Promise<void>((r) => setTimeout(r, ms));

/** Open the dashboard and wait out the boot flash (menu rendered). */
export async function bootDashboard(
  browser: Awaited<ReturnType<typeof launchBrowser>>,
  port: number,
): Promise<Page> {
  const page: Page = await browser.newPage(`http://127.0.0.1:${port}/`);
  await waitFor(
    () =>
      page.evaluate(() => document.querySelectorAll(".menu .item").length >= 3),
    "the dashboard menu to render",
  );
  return page;
}

/** Install the fake-pad pipeline (see the module comment) and return the
 * compat plugin version the shim ended up with. */
export function installFakePads(page: Page): Promise<string> {
  return page.evaluate(async () => {
    const src = await (await fetch("/gamepad-compatibility-plugin.js")).text();
    const w = globalThis as Win;
    w.__rawPads = [];
    const shim: Win = {
      navigator: {
        userAgent: navigator.userAgent,
        getGamepads: () => w.__rawPads,
      },
      localStorage: w.localStorage,
      addEventListener: w.addEventListener.bind(w),
      WeakMap,
      Proxy,
      JSON,
      Math,
      Array,
      Object,
    };
    new Function("globalThis", src)(shim);
    Object.defineProperty(navigator, "getGamepads", {
      configurable: true,
      value: () => shim.navigator.getGamepads(),
    });
    w.__setPad = (pad: unknown) => {
      w.__rawPads = [pad];
    };
    w.__press = (i: number, on: boolean) => {
      const p = w.__rawPads[0];
      if (p && p.buttons[i]) {
        p.buttons[i].pressed = on;
        p.buttons[i].value = on ? 1 : 0;
      }
    };
    return shim.CMGGamepadCompat?.version ?? "missing";
  });
}

export function makeButtons(n: number) {
  return Array.from(
    { length: n },
    () => ({ pressed: false, touched: false, value: 0 }),
  );
}

export function standardPad() {
  return {
    id: "Std Pad (STANDARD GAMEPAD Vendor: dead Product: beef)",
    index: 0,
    connected: true,
    mapping: "standard",
    timestamp: 1,
    buttons: makeButtons(17),
    axes: [0, 0, 0, 0],
  };
}

/** Swap in a raw pad and give the launcher's poll loop a beat to see it. */
export async function setPad(
  page: Page,
  pad: Record<string, unknown>,
): Promise<void> {
  await page.evaluate((p: Record<string, unknown>) => {
    (globalThis as Win).__setPad(p);
  }, { args: [pad] });
  await sleep(300);
}

/** One clean press-and-release on a raw button — held long enough for the
 * poll loop to see the edge, released long enough for it to settle. */
export async function tapButton(page: Page, i: number): Promise<void> {
  await page.evaluate((n: number) => {
    (globalThis as Win).__press(n, true);
  }, { args: [i] });
  await sleep(140);
  await page.evaluate((n: number) => {
    (globalThis as Win).__press(n, false);
  }, { args: [i] });
  await sleep(260);
}

/** One clean deflect-and-release on raw axes[7] (the generic digital-hat
 * vertical pair the compat plugin rebuilds a D-pad from). */
export async function tapAxis7(page: Page, v: number): Promise<void> {
  await page.evaluate((x: number) => {
    (globalThis as Win).__rawPads[0].axes[7] = x;
  }, { args: [v] });
  await sleep(140);
  await page.evaluate(() => {
    (globalThis as Win).__rawPads[0].axes[7] = 0;
  });
  await sleep(260);
}

/** Index of the selected main-menu item (-1 when nothing is selected). */
export function menuSel(page: Page): Promise<number> {
  return page.evaluate(() =>
    [...document.querySelectorAll(".menu .item")].findIndex((el) =>
      el.classList.contains("sel")
    )
  );
}
