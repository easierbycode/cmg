// Auto-icon pipeline — give every launcher row a picture, headlessly.
//
//   deno task icons:auto --list
//   deno task icons:auto                          # catalog games missing an icon
//   deno task icons:auto --game games/2028-ai --write
//   deno task icons:auto --systems nes,psx
//   deno task icons:auto --catalog --systems all  # both jobs in one run
//
// Two jobs, runnable together or separately:
//
// Job 1 — catalog games (data/games.json). Boots each game headless via
// tools/game-recorder/record/icon.ts (same virtual-clock injection as the
// recorder, so WebGL canvases are readable), steps a few seconds past the
// splash, and writes one gameplay frame to static/icons/auto/<slug>.png.
// With --write the entry's "icon" is set in data/games.json — by careful
// per-line string edit, preserving the file's one-object-per-line layout.
// Demos (data/demos.json) are icon-less by design and never touched.
// Capturing needs the games served: run `deno task dev`, or point
// CMG_ORIGIN at a deploy (e.g. https://cmg.easierbycode.deno.net).
//
// Job 2 — console systems (static/<SystemDir>/manifest.json). Fetches
// boxart from libretro-thumbnails through lib/cover-art.ts: the exact
// No-Intro/Redump candidates first, then one shelf-listing request per
// system dir with a fuzzy match — the same 3-tier order RetroArch uses
// (mirrors POST /api/icons/fetch). Hits land in
// static/<SystemDir>/covers/<rom>.png; re-run the matching
// `deno task <sys>:manifest` afterwards so the manifest picks them up.
// Switch has no libretro shelf and is reported as skipped.

import { parseArgs } from "@std/cli/parse-args";
import { ensureDir } from "@std/fs";
import { captureIconPng } from "../tools/game-recorder/record/icon.ts";
import { resolveScene } from "../tools/game-recorder/record/scenes.ts";
import {
  coverCandidates,
  coverIndexUrls,
  type CoverSystem,
  matchCoverFromIndex,
  stripRomExt,
} from "../lib/cover-art.ts";

// ---------------------------------------------------------------- catalog --

/** The data/games.json entry fields this pipeline reads. */
interface GameEntry {
  id: string;
  name?: string;
  icon?: string | null;
  url?: string;
  /** Dashboard seed rows carry this; a catalog row with it has no game. */
  submenu?: boolean;
}

/** A static/<SystemDir>/manifest.json row (see build-*-manifest.ts). */
interface RomEntry {
  file: string;
  name: string;
  /** PS2 "web" rows are browser builds, not discs — no boxart exists. */
  kind?: string;
}

/** system → static dir + the deno task that rebuilds its manifest. */
const SYSTEMS: Record<CoverSystem, { dir: string; task: string }> = {
  nes: { dir: "Nintendo", task: "nes:manifest" },
  tg16: { dir: "TurboGrafx-16", task: "tg16:manifest" },
  psx: { dir: "PlayStation", task: "psx:manifest" },
  ps2: { dir: "PlayStation2", task: "ps2:manifest" },
  saturn: { dir: "SegaSaturn", task: "saturn:manifest" },
  naomi: { dir: "Naomi", task: "naomi:manifest" },
  arcade: { dir: "arcade", task: "arcade:manifest" },
  switch: { dir: "NintendoSwitch", task: "switch:manifest" },
};

const repoRoot = new URL("../", import.meta.url);
const gamesJsonUrl = new URL("data/games.json", repoRoot);
const staticUrl = new URL("static/", repoRoot);
const autoIconsDir = new URL("icons/auto/", staticUrl);

const cmgOrigin = () => Deno.env.get("CMG_ORIGIN") ?? "http://localhost:5173";

/** Ids carry slashes and query strings; file names can't (as scenes.ts). */
const slugify = (id: string) =>
  id.replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-|-$/g, "");

/** Why a catalog entry is not capturable — or null when it is. */
function skipReason(e: GameEntry): string | null {
  if (e.submenu || /^__.+__$/.test(e.id)) {
    return "submenu entry, no playable target";
  }
  const path = (e.url ?? e.id).split("?")[0];
  if (/(^|\/)ps2(\/|$)/.test(path)) return "PS2 player, use --systems ps2";
  if (/(^|\/)switch(\/|$)/.test(path)) return "Switch player, no auto icon";
  return null;
}

