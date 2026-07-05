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
