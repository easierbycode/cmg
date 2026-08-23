// Bundles the "2028.Ai" boot entry (scripts/2028-ai/boot-entry.js) — which
// pulls in the 2019-es7 Phaser scenes and the level-loader plugin — into a
// single self-contained IIFE at static/games/2028-ai/game.bundle.js.
//
// Phaser is provided as a browser global (lib/phaser.min.js), so it is not
// imported here; esbuild leaves the bare `Phaser` references alone.
//
// The Phaser scenes come from the sibling 2019-es7 checkout, which
// boot-entry.js reaches with plain relative imports (../../../2019-es7/…).
// That is the right default — it keeps the entry valid on its own, and a
// fresh clone laid out beside its sibling just works — but a machine can hold
// several checkouts of that repo sitting on different branches, and picking
// the wrong one silently bundles the wrong runtime. Point the build at a
// specific checkout the same way dezaemon:vendor does:
//
//   deno run -A scripts/build-2028-ai.ts
//   CMG_ES7_ROOT=/path/to/2019-es7 deno run -A scripts/build-2028-ai.ts
//
// Run from the cmg repo root.
import * as esbuild from "esbuild";
import { fileURLToPath } from "node:url";
import { isAbsolute, join, relative, resolve } from "jsr:@std/path@^1.1.2";

const entry = fileURLToPath(
  new URL("./2028-ai/boot-entry.js", import.meta.url),
);
const outfile = fileURLToPath(
  new URL("../static/games/2028-ai/game.bundle.js", import.meta.url),
);

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const DEFAULT_ES7 = resolve(ROOT, "..", "2019-es7");
const ES7_ROOT = resolve(Deno.env.get("CMG_ES7_ROOT") ?? DEFAULT_ES7);

// A checkout without the scenes would otherwise fail as a wall of unresolved
// imports naming a path the caller never typed.
if (!await exists(join(ES7_ROOT, "src", "phaser", "GameScene.js"))) {
  console.error(
    `2019-es7 Phaser scenes not found under ${ES7_ROOT}\n` +
      `Clone easierbycode/2019-es7 next to this repo, or set CMG_ES7_ROOT.`,
  );
  Deno.exit(1);
}

// Redirect imports that land inside the default sibling checkout to the chosen
// one. Modules within that checkout import each other relatively, so they
// follow along on their own and never match this hook a second time.
const es7Root: esbuild.Plugin = {
  name: "es7-root",
  setup(build) {
    if (ES7_ROOT === DEFAULT_ES7) return;
    build.onResolve({ filter: /^\.{1,2}\// }, (args) => {
      const rel = relative(DEFAULT_ES7, resolve(args.resolveDir, args.path));
      if (!rel || rel.startsWith("..") || isAbsolute(rel)) return null;
      return { path: join(ES7_ROOT, rel) };
    });
  },
};

console.log(`Bundling 2019-es7 scenes from ${ES7_ROOT}`);

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
  plugins: [es7Root],
});

await esbuild.stop();

if (result.errors.length > 0) {
  console.error("Build failed:", result.errors);
  Deno.exit(1);
}

const size = (await Deno.stat(outfile)).size;
console.log(`Built ${outfile} (${(size / 1024).toFixed(0)} KB)`);

async function exists(path: string) {
  try {
    await Deno.stat(path);
    return true;
  } catch {
    return false;
  }
}
