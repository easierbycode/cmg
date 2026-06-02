// Vendor EmulatorJS + dashboard fonts locally for OFFLINE binary builds
// (`deno task build:mac` / `build:linux`; future Cordova iOS/Android). The
// online Deno Deploy build does NOT run this — it keeps using the CDN, which
// already sends `Cross-Origin-Resource-Policy: cross-origin` and so loads fine
// under the app's COEP: require-corp (see main.ts).
//
// The runtime CDN<->local switch is keyed on `window.__CMG_BUNDLED`, set by the
// binary launchers (they export CMG_BUNDLED=1 → routes/index.tsx emits the flag)
// and read by static/psx/play.html + static/turbografx16/play.html. The PS2
// player (Play!) is always local, so it needs no switch.
//
// Outputs (all gitignored — present only in binary builds):
//   static/emulatorjs/data/    EmulatorJS self-host bundle + the cores in use
//   static/fonts/*.woff2       Share Tech Mono + Orbitron
//   static/fonts.css           @font-face for the above
//
// IMPORTANT: the EmulatorJS offline mirror is best-effort. Validate it by
// building a binary and launching it with NO network — if the emulator requests
// a file that 404s, add it here. Cores in use: psx → pcsx_rearmed,
// turbografx16 → mednafen_pce.

const ROOT = new URL("../", import.meta.url);
const path = (rel: string) => new URL(rel, ROOT).pathname;

const CDN = "https://cdn.emulatorjs.org/stable/data/";
// EmulatorJS downloads cores on demand from the CDN; mirror the two we use.
const CORES = ["pcsx_rearmed-wasm.data", "mednafen_pce-wasm.data"];

const FONT_CSS_URL =
  "https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@500;700;800&display=swap";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function sh(cmd: string, args: string[]): Promise<void> {
  const out = await new Deno.Command(cmd, {
    args,
    stdout: "inherit",
    stderr: "inherit",
  }).output();
  if (!out.success) throw new Error(`\`${cmd} ${args.join(" ")}\` failed`);
}

async function fetchTo(url: string, destPath: string): Promise<void> {
  const r = await fetch(url, { headers: { "User-Agent": UA } });
  if (!r.ok) throw new Error(`HTTP ${r.status} fetching ${url}`);
  await Deno.mkdir(destPath.slice(0, destPath.lastIndexOf("/")), {
    recursive: true,
  });
  await Deno.writeFile(destPath, new Uint8Array(await r.arrayBuffer()));
  console.log(`  ✓ ${destPath.replace(ROOT.pathname, "")}`);
}

// 1. EmulatorJS self-host bundle — sparse-checkout just the repo's data/ folder
//    (loader.js, emulator.min.js/.css, localization, compression workers, …).
console.log("[vendor] EmulatorJS data/ (git sparse checkout) …");
const tmp = await Deno.makeTempDir({ prefix: "ejs-" });
try {
  await sh("git", [
    "clone",
    "--depth",
    "1",
    "--filter=blob:none",
    "--sparse",
    "https://github.com/EmulatorJS/EmulatorJS",
    tmp,
  ]);
  await sh("git", ["-C", tmp, "sparse-checkout", "set", "data"]);
  await Deno.mkdir(path("static/emulatorjs/data"), { recursive: true });
  await sh("cp", ["-R", `${tmp}/data/.`, path("static/emulatorjs/data")]);
} finally {
  await Deno.remove(tmp, { recursive: true }).catch(() => {});
}

// 2. Cores (not committed to the EmulatorJS repo — mirror from the CDN).
console.log("[vendor] cores …");
for (const c of CORES) {
  await fetchTo(CDN + "cores/" + c, path(`static/emulatorjs/data/cores/${c}`));
}

// 3. Fonts — resolve the Google Fonts CSS, download each woff2, rewrite the CSS
//    to local paths so the dashboard renders offline (see routes/index.tsx).
console.log("[vendor] fonts …");
const cssRes = await fetch(FONT_CSS_URL, { headers: { "User-Agent": UA } });
if (!cssRes.ok) throw new Error(`HTTP ${cssRes.status} fetching font CSS`);
let css = await cssRes.text();
const urlRe = /url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)/g;
const seen = new Map<string, string>();
let m: RegExpExecArray | null;
let i = 0;
while ((m = urlRe.exec(css)) !== null) {
  const u = m[1];
  if (!seen.has(u)) {
    const name = `font-${i++}.woff2`;
    await fetchTo(u, path(`static/fonts/${name}`));
    seen.set(u, name);
  }
}
for (const [u, name] of seen) css = css.replaceAll(u, `/fonts/${name}`);
await Deno.writeTextFile(path("static/fonts.css"), css);
console.log(
  `[vendor] done — ${seen.size} font file(s) + fonts.css, EmulatorJS data + ${CORES.length} cores.`,
);
