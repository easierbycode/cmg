# Voxel 3D export

**SAVE AS VOXEL 3D** (added 2026-07-20) is the editor menu option that voxelizes
a game and publishes it as a playable URL. Built on top of the existing SAVE AS
3D super-scaler pipeline.

**Flow (all in `static/editor/index.html`, `saveAsVoxel3D()`):** `build3DData()`
→ re-run `buildAtlasWithReplacements()` for frame canvases → `buildVoxelAtlas()`
voxelizes EVERY frame via the in-process Pixel Composer engine (loaded with
`ensurePixelComposerEngine()` from `/pixel-composer/pixel-composer.js`,
bypassing pc-client's 64-frame/24MB iframe caps) with
`{mode:'extrude', depth:6, yaw:10, pitch:10}` — **pitch/yaw 10, not the 30/30
default, per the feature request**. New frames keep their ORIGINAL keys (recipe
lookups unchanged) plus `sourceSize` = pre-voxel dims; the runtime's
`voxScale()` divides them out so gameplay sizing cancels the ~pixelSize× voxel
inflation. `pixelSize` auto-degrades from 4 if the packed voxel sheet (4096
wide) would exceed ~7900px tall (WebGL cap). Then inline the vendored Phaser
4.2.1 (`/games/2028-ai/lib/phaser.min.js`, ~1.3MB) and POST `{name, html}` to
`/api/games/voxel`; on failure (hosted deploy / offline) falls back to a blob
download.

**Runtime:** `static/editor/voxel3d-runtime.js` — self-contained
`window.VOXEL3D_RUNTIME(DATA)`, serialized into the export via `.toString()`
(same idiom as `GAME3D_RUNTIME`). It's a **direct port of GAME3D_RUNTIME's
world-space simulation** (keep the two gameplay loops in sync) but renders
through **Phaser 4.2.1 WebGL** instead of canvas 2D. Two view modes over one
sim: `3d` super-scaler (ground = a `Mesh2D` — the 4.2 textured-triangle object,
`G_ROWS=44`×`G_COLS=26` perspective strip; Phaser 4 has NO scene-level 3D
camera, Mesh2D + hand projection IS the 3D toolkit) and `2d` vertical shooter
(z→screen-y, scrolling stage bg in a center column with side panels). Toggle: M
key / on-screen MODE button / `?mode=2d|3d`. Pooled immediate-mode
`img()`/`txt()` draw helpers; fixed 120Hz step in the scene `update`. Test hooks
on `window.__VOXEL3D__` (getState/start/god/setMode/…); game handle is
`globalThis.__PHASER_GAME__`.

**Publish route:** `routes/api/games/voxel.ts` — POST `{name, html}`,
`localWriteGuard` (local-launcher only, 403 on Deno Deploy), writes
`GAMES_DIR/voxel-<slug>/index.html` + `codemonkey.json`, returns
`url: "/games/voxel-<slug>"` (**no trailing slash** — the dev middleware 404s
directory-shaped `/games/…/` before the catch-all sees them). Served by the
existing `routes/games/[...path].ts` catch-all. `GAMES_DIR` (`<repo>/games`, env
`CMG_GAMES_DIR`) is now gitignored (`/games/`).

**E2E:** `tests/e2e/voxel3d_export_test.ts` (`deno task test:e2e`) — loads RTDB
`levels/foo` in 2019-es7 (custom frames merge into `game_asset`), converts via
`/editor/?level=foo` + `saveAsVoxel3D()`, asserts `/games/voxel-foo` serves and
plays in both modes. Imports the route handlers directly (`define.handlers` is a
pass-through; call `.POST({req})`/`.GET({req,params})`). Skips the 2019-es7
stage if the sibling checkout is absent. astral Chrome won't launch in the
sandbox, but the **whole flow was verified live** in the Browser pane: 555
frames voxelized on "foo" in ~72s, published, played in 2D (30 enemies,
voxel-shaded sprites) and 3D (Mesh2D perspective ground, WebGL renderer type 2).

**Combat + BGM data model (fixed 2026-07-20).** The 2019-es7 level model keeps
bullets in `projectileData` (enemies) and `projectileDataA`/`projectileDataB`
(bosses) — NOT `bulletData` (that was 2019-turbo). Level "foo" has no
`bulletData`, so the runtime's original `bulletData` lookup meant nothing fired.
The runtime now reads projectileData/A/B (with bulletData + any-projectile
fallback). Boss AI is a phase state machine (`updateBossAI`/`rollBossPhase` in
the runtime) reinterpreting the 2019-es7 boss modules: warp/reposition, aimed
column rake (projA), lane-wide spray (projB, counts trimmed — the 2D game's
radial bursts were up to 72), and a dive that descends the player's column; each
phase drives the boss `anim.{shoot,attack,warp,idle}`. Boss `interval` is unused
(cadence is baked, like the source). **BGM:** each stage plays its boss theme
from stage start (no separate ambient track), keyed `boss_<name>_bgm` by stage
via `["bison","barlog","sagat","vega","fang"]`; `customAudioURLs[sameKey]`
overrides it. Editor `buildVoxelBgm` resolves IndexedDB upload →
`audioURLs[key]` remote → `AUDIO_PATHS[key]` default; small sources bundle as
data-URLs, large custom BGM (foo's are ~42MB Cloudinary) is left by reference
(URL string) so the export stays ~18MB. Runtime plays one looping
HTMLAudioElement, switched per stage in `startStageRun`, view-independent. Test
hooks: `__VOXEL3D__.bgm()` and boss phase/z/animKey now in `getState()`.

Related: [Phaser versions & repo workflow](phaser-versions-and-repos.md),
[Scene-script architecture](scene-script-architecture.md),
[2019-turbo testing](2019-turbo-testing.md)
