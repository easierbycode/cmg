// Generate static/PlayStation/manifest.json by scanning the ROM directory.
// Mirrors scripts/build-tg16-manifest.ts — Deno Deploy can serve files in
// static/ but can't Deno.readDir into the source tree at runtime, so the
// manifest is the authoritative ROM index.

interface PsxRom {
  file: string;
  name: string;
  url: string;
  size: string;
  date: string;
  icon?: string;
}

// .zip = a cue/bin game packed by scripts/import-openemu.ts — EmulatorJS
// unpacks it in the browser and auto-selects the cue/m3u sheet.
const PSX_EXT = /\.(pbp|chd|iso|cue|m3u|zip)$/i;

const dirUrl = new URL("../static/PlayStation/", import.meta.url);
const manifestPath = new URL("manifest.json", dirUrl);

// Strip trailing region / translation / version tags — "(USA)", "(Beta)",
// "[T-Eng]" — repeatedly, mirroring scripts/build-nes-manifest.ts.
function cleanName(file: string): string {
  let name = file.replace(PSX_EXT, "");
  let prev: string;
  do {
    prev = name;
    name = name.replace(/\s*[\[(][^\[\]()]*[\])]\s*$/, "").trim();
  } while (name !== prev);
  return name || file.replace(PSX_EXT, "");
}

// Cover art (fetched by a separate pipeline) lives in covers/ beside the
// ROMs — return the served URL when <basename>.png exists.
async function coverIcon(file: string): Promise<string | undefined> {
  const base = file.replace(PSX_EXT, "");
  try {
    await Deno.stat(new URL(`covers/${base}.png`, dirUrl));
    return `/PlayStation/covers/${encodeURIComponent(base)}.png`;
  } catch {
    return undefined;
  }
}

const games: PsxRom[] = [];
try {
  for await (const entry of Deno.readDir(dirUrl)) {
    if (!entry.isFile) continue;
    if (!PSX_EXT.test(entry.name)) continue;
    const stat = await Deno.stat(new URL(entry.name, dirUrl));
    const sizeMb = (stat.size / (1024 * 1024)).toFixed(1);
    const d = stat.mtime ?? new Date();
    const date = `${String(d.getMonth() + 1).padStart(2, "0")}.${
      String(d.getDate()).padStart(2, "0")
    }.${String(d.getFullYear()).slice(-2)}`;
    const icon = await coverIcon(entry.name);
    games.push({
      file: entry.name,
      name: cleanName(entry.name),
      url: `/PlayStation/${encodeURIComponent(entry.name)}`,
      size: `${sizeMb} MB`,
      date,
      ...(icon ? { icon } : {}),
    });
  }
} catch (e) {
  console.error(
    `[psx-manifest] could not read ${dirUrl.pathname}: ${(e as Error).message}`,
  );
}

games.sort((a, b) => a.name.localeCompare(b.name));

await Deno.writeTextFile(manifestPath, JSON.stringify(games, null, 2) + "\n");
console.log(
  `[psx-manifest] wrote ${games.length} ROM${
    games.length === 1 ? "" : "s"
  } to ${manifestPath.pathname}`,
);