async function fileExists(url: URL): Promise<boolean> {
  try {
    return (await Deno.stat(url)).isFile;
  } catch {
    return false;
  }
}

async function readGames(): Promise<{ text: string; entries: GameEntry[] }> {
  const text = await Deno.readTextFile(gamesJsonUrl);
  return { text, entries: JSON.parse(text) as GameEntry[] };
}

// Set "icon" on the one line holding this entry, keeping everything else
// byte-for-byte: replace an existing "icon" value, else slot the pair in
// after "sub" (the field order every row uses) or "name".
function setIconOnLine(line: string, icon: string): string | null {
  const value = JSON.stringify(icon);
  const iconRe = /("icon":\s*)(null|"(?:[^"\\]|\\.)*")/;
  if (iconRe.test(line)) return line.replace(iconRe, `$1${value}`);
  for (const key of ["sub", "name"]) {
    const re = new RegExp(`("${key}":\\s*"(?:[^"\\\\]|\\\\.)*")`);
    if (re.test(line)) return line.replace(re, `$1, "icon": ${value}`);
  }
  return null;
}

function applyIconEdits(
  text: string,
  updates: Array<{ id: string; icon: string }>,
): { text: string; failed: string[] } {
  const lines = text.split("\n");
  const failed: string[] = [];
  for (const { id, icon } of updates) {
    const needle = `"id": ${JSON.stringify(id)}`;
    const i = lines.findIndex((l) => l.includes(needle));
    const edited = i >= 0 ? setIconOnLine(lines[i], icon) : null;
    if (edited == null) failed.push(id);
    else lines[i] = edited;
  }
  return { text: lines.join("\n"), failed };
}

// ------------------------------------------------------------------ covers --

const FETCH_TIMEOUT_MS = 20_000;

async function fetchPng(url: string): Promise<Uint8Array | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) {
      await res.body?.cancel();
      return null;
    }
    const bytes = new Uint8Array(await res.arrayBuffer());
    return bytes.length > 8 ? bytes : null;
  } catch {
    return null;
  }
}

// Apache autoindex → the .png file names it links.
function parseIndexListing(html: string): string[] {
  const out: string[] = [];
  for (const m of html.matchAll(/href="([^"]+\.png)"/gi)) {
    try {
      out.push(decodeURIComponent(m[1]));
    } catch {
      out.push(m[1]);
    }
  }
  return out;
}

// One listing fetch per shelf per run, shared across every game and system
// (NAOMI and Dreamcast overlap, and concurrent lookups dedupe on the promise).
const shelfCache = new Map<string, Promise<string[]>>();
function shelfIndex(indexUrl: string): Promise<string[]> {
  let p = shelfCache.get(indexUrl);
  if (!p) {
    p = (async () => {
      const res = await fetch(indexUrl, {
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS * 3),
      });
      if (!res.ok) {
        await res.body?.cancel();
        return [];
      }
      return parseIndexListing(await res.text());
    })().catch(() => [] as string[]);
    shelfCache.set(indexUrl, p);
  }
  return p;
}

async function findCover(
  system: CoverSystem,
  game: { name?: string; file?: string },
): Promise<{ bytes: Uint8Array; source: string } | null> {
  for (const url of coverCandidates(system, game)) {
    const bytes = await fetchPng(url);
    if (bytes) return { bytes, source: url };
  }
  for (const indexUrl of coverIndexUrls(system)) {
    const entry = matchCoverFromIndex(await shelfIndex(indexUrl), game);
    if (!entry) continue;
    const bytes = await fetchPng(indexUrl + encodeURIComponent(entry));
    if (bytes) return { bytes, source: indexUrl + entry };
  }
  return null;
}

/** Run fn over items with at most `limit` in flight. */
async function mapLimit<T>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<void>,
): Promise<void> {
  const queue = [...items];
  const workers = Array.from(
    { length: Math.max(1, Math.min(limit, queue.length)) },
    async () => {
      while (queue.length) await fn(queue.shift()!);
    },
  );
  await Promise.all(workers);
}

