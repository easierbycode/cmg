# 2019-turbo testing

`C:\CODE\2019-turbo` is a no-build ES-module Phaser 4.1 game (see its AGENTS.md). Serve it via the cmg launch config `2019-turbo` (added to `C:\CODE\cmg\.claude\launch.json`; runs `.claude/serve_nocache.py` on port 8125 with the repo path as arg). The cmg dev server is the `dev` config (deno task dev, port 5173) and serves `/editor/` + `/games/2028-ai`.

**Why:** In this environment the Browser pane is often hidden (`document.hidden === true`), so Phaser's RAF loop never ticks and screenshots time out.

**How to apply:** Drive games headlessly via `javascript_tool`: install a pump `setInterval(() => game.loop.step(performance.now()), 16)` (game handle: `window.__game` in 2019-turbo, `globalThis.__PHASER_4_GAME__` in 2028-ai), then call scene methods directly (`scene.getScene('PreloadScene').choose(false)`, `title.titleStart()`) and assert on `game.scene.scenes.filter(s => s.scene.isActive())`, `scene.children.list`, and DOM state instead of screenshots.

**Caveat on the pump (verified 2026-07-23, Phaser 4.2.1):** `game.loop.step()` advances `scene.time.now` but does *not* reliably drain the scene Clock's queued events — `this.time.delayedCall(...)` callbacks never fired even after stepping past their delay. To test timer-driven logic, drive the Clock directly instead: `scene.time.preUpdate(t, dt); scene.time.update(t, dt);` in a loop with modest deltas (e.g. 100ms slices). That fires `delayedCall` exactly on schedule.

The cmg e2e test `tests/e2e/level_editor_firebase_test.ts` fails in this sandbox at astral's Chrome launch (environment, not code).

Related: [Scene-script architecture](scene-script-architecture.md), [SpacetimeDB JSON reducer args](spacetimedb-json-reducer-args.md)
