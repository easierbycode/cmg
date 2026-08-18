# Fresh project

Your new Fresh project is ready to go. You can follow the Fresh "Getting
Started" guide here: https://fresh.deno.dev/docs/getting-started

### Usage

Make sure to install Deno:
https://docs.deno.com/runtime/getting_started/installation

Then start the project in development mode:

```
deno task dev
```

This will watch the project directory and restart as necessary.

# cmg

- [Icon capture system](docs/icon-capture-system.md) — .icons store, capture
  chain (keep blank-gated!), libretro covers, icons:auto pipeline; ARM64
  astral→findChrome, vite-dev player-page injection gap
- [Input origin rule & remote updates](docs/cmg-input-origin-and-updates.md) —
  mapped keys need same-origin gameframe; cmg-net .cmg-* markers;
  /api/app-update; shmup-party-ps2 re-vendor procedure + ARM64 gotchas
- [Scene-script architecture](docs/scene-script-architecture.md) — player
  title/intro scripts: editor → 2028-ai/2019-turbo flow, two-copy sync rule,
  bundle rebuild command
- [2019-turbo testing](docs/2019-turbo-testing.md) — hidden Browser pane pauses
  Phaser; pump game.loop.step via javascript_tool and assert on scene state
  (drive scene.time directly for delayedCall timers)
- [Phaser versions & repo workflow](docs/phaser-versions-and-repos.md) — 4.2.1
  pins, the vendored-build gotcha, generated files, Windows/git friction, branch
  & push rules
- [Voxel 3D export](docs/voxel3d-export.md) — SAVE AS VOXEL 3D: voxelize atlas
  (pitch/yaw 10), Phaser 4.2.1 Mesh2D dual-mode runtime, publish to
  /games/voxel-<slug>
- [Editor/viewer bridge](docs/editor-viewer-bridge.md) — cmg-theme/cmg-tweaks
  launcher sync keys, editorBossData/atlas bridge, attackPattern override,
  boss-viewer v2 is Phaser-free
- [SpacetimeDB JSON reducer args](docs/spacetimedb-json-reducer-args.md) —
  goofy-game-st: reducer int args must be JSON numbers, but idKey() stringifies
  PKs — Number() before CallReducer (the coin-collect bug); failed calls come
  back with request_id 0, so correlate by reducer_name
- [cmg gamepad testing](docs/cmg-gamepad-testing.md) — committed tests in
  tests/e2e/ (launcher_pad_harness); astral headless + fake getGamepads shim;
  hidden pane pauses rAF/pollPad
- [Voland Switch section](docs/voland-switch-section.md) — Voland ships no WASM
  build (Aug 2026); /switch is a PS2-style top-level player + BYOC; COOP/COEP
  must be synced in BOTH main.ts and vite.config.ts; prod.keys rides into
  compiled launchers

## Games, demos & OTA updates

The game list **and the Games → Demos list** are delivered over-the-air. The
launcher binary (`deno task build:mac`) embeds a snapshot, but at boot the
dashboard fetches the live manifest, so **adding a game or a demo and pushing to
`main` deploys it to every CMG Launcher with no rebuild**.

**To add or edit a game:** edit [`data/games.json`](data/games.json) (one entry
per game). **To add or edit a demo:** edit [`data/demos.json`](data/demos.json).
Push to `main` — Deno Deploy runs `deno task build`, which regenerates
`static/games.manifest.json` (`{ version, generatedAt, games, demos }`), and
every launcher picks it up on its next launch.

Game entry fields:

```jsonc
{
  "id": "monkey-kombat", // external games load from easierbycode.com/<id>
  "name": "Monkey Kombat", // menu label
  "title": "MONKEY KOMBAT", // detail panel title
  "sub": "…", // short subtitle
  "icon": "/icons/foo.png", // or null
  "size": "6.4 MB",
  "date": "05.19.26",
  "url": "/games/2028-ai" // OPTIONAL: in-repo Fresh route (resolved against
  // the manifest origin). Omit for external games.
}
```

Demo entries use the same shape but always set `url` to their `/demos/<id>`
route (resolved against the manifest origin, so the page stays co-origin with
the `/api/ws-goofy` relay) and omit `icon`.

How it resolves at runtime (`svelte-src/Dashboard.svelte` → `loadManifest`):

