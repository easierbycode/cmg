// Generate static/TurboGrafx-16/manifest.json by scanning the ROM directory.
// Deno Deploy's runtime can serve files in static/ but cannot Deno.readDir into
// the source tree, so the manifest acts as the authoritative ROM index.

interface Tg16Rom {
  file: string;
  name: string;
  url: string;
  size: string;
  date: string;
}

const dirUrl = new URL("../static/TurboGrafx-16/", import.meta.url);
const manifestPath = new URL("manifest.json", dirUrl);

const games: Tg16Rom[] = [];
try {
  for await (const entry of Deno.readDir(dirUrl)) {
    if (!entry.isFile) continue;
    if (!/\.pce$/i.test(entry.name)) continue;
    const stat = await Deno.stat(new URL(entry.name, dirUrl));
    const sizeMb = (stat.size / (1024 * 1024)).toFixed(1);
    const d = stat.mtime ?? new Date();
    const date =
      `${String(d.getMonth() + 1).padStart(2, "0")}.${
        String(d.getDate()).padStart(2, "0")
      }.${String(d.getFullYear()).slice(-2)}`;
    const display = entry.name
      .replace(/\.pce$/i, "")
      .replace(/\s*\(USA\)\s*$/i, "")
      .trim();
    games.push({
      file: entry.name,
      name: display,
      url: `/TurboGrafx-16/${encodeURIComponent(entry.name)}`,
      size: `${sizeMb} MB`,
      date,
    });
  }
} catch (e) {
  console.error(
    `[tg16-manifest] could not read ${dirUrl.pathname}: ${(e as Error).message}`,
  );
}

games.sort((a, b) => a.name.localeCompare(b.name));

await Deno.writeTextFile(manifestPath, JSON.stringify(games, null, 2) + "\n");
console.log(
  `[tg16-manifest] wrote ${games.length} ROM${games.length === 1 ? "" : "s"} to ${manifestPath.pathname}`,
);
