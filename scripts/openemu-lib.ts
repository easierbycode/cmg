// Shared OpenEmu-library import logic, used by two callers:
//   - scripts/import-openemu.ts       (CLI: deno task openemu:import)
//   - routes/api/openemu/{scan,import}.ts  (the dashboard's Settings →
//     "Import OpenEmu Library" picker)
//
// scanSystem() enumerates what OpenEmu has without writing anything;
// importEntry() materialises one game into the launcher's static ROM dir.
// The API route re-scans and matches entries by (system, file) so it never
// acts on client-supplied filesystem paths.
//
// OpenEmu keeps single-file games loose in each system folder and disc-based
// games in per-game subfolders (cue + bin tracks, plus an m3u for multi-disc
// sets). Single files are copied (or symlinked) as-is. cue/bin folders are
// packed into one *uncompressed* zip per game: the EmulatorJS players fetch
// exactly one URL per game, and EmulatorJS unpacks zips in the browser and
// auto-selects the cue/m3u, so a store-zip is the way to serve a multi-file
// game as a single manifest entry. (chd/iso-only folders skip the zip and
// import the disc image directly.)

export interface SystemDef {
  id: string; // stable key ("saturn", "psx", …)
  label: string; // display name for pickers
  openEmuDir: string; // folder under OpenEmu's Game Library/roms/
  targetDir: string; // repo static/ dir the manifest script scans
  singleExts: string[]; // loose files imported as-is
  disc: boolean; // pack per-game subfolders into store-zips
  manifestScript: string;
}

export const SYSTEMS: SystemDef[] = [
  {
    id: "saturn",
    label: "Sega Saturn",
    openEmuDir: "Sega Saturn",
    targetDir: "static/SegaSaturn",
    singleExts: ["chd", "iso", "zip"],
    disc: true,
    manifestScript: "build-saturn-manifest.ts",
  },
  {
    id: "psx",
    label: "PlayStation",
    openEmuDir: "Sony PlayStation",
    targetDir: "static/PlayStation",
    singleExts: ["pbp", "chd", "iso", "zip"],
    disc: true,
    manifestScript: "build-psx-manifest.ts",
  },
  {
    id: "nes",
    label: "Nintendo (NES)",
    openEmuDir: "Nintendo (NES)",
    targetDir: "static/Nintendo",
    singleExts: ["nes", "fds", "unif", "unf", "zip"],
    disc: false,
    manifestScript: "build-nes-manifest.ts",
  },
  {
    id: "tg16",
    label: "TurboGrafx-16",
    openEmuDir: "TurboGrafx-16",
    targetDir: "static/TurboGrafx-16",
    singleExts: ["pce", "zip"],
    disc: false,
    manifestScript: "build-tg16-manifest.ts",
  },
  {
    id: "arcade",
    label: "Arcade",
    openEmuDir: "Arcade",
    targetDir: "static/arcade",
    singleExts: ["zip"],
    disc: false,
    manifestScript: "build-arcade-manifest.ts",
  },
];

// Disc-folder contents worth packing (everything a cue/m3u can reference).
const DISC_SET_EXT = /\.(cue|m3u|bin|img|wav|ccd|sub)$/i;

const repoRoot = new URL("..", import.meta.url);

export function defaultLibraryRoot(): string {
  return `${
    Deno.env.get("HOME")
  }/Library/Application Support/OpenEmu/Game Library/roms`;
}

export interface GameEntry {
  system: string; // SystemDef.id
  file: string; // filename that lands in the system's static dir
  name: string; // display name (file minus extension)
  kind: "file" | "pack"; // copy/link one file vs pack a store-zip
  size: number; // source bytes (sum of pack contents)
  imported: boolean; // target already exists
  srcs: string[]; // absolute source paths (server-side only)
}

export interface ScanResult {
  games: GameEntry[];
  unsupported: string[];
}

function ext(name: string): string {
  const i = name.lastIndexOf(".");
  return i < 0 ? "" : name.slice(i + 1).toLowerCase();
}

async function exists(path: string): Promise<boolean> {
  try {
    await Deno.lstat(path);
    return true;
  } catch {
    return false;
  }
}

export function targetDirFor(sys: SystemDef): string {
  return new URL(sys.targetDir, repoRoot).pathname;
}

// A cue/m3u left loose in the system folder: pull in the sibling files it
// references so the pack is complete.
async function referencedFiles(sheetPath: string): Promise<string[]> {
  const dir = sheetPath.slice(0, sheetPath.lastIndexOf("/"));
  const text = await Deno.readTextFile(sheetPath);
  const out = [sheetPath];
  const names = sheetPath.toLowerCase().endsWith(".m3u")
    ? text.split("\n").map((l) => l.trim()).filter((l) =>
      l && !l.startsWith("#")
    )
    : [...text.matchAll(/FILE\s+"([^"]+)"/gi)].map((m) => m[1]);
  for (const name of names) {
    const path = `${dir}/${name}`;
    if (await exists(path)) {
      out.push(path);
      // An m3u lists cue sheets, which reference tracks of their own.
      if (name.toLowerCase().endsWith(".cue")) {
        out.push(...(await referencedFiles(path)).slice(1));
      }
    } else {
      console.warn(`  warn  ${name} referenced by ${sheetPath} is missing`);
    }
  }
  return [...new Set(out)];
}

