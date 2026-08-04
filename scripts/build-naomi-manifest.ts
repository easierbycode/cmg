// Generate static/Naomi/manifest.json by scanning the ROM directory.
//
// Mirrors scripts/build-ps2-manifest.ts — Deno Deploy can serve files in
// static/ but can't Deno.readDir into the source tree at runtime, so the
// manifest is the authoritative ROM index. It runs as part of `deno task
// build`, which every packaging task starts with, so an image dropped into
// static/Naomi/ is listed by the dashboard in the desktop builds
// (`deno task desktop:*`) and the compiled launchers (`deno task build:mac`
// and friends) — both embed static/ wholesale. Images stay out of git (see
// .gitignore), same policy as the PSX/Saturn/NES libraries, so the public
// deploy ships BYOD-only.

interface NaomiRom {
  file: string;
  name: string;
  url: string;
  size: string;
  date: string;
  /** "naomi" = arcade ROM set, "dc" = Dreamcast disc image. */
  kind: "naomi" | "dc";
}

// Formats flycast accepts (config/core.json in the flycast-wasm release).
const NAOMI_EXT = /\.(zip|7z|dat|lst|bin|chd|gdi|cdi|cue|iso|elf)$/i;
// Disc images are Dreamcast; the rest are NAOMI/Atomiswave arcade ROM sets.
const DISC_EXT = /\.(chd|gdi|cdi|cue|iso)$/i;
// BIOS dumps, not games. static/naomi/play.html loads these into the emulated
// system directory; listing them as bootable rows would only confuse.
const BIOS_FILES = new Set([
  "naomi.zip",
  "awbios.zip",
  "dc_boot.bin",
  "dc_flash.bin",
]);

const dirUrl = new URL("../static/Naomi/", import.meta.url);
const manifestPath = new URL("manifest.json", dirUrl);

const games: NaomiRom[] = [];
try {
  for await (const entry of Deno.readDir(dirUrl)) {
    if (!entry.isFile) continue;
    if (!NAOMI_EXT.test(entry.name)) continue;
    if (BIOS_FILES.has(entry.name.toLowerCase())) continue;
    const stat = await Deno.stat(new URL(entry.name, dirUrl));
    const sizeMb = (stat.size / (1024 * 1024)).toFixed(1);
    const d = stat.mtime ?? new Date();
    const date = `${String(d.getMonth() + 1).padStart(2, "0")}.${
      String(d.getDate()).padStart(2, "0")
    }.${String(d.getFullYear()).slice(-2)}`;
    const display = entry.name
      .replace(NAOMI_EXT, "")
      .replace(/\s*\((USA|U|US|NTSC|J|JP|E|EU|PAL|World|W)\)\s*$/i, "")
      .trim();
    games.push({
      file: entry.name,
      name: display,
      url: `/Naomi/${encodeURIComponent(entry.name)}`,
      size: `${sizeMb} MB`,
      date,
      kind: DISC_EXT.test(entry.name) ? "dc" : "naomi",
    });
  }
} catch (e) {
  console.error(
    `[naomi-manifest] could not read ${dirUrl.pathname}: ${
      (e as Error).message
    }`,
  );
}

games.sort((a, b) => a.name.localeCompare(b.name));

await Deno.writeTextFile(manifestPath, JSON.stringify(games, null, 2) + "\n");
console.log(
  `[naomi-manifest] wrote ${games.length} ROM${
    games.length === 1 ? "" : "s"
  } to ${manifestPath.pathname}`,
);
