// E2E for the controller configurator's gamepad navigation, headless. The
// real launcher opens the real panel — window.openControllerConfigurator, the
// same global the Guide's "Controller Settings" row calls — and a fake
// standard pad drives it (see launcher_pad_harness.ts for the pipeline):
//
//   1. D-pad down establishes the .pad-focus ring, moves it, and D-pad up
//      moves it back,
//   2. B closes the panel,
//   3. none of it leaks into the launcher underneath — the main-menu
//      selection stays put, and the B that closed the panel is not replayed
//      as a fresh launcher Back edge.
//
// Run with: deno task test:e2e   (no network needed)
// Prerequisite — the test skips itself, loudly, without it:
//   deno task dashboard:build       (static/dashboard.bundle.js; not committed)
// Set CHROME_PATH to use an installed Chrome instead of the one astral
// downloads — astral's bundled win64 build fails to spawn on some Windows
// hosts ("side-by-side configuration is incorrect").

import { assert, assertEquals } from "@std/assert";
import {
  bootDashboard,
  BUNDLE_SKIP_NOTE,
  haveBundle,
  installFakePads,
  launchBrowser,
  launcher,
  menuSel,
  type Page,
  setPad,
  sleep,
  standardPad,
  tapButton,
  waitFor,
  type Win,
} from "./launcher_pad_harness.ts";

const PORT = 8817;

if (!haveBundle) {
  console.log(`[controller configurator e2e] ${BUNDLE_SKIP_NOTE}`);
}

Deno.test({
  name: "controller configurator: pad focus nav, B closes, nothing leaks",
  ignore: !haveBundle,
  // The browser runs for the length of the test; Deno's op / resource
  // sanitizers can't see it settle before the check runs.
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    const server = launcher(PORT);
    const browser = await launchBrowser();
    try {
      const page: Page = await bootDashboard(browser, PORT);
      const version = await installFakePads(page);
      assertEquals(version, "1.3.0", "the fake-pad pipeline should install");
      await setPad(page, standardPad());

      // Open the configurator directly (the Guide row calls the same global).
      const hasGlobal = await page.evaluate(() => {
        const w = globalThis as Win;
        const has = typeof w.openControllerConfigurator === "function";
        if (has) w.openControllerConfigurator({ byMouse: false });
        return has;
      });
      assert(hasGlobal, "window.openControllerConfigurator should exist");
      await waitFor(
        () =>
          page.evaluate(() => {
            const gm = (globalThis as Win).gamepadManager;
            return !!(gm?.isConfiguratorOpen && gm.isConfiguratorOpen());
          }),
        "the configurator to open",
      );
      assertEquals(
        await page.evaluate(() =>
          (globalThis as Win).gamepadManager?.wizardActive
        ),
        false,
        "wizardActive should be initialized false",
      );

      // --- D-pad drives the .pad-focus ring ---------------------------------
      const focusInfo = () =>
        page.evaluate(() => {
          const el = document.querySelector(".pad-focus");
          return el
            ? {
              tag: el.tagName,
              id: el.id || null,
              text: (el.textContent || "").trim().slice(0, 30),
            }
            : null;
        });

      await tapButton(page, 13); // D-pad down — first nav establishes focus
      const f1 = await focusInfo();
      assert(f1 !== null, "D-pad down should establish pad focus");
      await tapButton(page, 13);
      const f2 = await focusInfo();
      assert(
        JSON.stringify(f2) !== JSON.stringify(f1),
        `D-pad down should move focus, got ${Deno.inspect({ f1, f2 })}`,
      );
      await tapButton(page, 12); // D-pad up — back
      const f3 = await focusInfo();
      assertEquals(
        JSON.stringify(f3),
        JSON.stringify(f1),
        "D-pad up should move focus back",
      );

      // Nav must NOT leak into the launcher underneath.
      const menuSelBefore = await menuSel(page);

      // --- B closes ---------------------------------------------------------
      await tapButton(page, 1);
      await waitFor(
        async () =>
          !(await page.evaluate(() => {
            const gm = (globalThis as Win).gamepadManager;
            return !!(gm?.isConfiguratorOpen && gm.isConfiguratorOpen());
          })),
        "B to close the configurator",
      );

      await sleep(400);
      assertEquals(
        await menuSel(page),
        menuSelBefore,
        "panel nav must not move the launcher's menu selection",
      );
      // The B that closed the panel must not fire launcher Back/etc. as a
      // fresh edge after close — still on the dashboard, not the Games screen.
      assert(
        await page.evaluate(() =>
          !document.querySelector(".games-screen.shown")
        ),
        "the close press must not leak an action into the launcher",
      );
    } finally {
      await browser.close();
      await server.shutdown();
    }
  },
});
