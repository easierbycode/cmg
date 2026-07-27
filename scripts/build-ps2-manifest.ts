// Generate static/PlayStation2/manifest.json by scanning the ROM directory.
// Mirrors scripts/build-psx-manifest.ts — Deno Deploy can serve files in
// static/ but can't Deno.readDir into the source tree at runtime, so the
// manifest is the authoritative ROM index. PS2 discs are large and normally
// supplied via BYOD (the dashboard file picker); this manifest mainly indexes
// small homebrew (.elf) or any small images dropped into the directory.

interface Ps2Rom {
  file: string;
  name: string;
  url: string;
  size: string;
  date: string;
  /** "web" rows launch a browser build in the game iframe instead of Play! */
  kind?: "web";
}

// Formats Play! accepts (single-file): ISO, CSO, CHD, ISZ, BIN, ELF.
const PS2_EXT = /\.(iso|cso|chd|isz|bin|elf)$/i;

const dirUrl = new URL("../static/PlayStation2/", import.meta.url);
const manifestPath = new URL("manifest.json", dirUrl);

const games: Ps2Rom[] = [];
try {
  for await (const entry of Deno.readDir(dirUrl)) {
    if (!entry.isFile) continue;
    if (!PS2_EXT.test(entry.name)) continue;
    const stat = await Deno.stat(new URL(entry.name, dirUrl));
    const sizeMb = (stat.size / (1024 * 1024)).toFixed(1);
    const d = stat.mtime ?? new Date();
    const date = `${String(d.getMonth() + 1).padStart(2, "0")}.${
      String(d.getDate()).padStart(2, "0")
    }.${String(d.getFullYear()).slice(-2)}`;
    const display = entry.name
      .replace(PS2_EXT, "")
      .replace(/\s*\((USA|U|US|NTSC|J|JP|E|EU|PAL)\)\s*$/i, "")
      .trim();
    games.push({
      file: entry.name,
      name: display,
      url: `/PlayStation2/${encodeURIComponent(entry.name)}`,
      size: `${sizeMb} MB`,
      date,
    });
  }
} catch (e) {
  console.error(
    `[ps2-manifest] could not read ${dirUrl.pathname}: ${(e as Error).message}`,
  );
}

// Web-build rows, from an optional data/ps2-web.json sidecar. These are PS2
// titles that ship a browser build alongside the disc: the dashboard launches
// them in the ordinary game iframe rather than through Play!. Kept in a
// sidecar so this generator stays free to clobber the manifest on every build.
const webListUrl = new URL("../data/ps2-web.json", import.meta.url);
try {
  const web = JSON.parse(await Deno.readTextFile(webListUrl)) as Ps2Rom[];
  for (const row of web) games.push({ ...row, kind: "web" });
} catch (e) {
  if (!(e instanceof Deno.errors.NotFound)) {
    console.error(`[ps2-manifest] bad ${webListUrl.pathname}: ${(e as Error).message}`);
  }
}

games.sort((a, b) => a.name.localeCompare(b.name));

await Deno.writeTextFile(manifestPath, JSON.stringify(games, null, 2) + "\n");
console.log(
  `[ps2-manifest] wrote ${games.length} ROM${
    games.length === 1 ? "" : "s"
  } to ${manifestPath.pathname}`,
);
