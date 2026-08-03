// Vendor Phaser Editor 2D into the repo so the Guide's "Edit Game" button works
// with no npm install and no first-run download.
//
// `phasereditor2d-launcher` (the npm package a Phaser Editor project lists in
// its devDependencies) is a thin CLI: on first run it downloads the platform's
// PhaserEditor2D-core zip from updates.phasereditor2d.com and unpacks it into
// ~/.phasereditor2d/installs. This script does both halves up front, into the
// repo instead of the home directory:
//
//   vendor/phasereditor2d/
//     version.json                        { version, platforms, installedAt }
//     launcher/                           the npm package, verbatim
//     downloads/PhaserEditor2D-core-<v>-<platform>.zip
//     installs/PhaserEditor2D-core-<v>-<platform>/PhaserEditor2D/PhaserEditor2D[.exe]
//
// The installs/ layout is byte-for-byte what installEditor.js produces, so
// lib/phaser-editor.ts can resolve the executable from either this directory or
// a pre-existing ~/.phasereditor2d (CMG_PHASER_EDITOR_HOME overrides both).
//
// Output is gitignored (vendor/ — ~12 MB per platform), like the arcade core.
//
//   deno task phasereditor:vendor              # this machine's platform
//   deno task phasereditor:vendor -- --all     # windows + macos + linux
//   deno task phasereditor:vendor -- --force   # re-download even if present

import { fromFileUrl, join } from "jsr:@std/path@^1.1.2";
import { UntarStream } from "jsr:@std/tar@^0.1.7";

// fromFileUrl, not URL.pathname: the latter renders file:///C:/… as "/C:/…",
// which Windows file APIs reject (os error 123).
const ROOT_PATH = fromFileUrl(new URL("../", import.meta.url));
const VENDOR_DIR = join(ROOT_PATH, "vendor", "phasereditor2d");

// The range evil-invaders-phaser4 (and the Phaser Editor project templates)
// pin. The exact version is resolved from the registry when online; this is the
// floor and the offline fallback.
const RANGE_MIN = "3.67.0";
const REGISTRY = Deno.env.get("CMG_NPM_REGISTRY") ??
  "https://registry.npmjs.org";
const UPDATES = Deno.env.get("CMG_PHASER_EDITOR_UPDATES") ??
  "https://updates.phasereditor2d.com";

const args = new Set(Deno.args);
const FORCE = args.has("--force");
const ALL = args.has("--all");

type Platform = "windows" | "macos" | "linux";
const PLATFORM_BY_OS: Record<string, Platform> = {
  windows: "windows",
  darwin: "macos",
  linux: "linux",
};

function hostPlatform(): Platform {
  const p = PLATFORM_BY_OS[Deno.build.os];
  if (!p) throw new Error(`no Phaser Editor build for ${Deno.build.os}`);
  return p;
}

function rel(p: string): string {
  return p.startsWith(ROOT_PATH) ? p.slice(ROOT_PATH.length) : p;
}

async function exists(p: string): Promise<boolean> {
  try {
    await Deno.stat(p);
    return true;
  } catch {
    return false;
  }
}

async function fileWithBytes(p: string): Promise<boolean> {
  try {
    const st = await Deno.stat(p);
    return st.isFile && st.size > 0;
  } catch {
    return false;
  }
}

// ── version ──────────────────────────────────────────────────────────────────

function cmpVersion(a: string, b: string): number {
  const pa = a.split(".").map((n) => parseInt(n, 10) || 0);
  const pb = b.split(".").map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] ?? 0) !== (pb[i] ?? 0)) return (pa[i] ?? 0) - (pb[i] ?? 0);
  }
  return 0;
}

// ^3.67.0 — same major, not older than the floor. Prereleases are skipped: the
// editor's zip only ships for tagged releases.
function satisfies(version: string): boolean {
  if (!/^\d+\.\d+\.\d+$/.test(version)) return false;
  return version.split(".")[0] === RANGE_MIN.split(".")[0] &&
    cmpVersion(version, RANGE_MIN) >= 0;
}

