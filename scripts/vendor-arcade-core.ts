// Vendor the Internet Archive Emularity MAME core used by static/arcade/play.html
// so Linux/AppImage builds can boot bundled arcade ROMs without network access.
//
// Output is intentionally gitignored:
//   static/arcade/emularity/engine/<rom>.json
//   static/arcade/emularity/engine/mamezn.js
//   static/arcade/emularity/engine/mamezn.wasm

const ROOT = new URL("../", import.meta.url);
const path = (rel: string) => new URL(rel, ROOT).pathname;

const SOURCE = (Deno.env.get("CMG_ARCADE_ENGINE_ORIGIN") ??
  "https://emularity-engine.ux-b.archive.org/").replace(/\/?$/, "/");
const OUT_DIR = path("static/arcade/emularity/engine");
const ARCADE_DIR = path("static/arcade");
const BIOS_ZIPS = new Set(["coh1002m", "coh3002c", "qsound_hle"]);
const FORCE = Deno.env.get("CMG_ARCADE_FORCE_VENDOR") === "1";

async function exists(p: string): Promise<boolean> {
  try {
    const stat = await Deno.stat(p);
    return stat.isFile && stat.size > 0;
  } catch {
    return false;
  }
}

async function fetchTo(url: string, destPath: string): Promise<void> {
  if (!FORCE && await exists(destPath)) {
    console.log(`  - ${destPath.replace(ROOT.pathname, "")} (cached)`);
    return;
  }
  const r = await fetch(url, { redirect: "follow" });
  if (!r.ok) throw new Error(`HTTP ${r.status} fetching ${url}`);
  await Deno.mkdir(destPath.slice(0, destPath.lastIndexOf("/")), {
    recursive: true,
  });
  await Deno.writeFile(destPath, new Uint8Array(await r.arrayBuffer()));
  console.log(`  + ${destPath.replace(ROOT.pathname, "")}`);
}

function localCoreName(remoteName: string): string {
  // IA serves mamezn.js.gz and mamezn.wasm.gz as already-uncompressed bytes.
  // Store them without .gz so the local static server gives browsers sane MIME.
  return remoteName.replace(/\.gz$/i, "");
}

const roms: string[] = [];
try {
  for await (const entry of Deno.readDir(ARCADE_DIR)) {
    if (!entry.isFile || !/\.zip$/i.test(entry.name)) continue;
    const rom = entry.name.replace(/\.zip$/i, "");
    if (!BIOS_ZIPS.has(rom)) roms.push(rom);
  }
} catch (e) {
  console.error(
    `[arcade-core] could not read ${ARCADE_DIR}: ${(e as Error).message}`,
  );
  Deno.exit(1);
}

roms.sort((a, b) => a.localeCompare(b));
if (roms.length === 0) {
  console.log("[arcade-core] no arcade ROMs found; nothing to vendor");
  Deno.exit(0);
}

await Deno.mkdir(OUT_DIR, { recursive: true });

const coreFiles = new Set<string>();
console.log(`[arcade-core] recipes from ${SOURCE}`);
for (const rom of roms) {
  const recipeUrl = `${SOURCE}${encodeURIComponent(rom)}.json`;
  const recipePath = `${OUT_DIR}/${rom}.json`;
  await fetchTo(recipeUrl, recipePath);
  const recipe = JSON.parse(await Deno.readTextFile(recipePath));
  coreFiles.add(recipe.wasmjs_filename || "mamezn.js.gz");
  coreFiles.add(recipe.wasm_filename || "mamezn.wasm.gz");
  if (recipe.file_locations && typeof recipe.file_locations === "object") {
    for (const value of Object.values(recipe.file_locations)) {
      if (typeof value === "string" && value) coreFiles.add(value);
    }
  }
}

console.log("[arcade-core] core files");
for (const file of Array.from(coreFiles).sort((a, b) => a.localeCompare(b))) {
  await fetchTo(
    `${SOURCE}${encodeURIComponent(file)}`,
    `${OUT_DIR}/${localCoreName(file)}`,
  );
}

console.log(
  `[arcade-core] done - ${roms.length} recipe(s), ${coreFiles.size} core file(s)`,
);
