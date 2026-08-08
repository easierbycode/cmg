# cmg gamepad testing

The launcher's gamepad nav (pollPad in Dashboard.svelte) is rAF-driven, and the in-app Browser pane pauses rAF while hidden (same issue as [2019-turbo testing](2019-turbo-testing.md)) — so pad input can't be exercised there. Instead run headless Chrome via astral, where rAF ticks normally.

**Why:** synchronous keyboard-event dispatch tests only the shared registry paths; chord latching, hold-to-repeat, wrap-on-fresh-edge, and compat-plugin normalization only run through the rAF poll loop.

**How to apply:**
- The technique is now committed as tests (run `deno task test:e2e`): `tests/e2e/gamepad_compat_plugin_test.ts` (plugin unit tests via shimmed root — Deno's own navigator is non-writable), `tests/e2e/launcher_gamepad_nav_test.ts` (nav, wrap, Start/B, demo launch, Guide hint/slider/chord), `tests/e2e/controller_configurator_pad_test.ts` (pad focus + input-leak guards), all on `tests/e2e/launcher_pad_harness.ts` (self-hosted launcher + fake-pad pipeline, phaser_editor_test.ts-style; skips loudly without `deno task dashboard:build`).
- Set `CHROME_PATH="C:/Program Files/Google/Chrome/Application/chrome.exe"` (astral's bundled Chrome fails to spawn on this host).
- The pipeline: fetch `/gamepad-compatibility-plugin.js`, re-evaluate via `new Function('globalThis', src)(shimRoot)` with `shimRoot.navigator.getGamepads = () => fakePads`, then `Object.defineProperty(navigator, 'getGamepads', { value: () => shim.navigator.getGamepads() })` — the real normalization pipeline (profiles → SNES → generic) stays under test.
- A self-hosted test shell must serve ALL scripts from routes/index.tsx — dashboard.bundle.js alone is not enough; `gamepad-support.js`, `controller-configurator.js`, `controller-mapping-wizard.js` define `window.openControllerConfigurator` / `gamepadManager`.
- Gotchas: dashboard boots with menuSel=1 (Games preselected); Svelte 5 flushes DOM in microtasks so await ~30ms between key dispatch and DOM assert; the compat plugin's generic d-pad rebuild only observes axis neutral/hat-rest inside the `buttons` getter, so poll buttons once at rest before deflecting; joydev SNES normalization swaps raw face 2↔3.
- Under full-suite load a 140ms fake press can miss the poll window — use press-until-moved / press-until-state retries (a missed tap changes nothing, so retrying is safe), as the committed tests do.