1. `https://cmg.easierbycode.deno.net/games.manifest.json` — the deploy. This is
   how launchers and the web app receive new games/demos (OTA).
2. same-origin `/games.manifest.json` — the web app's own copy, and an offline
   launcher's embedded fallback.
3. the baked-in seeds (`SEED_GAMES` / `SEED_DEMOS`) — only if both fetches fail
   (fully offline).

The manifest is served with permissive CORS + `no-store` by the global
middleware in [`main.ts`](main.ts), so the cross-origin fetch from a launcher on
`localhost` works. Regenerate it locally with `deno task games:manifest` (it
also runs as the first step of `deno task build`).

## Recording games for social

`tools/game-recorder` records any catalog game from a headless browser and posts
it to Instagram Reels / TikTok:

```sh
deno task record --list
deno task record --game games/2028-ai
deno task record --game akuma --post instagram,tiktok --caption "..." --dry-run
```

The catalog comes from `data/games.json` / `data/demos.json`, so a game added to
CMG is recordable immediately. Capture is deterministic — the page clock is
replaced and the game is stepped one exact frame at a time — so no frames drop
and the same game always produces the same file. Per-game capture hints
(`startWhen`, `stopWhen`, `durationMs`, …) go in an optional `recorder` key on
the catalog entry. See
[`tools/game-recorder/README.md`](tools/game-recorder/README.md).

## Game icons — capture in game, fetch boxart, or let it fill itself

A game tile's art resolves in this order: the **local icon store** (icons you
captured or fetched on this machine), the entry's own `icon` field (OTA
manifest, a local game's `thumbnail.png`, or a console-manifest cover), and —
for console ROMs — **hotlinked libretro boxart** guessed from the ROM's
filename, degrading to the initials placeholder when everything misses.

