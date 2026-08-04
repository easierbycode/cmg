// E2E for the launcher's gamepad polling path: the REAL dashboard bundle and
// compat plugin, driven end to end in headless Chrome (real rAF loop) by fake
// pads — see launcher_pad_harness.ts for the pipeline.
//
// What a player with each pad in hand would see:
//   1. a standard-mapping pad's D-pad edges move the main-menu selection,
//   2. fresh presses wrap at both ends of the menu,
//   3. an axes-only generic pad (Chrome-on-Android style) still drives nav
//      via the plugin's rebuilt D-pad,
//   4. Start opens the Games screen and B backs out,
//   5. with a SNES-family pad: a demo launches, the Guide opens, its footer
//      hint advertises the SNES chord, the Fullscreen row is offered, Y/X
//      raise and lower a slider, SELECT closes the Guide, and the SELECT+Down
//      pad chord re-opens it WITHOUT the still-held direction scrolling the
//      list (the selHeld guard).
//
// Run with: deno task test:e2e   (no network needed)
// Prerequisite — the test skips itself, loudly, without it:
//   deno task dashboard:build       (static/dashboard.bundle.js; not committed)
// Set CHROME_PATH to use an installed Chrome instead of the one astral
// downloads — astral's bundled win64 build fails to spawn on some Windows
// hosts ("side-by-side configuration is incorrect").

import { assert, assertEquals, assertMatch } from "@std/assert";
import {
  bootDashboard,
  BUNDLE_SKIP_NOTE,
  haveBundle,
  installFakePads,
  launchBrowser,
  launcher,
  makeButtons,
  menuSel,
  type Page,
  setPad,
  standardPad,
  tapAxis7,
  tapButton,
  waitFor,
  type Win,
} from "./launcher_pad_harness.ts";

const PORT = 8816;

if (!haveBundle) {
  console.log(`[launcher gamepad e2e] ${BUNDLE_SKIP_NOTE}`);
}

/** One nav tap can land in a janky poll window when the suite has several
 * Chrome instances up. A missed tap moves nothing (safe to redo), a seen tap
 * moves exactly one step — so retry until the selection moves, re-reading the
 * start each attempt to keep the caller's one-step assert meaningful. */
async function tapToMove(
  page: Page,
  tap: () => Promise<void>,
): Promise<{ before: number; after: number }> {
  let before = await menuSel(page);
  for (let attempt = 0; attempt < 3; attempt++) {
    await tap();
    const after = await menuSel(page);
    if (after !== before) return { before, after };
    before = after;
  }
  throw new Error("the menu selection never moved after 3 taps");
}

