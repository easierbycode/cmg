# Scene-script architecture

The scene-script feature (added 2026-07-15) lets players hook or replace
TitleScene and the story intro (AdvScene) in level-editor games.

**Canonical runtime:** `C:\CODE\cmg\static\phaser-plugins\scene-script.js` —
dependency-free ES module. `C:\CODE\2019-turbo\src\scene-script.js` is a
**verbatim copy; keep the two in sync** (cp after any edit). It resolves entries
from (1) `?editorPlay=1` + localStorage `__editorSceneScripts__`, (2)
`?titleScript=`/`?advScript=` params (URL or `gist:[user/]id[@rev][%23file]`),
(3) `recipe.sceneScripts`. `.ts` compiles via sucrase, `.svelte` via Svelte 5
compiler (`css: "injected"` is required or component styles are dropped) — both
lazily from esm.sh.

**Game integrations:** 2019-turbo scenes call
`runSceneScriptCreate/Start/End/Update` directly (scripts resolved in
PreloadScene); 2028-ai wraps the 2019-es7 scenes via
`ScriptedTitleScene`/`ScriptedAdvScene` subclasses in
`cmg/scripts/2028-ai/boot-entry.js`. After editing boot-entry or
scene-script.js, rebuild the bundle: `deno run -A scripts/build-2028-ai.ts`.
Editor-play normally skips to GameScene; boot-entry reroutes through Title/Adv
when `hasSceneScript()` so PLAY previews scripts.

**Editor UI:** panels in the Story and Title editor modals of
`static/editor/index.html` (functions prefixed `ss`, globals `sceneScripts`).
Entries persist in Firebase level records, `game.json`
(`gameData.sceneScripts`), and the editor-play localStorage key; inline
TS/Svelte is pre-compiled to `compiledJs` on save/play.

**5velte-ph4ser in scene scripts:** `5velte-ph4ser@1.0.0` (npm;
easierbycode/svelte-phaser, Svelte 5 + Phaser 4) works inside .svelte scene
scripts via its pure-TS core: import from
`https://esm.sh/5velte-ph4ser@1.0.0/core?external=phaser&deps=svelte@5.16.0`
(`deps` pins svelte to the compile pipeline's build for one shared runtime;
`external=phaser` emits a bare `import Phaser from "phaser"` that resolves
through the page's import map to the game's own Phaser). Adopt the running
game/scene with `setContext(GAME_CONTEXT_KEY, ctx.game)` +
`setContext(SCENE_CONTEXT_KEY, ctx.scene)` — do NOT use
createGame/createScene(instance), they destroy the game/remove the scene on
unmount. The overlay host is `pointer-events:none` (DOM content opts in with
`pointer-events:auto`); local checkout of the lib:
`C:\CODE\mario-sp\node_modules\5velte-ph4ser`. Example:
`2019-turbo/examples/scene-scripts/DemoAdvScene.svelte`.

**Bare `phaser` imports resolve everywhere (as of 2026-07-16):** 2019-turbo's
index.html import-maps `phaser` at the jsdelivr ESM build the game itself
imports. Pages that load Phaser as a **UMD global** (2028-ai, and the
build-level APK shell) map `phaser` at `static/phaser-plugins/phaser-global.js`,
which re-exports `globalThis.Phaser`. Never map those pages at a CDN ESM build
instead — that yields a _second_, unrelated Phaser (broken `instanceof` against
the running game, split PluginCache). `tools/build-level` stages the shim as
`www/phaser-global.js`.

Related: `cmg-repo-layout`, [2019-turbo testing](2019-turbo-testing.md)
