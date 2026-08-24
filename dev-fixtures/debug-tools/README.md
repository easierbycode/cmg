# debug-tools

Reverse-engineering and comparison tools for Dezaemon 2 (Sega Saturn) save
imports. The saves themselves are copyrighted community content and stay local
(`.gitignore` keeps all of `dev-fixtures/` except this directory) — these
scripts are original and are tracked.

Everything here reads the decoder and runtime out of the **2019-es7 sibling
checkout**. Override the location with `CMG_ES7_ROOT`; note that a machine
holding several checkouts on different branches is the normal case, and picking
the wrong one is the classic silent failure — `serve-runtime.ts` deliberately
prefers the same checkout `scripts/build-2028-ai.ts` bundles from.

## Inspecting a save

| Tool                           | Answers                                                                                                                                                                                                                                   |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dump-behavior.mjs <save.sav>` | What does each enemy record _do_? Fire config, speed, movement mode, change channels, and the scroll rows it is placed on. `--summary` adds fire-mode distribution and the ground turrets; `--enemy N` lists exact row/column placements. |
| `contact-sheet.mjs <save.sav>` | Which record is that creature? A labeled sprite grid in first-spawn order. `--frames` draws whole animations.                                                                                                                             |
| `dump-sprites.mjs <save.sav>`  | Boss core/part art, and any slice of the zako record bank, as individual PNGs.                                                                                                                                                            |
| `dump-bg.mjs <save.sav>`       | The stage background tilemap, including a crop of the boss chamber.                                                                                                                                                                       |

Read them together: `contact-sheet.mjs` tells you record 22 is the winged
statue, `dump-behavior.mjs` tells you record 22 is ground, max-LIFE, and carries
an untraced special fire pattern.

## Comparing against hardware

```sh
# 1. stills from a capture, at the rate you need
dev-fixtures/debug-tools/extract-frames.sh ramsie.mov ./frames 4

# 2. serve the editor and the runtime SOURCE from one origin
deno run -A dev-fixtures/debug-tools/serve-runtime.ts "dev-fixtures/Dez 2 - Ramsie.sav"
```

Import the save at `/editor/?game=2028-ai` (the URL-import field reaches the
served copy at `/__sav__/save.sav`), press PLAY, and the runtime at
`/es7/phaser-game.html?editorPlay=1&stage=0&god=1` runs from unbundled
`src/phaser/*.js` — edit a scene module, reload, see the change.

Then paste `deterministic-step.js` into the devtools console to drive the game
frame by frame instead of trusting whatever `requestAnimationFrame` delivered:

```js
await dezaStep.attach(); // freezes real time, and PROVES the freeze
dezaStep.toSecond(31); // jump to the same moment as frame 31 of the capture
dezaStep.census(); // scroll, live records, bullets on screen
dezaStep.glueError("W", 600); // 0 = record is pinned to the map, as scenery should be
dezaStep.resume();
```

`attach()` throws rather than returning an unverified result if real time is not
actually frozen — interleaved wall-clock frames make every measurement drift,
and the numbers still look plausible.

## Gotcha worth knowing

A browser keeps one ES module graph per URL, so after editing a scene module a
plain reload re-runs the **stale** module and the change appears to do nothing.
`serve-runtime.ts` sends `cache-control: no-store` for `/es7/` to prevent it;
confirm in the page before trusting a result:

```js
String((await import("/es7/src/phaser/dezaemon-runtime.js")).initEnemyBehavior)
  .includes("MIN_ZAKO_RELOAD_FRAMES");
```
