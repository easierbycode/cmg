// Import ROM libraries from OpenEmu into the launcher's static/ ROM dirs, one
// OpenEmu system folder per bundled emulator, then re-run the per-system
// manifest scripts so the dashboard menus pick the games up.
//
//   deno task openemu:import                       # every matching system
//   deno task openemu:import --systems=saturn,psx  # a subset
//   deno task openemu:import --dry-run             # log without writing
//   deno task openemu:import --link                # symlink single files
//   deno task openemu:import --force               # re-import over existing
//   deno task openemu:import "--library=/path/to/Game Library/roms"
//
// OpenEmu keeps single-file games loose in each system folder and disc-based
// games in per-game subfolders (cue + bin tracks, plus an m3u for multi-disc
// sets). Single files are copied (or symlinked with --link) as-is. cue/bin
// folders are packed into one *uncompressed* zip per game: the EmulatorJS
// players fetch exactly one URL per game, and EmulatorJS unpacks zips in the
// browser and auto-selects the cue/m3u, so a store-zip is the way to serve a
// multi-file game as a single manifest entry. (chd/iso-only folders skip the
// zip and import the disc image directly.)

interface SystemDef {
  id: string; // --systems key + log label
  openEmuDir: string; // folder under OpenEmu's Game Library/roms/
  targetDir: string; // repo static/ dir the manifest script scans
  singleExts: string[]; // loose files imported as-is
  disc: boolean; // pack per-game subfolders into store-zips
  manifestScript: string;
}

const SYSTEMS: SystemDef[] = [
  {
    id: "saturn",
    openEmuDir: "Sega Saturn",
    targetDir: "static/SegaSaturn",
    singleExts: ["chd", "iso", "zip"],
    disc: true,
    manifestScript: "build-saturn-manifest.ts",
  },
  {
    id: "psx",
    openEmuDir: "Sony PlayStation",
    targetDir: "static/PlayStation",
    singleExts: ["pbp", "chd", "iso", "zip"],
    disc: true,
    manifestScript: "build-psx-manifest.ts",
  },
  {
    id: "nes",
    openEmuDir: "Nintendo (NES)",
    targetDir: "static/Nintendo",
    singleExts: ["nes", "fds", "unif", "unf", "zip"],
    disc: false,
    manifestScript: "build-nes-manifest.ts",
  },
  {
    id: "tg16",
    openEmuDir: "TurboGrafx-16",
    targetDir: "static/TurboGrafx-16",
    singleExts: ["pce", "zip"],
    disc: false,
    manifestScript: "build-tg16-manifest.ts",
  },
  {
    id: "arcade",
    openEmuDir: "Arcade",
    targetDir: "static/arcade",
    singleExts: ["zip"],
    disc: false,
    manifestScript: "build-arcade-manifest.ts",
  },
];

// Disc-folder contents worth packing (everything a cue/m3u can reference).
const DISC_SET_EXT = /\.(cue|m3u|bin|img|wav|ccd|sub)$/i;

const args = new Map<string, string>();
for (const a of Deno.args) {
  if (a === "--") continue; // deno task forwards the npm-style separator verbatim
  const m = a.match(/^--([^=]+)(?:=(.*))?$/);
  if (!m) {
    console.error(`[openemu-import] unknown argument: ${a}`);
    Deno.exit(1);
  }
  args.set(m[1], m[2] ?? "true");
}

const dryRun = args.get("dry-run") === "true";
const link = args.get("link") === "true";
const force = args.get("force") === "true";
const only = args.get("systems")?.split(",").map((s) => s.trim().toLowerCase());
const libraryRoot = args.get("library") ??
  `${
    Deno.env.get("HOME")
  }/Library/Application Support/OpenEmu/Game Library/roms`;

const repoRoot = new URL("..", import.meta.url);

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

// Copy or symlink one file into the target dir. Returns "imported" | "skipped".
async function importFile(
  src: string,
  destDir: string,
  name: string,
): Promise<"imported" | "skipped"> {
  const dest = `${destDir}/${name}`;
  if (await exists(dest)) {
    if (!force) return "skipped";
    if (!dryRun) await Deno.remove(dest);
  }
  console.log(`  ${link ? "link" : "copy"}  ${name}`);
  if (dryRun) return "imported";
  if (link) await Deno.symlink(src, dest);
  else await Deno.copyFile(src, dest);
  return "imported";
}