// --------------------------------------------------------------------- CLI --

const args = parseArgs(Deno.args, {
  string: [
    "game",
    "systems",
    "chrome",
    "max-dim",
    "advance-ms",
    "concurrency",
  ],
  boolean: [
    "help",
    "list",
    "dry-run",
    "force",
    "write",
    "no-sandbox",
    "catalog",
  ],
  collect: ["game"],
});

function usage(): void {
  console.log(
    `auto-icons — headless icon + boxart pipeline for the CMG launcher

Usage:
  deno task icons:auto --list
  deno task icons:auto [--game <id>...] [--write] [options]
  deno task icons:auto --systems <list|all> [options]

Job selection:
  (default)          job 1: capture catalog games missing an "icon"
  --game <id>        job 1 for these ids only (repeatable or comma-separated)
  --systems <list>   job 2: nes,tg16,psx,ps2,saturn,naomi,arcade — or all
  --catalog          force job 1 alongside --systems

Options:
  --list             show catalog icon status + per-system cover coverage
  --write            job 1: set "icon" in data/games.json for captured games
  --force            job 1: recapture even when an icon is set;
                     job 2: refetch covers that already exist on disk
  --dry-run          print what would happen; no captures, no fetches
  --advance-ms <n>   virtual time stepped past the splash (default 4000)
  --max-dim <n>      downscale the longest side (default 512; 0 = native)
  --concurrency <n>  parallel cover fetches (default 4, max 8)
  --chrome <path>    use an installed Chrome (skips astral's download)
  --no-sandbox       pass --no-sandbox to Chrome

Env: CMG_ORIGIN (where /games/* routes are served, default
http://localhost:5173) — must answer before job 1 captures; CMG_EXTERNAL_BASE,
RECORD_CHROME. Demos (data/demos.json) are icon-less by design and skipped.
After job 2 adds covers, re-run the matching \`deno task <sys>:manifest\`.`,
  );
}

if (args.help) {
  usage();
  Deno.exit(0);
}

function num(flag: string, dflt: number): number {
  const v = args[flag as "max-dim"] as string | undefined;
  if (v == null) return dflt;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) {
    console.error(`invalid --${flag}: ${v}`);
    Deno.exit(1);
  }
  return n;
}

const wantGames = (args.game as string[])
  .flatMap((g) => g.split(","))
  .map((g) => g.trim())
  .filter(Boolean);
const maxDim = num("max-dim", 512);
const advanceMs = num("advance-ms", 4000);
const concurrency = Math.min(8, num("concurrency", 4));
const chromePath = args.chrome ?? Deno.env.get("RECORD_CHROME");
const chromeArgs = args["no-sandbox"] ? ["--no-sandbox"] : [];

// -------------------------------------------------------------------- list --

async function coverPathFor(sys: CoverSystem, rom: RomEntry): Promise<{
  url: URL;
  rel: string;
  exists: boolean;
}> {
  const base = stripRomExt(rom.file);
  const url = new URL(
    `${SYSTEMS[sys].dir}/covers/${encodeURIComponent(base)}.png`,
    staticUrl,
  );
  return {
    url,
    rel: `static/${SYSTEMS[sys].dir}/covers/${base}.png`,
    exists: await fileExists(url),
  };
}

async function readSystemManifest(
  sys: CoverSystem,
): Promise<RomEntry[] | null> {
  try {
    const url = new URL(`${SYSTEMS[sys].dir}/manifest.json`, staticUrl);
    return JSON.parse(await Deno.readTextFile(url)) as RomEntry[];
  } catch {
    return null;
  }
}

