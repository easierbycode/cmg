// Vendor the Flycast WASM core (Dreamcast / NAOMI) used by static/naomi/play.html.
//
// The core is a libretro build of flycast with a custom SH4→WebAssembly JIT:
//   https://github.com/nasomers/flycast-wasm
// It is published as two loose release assets (flycast_libretro.js + .wasm,
// ~10 MB) rather than an EmulatorJS core bundle, so this script downloads them
// and packs the bundle EmulatorJS actually asks for — cores/<core>-wasm.data,
// a zip holding the js, the wasm and core.json — plus the core "report" JSON
// the frontend reads before it picks a filename. static/naomi/play.html points
// EmulatorJS at both through EJS_paths.
//
// Output is intentionally gitignored (10 MB of binaries), same policy as the
// arcade Emularity core:
//   static/naomi/core/flycast-wasm.data
//   static/naomi/core/report.json
//
// Runs as part of `deno task build`, so the deploy, the desktop builds
// (`deno task desktop:*`) and the compiled launchers (`deno task build:mac` and
// friends) all carry the core. A download failure is a warning, not a build
// break — the player then shows an actionable "run deno task naomi:core" error.

import { fromFileUrl } from "jsr:@std/path@^1.1.2";

// fromFileUrl, not URL.pathname: the latter renders file:///C:/… as "/C:/…",
// which Windows file APIs reject — build:windows runs this too.
const ROOT = new URL("../", import.meta.url);
const ROOT_PATH = fromFileUrl(ROOT);
const path = (rel: string) => fromFileUrl(new URL(rel, ROOT));

// Pinned release. Override to test a newer core without editing this file.
const TAG = Deno.env.get("CMG_FLYCAST_TAG") ?? "v1.0";
const BASE = (Deno.env.get("CMG_FLYCAST_ORIGIN") ??
  `https://github.com/nasomers/flycast-wasm/releases/download/${TAG}/`)
  .replace(/\/?$/, "/");
const FORCE = Deno.env.get("CMG_FLYCAST_FORCE_VENDOR") === "1";

const OUT_DIR = path("static/naomi/core");
const DATA_PATH = `${OUT_DIR}/flycast-wasm.data`;
const REPORT_PATH = `${OUT_DIR}/report.json`;

// Mirrors config/core.json from the flycast-wasm repo at the pinned tag.
// EmulatorJS reads this out of the bundle for the file-extension filter, the
// core name shown in its UI, and the save-state file extension.
const CORE_JSON = {
  name: "flycast",
  extensions: [
    "cdi",
    "gdi",
    "chd",
    "cue",
    "iso",
    "elf",
    "bin",
    "lst",
    "zip",
    "7z",
    "dat",
  ],
  options: {},
  save: "state",
  license: "GPLv2",
  repo: "https://github.com/flyinghead/flycast",
};

const LICENSE_TXT = [
  "Flycast WASM — a WebAssembly libretro build of Flycast with an SH4→WASM JIT.",
  "",
  `Core: https://github.com/nasomers/flycast-wasm (${TAG})`,
  "Upstream emulator: https://github.com/flyinghead/flycast",
  "",
  "Licensed under the GNU General Public License v2, inherited from Flycast.",
  "The full license text ships with both repositories.",
  "",
  "No BIOS or game content is included. Supply your own dumps.",
].join("\n");

async function exists(p: string): Promise<boolean> {
  try {
    const stat = await Deno.stat(p);
    return stat.isFile && stat.size > 0;
  } catch {
    return false;
  }
}

async function fetchBytes(url: string): Promise<Uint8Array> {
  const r = await fetch(url, { redirect: "follow" });
  if (!r.ok) throw new Error(`HTTP ${r.status} fetching ${url}`);
  return new Uint8Array(await r.arrayBuffer());
}

// ─── Minimal zip writer ────────────────────────────────────────────────────
// EmulatorJS sniffs the core bundle's magic bytes and unzips it in a worker, so
// the bundle has to be a real archive. Deflate via CompressionStream keeps the
// ~10 MB wasm at roughly a third of its size on the wire; entries that don't
// shrink are stored instead.

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