// Pack a disc game's files into one uncompressed zip (`zip -0 -j`: store-only,
// flatten paths — cue/m3u sheets reference their tracks by bare filename).
async function packDisc(
  files: string[],
  destDir: string,
  zipName: string,
): Promise<"imported" | "skipped"> {
  const dest = `${destDir}/${zipName}`;
  if (await exists(dest)) {
    if (!force) return "skipped";
    if (!dryRun) await Deno.remove(dest);
  }
  console.log(`  pack  ${zipName} (${files.length} files)`);
  if (dryRun) return "imported";
  const cmd = new Deno.Command("zip", {
    args: ["-0", "-j", "-q", dest, ...files],
    stdout: "inherit",
    stderr: "inherit",
  });
  const { success } = await cmd.output();
  if (!success) {
    try {
      await Deno.remove(dest);
    } catch { /* nothing to clean up */ }
    throw new Error(`zip failed for ${zipName} (is 'zip' installed?)`);
  }
  return "imported";
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

interface Tally {
  imported: number;
  skipped: number;
  unsupported: string[];
}

async function importSystem(sys: SystemDef): Promise<Tally | null> {
  const srcDir = `${libraryRoot}/${sys.openEmuDir}`;
  const destDir = new URL(sys.targetDir, repoRoot).pathname;
  const tally: Tally = { imported: 0, skipped: 0, unsupported: [] };

  let entries: Deno.DirEntry[];
  try {
    entries = [];
    for await (const e of Deno.readDir(srcDir)) entries.push(e);
  } catch {
    console.log(`[${sys.id}] no OpenEmu library at ${srcDir} — skipping`);
    return null;
  }
  console.log(`[${sys.id}] ${srcDir} → ${sys.targetDir}`);
  entries.sort((a, b) => a.name.localeCompare(b.name));

  const count = (r: "imported" | "skipped") => {
    tally[r]++;
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
      tally.unsupported.push(entry.name);
      continue;
    }

    if (info.isFile) {
      if (sys.singleExts.includes(ext(entry.name))) {
        count(await importFile(srcPath, destDir, entry.name));
      } else if (sys.disc && /\.(cue|m3u)$/i.test(entry.name)) {
        const zipName = entry.name.replace(/\.(cue|m3u)$/i, "") + ".zip";
        count(await packDisc(await referencedFiles(srcPath), destDir, zipName));
      } else {
        tally.unsupported.push(entry.name);
      }
      continue;
    }

    // Per-game subfolder (OpenEmu's layout for disc games).
    if (!sys.disc) {
      tally.unsupported.push(entry.name + "/");
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
      count(await packDisc(discSet, destDir, entry.name + ".zip"));
    } else if (singles.length) {
      // chd/iso-only folder — no cue sheet to satisfy, import the images as-is.
      for (const f of singles) {
        count(await importFile(f, destDir, f.slice(f.lastIndexOf("/") + 1)));
      }
    } else {
      tally.unsupported.push(entry.name + "/");
    }
  }

  console.log(
    `[${sys.id}] imported ${tally.imported}, skipped ${tally.skipped} existing` +
      (tally.unsupported.length
        ? `, unsupported: ${tally.unsupported.join(", ")}`
        : ""),
  );
  return tally;
}

const selected = SYSTEMS.filter((s) => !only || only.includes(s.id));
if (!selected.length) {
  console.error(
    `[openemu-import] no matching systems (have: ${
      SYSTEMS.map((s) => s.id).join(", ")
    })`,
  );
  Deno.exit(1);
}

let total = 0;
const touched: SystemDef[] = [];
for (const sys of selected) {
  const tally = await importSystem(sys);
  if (tally) {
    total += tally.imported;
    if (tally.imported > 0) touched.push(sys);
  }
}

// Refresh the manifests the dashboard menus are built from.
if (!dryRun) {
  for (const sys of touched) {
    const script = new URL(sys.manifestScript, import.meta.url).pathname;
    const { success } = await new Deno.Command(Deno.execPath(), {
      args: ["run", "-A", script],
      stdout: "inherit",
      stderr: "inherit",
    }).output();
    if (!success) {
      console.error(`[openemu-import] ${sys.manifestScript} failed`);
    }
  }
}

console.log(
  `[openemu-import] ${dryRun ? "(dry run) " : ""}${total} game${
    total === 1 ? "" : "s"
  } imported` +
    (touched.length && !dryRun
      ? ` — manifests refreshed for ${touched.map((s) => s.id).join(", ")}`
      : ""),
);