Deno.test({
  name: "launcher gamepad nav: D-pad edges, wrap, Start/B, Guide + chord",
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
      const menuLen: number = await page.evaluate(() =>
        document.querySelectorAll(".menu .item").length
      );

      // --- 1. standard pad: D-pad edges move the selection ------------------
      await setPad(page, standardPad());
      assert(
        (await menuSel(page)) >= 0,
        "the menu should boot with a selection",
      );
      const down = await tapToMove(page, () => tapButton(page, 13));
      assertEquals(
        down.after,
        (down.before + 1) % menuLen,
        "a fresh D-pad down edge should move the selection down",
      );

      // --- 2. wrap-around on fresh presses ----------------------------------
      for (let guard = 0; guard < 6 && (await menuSel(page)) > 0; guard++) {
        await tapButton(page, 12); // walk to the top
      }
      assertEquals(await menuSel(page), 0, "the walk should reach the top");
      const wrapUp = await tapToMove(page, () => tapButton(page, 12));
      assertEquals(
        wrapUp.after,
        menuLen - 1,
        "one more fresh UP at the top must wrap to the last item",
      );
      const wrapDown = await tapToMove(page, () => tapButton(page, 13));
      assertEquals(
        wrapDown.after,
        0,
        "a fresh DOWN at the last item must wrap back to the first",
      );

      // --- 3. axes-only generic pad drives nav (rebuilt D-pad) --------------
      await setPad(page, {
        id: "usb gamepad (Vendor: 0810 Product: e501)",
        index: 0,
        connected: true,
        mapping: "",
        timestamp: 2,
        buttons: makeButtons(10),
        axes: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1.2857142857142856],
      });
      const axisDown = await tapToMove(page, () => tapAxis7(page, 1));
      assertEquals(
        axisDown.after,
        (axisDown.before + 1) % menuLen,
        "axes[7]-only D-pad should move the selection down",
      );

      // --- 4. Start activates Games; B goes back ----------------------------
      for (let guard = 0; guard < 6 && (await menuSel(page)) !== 1; guard++) {
        await tapAxis7(page, -1); // select "Games"
      }
      assertEquals(await menuSel(page), 1, "Games should be selectable by pad");
      // Press-until-state: a tap can land in a janky poll window under suite
      // load, so retap while the screen hasn't changed yet — never after.
      const gamesShown = () =>
        page.evaluate(() => !!document.querySelector(".games-screen.shown"));
      await waitFor(
        async () => {
          if (await gamesShown()) return true;
          await tapButton(page, 9); // Start
          return await gamesShown();
        },
        "Start to open the Games screen",
        15000,
      );
      await waitFor(
        async () => {
          if (!(await gamesShown())) return true;
          await tapButton(page, 1); // B
          return !(await gamesShown());
        },
        "B to return to the dashboard",
        15000,
      );

      // --- 5. SNES pad + demo + Guide ---------------------------------------
      await setPad(page, {
        id: "SNES Controller (Vendor: 057e Product: 2017)",
        index: 0,
        connected: true,
        mapping: "",
        timestamp: 3,
        buttons: makeButtons(16),
        axes: [0, 0, 0, 0, 0, 0, 0, 0, 0], // joydev family
      });
      await waitFor(
        () =>
          page.evaluate(() =>
            [...document.querySelectorAll(".games-screen .game-row")].some(
              (el) => /DEMOS/i.test(el.textContent ?? ""),
            )
          ),
        "the games list (with the DEMOS row) to render",
      );
      // The walk itself is keyboard-driven — the pad under test stays idle so
      // the Guide sections below start from a clean edge state.
      const launched = await page.evaluate(async () => {
        const zzz = (ms: number) => new Promise((r) => setTimeout(r, ms));
        const key = (k: string) =>
          globalThis.dispatchEvent(
            new KeyboardEvent("keydown", { key: k, bubbles: true }),
          );
        const items = [...document.querySelectorAll(".menu .item")];
        const gamesIdx = items.findIndex((el) =>
          /games/i.test(el.textContent || "")
        );
        if (gamesIdx < 0) return "no-games-item";
        for (let guard = 0; guard < 5; guard++) {
          const cur = items.findIndex((el) => el.classList.contains("sel"));
          if (cur === gamesIdx) break;
          key(cur < gamesIdx ? "ArrowDown" : "ArrowUp");
          await zzz(150);
        }
        key("Enter");
        await zzz(400);
        if (!document.querySelector(".games-screen.shown")) {
          return "games-not-shown";
        }
        // Walk the games list to the DEMOS submenu row.
        const rowSel = () =>
          document.querySelector(".games-screen .game-row.sel")?.textContent ||
          "";
        for (let i = 0; i < 40 && !/DEMOS/i.test(rowSel()); i++) {
          key("ArrowDown");
          await zzz(140);
        }
        if (!/DEMOS/i.test(rowSel())) {
          return "no-demos-row: " + rowSel().slice(0, 40);
        }
        key("Enter");
        await zzz(400);
        key("Enter"); // launch the first demo
        for (let i = 0; i < 30; i++) {
          if (document.body.classList.contains("playing")) return "playing";
          await zzz(200);
        }
        return "not-playing";
      });
      assertEquals(launched, "playing", "the first demo should launch");

      // Backquote is the keyboard stand-in for the SELECT + Down chord.
      const guide = await page.evaluate(async () => {
        const zzz = (ms: number) => new Promise((r) => setTimeout(r, ms));
        globalThis.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: "`",
            code: "Backquote",
            bubbles: true,
          }),
        );
        await zzz(400);
        const hint =
          (document.querySelector(".osd-foot-hint, .gf-hint")?.textContent ||
            "").trim();
        const rows = [...document.querySelectorAll(".osd-row, .osd-sect")].map(
          (el) =>
            (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 30),
        );
        return {
          open: !!document.querySelector(".osd-panel, .osd-blades"),
          hint,
          rows,
        };
      });
      assert(guide.open, `the Guide should open, got ${Deno.inspect(guide)}`);
      assertMatch(
        guide.hint,
        /SELECT \+ ↓ or R/,
        "with a SNES pad the hint must advertise the SNES chord",
      );
      assert(
        guide.rows.some((r: string) => /Fullscreen/i.test(r)),
        `the Fullscreen row should be offered, got ${guide.rows.join(" | ")}`,
      );

      // Y raises a slider, X lowers it. NB: this fake pad is joydev-family
      // SNES — the compat plugin swaps raw 2/3 into the standard slots (raw 2
      // = top face = increase, raw 3 = left face = decrease).
      const slider = await page.evaluate(async () => {
        const zzz = (ms: number) => new Promise((r) => setTimeout(r, ms));
        const w = globalThis as Win;
        const rows =
          () => [...document.querySelectorAll(".osd-sect, .osd-row")];
        const look = rows().find((el) => /Look/i.test(el.textContent || ""));
        if (!look) return { err: "no Look header" };
        (look as HTMLElement).click();
        await zzz(300);
        const breathe = rows().find((el) =>
          /Breathe/i.test(el.textContent || "")
        );
        if (!breathe) return { err: "no Breathe row after expand" };
        breathe.dispatchEvent(
          new PointerEvent("pointerenter", { bubbles: true }),
        );
        await zzz(250);
        const read = () => {
          const el = rows().find((n) => /Breathe/i.test(n.textContent || ""));
          return parseFloat(
            (el?.querySelector(".osd-val")?.textContent || "").replace(
              /[^\d.]/g,
              "",
            ),
          );
        };
        const press = async (i: number) => {
          w.__press(i, true);
          await zzz(140);
          w.__press(i, false);
          await zzz(260);
        };
        // A missed press changes nothing, so retap until the value moves.
        const bump = async (i: number) => {
          const from = read();
          for (let a = 0; a < 3 && read() === from; a++) await press(i);
          return read();
        };
        const v0 = read();
        const v1 = await bump(2); // raw 2 -> normalized top face = increase
        const v2 = await bump(3); // raw 3 -> normalized left face = decrease
        return { v0, v1, v2 };
      });
      assert(
        !("err" in slider) && slider.v1 > slider.v0 && slider.v2 < slider.v1,
        `Y should raise and X lower the slider, got ${Deno.inspect(slider)}`,
      );

      // SELECT (8) backs out / closes the Guide (press-until-state again).
      const guideOpen = () =>
        page.evaluate(() =>
          !!document.querySelector(".osd-panel, .osd-blades")
        );
      await waitFor(
        async () => {
          if (!(await guideOpen())) return true;
          await tapButton(page, 8);
          return !(await guideOpen());
        },
        "SELECT to close the Guide",
        15000,
      );

      // Re-open via the SELECT+Down pad chord, held a while — the Guide must
      // open and the still-held chord must NOT scroll the selection.
      const chord = await page.evaluate(async () => {
        const zzz = (ms: number) => new Promise((r) => setTimeout(r, ms));
        const w = globalThis as Win;
        w.__press(8, true); // SELECT…
        await zzz(60);
        w.__rawPads[0].axes[1] = 1; // …+ Down (joydev pair -> D-pad down)
        await zzz(800); // hold the chord a beat too long on purpose
        w.__rawPads[0].axes[1] = 0;
        w.__press(8, false);
        await zzz(300);
        const selText =
          (document.querySelector(".osd-row.sel, .osd-sect.sel")?.textContent ||
            "").trim();
        return {
          open: !!document.querySelector(".osd-panel, .osd-blades"),
          selText,
        };
      });
      assert(
        chord.open,
        `the SELECT+Down chord should open the Guide, got ${
          Deno.inspect(chord)
        }`,
      );
      assertMatch(
        chord.selText,
        /Exit Game/i,
        "the held chord must not scroll the Guide off its first row",
      );
    } finally {
      await browser.close();
      await server.shutdown();
    }
  },
});