if (args.list) {
  const { entries } = await readGames();
  console.log("━━ catalog (data/games.json) ━━");
  for (const e of entries) {
    const skip = skipReason(e);
    const status = skip
      ? `skip (${skip})`
      : e.icon
      ? `icon ${e.icon}`
      : "icon — (would capture)";
    console.log(`  ${e.id.padEnd(52)} ${status}`);
  }
  console.log("\n━━ console cover coverage ━━");
  for (const sys of Object.keys(SYSTEMS) as CoverSystem[]) {
    const roms = await readSystemManifest(sys);
    if (!roms) {
      console.log(
        `  ${sys.padEnd(8)} ${SYSTEMS[sys].dir.padEnd(16)} no manifest.json`,
      );
      continue;
    }
    let have = 0;
    for (const rom of roms) {
      if ((await coverPathFor(sys, rom)).exists) have++;
    }
    const note = sys === "switch" && roms.length
      ? "  (no libretro coverage)"
      : "";
    console.log(
      `  ${sys.padEnd(8)} ${SYSTEMS[sys].dir.padEnd(16)} ` +
        `${String(roms.length).padStart(3)} rom(s), ${have} cover(s)${note}`,
    );
  }
  Deno.exit(0);
}

// ------------------------------------------------------------------- job 1 --

const wantSystems: CoverSystem[] | null = (() => {
  if (!args.systems) return null;
  const names = args.systems === "all"
    ? (Object.keys(SYSTEMS) as CoverSystem[])
    : args.systems.split(",").map((s) => s.trim()).filter(Boolean);
  for (const n of names) {
    if (!(n in SYSTEMS)) {
      console.error(
        `unknown system "${n}" — valid: ${Object.keys(SYSTEMS).join(", ")}`,
      );
      Deno.exit(1);
    }
  }
  return names as CoverSystem[];
})();

const runCatalog = args.catalog || wantGames.length > 0 || wantSystems == null;
let softFailures = 0;

if (runCatalog) {
  console.log("━━ job 1: catalog icons ━━");
  const { text, entries } = await readGames();
  const byId = new Map(entries.map((e) => [e.id, e]));

  const targets: GameEntry[] = [];
  if (wantGames.length) {
    for (const id of wantGames) {
      const e = byId.get(id);
      if (!e) {
        console.error(
          `  ${id}: not in data/games.json (demos are icon-less by design)`,
        );
        softFailures++;
        continue;
      }
      targets.push(e);
    }
  } else {
    targets.push(...entries.filter((e) => args.force || !e.icon));
  }

  const capturable = targets.filter((e) => {
    const skip = skipReason(e);
    if (skip) console.log(`  ${e.id}: skipped — ${skip}`);
    return !skip;
  });

  if (!capturable.length) {
    console.log("  nothing to capture — every selected entry has an icon");
  } else if (args["dry-run"]) {
    for (const e of capturable) {
      const spec = await resolveScene({ game: e.id }).catch(() => null);
      console.log(
        `  would capture ${e.id} → static/icons/auto/${slugify(e.id)}.png` +
          (spec ? ` (from ${spec.url})` : " (unresolvable!)"),
      );
    }
  } else {
    // Resolve everything first so the origin preflight sees the real URLs.
    const specs: Array<{
      entry: GameEntry;
      spec: Awaited<ReturnType<typeof resolveScene>>;
    }> = [];
    for (const entry of capturable) {
      try {
        specs.push({ entry, spec: await resolveScene({ game: entry.id }) });
      } catch (e) {
        console.error(`  ${entry.id}: ${(e as Error).message}`);
        softFailures++;
      }
    }

    const origin = cmgOrigin();
    if (specs.some(({ spec }) => spec.url.startsWith(origin))) {
      let alive = false;
      for (const path of ["/games.manifest.json", "/"]) {
        try {
          const res = await fetch(origin + path, {
            signal: AbortSignal.timeout(5000),
          });
          await res.body?.cancel();
          if (res.ok) {
            alive = true;
            break;
          }
        } catch {
          // try the next path
        }
      }
      if (!alive) {
        console.error(
          `cannot reach ${origin} — start the dev server (deno task dev) ` +
            `or point CMG_ORIGIN at a deploy, e.g. ` +
            `CMG_ORIGIN=https://cmg.easierbycode.deno.net`,
        );
        Deno.exit(1);
      }
    }

    await ensureDir(autoIconsDir);
    const captured: Array<{ id: string; icon: string }> = [];
    for (const { entry, spec } of specs) {
      const slug = slugify(entry.id);
      const rel = `static/icons/auto/${slug}.png`;
      console.log(`  capturing ${entry.id} → ${rel}`);
      try {
        const result = await captureIconPng({
          url: spec.url,
          width: spec.width,
          height: spec.height,
          settleMs: spec.settleMs,
          startWhen: spec.startWhen,
          advanceMs,
          maxDim,
          chromePath,
          chromeArgs,
        });
        await Deno.writeFile(new URL(`${slug}.png`, autoIconsDir), result.png);
        console.log(
          `    ${result.width}x${result.height} (${result.source})`,
        );
        captured.push({ id: entry.id, icon: `/icons/auto/${slug}.png` });
      } catch (e) {
        console.error(`    failed: ${(e as Error).message}`);
        softFailures++;
      }
    }

    if (captured.length && args.write) {
      const { text: edited, failed } = applyIconEdits(text, captured);
      for (const id of failed) {
        console.error(`  could not edit the games.json line for ${id}`);
        softFailures++;
      }
      try {
        JSON.parse(edited); // never write a games.json that doesn't parse
      } catch (e) {
        console.error(
          `  edited games.json no longer parses (${(e as Error).message}) — ` +
            `not writing`,
        );
        Deno.exit(1);
      }
      await Deno.writeTextFile(gamesJsonUrl, edited);
      console.log(
        `  data/games.json: set "icon" on ${
          captured.length - failed.length
        } entr${captured.length - failed.length === 1 ? "y" : "ies"}`,
      );
    } else if (captured.length) {
      for (const c of captured) {
        console.log(`  would set "icon": "${c.icon}" on ${c.id}`);
      }
      console.log("  (re-run with --write to update data/games.json)");
    }
  }
}

