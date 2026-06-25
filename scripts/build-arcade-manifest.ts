// Generate static/arcade/manifest.json by scanning local arcade ROM zips.
// The player lives at /arcade/play.html; this manifest is the dashboard's
// authoritative arcade game list, matching the other bundled-system manifests.

interface ArcadeRom {
  file: string;
  rom: string;
  name: string;
  url: string;
  size: string;
  date: string;
  bios: string[];
}

const GAME_ZIP = /\.zip$/i;
const BIOS_ZIPS = new Set([
  "coh1002m",
  "coh3002c",
  "qsound_hle",
]);
const BIOS_BY_ROM: Record<string, string[]> = {
  sfex2: ["coh3002c", "qsound_hle"],
};

const dirUrl = new URL("../static/arcade/", import.meta.url);
const manifestPath = new URL("manifest.json", dirUrl);

function cleanName(file: string): string {
  let name = file.replace(GAME_ZIP, "");
  let prev: string;
  do {
    prev = name;
    name = name.replace(/\s*[\[(][^\[\]()]*[\])]\s*$/, "").trim();
  } while (name !== prev);
  return name || file.replace(GAME_ZIP, "");
}

function prettyName(rom: string, file: string): string {
  if (rom === "sfex2") return "Street Fighter EX2";
  return cleanName(file)
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const games: ArcadeRom[] = [];
try {
  for await (const entry of Deno.readDir(dirUrl)) {
    if (!entry.isFile) continue;
    if (!GAME_ZIP.test(entry.name)) continue;
    const rom = entry.name.replace(GAME_ZIP, "");
    if (BIOS_ZIPS.has(rom)) continue;

    const stat = await Deno.stat(new URL(entry.name, dirUrl));
    const sizeMb = (stat.size / (1024 * 1024)).toFixed(1);
    const d = stat.mtime ?? new Date();
    const date = `${String(d.getMonth() + 1).padStart(2, "0")}.${
      String(d.getDate()).padStart(2, "0")
    }.${String(d.getFullYear()).slice(-2)}`;

    games.push({
      file: entry.name,
      rom,
      name: prettyName(rom, entry.name),
      url: `/arcade/${encodeURIComponent(entry.name)}`,
      size: `${sizeMb} MB`,
      date,
      bios: BIOS_BY_ROM[rom] ?? [],
    });
  }
} catch (e) {
  console.error(
    `[arcade-manifest] could not read ${dirUrl.pathname}: ${
      (e as Error).message
    }`,
  );
}

games.sort((a, b) => a.name.localeCompare(b.name));

await Deno.writeTextFile(manifestPath, JSON.stringify(games, null, 2) + "\n");
console.log(
  `[arcade-manifest] wrote ${games.length} ROM${
    games.length === 1 ? "" : "s"
  } to ${manifestPath.pathname}`,
);
