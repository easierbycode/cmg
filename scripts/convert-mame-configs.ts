// Populate the static arcade cfg directory consumed by static/arcade/play.html
// (which mounts /<driver>.cfg into the MAME core). Two sources are merged into
// static/arcade/cfg/:
//
//   1. The dev's local OpenEmu MAME cfg dir (optional) — captures coin counters,
//      high-score state, etc. from actually playing. Skipped on CI/Linux.
//
//        CMG_MAME_CONFIG_SRC="/path/to/OpenEmu/MAME" deno task arcade:configs
//
//   2. Committed per-game overrides in data/arcade-cfg/ — always applied, and
//      they win over the OpenEmu copy. Hand-authored control maps (e.g. the
//      Stadia Controller layout for sfex2) live here so they ship in every
//      build, including CI/Linux/web where OpenEmu is absent.

import { fromFileUrl } from "jsr:@std/path@^1.1.2";

// fromFileUrl, not URL.pathname: the latter renders file:///C:/… as "/C:/…",
// which Windows file APIs reject (os error 123) — build:windows runs this too.
const ROOT = new URL("../", import.meta.url);
const path = (rel: string) => fromFileUrl(new URL(rel, ROOT));

const DEFAULT_SRC =
  "/Users/danieljohnson/Library/Application Support/OpenEmu/MAME";
const requestedSrc = Deno.env.get("CMG_MAME_CONFIG_SRC") || DEFAULT_SRC;
const srcDir = requestedSrc.endsWith("/cfg")
  ? requestedSrc
  : `${requestedSrc}/cfg`;
const destDir = path("static/arcade/cfg");
const overridesDir = path("data/arcade-cfg");

async function isDir(p: string): Promise<boolean> {
  try {
    return (await Deno.stat(p)).isDirectory;
  } catch {
    return false;
  }
}

const isCfgName = (name: string) =>
  /\.cfg$/i.test(name) && /^[A-Za-z0-9_.-]+\.cfg$/.test(name);

// Copy every *.cfg from `fromDir` into destDir (normalising BOM/CRLF), reporting
// how many were copied and how many carry explicit input mappings.
async function copyCfgDir(
  fromDir: string,
): Promise<{ copied: number; withInput: number }> {
  let copied = 0;
  let withInput = 0;
  for await (const entry of Deno.readDir(fromDir)) {
    if (!entry.isFile || !isCfgName(entry.name)) continue;

    const raw = await Deno.readFile(`${fromDir}/${entry.name}`);
    let text = new TextDecoder().decode(raw);
    text = text.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
    if (/<input\b|<port\b|JOYCODE|KEYCODE|GUNCODE|MOUSECODE/.test(text)) {
      withInput++;
    }
    await Deno.writeTextFile(`${destDir}/${entry.name}`, text);
    copied++;
  }
  return { copied, withInput };
}

// Start from a clean slate, then layer the sources (overrides last so they win).
await Deno.remove(destDir, { recursive: true }).catch(() => {});
await Deno.mkdir(destDir, { recursive: true });

// 1. Optional local OpenEmu import.
if (await isDir(srcDir)) {
  const { copied, withInput } = await copyCfgDir(srcDir);
  console.log(
    `[mame-configs] imported ${copied} cfg file${
      copied === 1 ? "" : "s"
    } from ${srcDir} (${withInput} with explicit input mappings)`,
  );
} else {
  console.log(
    `[mame-configs] OpenEmu cfg directory not found: ${srcDir}; skipping local import`,
  );
}

// 2. Committed overrides (always applied; overwrite any OpenEmu copy).
if (await isDir(overridesDir)) {
  const { copied } = await copyCfgDir(overridesDir);
  console.log(
    `[mame-configs] applied ${copied} committed override cfg file${
      copied === 1 ? "" : "s"
    } from data/arcade-cfg/`,
  );
}
