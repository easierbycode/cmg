// CMG game recorder — capture any game in the CMG catalog and publish it.
//
//   deno task record --list
//   deno task record --game games/2028-ai
//   deno task record --game games/2028-ai --post instagram,tiktok --caption "..."
//
// Recording is deterministic by default: a virtual clock is injected before
// any page script runs, so the game is stepped one exact 1/fps tick at a
// time and each finished frame is read off the canvas at native resolution.
// A slow machine (or a busy CI runner) can't drop frames, and the same game
// always produces the same file. `--mode screencast` falls back to
// wall-clock CDP capture for games animated by timers rather than rAF.

import { parseArgs } from "@std/cli/parse-args";
import { ensureDir } from "@std/fs";
import { join } from "@std/path";
import { binAvailable, ffmpegBin } from "./lib/proc.ts";
import { recordDeterministic } from "./record/deterministic.ts";
import { recordScene } from "./record/recorder.ts";
import { listGames, resolveScene } from "./record/scenes.ts";
import { encodeFramesToReel } from "./transcode/frames.ts";
import { extractCover, toReel } from "./transcode/transcode.ts";

const args = parseArgs(Deno.args, {
  string: [
    "game",
    "url",
    "name",
    "out-dir",
    "mode",
    "fps",
    "fill",
    "background",
    "width",
    "height",
    "duration",
    "chrome",
    "post",
    "caption",
    "privacy",
  ],
  boolean: [
    "help",
    "list",
    "keep-frames",
    "no-sandbox",
    "no-pixel-art",
    "dry-run",
  ],
  default: { "out-dir": "out/recordings", mode: "deterministic" },
});

if (args.list) {
  for (const g of await listGames()) {
    console.log(`${g.id.padEnd(48)} ${g.name}`);
  }
  Deno.exit(0);
}

if (args.help || (!args.game && !args.url)) {
  console.log(
    `game-recorder — record a CMG game and post it to Instagram / TikTok

Usage:
  deno task record --list
  deno task record --game <id> [options]
  deno task record --url <page> [--duration <sec>] [options]

Options:
  --game <id>        catalog id from data/games.json or data/demos.json
  --url <page>       record any page instead (or override a game's URL)
  --name <base>      output file base name (default: derived from the id)
  --mode <m>         deterministic (default) | screencast
  --fps <n>          deterministic frame rate (default 30)
  --duration <sec>   capture length when the game has no stop predicate
  --width/--height   viewport (default 1280x960)
  --fill pad|blur    9:16 canvas fill (default pad, game-background color)
  --background <c>   pad color (default 0x05060f)
  --no-pixel-art     skip the nearest-neighbor upscale stage
  --post <list>      instagram,tiktok — publish after recording
  --caption <text>   post caption
  --privacy <level>  TikTok visibility (default SELF_ONLY)
  --dry-run          validate posting without publishing
  --keep-frames      keep the frame dump beside the video
  --chrome <path>    use an installed Chrome (skips astral's download)
  --out-dir <dir>    default out/recordings

Per-game capture behaviour is optional and lives on the catalog entry:
  "recorder": { "startWhen": "!!window.__ready", "stopWhen": "…",
                "tailMs": 4000, "width": 1280, "height": 960,
                "query": "?attract=1" }

Env: CMG_ORIGIN (where in-repo /games/* routes are served, default
http://localhost:5173), CMG_EXTERNAL_BASE, RECORD_CHROME, FFMPEG/FFPROBE,
IG_ACCESS_TOKEN + IG_USER_ID, TIKTOK_ACCESS_TOKEN.`,
  );
  Deno.exit(args.help ? 0 : 1);
}

if (!(await binAvailable(ffmpegBin()))) {
  console.error(
    `${ffmpegBin()} not found — install ffmpeg, or point FFMPEG at a binary ` +
      `(Windows ARM64: a tordona/BtbN arm64 build, or the x64 one under Prism)`,
  );
  Deno.exit(1);
}

const spec = await resolveScene({
  game: args.game,
  url: args.url,
  name: args.name,
  width: args.width ? Number(args.width) : undefined,
  height: args.height ? Number(args.height) : undefined,
  durationMs: args.duration ? Number(args.duration) * 1000 : undefined,
});

await ensureDir(args["out-dir"]);
const chromePath = args.chrome ?? Deno.env.get("RECORD_CHROME");
const chromeArgs = args["no-sandbox"] ? ["--no-sandbox"] : [];
const reel = join(args["out-dir"], `${spec.name}.reel.mp4`);

console.log(`recording "${spec.name}" (${args.mode}) from ${spec.url}`);

if (args.mode === "deterministic") {
  const fps = args.fps ? Number(args.fps) : 30;
  const det = await recordDeterministic(spec, {
    outDir: args["out-dir"],
    fps,
    chromePath,
    chromeArgs,
  });
  const durationS = det.frameCount / fps;
  console.log(
    `  ${det.frameCount} frames @ ${fps}fps (${
      durationS.toFixed(2)
    }s), canvas ${det.width}x${det.height}`,
  );
  await encodeFramesToReel({
    framesDir: det.framesDir,
    fps,
    width: det.width,
    height: det.height,
    output: reel,
    fill: (args.fill as "pad" | "blur" | undefined) ?? "pad",
    background: args.background,
    pixelArt: !args["no-pixel-art"],
  });
  await extractCover(
    reel,
    reel.replace(/\.mp4$/, ".cover.jpg"),
    durationS * 0.35,
  );
  if (!args["keep-frames"]) {
    await Deno.remove(det.framesDir, { recursive: true });
  }
} else {
  const raw = await recordScene(spec, {
    outDir: args["out-dir"],
    keepFrames: args["keep-frames"],
    chromePath,
    chromeArgs,
  });
  console.log(
    `  ${raw.frameCount} frames, ${
      raw.durationS.toFixed(2)
    }s, ~${raw.avgFps}fps`,
  );
  await toReel({
    input: raw.rawVideo,
    output: reel,
    fill: (args.fill as "pad" | "blur" | undefined) ?? "blur",
  });
  await extractCover(
    reel,
    reel.replace(/\.mp4$/, ".cover.jpg"),
    raw.durationS * 0.35,
  );
}

console.log(`  ${reel}`);

// Posting shells out so credentials stay in one place and the CLI behaves
// identically whether it's invoked here or by hand.
for (
  const platform of (args.post ?? "").split(",").map((p) => p.trim()).filter(
    Boolean,
  )
) {
  console.log(`\n━━ post:${platform} ━━`);
  const { code } = await new Deno.Command(Deno.execPath(), {
    args: [
      "run",
      "-A",
      new URL("./post.ts", import.meta.url).href,
      "--platform",
      platform,
      "--video",
      reel,
      ...(args.caption ? ["--caption", args.caption] : []),
      ...(args.privacy ? ["--privacy", args.privacy] : []),
      ...(args["dry-run"] ? ["--dry-run"] : []),
    ],
    stdout: "inherit",
    stderr: "inherit",
  }).output();
  if (code !== 0) Deno.exit(code);
}
