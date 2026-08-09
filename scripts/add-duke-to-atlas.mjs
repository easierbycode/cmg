// Append the default player's baked frames to the shipped game_asset atlas.
//
// Duke is the game's player (assets/game.json playerData), so his frames have
// to live in the atlas the runtime loads, exactly like player00.gif did —
// otherwise every level that does not pin its own playerData and carry its own
// art draws an invisible ship. The pixels come from the Dezaemon importer's
// baked module (static/editor/dezaemon/lib/player-art.js), so this stays in
// step with what a .sav import ships; tests/game_recipe_atlas_test.ts is what
// notices if they drift apart.
//
//   node scripts/add-duke-to-atlas.mjs
//
// Idempotent: a frame already in the atlas at the right size is left alone, so
// re-run it after a repack drops them and only what is missing comes back.
//
// It also updates the sibling 2019-es7 checkout's copy of the same atlas, since
// the two are kept byte-identical. Point elsewhere with CMG_ES7_ROOT, or set it
// to "" to skip that copy.

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(here, "..");
const ES7 = process.env.CMG_ES7_ROOT ?? path.join(ROOT, "..", "2019-es7");

const require = createRequire(import.meta.url);
// pngjs is a devDependency of the importer in the sibling checkout; this script
// is the only thing in cmg that needs it, so it is not worth a package.json here.
function loadPngLib() {
  const candidates = [
    "pngjs",
    ES7 && path.join(ES7, "tools", "dezaemon-import", "node_modules", "pngjs"),
  ].filter(Boolean);
  for (const c of candidates) {
    try {
      return require(c).PNG;
    } catch { /* try the next one */ }
  }
  throw new Error(
    "pngjs not found — run `npm install` in <2019-es7>/tools/dezaemon-import, " +
      "or set CMG_ES7_ROOT to that checkout.",
  );
}
const PNG = loadPngLib();

const TARGETS = [
  {
    png: path.join(ROOT, "static/games/2028-ai/assets/img/game_asset.png"),
    json: path.join(ROOT, "static/games/2028-ai/assets/game_asset.json"),
  },
  ES7 && {
    png: path.join(ES7, "assets/img/game_asset.png"),
    json: path.join(ES7, "assets/game_asset.json"),
  },
].filter(Boolean);

const PAD = 4;

const artModule = await import(
  pathToFileURL(path.join(ROOT, "static/editor/dezaemon/lib/player-art.js"))
    .href
);
const art = artModule.decodePlayerArt();

for (const target of TARGETS) {
  if (!fs.existsSync(target.png) || !fs.existsSync(target.json)) {
    console.log(`skipped (not present): ${target.png}`);
    continue;
  }
  const json = JSON.parse(fs.readFileSync(target.json, "utf8"));
  const frames = json.frames;
  const missing = art.filter((f) => {
    const cur = frames[f.key] && frames[f.key].frame;
    return !(cur && cur.w === f.w && cur.h === f.h);
  });
  if (!missing.length) {
    console.log(`${target.png}: already has all ${art.length} player frames`);
    continue;
  }

  const src = PNG.sync.read(fs.readFileSync(target.png));
  let usedY = 0;
  for (const k of Object.keys(frames)) {
    const f = frames[k].frame;
    usedY = Math.max(usedY, f.y + f.h);
  }

  // Shelf-pack the new frames into rows below everything already there,
  // tallest first so a row's height is settled once.
  const sorted = missing.slice().sort((a, b) => b.h - a.h);
  const placed = [];
  let x = PAD;
  let y = usedY + PAD;
  let rowH = 0;
  for (const f of sorted) {
    if (x + f.w + PAD > src.width) {
      y += rowH + PAD;
      x = PAD;
      rowH = 0;
    }
    placed.push({ ...f, x, y });
    x += f.w + PAD;
    rowH = Math.max(rowH, f.h);
  }
  const height = y + rowH + PAD;

  const out = new PNG({ width: src.width, height });
  out.data.fill(0);
  src.data.copy(out.data, 0, 0, src.data.length);
  for (const f of placed) {
    for (let row = 0; row < f.h; row++) {
      for (let col = 0; col < f.w; col++) {
        const s = (row * f.w + col) * 4;
        const d = ((f.y + row) * out.width + (f.x + col)) * 4;
        out.data[d] = f.rgba[s];
        out.data[d + 1] = f.rgba[s + 1];
        out.data[d + 2] = f.rgba[s + 2];
        out.data[d + 3] = f.rgba[s + 3];
      }
    }
    frames[f.key] = {
      frame: { x: f.x, y: f.y, w: f.w, h: f.h },
      rotated: false,
      trimmed: false,
      spriteSourceSize: { x: 0, y: 0, w: f.w, h: f.h },
      sourceSize: { w: f.w, h: f.h },
    };
  }

  if (json.meta && json.meta.size) json.meta.size = { w: src.width, h: height };
  // TexturePacker's SmartUpdate hash describes the sheet it produced; this
  // sheet is no longer that one, so drop it rather than leave it lying.
  if (json.meta) delete json.meta.smartupdate;

  fs.writeFileSync(target.png, PNG.sync.write(out));
  fs.writeFileSync(target.json, JSON.stringify(json, null, "\t") + "\n");
  console.log(
    `${target.png}: +${placed.length} frames, ` +
      `${src.width}x${src.height} -> ${src.width}x${height}`,
  );
}
