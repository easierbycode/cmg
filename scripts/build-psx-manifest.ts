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
}

const PSX_EXT = /\.(pbp|chd|iso|cue|m3u)$/i;

const dirUrl = new URL("../static/PlayStation/", import.meta.url);
const manifestPath = new URL("manifest.json", dirUrl);

const games: PsxRom[] = [];
try {
  for await (const entry of Deno.readDir(dirUrl)) {
    if (!entry.isFile) continue;
    if (!PSX_EXT.test(entry.name)) continue;
    const stat = await Deno.stat(new URL(entry.name, dirUrl));
    const sizeMb = (stat.size / (1024 * 1024)).toFixed(1);
    const d = stat.mtime ?? new Date();
    const date =
      `${String(d.getMonth() + 1).padStart(2, "0")}.${
        String(d.getDate()).padStart(2, "0")
      }.${String(d.getFullYear()).slice(-2)}`;
    const display = entry.name
      .replace(PSX_EXT, "")
      .replace(/\s*\((USA|U|US|NTSC|J|JP|E|EU|PAL)\)\s*$/i, "")
      .trim();
    games.push({
      file: entry.name,
      name: display,
      url: `/PlayStation/${encodeURIComponent(entry.name)}`,
      size: `${sizeMb} MB`,
      date,
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
  `[psx-manifest] wrote ${games.length} ROM${games.length === 1 ? "" : "s"} to ${manifestPath.pathname}`,
);
