// Headless one-shot icon capture — the CLI face of record/icon.ts.
//
//   deno run -A tools/game-recorder/icon-cli.ts --url http://localhost:5173/games/2028-ai --out icon.png
//   deno run -A tools/game-recorder/icon-cli.ts --game games/2028-ai --out icon.png
//
// Spawned as a subprocess by POST /api/icons/auto (the route only needs
// Deno.Command, so astral never enters the server bundle) and usable by
// hand. scripts/auto-icons.ts imports record/icon.ts directly instead.
// Prints one JSON line on success: { ok, out, width, height, source }.

import { parseArgs } from "@std/cli/parse-args";
import { captureIconPng, describeCaptureError } from "./record/icon.ts";
import { resolveScene } from "./record/scenes.ts";

const args = parseArgs(Deno.args, {
  string: [
    "game",
    "url",
    "out",
    "fps",
    "width",
    "height",
    "settle-ms",
    "advance-ms",
    "max-dim",
    "timeout-ms",
    "start-when",
    "chrome",
  ],
  boolean: ["help", "no-sandbox"],
});

// A typo'd number must not silently become NaN — that would skip the advance
// phase and disable the startWhen cap at once. (scripts/auto-icons.ts rejects
// bad numbers the same way.)
function num(name: string, value: string | undefined): number | undefined {
  if (value == null) return undefined;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) {
    console.error(`--${name} expects a number, got "${value}"`);
    Deno.exit(1);
  }
  return n;
}

if (args.help || (!args.game && !args.url) || !args.out) {
  console.log(
    `icon-cli — boot a game headless and write one gameplay frame as a PNG

Usage:
  deno run -A tools/game-recorder/icon-cli.ts (--game <id> | --url <page>) --out <file.png>

Options:
  --game <id>        catalog id from data/games.json or data/demos.json
  --url <page>       capture any page (overrides the game's URL)
  --out <file>       where to write the PNG (required)
  --advance-ms <n>   virtual time stepped past the splash (default 4000)
  --settle-ms <n>    real-time boot grace (default 3000, or the catalog's)
  --start-when <js>  predicate to skip splash screens (or the catalog's)
  --max-dim <n>      downscale the longest side (default 512; 0 = native)
  --timeout-ms <n>   overall budget before it gives up (default 90000)
  --width/--height   viewport (default 1280x960)
  --fps <n>          virtual clock rate (default 30)
  --chrome <path>    use an installed Chrome (skips astral's download)

Env: CMG_ORIGIN (default http://localhost:5173), CMG_EXTERNAL_BASE,
RECORD_CHROME.`,
  );
  Deno.exit(args.help ? 0 : 1);
}

let url = args.url;
let startWhen = args["start-when"];
let settleMs = num("settle-ms", args["settle-ms"]);
let width = num("width", args.width);
let height = num("height", args.height);

if (args.game) {
  const spec = await resolveScene({ game: args.game, url: args.url });
  url = spec.url;
  startWhen ??= spec.startWhen;
  settleMs ??= spec.settleMs;
  width ??= spec.width;
  height ??= spec.height;
}

try {
  const result = await captureIconPng({
    url: url!,
    width,
    height,
    fps: num("fps", args.fps),
    settleMs,
    startWhen,
    advanceMs: num("advance-ms", args["advance-ms"]),
    maxDim: args["max-dim"] != null ? num("max-dim", args["max-dim"]) : 512,
    timeoutMs: num("timeout-ms", args["timeout-ms"]),
    chromePath: args.chrome ?? Deno.env.get("RECORD_CHROME"),
    chromeArgs: args["no-sandbox"] ? ["--no-sandbox"] : [],
  });
  await Deno.writeFile(args.out, result.png);
  console.log(JSON.stringify({
    ok: true,
    out: args.out,
    width: result.width,
    height: result.height,
    source: result.source,
  }));
} catch (e) {
  console.error(`icon capture failed: ${describeCaptureError(e)}`);
  Deno.exit(1);
}
