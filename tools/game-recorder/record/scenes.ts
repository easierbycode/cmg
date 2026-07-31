// Scene resolution against CMG's own catalog.
//
// A "scene" is anything a headless browser can load and watch. Rather than
// keeping a second list of games, this reads data/games.json and
// data/demos.json — the same files the OTA manifest is built from — so a
// game added to the launcher is immediately recordable by id, with no
// entry to duplicate here.
//
// Per-game capture behaviour (when to start, when to stop, viewport) comes
// from the optional `recorder` key on a catalog entry; anything without one
// records a fixed window after load, which is what most games want.

import { join } from "@std/path";

export interface SceneSpec {
  name: string;
  url: string;
  width: number;
  height: number;
  /**
   * JS predicate evaluated in the page. Capture begins once it is truthy —
   * a game that reports readiness (e.g. `window.__racerPhase`) can skip its
   * own boot and loading screens.
   */
  startWhen?: string;
  /** JS predicate that ends the capture, plus `tailMs` of extra footage. */
  stopWhen?: string;
  tailMs?: number;
  /** Fixed capture length when there is no stopWhen. */
  durationMs?: number;
  /** Hard cap — a capture never runs longer than this. */
  maxMs: number;
  /** Real-time grace period after load, before stepping (default 4000). */
  settleMs?: number;
}

/** The `recorder` key a catalog entry may carry. */
export interface RecorderHints {
  width?: number;
  height?: number;
  startWhen?: string;
  stopWhen?: string;
  tailMs?: number;
  durationMs?: number;
  maxMs?: number;
  settleMs?: number;
  /** Appended to the resolved URL (e.g. "?attract=1&mute=1"). */
  query?: string;
}

interface CatalogEntry {
  id: string;
  name?: string;
  url?: string;
  recorder?: RecorderHints;
}

/**
 * Where in-repo routes (`url: "/games/2028-ai"`) are served from. Defaults
 * to the local dev server; point CMG_ORIGIN at the deploy to record what
 * players actually get.
 */
const origin = () => Deno.env.get("CMG_ORIGIN") ?? "http://localhost:5173";

/** Games without an in-repo `url` are hosted per the launcher convention. */
const externalBase = () =>
  Deno.env.get("CMG_EXTERNAL_BASE") ?? "https://easierbycode.com";

/** Repo root — tools/game-recorder/record/scenes.ts → ../../.. */
const repoRoot = () => new URL("../../..", import.meta.url);

async function readCatalog(file: string): Promise<CatalogEntry[]> {
  try {
    const path = join(new URL(`data/${file}`, repoRoot()).pathname);
    // On Windows the pathname carries a leading slash before the drive.
    const text = await Deno.readTextFile(
      path.replace(/^[\\/]([A-Za-z]:)/, "$1"),
    );
    return JSON.parse(text) as CatalogEntry[];
  } catch {
    return [];
  }
}

export async function loadCatalog(): Promise<CatalogEntry[]> {
  const [games, demos] = await Promise.all([
    readCatalog("games.json"),
    readCatalog("demos.json"),
  ]);
  return [...games, ...demos];
}

/** Every recordable id, for `--list` and error messages. */
export async function listGames(): Promise<
  Array<{ id: string; name: string }>
> {
  return (await loadCatalog()).map((e) => ({ id: e.id, name: e.name ?? e.id }));
}

/** A catalog entry's playable URL, mirroring how the dashboard resolves it. */
export function entryUrl(entry: CatalogEntry): string {
  const path = entry.url ?? entry.id;
  const url = path.startsWith("http")
    ? path
    : path.startsWith("/")
    ? `${origin()}${path}`
    : `${externalBase()}/${path}`;
  return url + (entry.recorder?.query ?? "");
}

/** Turn an id (or an ad-hoc URL) into a capture spec. */
export async function resolveScene(opts: {
  game?: string;
  url?: string;
  name?: string;
  width?: number;
  height?: number;
  durationMs?: number;
}): Promise<SceneSpec> {
  if (opts.game) {
    const catalog = await loadCatalog();
    const entry = catalog.find((e) => e.id === opts.game) ??
      catalog.find((e) => e.name?.toLowerCase() === opts.game!.toLowerCase());
    if (!entry) {
      throw new Error(
        `unknown game "${opts.game}" — run with --list to see the catalog`,
      );
    }
    const r = entry.recorder ?? {};
    const durationMs = opts.durationMs ?? r.durationMs ??
      (r.stopWhen ? undefined : 20_000);
    return {
      // Ids carry slashes and query strings; file names can't.
      name: opts.name ??
        entry.id.replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-|-$/g, ""),
      url: opts.url ?? entryUrl(entry),
      width: opts.width ?? r.width ?? 1280,
      height: opts.height ?? r.height ?? 960,
      startWhen: r.startWhen,
      stopWhen: r.stopWhen,
      tailMs: r.tailMs,
      settleMs: r.settleMs,
      durationMs,
      maxMs: r.maxMs ?? Math.max((durationMs ?? 20_000) * 2, 45_000),
    };
  }

  if (!opts.url) {
    throw new Error("pass --game <id> or --url <page> (or --list)");
  }
  const durationMs = opts.durationMs ?? 15_000;
  return {
    name: opts.name ?? "ad-hoc",
    url: opts.url,
    width: opts.width ?? 1280,
    height: opts.height ?? 960,
    durationMs,
    maxMs: durationMs * 2 + 15_000,
  };
}
