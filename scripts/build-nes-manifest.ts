// Generate static/Nintendo/manifest.json by scanning the ROM directory.
// Mirrors scripts/build-tg16-manifest.ts — Deno Deploy can serve files in
// static/ but can't Deno.readDir into the source tree at runtime, so the
// manifest is the authoritative ROM index. (Users can still load their own
// cartridges at runtime via BYOC — see the NES screen in Dashboard.svelte.)
//
// Note: ROMs live in static/Nintendo/ (served at /Nintendo/…) while the
// EmulatorJS player is static/nes/play.html — two distinct names so they don't
// collide on case-insensitive filesystems (macOS), matching the PlayStation/psx
// and SegaSaturn/saturn split.

interface NesRom {
  file: string;
  name: string;
  url: string;
  size: string;
  date: string;
}

// .zip = a zipped cartridge (OpenEmu keeps most carts zipped) — EmulatorJS
// unpacks it in the browser and picks the rom inside.
const NES_EXT = /\.(nes|fds|unif|unf|zip)$/i;

const dirUrl = new URL("../static/Nintendo/", import.meta.url);
const manifestPath = new URL("manifest.json", dirUrl);

// Strip trailing region / translation / version tags — "(J)", "[T-Eng1.01]",
// "(USA)" — repeatedly, so "Mitsume ga Tooru (J) [T-Eng1.01]" → "Mitsume ga Tooru".
function cleanName(file: string): string {
  let name = file.replace(NES_EXT, "");
  let prev: string;
  do {
    prev = name;
    name = name.replace(/\s*[\[(][^\[\]()]*[\])]\s*$/, "").trim();
  } while (name !== prev);
  return name || file.replace(NES_EXT, "");
}

const games: NesRom[] = [];
try {
  for await (const entry of Deno.readDir(dirUrl)) {
    if (!entry.isFile) continue;
    if (!NES_EXT.test(entry.name)) continue;
    const stat = await Deno.stat(new URL(entry.name, dirUrl));
    const sizeMb = (stat.size / (1024 * 1024)).toFixed(1);
    const d = stat.mtime ?? new Date();
    const date = `${String(d.getMonth() + 1).padStart(2, "0")}.${
      String(d.getDate()).padStart(2, "0")
    }.${String(d.getFullYear()).slice(-2)}`;
    games.push({
      file: entry.name,
      name: cleanName(entry.name),
      url: `/Nintendo/${encodeURIComponent(entry.name)}`,
      size: `${sizeMb} MB`,
      date,
    });
  }
} catch (e) {
  console.error(
    `[nes-manifest] could not read ${dirUrl.pathname}: ${(e as Error).message}`,
  );
}

games.sort((a, b) => a.name.localeCompare(b.name));

await Deno.writeTextFile(manifestPath, JSON.stringify(games, null, 2) + "\n");
console.log(
  `[nes-manifest] wrote ${games.length} ROM${
    games.length === 1 ? "" : "s"
  } to ${manifestPath.pathname}`,
);
