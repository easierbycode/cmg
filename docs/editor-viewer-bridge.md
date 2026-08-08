# Editor/viewer bridge

Cross-page sync conventions in cmg (as of July 2026):

- **Launcher theme sync**: launcher (Dashboard.svelte) persists tweaks under localStorage `cmg-tweaks` and mirrors `cmg-theme` ('xbox'|'xbox360'|'nintendo') and `cmg-scanlines` ('1'/'0') as standalone keys. Editor and boss viewer read `cmg-theme` || `__editorTheme__` (legacy) || `cmg-tweaks.theme`, treat non-'nintendo' as 'xbox', and on change write both keys + postMessage `{type:'cmg-theme', theme}` to `window.parent`. Flash text convention: "THEME: NINTENDO RED · LAUNCHER SYNCED".
- **Editor→viewer data bridge**: sessionStorage `editorBossData` (bossData JSON) and `editorAtlasFrames` (atlas JSON), plus IndexedDB db `editorViewerBridge`, store `assets`, key `atlasImage` (PNG blob) — written by `storeBossDataForViewers()` in static/editor/index.html.
- **attackPattern**: `bossData[bossN].attackPattern = 'bossM'` makes the game engine (game.bundle.js) run boss M's pattern; both the editor's pattern modal and boss-viewer v2's BP sheet edit this field.
- Boss viewer v2 (static/editor/boss-viewer.html, from a Claude Design handoff) is pure DOM/CSS atlas-cropping — no Phaser dependency anymore (v1 used Phaser).
