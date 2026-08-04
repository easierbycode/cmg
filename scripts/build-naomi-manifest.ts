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

// .gdi/.cue/.lst are text indexes: the data sits in the track/chip files they
// name. Those companions are loaded by static/naomi/play.html alongside the
// descriptor, so they must not show up as bootable rows of their own.
const DESCRIPTOR_EXT = /\.(gdi|cue|lst)$/i;

function refsInDescriptor(name: string, text: string): string[] {
  const out: string[] = [];
  if (/\.cue$/i.test(name)) {
    for (const m of text.matchAll(/^\s*FILE\s+(?:"([^"]+)"|(\S+))/gim)) {
      out.push(m[1] ?? m[2]);
    }
  } else if (/\.gdi$/i.test(name)) {
    for (const line of text.split(/\r?\n/)) {
      const m = line.match(/^\s*\d+\s+\d+\s+\d+\s+\d+\s+(?:"([^"]+)"|(\S+))/);
      if (m) out.push(m[1] ?? m[2]);
    }
  } else {
    // flycast's NAOMI .lst: quoted chip file names, one per ROM entry.
    for (const m of text.matchAll(/"([^"]+)"/g)) out.push(m[1]);
  }
  // Keep the reference as written (bar Windows separators): a descriptor that
  // names `tracks/track01.bin` is talking about a file in a subdirectory, not
  // about a `track01.bin` sitting at the top of the library, and shouldn't
  // fold that unrelated image into itself. static/naomi/play.html resolves
  // these the same way.
  return out.map((r) =>
    r.replace(/\\/g, "/").replace(/^\.?\//, "")
      .toLowerCase()
  );
}

const dirUrl = new URL("../static/Naomi/", import.meta.url);
const manifestPath = new URL("manifest.json", dirUrl);

// Pass one: every file present, and the companions the descriptors claim.
const present: string[] = [];
const companions = new Set<string>();
try {
  for await (const entry of Deno.readDir(dirUrl)) {
    if (!entry.isFile) continue;
    present.push(entry.name);
    if (!DESCRIPTOR_EXT.test(entry.name)) continue;
    try {
      const text = await Deno.readTextFile(new URL(entry.name, dirUrl));
      for (const ref of refsInDescriptor(entry.name, text)) companions.add(ref);
    } catch (e) {
      console.error(
        `[naomi-manifest] could not read ${entry.name}: ${
          (e as Error).message
        }`,
      );
    }
  }
} catch (e) {
  console.error(
    `[naomi-manifest] could not read ${dirUrl.pathname}: ${
      (e as Error).message
    }`,
  );
}

// Pass two: the bootable rows — every image that isn't a BIOS dump and isn't
// a track/chip belonging to one of the descriptors above.
const games: NaomiRom[] = [];
let hidden = 0;
for (const name of present) {
  if (!NAOMI_EXT.test(name)) continue;
  if (BIOS_FILES.has(name.toLowerCase())) continue;
  if (companions.has(name.toLowerCase())) {
    hidden++;
    continue;
  }
  try {
    const stat = await Deno.stat(new URL(name, dirUrl));
    const sizeMb = (stat.size / (1024 * 1024)).toFixed(1);
    const d = stat.mtime ?? new Date();
    const date = `${String(d.getMonth() + 1).padStart(2, "0")}.${
      String(d.getDate()).padStart(2, "0")
    }.${String(d.getFullYear()).slice(-2)}`;
    const display = name
      .replace(NAOMI_EXT, "")
      .replace(/\s*\((USA|U|US|NTSC|J|JP|E|EU|PAL|World|W)\)\s*$/i, "")
      .trim();
    games.push({
      file: name,
      name: display,
      url: `/Naomi/${encodeURIComponent(name)}`,
      size: `${sizeMb} MB`,
      date,
      kind: DISC_EXT.test(name) ? "dc" : "naomi",
    });
  } catch (e) {
    console.error(
      `[naomi-manifest] skipping ${name}: ${(e as Error).message}`,
    );
  }
}

games.sort((a, b) => a.name.localeCompare(b.name));

await Deno.writeTextFile(manifestPath, JSON.stringify(games, null, 2) + "\n");
console.log(
  `[naomi-manifest] wrote ${games.length} ROM${games.length === 1 ? "" : "s"}${
    hidden ? ` (${hidden} companion track file(s) folded in)` : ""
  } to ${manifestPath.pathname}`,
);
