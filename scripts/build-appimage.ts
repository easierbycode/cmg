// Packages the cross-compiled Linux launcher into a self-contained AppImage.
//
// Input:  dist/cmg-linux-x86_64   (produced by `deno compile` — see the
//                                   `build:linux` task in deno.json)
// Output: dist/cmg-x86_64.AppImage (uploaded to GitHub Releases by CI and
//                                   served at /app.AppImage on the deploy)
//
// AppImage is a Linux-only format, so this step only runs on Linux — the
// GitHub Actions workflow (.github/workflows/build-appimage.yml) or any Linux
// host/container. No system packages are required: appimagetool is fetched on
// demand and run with APPIMAGE_EXTRACT_AND_RUN=1, so neither FUSE nor
// squashfs-tools need to be installed.

const ROOT = new URL("../", import.meta.url);
const path = (rel: string) => new URL(rel, ROOT).pathname;

const BIN = path("dist/cmg-linux-x86_64");
const APPDIR = path("dist/AppDir");
const OUT = path("dist/cmg-x86_64.AppImage");
const ICON = Deno.env.get("CMG_APPIMAGE_ICON") ??
  path("static/icons/2028-icon.png");
const TOOL_DEST = path("dist/appimagetool");
const TOOL_URLS = [
  Deno.env.get("APPIMAGETOOL_URL") ?? "",
  "https://github.com/AppImage/appimagetool/releases/download/continuous/appimagetool-x86_64.AppImage",
  "https://github.com/AppImage/AppImageKit/releases/download/continuous/appimagetool-x86_64.AppImage",
].filter(Boolean);

async function exists(p: string): Promise<boolean> {
  try {
    await Deno.stat(p);
    return true;
  } catch {
    return false;
  }
}

if (Deno.build.os !== "linux") {
  console.error(
    `build-appimage: AppImage packaging is Linux-only (current OS: ` +
      `"${Deno.build.os}"). Run the GitHub Actions workflow or build inside a ` +
      `Linux container/host. The cross-compiled binary is still at ${BIN}.`,
  );
  Deno.exit(1);
}

if (!(await exists(BIN))) {
  console.error(
    `build-appimage: compiled binary not found at ${BIN}. ` +
      "Run `deno task build:linux`, which compiles it before packaging.",
  );
  Deno.exit(1);
}

if (!(await exists(ICON))) {
  console.error(`build-appimage: icon not found at ${ICON}`);
  Deno.exit(1);
}

// --- assemble the AppDir ---------------------------------------------------
await Deno.remove(APPDIR, { recursive: true }).catch(() => {});
await Deno.mkdir(`${APPDIR}/usr/bin`, { recursive: true });
await Deno.mkdir(`${APPDIR}/usr/share/icons/hicolor/256x256/apps`, {
  recursive: true,
});

await Deno.copyFile(BIN, `${APPDIR}/usr/bin/cmg`);
await Deno.chmod(`${APPDIR}/usr/bin/cmg`, 0o755);

await Deno.writeTextFile(
  `${APPDIR}/AppRun`,
  `#!/bin/sh
HERE="$(dirname "$(readlink -f "$0")")"
exec "$HERE/usr/bin/cmg" "$@"
`,
);
await Deno.chmod(`${APPDIR}/AppRun`, 0o755);

await Deno.writeTextFile(
  `${APPDIR}/cmg.desktop`,
  `[Desktop Entry]
Type=Application
Name=CMG
Comment=CMG Launcher
Exec=cmg
Icon=cmg
Categories=Game;
Terminal=false
`,
);

await Deno.copyFile(ICON, `${APPDIR}/cmg.png`);
await Deno.copyFile(ICON, `${APPDIR}/.DirIcon`);
await Deno.copyFile(
  ICON,
  `${APPDIR}/usr/share/icons/hicolor/256x256/apps/cmg.png`,
);

// --- obtain appimagetool ---------------------------------------------------
async function resolveAppimagetool(): Promise<string> {
  const onPath = await new Deno.Command("sh", {
    args: ["-c", "command -v appimagetool || true"],
    stdout: "piped",
  }).output();
  const found = new TextDecoder().decode(onPath.stdout).trim();
  if (found) return found;

  if (await exists(TOOL_DEST)) return TOOL_DEST;

  let lastErr: unknown;
  for (const url of TOOL_URLS) {
    try {
      console.log(`build-appimage: downloading appimagetool from ${url}`);
      const res = await fetch(url, { redirect: "follow" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await Deno.writeFile(TOOL_DEST, new Uint8Array(await res.arrayBuffer()));
      await Deno.chmod(TOOL_DEST, 0o755);
      return TOOL_DEST;
    } catch (err) {
      lastErr = err;
      console.warn(`  failed: ${err instanceof Error ? err.message : err}`);
    }
  }
  throw new Error(`could not obtain appimagetool: ${lastErr}`);
}

const tool = await resolveAppimagetool();

// --- package ---------------------------------------------------------------
console.log(`build-appimage: packaging ${APPDIR} -> ${OUT}`);
const result = await new Deno.Command(tool, {
  args: [APPDIR, OUT],
  env: {
    ...Deno.env.toObject(),
    APPIMAGE_EXTRACT_AND_RUN: "1", // run appimagetool without FUSE
    ARCH: "x86_64",
    NO_STRIP: "1", // never strip the Deno binary — it has an appended payload
  },
  stdout: "inherit",
  stderr: "inherit",
}).output();

if (!result.success) {
  console.error(`build-appimage: appimagetool failed (exit ${result.code})`);
  Deno.exit(result.code || 1);
}

await Deno.chmod(OUT, 0o755);
const { size } = await Deno.stat(OUT);
console.log(
  `build-appimage: wrote ${OUT} (${(size / 1024 / 1024).toFixed(1)} MB)`,
);