// ------------------------------------------------------------------- job 2 --

if (wantSystems) {
  for (const sys of wantSystems) {
    const { dir, task } = SYSTEMS[sys];
    console.log(`\n━━ job 2: ${sys} covers (static/${dir}) ━━`);
    const roms = await readSystemManifest(sys);
    if (!roms) {
      console.error(
        `  static/${dir}/manifest.json missing — run deno task ${task} first`,
      );
      softFailures++;
      continue;
    }
    if (!roms.length) {
      console.log("  manifest is empty — nothing to fetch");
      continue;
    }
    if (!coverCandidates(sys, { name: "x", file: "x.bin" }).length) {
      console.log(
        `  skipped — no libretro coverage for ${sys} (${roms.length} rom(s))`,
      );
      continue;
    }

    let present = 0;
    const misses: string[] = [];
    let hits = 0;
    const pending: Array<{ rom: RomEntry; out: URL; rel: string }> = [];
    for (const rom of roms) {
      if (rom.kind === "web") continue; // browser build, no disc art exists
      const cover = await coverPathFor(sys, rom);
      if (cover.exists && !args.force) {
        present++;
        continue;
      }
      pending.push({ rom, out: cover.url, rel: cover.rel });
    }

    if (args["dry-run"]) {
      for (const p of pending) {
        console.log(`  would fetch cover for "${p.rom.name}" → ${p.rel}`);
      }
      console.log(`  ${present} already present, ${pending.length} to fetch`);
      continue;
    }

    if (pending.length) {
      await ensureDir(new URL(`${dir}/covers/`, staticUrl));
    }
    await mapLimit(pending, concurrency, async ({ rom, out, rel }) => {
      const hit = await findCover(sys, { name: rom.name, file: rom.file });
      if (!hit) {
        misses.push(rom.name);
        return;
      }
      await Deno.writeFile(out, hit.bytes);
      hits++;
      console.log(`  ${rel}  ←  ${hit.source}`);
    });

    console.log(
      `  [${sys}] ${hits} hit(s), ${misses.length} miss(es), ` +
        `${present} already present`,
    );
    if (misses.length) console.log(`    missed: ${misses.join(", ")}`);
    if (hits) {
      console.log(
        `    covers added — re-run \`deno task ${task}\` so the manifest ` +
          `picks them up`,
      );
    }
  }
}

if (softFailures) {
  console.log(`\n${softFailures} item(s) failed — see messages above`);
}
