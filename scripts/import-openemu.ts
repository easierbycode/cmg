// Import ROM libraries from OpenEmu into the launcher's static/ ROM dirs, one
// OpenEmu system folder per bundled emulator, then re-run the per-system
// manifest scripts so the dashboard menus pick the games up. The scan/import
// logic lives in scripts/openemu-lib.ts, shared with the dashboard's
// Settings → "Import OpenEmu Library" picker (routes/api/openemu/).
//
//   deno task openemu:import                       # every matching system
//   deno task openemu:import --systems=saturn,psx  # a subset
//   deno task openemu:import --dry-run             # log without writing
//   deno task openemu:import --link                # symlink single files
//   deno task openemu:import --force               # re-import over existing
//   deno task openemu:import "--library=/path/to/Game Library/roms"

import {
  defaultLibraryRoot,
  importEntry,
  regenManifest,
  scanSystem,
  type SystemDef,
  SYSTEMS,
} from "./openemu-lib.ts";

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
const libraryRoot = args.get("library") ?? defaultLibraryRoot();

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
  const scan = await scanSystem(sys, libraryRoot);
  if (!scan) {
    console.log(
      `[${sys.id}] no OpenEmu library at ${libraryRoot}/${sys.openEmuDir} — skipping`,
    );
    continue;
  }
  console.log(
    `[${sys.id}] ${libraryRoot}/${sys.openEmuDir} → ${sys.targetDir}`,
  );
  let imported = 0;
  let skipped = 0;
  for (const entry of scan.games) {
    if (
      (await importEntry(sys, entry, { link, force, dryRun })) === "imported"
    ) {
      imported++;
    } else skipped++;
  }
  console.log(
    `[${sys.id}] imported ${imported}, skipped ${skipped} existing` +
      (scan.unsupported.length
        ? `, unsupported: ${scan.unsupported.join(", ")}`
        : ""),
  );
  total += imported;
  if (imported > 0) touched.push(sys);
}

// Refresh the manifests the dashboard menus are built from.
if (!dryRun) {
  for (const sys of touched) {
    if (!(await regenManifest(sys))) {
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