async function resolveVersion(): Promise<string> {
  const pinned = Deno.env.get("CMG_PHASER_EDITOR_VERSION");
  if (pinned) return pinned;
  try {
    const r = await fetch(`${REGISTRY}/phasereditor2d-launcher`, {
      headers: { accept: "application/vnd.npm.install-v1+json" },
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const meta = await r.json() as { versions?: Record<string, unknown> };
    const best = Object.keys(meta.versions ?? {})
      .filter(satisfies)
      .sort(cmpVersion)
      .pop();
    if (best) return best;
  } catch (e) {
    console.log(
      `[phaser-editor] registry lookup failed (${
        (e as Error).message
      }); using ${RANGE_MIN}`,
    );
  }
  return RANGE_MIN;
}

// ── the npm package ──────────────────────────────────────────────────────────

// Unpack the .tgz straight from the response stream. npm tarballs put every
// entry under "package/", which is stripped so launcher/cli.js lands flat.
async function installLauncherPackage(version: string): Promise<void> {
  const dest = join(VENDOR_DIR, "launcher");
  if (!FORCE && await fileWithBytes(join(dest, "cli.js"))) {
    console.log(`  - ${rel(dest)} (cached)`);
    return;
  }
  const url =
    `${REGISTRY}/phasereditor2d-launcher/-/phasereditor2d-launcher-${version}.tgz`;
  const r = await fetch(url, { redirect: "follow" });
  if (!r.ok || !r.body) throw new Error(`HTTP ${r.status} fetching ${url}`);

  await Deno.mkdir(dest, { recursive: true });
  const entries = r.body
    .pipeThrough(new DecompressionStream("gzip"))
    .pipeThrough(new UntarStream());
  for await (const entry of entries) {
    const name = entry.path.replace(/^package\//, "");
    // A tarball entry that climbs out of the extract dir is never legitimate.
    if (!name || name.includes("..")) {
      await entry.readable?.cancel();
      continue;
    }
    const out = join(dest, name);
    if (entry.header.typeflag === "5") {
      await Deno.mkdir(out, { recursive: true });
      continue;
    }
    if (!entry.readable) continue;
    await Deno.mkdir(join(out, ".."), { recursive: true });
    using file = await Deno.open(out, {
      write: true,
      create: true,
      truncate: true,
    });
    await entry.readable.pipeTo(file.writable, { preventClose: true });
  }
  console.log(`  + ${rel(dest)}`);
}

// ── the editor binaries ──────────────────────────────────────────────────────

function distName(version: string, platform: Platform): string {
  return `PhaserEditor2D-core-${version}-${platform}`;
}

export function execName(platform: Platform): string {
  return `PhaserEditor2D${platform === "windows" ? ".exe" : ""}`;
}

// Extract with OS tools rather than a zip library — the same approach (and the
// same fallback order) as lib/games-store.ts, so nothing new enters the
// compiled launcher's dependency graph. Unlike that helper this preserves the
// archive's own top-level folder: the editor expects <dist>/PhaserEditor2D/.
async function unzipTo(zipPath: string, targetDir: string): Promise<void> {
  await Deno.mkdir(targetDir, { recursive: true });
  const attempts: Array<[string, string[]]> = [
    ["unzip", ["-q", "-o", zipPath, "-d", targetDir]],
  ];
  if (Deno.build.os === "darwin") {
    attempts.push(["/usr/bin/ditto", ["-x", "-k", zipPath, targetDir]]);
  }
  if (Deno.build.os === "windows") {
    attempts.push([
      "powershell.exe",
      [
        "-NoProfile",
        "-NonInteractive",
        "-ExecutionPolicy",
        "Bypass",
        "-Command",
        `$ErrorActionPreference='Stop';Expand-Archive -LiteralPath '${
          zipPath.replace(/'/g, "''")
        }' -DestinationPath '${targetDir.replace(/'/g, "''")}' -Force`,
      ],
    ]);
  }
  for (const [cmd, cmdArgs] of attempts) {
    try {
      const out = await new Deno.Command(cmd, {
        args: cmdArgs,
        stdout: "null",
        stderr: "null",
      }).output();
      if (out.success) return;
    } catch {
      // tool not on PATH — try the next one
    }
  }
  throw new Error(
    `failed to unzip ${zipPath} (need unzip, ditto, or PowerShell)`,
  );
}

// The zip: vendor/downloads first, then a pre-existing ~/.phasereditor2d copy
// (what `npm run editor` already downloaded — lets this run offline), then the
// update server.
async function fetchCoreZip(
  version: string,
  platform: Platform,
): Promise<string> {
  const file = `${distName(version, platform)}.zip`;
  const dest = join(VENDOR_DIR, "downloads", file);
  if (!FORCE && await fileWithBytes(dest)) {
    console.log(`  - ${rel(dest)} (cached)`);
    return dest;
  }
  await Deno.mkdir(join(VENDOR_DIR, "downloads"), { recursive: true });

  const home = Deno.env.get("HOME") ?? Deno.env.get("USERPROFILE");
  const cached = home ? join(home, ".phasereditor2d", "installs", file) : null;
  if (cached && await fileWithBytes(cached)) {
    await Deno.copyFile(cached, dest);
    console.log(`  + ${rel(dest)} (from ${cached})`);
    return dest;
  }

  const url = `${UPDATES}/v${version}/${file}`;
  console.log(`    fetching ${url}`);
  const r = await fetch(url, { redirect: "follow" });
  if (!r.ok) throw new Error(`HTTP ${r.status} fetching ${url}`);
  await Deno.writeFile(dest, new Uint8Array(await r.arrayBuffer()));
  console.log(`  + ${rel(dest)}`);
  return dest;
}

async function installCore(
  version: string,
  platform: Platform,
): Promise<string> {
  const dir = join(VENDOR_DIR, "installs", distName(version, platform));
  const exec = join(dir, "PhaserEditor2D", execName(platform));
  if (!FORCE && await fileWithBytes(exec)) {
    console.log(`  - ${rel(exec)} (cached)`);
    return exec;
  }
  const zip = await fetchCoreZip(version, platform);
  await unzipTo(zip, dir);
  if (!await fileWithBytes(exec)) {
    throw new Error(`unpacked ${distName(version, platform)} has no ${exec}`);
  }
  // installEditor.js chmods the binary after unzipping; zip metadata does not
  // survive every extractor, and a non-executable file spawns as EACCES.
  if (platform !== "windows" && Deno.build.os !== "windows") {
    await Deno.chmod(exec, 0o755);
  }
  console.log(`  + ${rel(exec)}`);
  return exec;
}

// ── main ─────────────────────────────────────────────────────────────────────

const version = await resolveVersion();
const platforms: Platform[] = ALL
  ? ["windows", "macos", "linux"]
  : [hostPlatform()];

console.log(
  `[phaser-editor] v${version} → ${rel(VENDOR_DIR)} (${platforms.join(", ")})`,
);
await Deno.mkdir(VENDOR_DIR, { recursive: true });

console.log("[phaser-editor] launcher package");
await installLauncherPackage(version);

console.log("[phaser-editor] editor core");
for (const platform of platforms) {
  await installCore(version, platform);
}

// A manifest so lib/phaser-editor.ts can resolve the install without guessing
// the version, and so a stale vendor tree is obvious.
const manifestPath = join(VENDOR_DIR, "version.json");
let installed: Platform[] = [];
if (!FORCE && await exists(manifestPath)) {
  try {
    const prev = JSON.parse(await Deno.readTextFile(manifestPath));
    if (prev.version === version && Array.isArray(prev.platforms)) {
      installed = prev.platforms;
    }
  } catch {
    // unreadable manifest — rewrite it
  }
}
await Deno.writeTextFile(
  manifestPath,
  JSON.stringify(
    {
      version,
      platforms: [...new Set([...installed, ...platforms])].sort(),
      installedAt: new Date().toISOString(),
    },
    null,
    2,
  ) + "\n",
);

console.log(
  `[phaser-editor] done — v${version}, ${platforms.length} platform(s)`,
);