async function totalSize(paths: string[]): Promise<number> {
  let sum = 0;
  for (const p of paths) {
    try {
      sum += (await Deno.stat(p)).size;
    } catch { /* leave missing files out of the total */ }
  }
  return sum;
}

function displayName(file: string): string {
  return file.replace(/\.[^.]+$/, "");
}

// Enumerate everything OpenEmu has for one system, without writing. Returns
// null when the OpenEmu library folder for the system doesn't exist.
export async function scanSystem(
  sys: SystemDef,
  libraryRoot: string = defaultLibraryRoot(),
): Promise<ScanResult | null> {
  const srcDir = `${libraryRoot}/${sys.openEmuDir}`;
  const destDir = targetDirFor(sys);
  const result: ScanResult = { games: [], unsupported: [] };

  let entries: Deno.DirEntry[];
  try {
    entries = [];
    for await (const e of Deno.readDir(srcDir)) entries.push(e);
  } catch {
    return null;
  }
  entries.sort((a, b) => a.name.localeCompare(b.name));

  const add = async (
    file: string,
    kind: "file" | "pack",
    srcs: string[],
  ) => {
    result.games.push({
      system: sys.id,
      file,
      name: displayName(file),
      kind,
      size: await totalSize(srcs),
      imported: await exists(`${destDir}/${file}`),
      srcs,
    });
  };

  for (const entry of entries) {
    const srcPath = `${srcDir}/${entry.name}`;
    if (entry.name.startsWith(".")) continue;

    // stat (not the readDir entry) so symlinked files/folders classify by
    // what they point at.
    let info: Deno.FileInfo;
    try {
      info = await Deno.stat(srcPath);
    } catch {
      result.unsupported.push(entry.name);
      continue;
    }

    if (info.isFile) {
      if (sys.singleExts.includes(ext(entry.name))) {
        await add(entry.name, "file", [srcPath]);
      } else if (sys.disc && /\.(cue|m3u)$/i.test(entry.name)) {
        const zipName = entry.name.replace(/\.(cue|m3u)$/i, "") + ".zip";
        await add(zipName, "pack", await referencedFiles(srcPath));
      } else {
        result.unsupported.push(entry.name);
      }
      continue;
    }

    // Per-game subfolder (OpenEmu's layout for disc games).
    if (!sys.disc) {
      result.unsupported.push(entry.name + "/");
      continue;
    }
    const files: string[] = [];
    for await (const f of Deno.readDir(srcPath)) {
      // zip follows symlinks, so a linked track file packs fine.
      if ((f.isFile || f.isSymlink) && !f.name.startsWith(".")) {
        files.push(`${srcPath}/${f.name}`);
      }
    }
    const singles = files.filter((f) =>
      sys.singleExts.includes(ext(f)) && ext(f) !== "zip"
    );
    const discSet = files.filter((f) => DISC_SET_EXT.test(f));
    if (discSet.some((f) => /\.(cue|m3u)$/i.test(f))) {
      await add(entry.name + ".zip", "pack", discSet);
    } else if (singles.length) {
      // chd/iso-only folder — no cue sheet to satisfy, import the images as-is.
      for (const f of singles) {
        await add(f.slice(f.lastIndexOf("/") + 1), "file", [f]);
      }
    } else {
      result.unsupported.push(entry.name + "/");
    }
  }

  return result;
}

export interface ImportOpts {
  link?: boolean; // symlink single files instead of copying
  force?: boolean; // re-import over an existing target
  dryRun?: boolean;
  log?: (line: string) => void;
}

// Materialise one scanned entry into the system's static dir.
export async function importEntry(
  sys: SystemDef,
  entry: GameEntry,
  opts: ImportOpts = {},
): Promise<"imported" | "skipped"> {
  const { link = false, force = false, dryRun = false } = opts;
  const log = opts.log ?? console.log;
  const dest = `${targetDirFor(sys)}/${entry.file}`;
  if (await exists(dest)) {
    if (!force) return "skipped";
    if (!dryRun) await Deno.remove(dest);
  }

  if (entry.kind === "file") {
    const src = entry.srcs[0];
    log(`  ${link ? "link" : "copy"}  ${entry.file}`);
    if (dryRun) return "imported";
    if (link) await Deno.symlink(src, dest);
    else await Deno.copyFile(src, dest);
    return "imported";
  }

  // Pack a disc game's files into one uncompressed zip (`zip -0 -j`:
  // store-only, flatten paths — cue/m3u sheets reference their tracks by
  // bare filename).
  log(`  pack  ${entry.file} (${entry.srcs.length} files)`);
  if (dryRun) return "imported";
  const cmd = new Deno.Command("zip", {
    args: ["-0", "-j", "-q", dest, ...entry.srcs],
    stdout: "inherit",
    stderr: "inherit",
  });
  const { success } = await cmd.output();
  if (!success) {
    try {
      await Deno.remove(dest);
    } catch { /* nothing to clean up */ }
    throw new Error(`zip failed for ${entry.file} (is 'zip' installed?)`);
  }
  return "imported";
}

// Refresh the manifest the dashboard menu is built from.
export async function regenManifest(sys: SystemDef): Promise<boolean> {
  const script = new URL(`scripts/${sys.manifestScript}`, repoRoot).pathname;
  const { success } = await new Deno.Command(Deno.execPath(), {
    args: ["run", "-A", script],
    stdout: "inherit",
    stderr: "inherit",
  }).output();
  return success;
}
