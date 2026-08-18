# Game Icon capture system

usage example:

```
deno run -A tools/game-recorder/icon-cli.ts --url https://easierbycode.com/95-demo-sp --out screenshot-95-demo.png
```

-OR, all games at once-

```
deno task icons:auto
```

- **Store**: `GAMES_DIR/.icons/` (`CMG_ICONS_DIR` override), files named
  `slug-fnv1a(id).png` + `index.json` map (`lib/icons-store.ts`). Routes:
  `GET/POST/DELETE /api/icons`, `GET /api/icons/<file>.png`,
  `POST /api/icons/auto` (headless), `POST /api/icons/fetch` (libretro). Same
  guard policy as `/api/games/*`; empty/read-only on Deploy.
- **Client capture**: `static/icon-capture.js` (runtime-imported by the
  dashboard AND by the CAPTURE_AGENT script that `main.ts` middleware injects
  into /games, /demos and the emulator player pages). Chain: EJS
  `gameManager.screenshot()` → Phaser `renderer.snapshot()` → rAF canvas
  readback (shadow-DOM aware for Ruffle) → foreignObject DOM raster. **Every
  strategy must stay blank-gated** — a hidden/unpainted page otherwise saves a
  black tile (bit us in testing).
- **preserveDrawingBuffer arming**: sessionStorage `cmg-icon-capture=1` (set by
  the dashboard when local) → agent patches `getContext` pre-script. Vite dev
  serves player pages WITHOUT the Fresh middleware (no route matches → no
  injection); `injectCaptureArm` in Dashboard.svelte covers that at iframe
  onload, plus cmg-net cache-served games.
- **Icon resolution in dashboard**: `iconOverlay` (from /api/icons, wins) →
  entry `icon` → libretro hotlink candidates (`lib/cover-art.ts`, onerror walks
  list) → initials. Console keys are `<system>:<file>`; catalog keys are the
  catalog id. `currentIconKey` set per launch path; silent capture 20s into play
  via `$effect`.
- **Pipeline**: `deno task icons:auto` (`scripts/auto-icons.ts`) — headless
  captures into `static/icons/auto/` + `--write` stamps games.json;
  `--systems=…` downloads covers into `static/<Dir>/covers/` (gitignored) which
  `build-*-manifest.ts` stamp as `icon` fields. Headless engine:
  `tools/game-recorder/record/icon.ts` (reuses recorder's virtual-clock
  `injection` + extracted `settleBoot`).
- **Gotchas**: astral's pinned Chromium dies on this Windows ARM64 box
  (side-by-side error 14001) — `findChrome()` in record/icon.ts prefers
  RECORD_CHROME/CMG_BROWSER/CHROME_PATH then installed Chrome/Edge/Brave.
  libretro has NO Switch shelf (TheGamesDB/SteamGridDB are key-gated — future).
  MAME thumbnails are named by driver description, not romset shortname. NES ROM
  here carries `[T-Eng1.01]` tag → only the fuzzy index match lands it.

Related: [cmg gamepad testing](cmg-gamepad-testing.md) (hidden Browser pane
pauses rAF — pump `__PHASER_GAME__.loop.step` to render before capturing in
tests), [Phaser versions & repo workflow](phaser-versions-and-repos.md).