**Capture in game.** The in-game Guide has a **Capture Icon** row on any local
launcher. One capture engine
([`static/icon-capture.js`](static/icon-capture.js)) covers every game type,
most-faithful strategy first: EmulatorJS's own `gameManager.screenshot()`,
Phaser's `renderer.snapshot()`, a rAF-synchronized readback of the largest
visible canvas (shadow-DOM aware, so Ruffle's player canvas is found), and an
SVG `foreignObject` rasterization for canvas-less DOM games. Every strategy is
gated by a blank-frame detector — the old launcher's "black rectangle" WebGL
captures can't be saved. WebGL readback works because the launcher stamps a
capture agent into game/player HTML
([`lib/launcher-inject.ts`](lib/launcher-inject.ts)) that forces
`preserveDrawingBuffer` before any game script runs (armed via the
`cmg-icon-capture` sessionStorage flag); cross-origin frames answer the same
agent over postMessage instead. While you play, a game with no art is captured
silently after ~20s — playing a game is all it takes to give it an icon.

**Icon store.** Captures land in `GAMES_DIR/.icons/` (override: `CMG_ICONS_DIR`)
— named by a slug + hash of the game id, indexed in `index.json`, served back by
`GET /api/icons/<file>.png`. `GET /api/icons` maps ids to URLs;
`POST /api/icons` `{ id, dataUrl }` saves; `DELETE /api/icons` `{ id }` removes.
Mutations are guarded exactly like `/api/games/*` (local launcher only,
cross-site refused); on Deno Deploy the store reads empty and refuses writes, so
the hosted app quietly shows OTA icons + hotlinked covers.

**Auto icons.** Settings → **AUTO ICONS** fills everything still showing
initials, in the background while you keep playing: console ROMs get boxart via
`POST /api/icons/fetch` (libretro-thumbnails, keyless — exact No-Intro/Redump
filename first, display name second, then a fuzzy scan of the system shelf's
index, RetroArch's own matching order), and catalog games get a headless capture
via `POST /api/icons/auto` where available. That endpoint spawns
`tools/game-recorder/icon-cli.ts` — the recorder's deterministic virtual-clock
boot
([`tools/game-recorder/record/icon.ts`](tools/game-recorder/record/icon.ts)),
one frame instead of a reel — so it needs the dev checkout (`deno` CLI + tool
sources on disk); the dashboard probes and hides what can't run. An installed
Chrome/Edge/Brave is preferred over astral's pinned download (which doesn't
start on Windows ARM64).

**Pipeline.** `deno task icons:auto` does the same headless work at build time:
captures catalog games missing an `icon` into `static/icons/auto/` (and stamps
`data/games.json` with `--write` — commit the pair and the icons ship OTA), and
`--systems=nes,psx,…` downloads console covers into `static/<SystemDir>/covers/`
(gitignored, like the ROMs beside them — rerun `deno task <sys>:manifest` and
the builders stamp `icon` fields the dashboard renders). `--list` shows
coverage; see `--help` for the rest. Switch has no libretro shelf — its art
needs a keyed provider (TheGamesDB/SteamGridDB), which is the natural next
addition behind an env key.

## Launcher detection — hiding a game's own chrome

Games often carry their own standalone chrome (a header, attribution, an
instructions panel) that is redundant inside the launcher. CMG stamps the same
detection contract as
[codemonkey-games-launcher](https://github.com/easierbycode/codemonkey-games-launcher)
onto every game document it runs, so a game can hide that chrome with plain CSS:

```html
<style>
.inLauncher #info {
  display: none !important;
}
</style>
```

Signals available when the game runs inside the launcher UI (embedded in the
dashboard's game iframe — web, kiosk, and desktop builds alike):

- class `inLauncher` on `<html>` and `<body>`
- `<html data-cmg-launcher="1">`
- `window.__CMG_LAUNCHER__ === true` and `window.__CMG__.launcher === true`

Opening the same URL directly in a browser tab leaves all of these unset, so the
standalone page keeps its chrome. The stamp is applied twice, idempotently: a
middleware in [`main.ts`](main.ts) injects the marker
([`lib/launcher-inject.ts`](lib/launcher-inject.ts)) into every `/games/*` and
`/demos/*` HTML response — built-in static games, locally-added `GAMES_DIR`
games, per-game Fresh routes, and the evil-invaders proxy alike, including when
a packaged launcher loads them cross-origin from the deploy — and the dashboard
also stamps same-origin game frames on load (`injectLauncherMarkerIntoFrame` in
[`svelte-src/Dashboard.svelte`](svelte-src/Dashboard.svelte)). Games hosted on
other origins entirely (e.g. easierbycode.com) can't be stamped by the launcher;
they should self-detect with `if (self !== top)` (see
[`static/demos/akuma.js`](static/demos/akuma.js)).

## Windows build & the `codemonkey://` protocol

```
deno task build:windows              # → dist/cmg-windows-x86_64.exe
deno task register:windows:protocol  # HKCU registry: codemonkey:// → the exe
deno task unregister:windows:protocol
```

`build:windows` compiles
[`scripts/launch-windows.ts`](scripts/launch-windows.ts) into a self-contained
kiosk launcher (embedded Fresh app served on localhost, Chrome/Edge/Brave opened
in kiosk mode — the Windows counterpart of `build:mac` / `build:linux`). The exe
doubles as the `codemonkey://` protocol handler: a link like

```
codemonkey://add?repo=https://github.com/owner/game&branch=main&folder=
```

installs that repo into the local game store

.: TRY IT :.

```
deno task register:windows:protocol
```

.: (then paste below into browser / file explorer / run box) :.

```
codemonkey://add?repo=https://github.com/easierbycode/pacman&branch=master
```

([`lib/protocol.ts`](lib/protocol.ts) — the same flow as
`POST /api/games/add-github`). If a launcher is already running, the link is
forwarded to its API instead of racing a second kiosk onto the port.

The **Add to CodeMonkey** button that builds those links on github.com is the
Chrome extension in [`tools/github-extension/`](tools/github-extension/) (ported
from codemonkey-games-launcher). The whole chain — button click → protocol link
→ install → listed by `/api/games/local` — is covered by
[`tests/e2e/protocol_add_github_button_test.ts`](tests/e2e/protocol_add_github_button_test.ts).

## Editing a game in Phaser Editor 2D — the Guide's "Edit Game"

When a game's project directory carries a `phasereditor2d.config.json`, the
in-game Guide gains an **Edit Game** row. Pressing it starts
[Phaser Editor 2D](https://phasereditor2d.com/) against that directory and swaps
the game frame to the IDE — the real editor, on the real sources.

Install the editor once (it is **not** committed — ~12 MB of binaries, and
`vendor/` is gitignored):

```sh
deno task phasereditor:vendor            # this machine's platform
deno task phasereditor:vendor -- --all   # windows + macos + linux
```

That does up front what a project's `phasereditor2d-launcher` devDependency
would do on first run: it installs the npm package and the
`PhaserEditor2D-core-<version>-<platform>` binaries into
`vendor/phasereditor2d/`, laid out exactly like `~/.phasereditor2d/installs` so
either location works. Resolution order is `CMG_PHASER_EDITOR_HOME` →
`vendor/phasereditor2d` → `~/.phasereditor2d`; with none of them present the
button simply doesn't appear. If `npm run editor` already downloaded the zip,
the vendor task copies it out of the home directory instead of re-fetching.

Where projects are looked for, given a launched game id (`games/2028-ai` and
`evil-invaders-phaser4/?scene=MutoidScene` both reduce to a plain directory
name): `GAMES_DIR` (games added through **Add Game**) and the app root's parent
— the developer layout, where the launcher checkout and the game checkouts are
siblings (`C:\CODE\cmg`, `C:\CODE\evil-invaders-phaser4`). Set
`CMG_PHASER_PROJECT_DIRS` (`;`-separated) to search somewhere else instead.

The editor runs as its own process on a free port from 1960 up — 1959 is left to
a `npm run editor` you started by hand — and
[`routes/phaser-editor/[...path].ts`](routes/phaser-editor/%5B...path%5D.ts)
proxies it onto the launcher's origin at `/phaser-editor/<project>/`. Framing it
cross-origin would cost the launcher marker and the in-frame two-corner gesture
that opens the Guide (both same-origin only), and would break entirely over
https; the proxy also rebases the handful of absolute `/editor/…` URLs the
editor bakes in, which would otherwise land on this repo's own level editor.

**Local launcher only.** It spawns a process and serves an IDE over a directory
on this machine, so `/api/phaser-editor` refuses on the hosted Deno Deploy
origin and against cross-site callers, only accepts a project name that is a
single plain directory segment, and only ever opens a directory that actually
holds a `phasereditor2d.config.json`. Editors are children of the launcher and
are killed with it.

End to end — dashboard → Guide → **Edit Game** → the real editor in the frame —
is covered by
[`tests/e2e/phaser_editor_test.ts`](tests/e2e/phaser_editor_test.ts) (needs
`deno task phasereditor:vendor` and `deno task dashboard:build`; it skips itself
with a note otherwise).

## NAOMI / Dreamcast (Flycast WASM)

Games → **NAOMI** (the leaping reindeer of the Utopia boot disc) runs Sega's
NAOMI/Atomiswave arcade boards and Dreamcast discs through
[flycast-wasm](https://github.com/nasomers/flycast-wasm) — flycast built as a
libretro core with an SH4→WebAssembly JIT — inside the same EmulatorJS frontend
the PSX / Saturn / NES / TG16 players use.

The core is ~10 MB of binaries published as loose release assets, so it is
fetched rather than committed:

```sh
deno task naomi:core   # → static/naomi/core/flycast-wasm.data (+ report.json)
```

`scripts/vendor-flycast-core.ts` downloads the pinned release
(`CMG_FLYCAST_TAG`, default `v1.0`) and packs it into the
`cores/<core>-wasm.data` zip EmulatorJS asks for;
[`static/naomi/play.html`](static/naomi/play.html) points the frontend at it
with `EJS_paths`. It runs as part of `deno task build`, so the deploy, the
desktop builds and the compiled launchers all carry the core, and it is a
warning rather than a build break when the download fails (the player then says
so, and names the task to run).

**BYOD — Bring Your Own Disc.** With no images in `static/Naomi/`, the section
is a file picker: choose a NAOMI/Atomiswave ROM set (`.zip` `.7z` `.lst` `.dat`)
or a Dreamcast image (`.chd` `.gdi` `.cdi` `.cue` `.iso`) and it boots from the
picked `File` without ever uploading it.

Two things follow from flycast taking arcade ROM sets as archives:

- **A `.zip`/`.7z` is a ROM set, and reaches the core intact.** EmulatorJS
  normally unpacks archives before boot — which turns a board's chip dumps into
  loose files nothing can load — so the player takes this core off that path,
  exactly as the frontend does for its own arcade cores. A Dreamcast disc
  therefore can't be handed over zipped; use `.chd`, or the descriptor with its
  tracks.
- **A `.gdi` or `.cue` needs its track files.** Those formats are text indexes,
  so select the `.bin`/`.raw` tracks in the same dialog (or keep them beside the
  descriptor in `static/Naomi/`); they are written into the emulated filesystem
  next to it. A `.lst`'s chip files work the same way. If any are missing, the
  player says which.

**Local images** dropped in `static/Naomi/` are indexed by
`deno task naomi:manifest` (also part of `deno task build`) into
`static/Naomi/manifest.json`, which is what the dashboard lists — BIOS dumps and
the track files a descriptor names are folded into their game rather than listed
as bootable rows of their own. Since every packaging task starts with
`deno task build` and embeds `static/` wholesale, those images ride along into
`deno task desktop:*` and `deno task build:mac` / `build:linux` /
`build:windows` binaries. The files themselves are gitignored — same policy as
the PSX/Saturn/NES libraries, so the public deploy stays ROM-free and falls back
to BYOD.

**BIOS is yours to supply.** NAOMI needs `naomi.zip` (`awbios.zip` for
Atomiswave) and Dreamcast discs need `dc_boot.bin` / `dc_flash.bin`. Put them in
`static/bios/` or `static/Naomi/` (both gitignored), or select them in the BYOD
dialog alongside the game — the player writes whatever it finds into the
emulated system directory before boot. Nothing copyrighted is shipped or fetched
by any task here.

## Gamepads — read this before debugging any input bug

Nearly every input bug in this repo has the same shape: **three layers see a
different pad, and we can only patch one of them.**

| Layer                    | What it sees                                                                           | Patchable? |
| ------------------------ | -------------------------------------------------------------------------------------- | ---------- |
| Browser Gamepad API      | The raw report. Varies by pad, OS, browser and cable-vs-Bluetooth.                     | No         |
| `CMGGamepadCompat`       | Patches `navigator.getGamepads()` to the standard layout. Everything in JS reads this. | Yes        |
| MAME's SDL (arcade only) | Its **own** enumeration, taken from the `gamepadconnected` event.                      | **No**     |

That third row is the one that surprises people. The plugin can only replace
`navigator.getGamepads()`; it cannot touch the event object MAME already used to
register the pad. So in the arcade player, **JS and MAME genuinely disagree
about what the pad is**, and a fix that works in JS can do nothing for MAME.

### The standard layout

Everything is normalized to this. MAME's cfg token is the **index + 1**, so
`JOYCODE_1_BUTTON13` is Gamepad-API index 12.

| Index   | Standard slot       | Xbox · PlayStation · Nintendo | MAME                    |
| ------- | ------------------- | ----------------------------- | ----------------------- |
| 0       | face bottom         | A · Cross · B                 | `BUTTON1`               |
| 1       | face right          | B · Circle · A                | `BUTTON2`               |
| 2       | face left           | X · Square · Y                | `BUTTON3`               |
| 3       | face top            | Y · Triangle · X              | `BUTTON4`               |
| 4 / 5   | L1 / R1             |                               | `BUTTON5` / `BUTTON6`   |
| 6 / 7   | L2 / R2             |                               | `BUTTON7` / `BUTTON8`   |
| 8 / 9   | Select / Start      | Share · Options               | `BUTTON9` / `BUTTON10`  |
| 10 / 11 | L3 / R3             |                               | `BUTTON11` / `BUTTON12` |
| 12–15   | D-pad U / D / L / R |                               | `BUTTON13`–`BUTTON16`   |
| 16      | Home / Guide        | PS · Stadia                   | — (absent on many pads) |

Face buttons are named by **position**, never by letter: index 0 is Xbox A but
Nintendo B, so "press A" is ambiguous and `FBTN_BOTTOM` is not.

### The traps, and what they look like

1. **A pad's index is part of its MAME identity.** `JOYCODE_n` = index + 1, so a
   pad at index 1 is _Joystick 2_ and matches none of the `JOYCODE_1_*` bindings
   every cfg uses. Plug in a second controller and the newcomer is silently dead
   — the same pad works perfectly when it is the only one connected.
2. **`preferSinglePad` hides the other pads.** `padPriority` ranks SNES `3` >
   Xbox `2` > everything else `1`, and the winner is the _only_ pad
   `getGamepads()` returns. With a SNES pad plus a DualShock, JS never sees the
   DualShock at all. Poll every connected pad if any of them should be able to
   drive the game.
3. **MAME registers the raw button _count_.** A SNES joydev pad reports 8 raw
   buttons, so normalized slots 8/9 (Select/Start) sit past the end and are
   never polled, no matter what the cfg says.
4. **The SNES pad is two different pads.** Fingerprinted by axis count: _joydev_
   (few axes; D-pad as real buttons 12–15, top/left faces swapped) and _Nintendo
   HID_ (~10 axes; **raw 12–15 are Home/Capture/ZR, not directions** — the D-pad
   is an encoded hat on `axes[9]`). Reading raw 12–15 on the latter gives a
   stuck D-pad-right from ZR.
5. **Editing a shipped `.cfg` wipes the emulator's saved state.** The
   `fileSystemKey` is an FNV-1a hash of the cfg bytes, so any edit starts a
   fresh IndexedDB store. That is deliberate — it is how updated control maps
   reach players who already ran the game — but it also **unmasks latent input
   bugs** the old store was papering over. An unrelated-looking cfg edit
   "breaking" the D-pad is this.

### The escape hatch: mirror to a keystroke

When a binding has to work on every pad, **don't fight the joycode — send the
key**. `default.cfg` already binds the keyboard for directions, Start and coin,
and a keystroke is immune to both the joystick-numbering (trap 1, 2) and
raw-button-count (trap 3, 4) problems at once. That is why
[`static/arcade/play.html`](static/arcade/play.html) drives Start as `KEYCODE_1`
and the D-pad as arrow keys rather than trusting `JOYCODE_1_*`.

### MAME's `P1_BUTTONn` is not the game's button order

`P1_BUTTON1` is **not** necessarily Light Punch. For `sfex2` the ports are:

| Port   | `BUTTON1` | `BUTTON2` | `BUTTON3` | `BUTTON4` | `BUTTON5` | `BUTTON6` |
| ------ | --------- | --------- | --------- | --------- | --------- | --------- |
| Action | HP        | LK        | HK        | LP        | MP        | MK        |

Map a fighter by **what each port does in game**, not by its number — going by
the number is what produced a scrambled six-button layout once already. The
shipped result is the standard arrangement: `LP MP HP` = face-left, face-top, R1
and `LK MK HK` = face-bottom, face-right, R2.

### Testing

A hidden Browser pane pauses `requestAnimationFrame` and throttles intervals to
≥1s, so the real poll loop can't be driven there. Stub `navigator.getGamepads`
and call the exposed hook directly — `window.__cmgArcadeInput.poll()` for the
arcade player — and remember to reproduce **pad indices**, since that is the
variable most bugs hide in. The committed suites live in `tests/e2e/`
(`launcher_pad_harness.ts`).

## Importing an OpenEmu game library

`deno task openemu:import` copies every game from OpenEmu's library
(`~/Library/Application Support/OpenEmu/Game Library/roms/`) into the matching
bundled emulator's ROM dir and refreshes its manifest, so the games appear in
the dashboard menus on the next reload:

| OpenEmu system   | Launcher dir            |
| ---------------- | ----------------------- |
| Sega Saturn      | `static/SegaSaturn/`    |
| Sony PlayStation | `static/PlayStation/`   |
| Nintendo (NES)   | `static/Nintendo/`      |
| TurboGrafx-16    | `static/TurboGrafx-16/` |
| Arcade           | `static/arcade/`        |

Single-file games (chd/iso/pbp/carts/zips) are copied as-is (`--link` symlinks
them instead to save disk). Disc games stored as cue/bin folders are packed into
one uncompressed `.zip` per game — the EmulatorJS players unpack zips in the
browser and auto-select the cue/m3u sheet. Useful flags (append after the task
name): `--systems=saturn,psx`, `--dry-run`, `--force`,
`"--library=/path/to/Game Library/roms"`. Imported files are gitignored
(local-only, like the PSX library) — a `deno task build:mac` binary embeds them,
while Deno Deploy stays ROM-free.

## Pixellate shader (OpenEmu's default look)

The EmulatorJS players (NES / TurboGrafx-16 / PSX / Saturn) render through a
port of OpenEmu's default **Pixellate** shader
([`static/shaders/pixellate.js`](static/shaders/pixellate.js)) — anti-aliased
nearest-neighbour scaling, so pixels stay crisp at any window size. It is on by
default; toggle it per player from the in-game OSD (SELECT + Down → Plugins →
Pixellate Shader — the choice persists in `localStorage`), or pick any other
shader from the EmulatorJS Settings → Graphics menu.
