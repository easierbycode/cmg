// CLI: deno task record:slides --tutorial examples/hello-css.json
//
// Turns a Tutorial JSON (see types.ts — same shape as pablo.gg's GPT-
// generated reels scripts) into a recorded 9:16 typing video: render the
// self-contained HTML, serve it on a throwaway local port, point the
// generic scene recorder at it, transcode to the social cut.

import { parseArgs } from "@std/cli/parse-args";
import { ensureDir } from "@std/fs";
import { join } from "@std/path";
import { recordDeterministic } from "../record/deterministic.ts";
import { encodeFramesToReel } from "../transcode/frames.ts";
import { estimateDurationMs, renderTutorialHtml } from "./render.ts";
import { validateTutorial } from "./types.ts";

const args = parseArgs(Deno.args, {
  string: ["tutorial", "out-dir", "name", "chrome"],
  boolean: ["help", "keep-raw"],
  default: { "out-dir": "out" },
});

if (args.help || !args.tutorial) {
  console.log(
    `slides — render a coding-tutorial typing video from a Tutorial JSON

Usage: deno task record:slides --tutorial <file.json> [--name <basename>] [--out-dir out]

Tutorial JSON: { "description": "...", "commands": "code to type",
                 "files": [{ "name": "index.html", "content": "" }] }
(or timed "steps" — see tools/slides/types.ts; that's the input shape the
 planned VS Code / Codespaces plugin will emit)`,
  );
  Deno.exit(args.help ? 0 : 1);
}

const tutorial = validateTutorial(
  JSON.parse(await Deno.readTextFile(args.tutorial)),
);
const name = args.name ?? "tutorial";
await ensureDir(args["out-dir"]);

const html = renderTutorialHtml(tutorial);
const server = Deno.serve(
  { port: 0, onListen: () => {} },
  () =>
    new Response(html, {
      headers: { "content-type": "text/html; charset=utf-8" },
    }),
);

try {
  const estMs = estimateDurationMs(tutorial);
  console.log(
    `recording "${tutorial.description}" (~${Math.round(estMs / 1000)}s)...`,
  );
  // Typing is driven by rAF and setTimeout in the rendered page, so the
  // deterministic clock steps it exactly — the resulting video is identical
  // on a fast laptop and a loaded CI runner.
  const fps = 30;
  const det = await recordDeterministic(
    {
      name,
      // Rendered natively at 9:16 — encoding is then a near-passthrough.
      url: `http://localhost:${server.addr.port}/`,
      width: 1080,
      height: 1920,
      startWhen: "!!window.__slidesState",
      stopWhen: 'window.__slidesState === "done"',
      tailMs: 700,
      maxMs: estMs * 1.5 + 15_000,
    },
    {
      outDir: args["out-dir"],
      fps,
      chromePath: args.chrome ?? Deno.env.get("RECORD_CHROME"),
    },
  );
  console.log(
    `  ${det.frameCount} frames @ ${fps}fps (${
      (det.frameCount / fps).toFixed(1)
    }s)`,
  );

  const reel = join(args["out-dir"], `${name}.reel.mp4`);
  await encodeFramesToReel({
    framesDir: det.framesDir,
    fps,
    width: det.width,
    height: det.height,
    output: reel,
    fill: "pad",
    // Slides are text, not sprite art — a neighbor upscale would alias it.
    pixelArt: false,
  });
  console.log(`  ${reel}`);
  if (!args["keep-raw"]) await Deno.remove(det.framesDir, { recursive: true });
} finally {
  await server.shutdown();
}