async function deflateRaw(bytes: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([bytes as BlobPart]).stream()
    .pipeThrough(new CompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

interface ZipEntry {
  name: string;
  bytes: Uint8Array;
}

async function makeZip(entries: ZipEntry[]): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const locals: Uint8Array[] = [];
  const centrals: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = encoder.encode(entry.name);
    const raw = entry.bytes;
    const deflated = await deflateRaw(raw);
    const useDeflate = deflated.length < raw.length;
    const payload = useDeflate ? deflated : raw;
    const method = useDeflate ? 8 : 0;
    const crc = crc32(raw);

    const local = new Uint8Array(30 + nameBytes.length + payload.length);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(4, 20, true); // version needed
    lv.setUint16(6, 0, true); // flags
    lv.setUint16(8, method, true);
    lv.setUint16(10, 0, true); // mod time
    lv.setUint16(12, 0x21, true); // mod date (1996-01-01, deterministic)
    lv.setUint32(14, crc, true);
    lv.setUint32(18, payload.length, true);
    lv.setUint32(22, raw.length, true);
    lv.setUint16(26, nameBytes.length, true);
    lv.setUint16(28, 0, true); // extra length
    local.set(nameBytes, 30);
    local.set(payload, 30 + nameBytes.length);
    locals.push(local);

    const central = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(central.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true); // version made by
    cv.setUint16(6, 20, true); // version needed
    cv.setUint16(8, 0, true); // flags
    cv.setUint16(10, method, true);
    cv.setUint16(12, 0, true);
    cv.setUint16(14, 0x21, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, payload.length, true);
    cv.setUint32(24, raw.length, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint32(42, offset, true);
    central.set(nameBytes, 46);
    centrals.push(central);

    offset += local.length;
  }

  const centralSize = centrals.reduce((n, c) => n + c.length, 0);
  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(8, entries.length, true);
  ev.setUint16(10, entries.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, offset, true);

  const total = offset + centralSize + end.length;
  const out = new Uint8Array(total);
  let at = 0;
  for (const chunk of [...locals, ...centrals, end]) {
    out.set(chunk, at);
    at += chunk.length;
  }
  return out;
}

// ─── Main ──────────────────────────────────────────────────────────────────

if (!FORCE && await exists(DATA_PATH) && await exists(REPORT_PATH)) {
  console.log(
    `[flycast-core] ${DATA_PATH.replace(ROOT_PATH, "")} (cached) - set ` +
      "CMG_FLYCAST_FORCE_VENDOR=1 to refetch",
  );
} else {
  try {
    console.log(`[flycast-core] fetching core from ${BASE}`);
    const [js, wasm] = await Promise.all([
      fetchBytes(`${BASE}flycast_libretro.js`),
      fetchBytes(`${BASE}flycast_libretro.wasm`),
    ]);
    const encoder = new TextEncoder();
    const zip = await makeZip([
      { name: "flycast.js", bytes: js },
      { name: "flycast.wasm", bytes: wasm },
      {
        name: "core.json",
        bytes: encoder.encode(JSON.stringify(CORE_JSON)),
      },
      { name: "license.txt", bytes: encoder.encode(LICENSE_TXT) },
    ]);

    await Deno.mkdir(OUT_DIR, { recursive: true });
    await Deno.writeFile(DATA_PATH, zip);
    // The report is what EmulatorJS reads before choosing a core filename.
    // defaultWebGL2 must be true: flycast renders through WebGL2 (the build is
    // MIN_WEBGL_VERSION=2), and a false here makes the frontend ask for a
    // "-legacy" bundle that does not exist. buildStart doubles as the core
    // cache key, so it tracks the pinned tag.
    await Deno.writeTextFile(
      REPORT_PATH,
      JSON.stringify(
        { buildStart: `flycast-${TAG}`, options: { defaultWebGL2: true } },
        null,
        2,
      ) + "\n",
    );
    const mb = (n: number) => (n / (1024 * 1024)).toFixed(1);
    console.log(
      `[flycast-core] + ${DATA_PATH.replace(ROOT_PATH, "")} — ${
        mb(zip.length)
      } MB packed from ${mb(js.length + wasm.length)} MB of core`,
    );
  } catch (e) {
    // Non-fatal on purpose: an offline build should still produce a launcher,
    // it just won't have the NAOMI core in it.
    console.warn(
      `[flycast-core] could not vendor the core: ${(e as Error).message}\n` +
        "[flycast-core] NAOMI will report the core as missing until " +
        "`deno task naomi:core` succeeds.",
    );
  }
}
