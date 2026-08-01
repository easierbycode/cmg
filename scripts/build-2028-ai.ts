// Bundles the "2028.Ai" boot entry (scripts/2028-ai/boot-entry.js) — which
// pulls in the 2019-es7 Phaser scenes and the level-loader plugin — into a
// single self-contained IIFE at static/games/2028-ai/game.bundle.js.
//
// Phaser is provided as a browser global (lib/phaser.min.js), so it is not
// imported here; esbuild leaves the bare `Phaser` references alone.
//
// Run from the cmg repo root:  deno run -A scripts/build-2028-ai.ts
import * as esbuild from "esbuild";
import { fileURLToPath } from "node:url";

const entry = fileURLToPath(
  new URL("./2028-ai/boot-entry.js", import.meta.url),
);
const outfile = fileURLToPath(
  new URL("../static/games/2028-ai/game.bundle.js", import.meta.url),
);

const result = await esbuild.build({
  entryPoints: [entry],
  outfile,
  bundle: true,
  format: "iife",
  platform: "browser",
  target: ["es2019"],
  charset: "utf8",
  legalComments: "none",
  logLevel: "info",
});

await esbuild.stop();

if (result.errors.length > 0) {
  console.error("Build failed:", result.errors);
  Deno.exit(1);
}

const size = (await Deno.stat(outfile)).size;
console.log(`Built ${outfile} (${(size / 1024).toFixed(0)} KB)`);
