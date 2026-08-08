// Generate static/TurboGrafx-16/manifest.json by scanning the ROM directory.
// Deno Deploy's runtime can serve files in static/ but cannot Deno.readDir into
// the source tree, so the manifest acts as the authoritative ROM index.

interface Tg16Rom {
  file: string;
  name: string;
  url: string;
  size: string;
  date: string;
  icon?: string;
}

// .zip = a zipped HuCard (OpenEmu keeps most carts zipped) — EmulatorJS
// unpacks it in the browser and picks the rom inside.
const TG16_EXT = /\.(pce|zip)$/i;

const dirUrl = new URL("../static/TurboGrafx-16/", import.meta.url);
const manifestPath = new URL("manifest.json", dirUrl);

// Strip trailing region / translation / version tags — "(Japan)", "(J) (SGX)"
// — repeatedly, mirroring scripts/build-nes-manifest.ts.
function cleanName(file: string): string {
  let name = file.replace(TG16_EXT, "");
  let prev: string;
  do {
    prev = name;
    name = name.replace(/\s*[\[(][^\[\]()]*[\])]\s*$/, "").trim();
  } while (name !== prev);
  return name || file.replace(TG16_EXT, "");
}

// Cover art (fetched by a separate pipeline) lives in covers/ beside the
// ROMs — return the served URL when <basename>.png exists.
async function coverIcon(file: string): Promise<string | undefined> {
  const base = file.replace(TG16_EXT, "");
  try {
    await Deno.stat(new URL(`covers/${base}.png`, dirUrl));
    return `/TurboGrafx-16/covers/${encodeURIComponent(base)}.png`;
  } catch {
    return undefined;
  }
}

const games: Tg16Rom[] = [];
try {
  for await (const entry of Deno.readDir(dirUrl)) {
    if (!entry.isFile) continue;
    if (!TG16_EXT.test(entry.name)) continue;
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
      url: `/TurboGrafx-16/${encodeURIComponent(entry.name)}`,
      size: `${sizeMb} MB`,
      date,
      ...(icon ? { icon } : {}),
    });
  }
} catch (e) {
  console.error(
    `[tg16-manifest] could not read ${dirUrl.pathname}: ${
      (e as Error).message
    }`,
  );
}

games.sort((a, b) => a.name.localeCompare(b.name));

await Deno.writeTextFile(manifestPath, JSON.stringify(games, null, 2) + "\n");
console.log(
  `[tg16-manifest] wrote ${games.length} ROM${
    games.length === 1 ? "" : "s"
  } to ${manifestPath.pathname}`,
);
