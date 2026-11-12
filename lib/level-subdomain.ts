// Level subdomains: `<name>.<site>` is the game called <name>.
//
// A visit to the ROOT of a subdomain is routed by its label (main.ts, ahead
// of the dashboard route):
//
//   sfex2.<site>/           -> /arcade/play.html?rom=sfex2.zip&bios=…   (an
//                              arcade board the build ships: MAME, straight in)
//   2019-ps2.<site>/        -> /games/2028-ai?level=2019-PS2   (a cloud game
//                              that exists: straight in, the way ?level= does)
//   anything-else.<site>/   -> /editor/?new=anything-else      (neither: the
//                              level editor's NEW GAME, named for the label)
//
// Only the root is redirected. Every other path on a subdomain serves as the
// apex does, which is what lets the redirect be relative: the game page and
// its bundle load from the same host the visitor typed.
//
// <site> is whichever host the launcher is served on that can HAVE subdomains.
// The deploy's own URL cannot (nothing resolves under
// cmg.easierbycode.deno.net), so the list comes from the environment:
// CMG_SITE_HOSTS, comma-separated apex hosts (`*.example.com` is read as
// `example.com`). `localhost` is always on it, so `gs.localhost:5173/` works in
// a checkout (`deno task dev`, `deno task start`) with nothing set.
//
// ARCADE BOARDS come first. They are the MAME romsets in static/arcade/, listed
// by the manifest the build generates (scripts/build-arcade-manifest.ts) and
// named by their MAME short name: sfex2.<site> is Street Fighter EX2. The
// redirect is the URL the dashboard's own launchArcade builds — the romset's
// zip and the BIOS sets it needs — so the board boots the same way from either.
// The list ships inside the build, so a board answers without the database
// being asked at all: instantly, offline in a packaged launcher, and out of
// reach of anyone saving a cloud game under its name. The price is the other
// direction: a romset added later takes its short name's subdomain from a
// cloud game of the same name, which is then reached by ?level= or an alias.
// BIOS sets are not games and are not on the list.
//
// A cloud game is looked up by name (RTDB `levels/*`, the same keys the level
// loader reads with ?level= and the editor's SAVE GAME writes).
// Hostnames are case-insensitive and RTDB keys are not — the game is stored as
// `2019-PS2` — so the label is matched exactly first, then lowercased against
// every key's lowercase (sorted, so a tie such as `ramsie`/`Ramsie` resolves
// the same way every time). A key the DNS could never spell (a space, an
// underscore, an apostrophe) is reached by its slug: every run of such
// characters becomes one hyphen, so master-arena-mod.<site> is the game stored
// as `Master Arena Mod` (levelSlug). The slug is the game's own name, so it
// ranks above an alias.
//
// A game can also answer to ALIASES: other labels that name the same game, so
// 2019.<site> and streetfighter.<site> both open 2019-PS2. They live in one
// small index beside the games, RTDB `levelAliases/<alias>` = the game's key,
// written by `deno task level:alias` (scripts/level-alias.ts). An alias is a
// lowercase DNS label and never wins over a game's own key: a game called
// `2019` would answer to 2019 first. The redirect hands the game the key the
// alias stands for, so the level loader never has to know the alias.
//
// The key list comes from one shallow REST read, cached for a minute the way
// /characters caches its listing. When the database cannot be read at all the
// label is sent to the GAME, not the editor: a shared link to a real game is
// the common case, and the loader's own fallback is a better failure than a
// stranger's editor opening over a name that exists. The alias index failing
// on its own is the same doubt, about fewer names: a label no game owns might
// still be an alias nobody can check, so it goes to the game as well, rather
// than offer NEW GAME under a name that a save would then take from the alias.

export const DEFAULT_SITE_HOSTS: readonly string[] = ["localhost"];

/** The variable a deployment names its apex host(s) in. */
export const SITE_HOSTS_ENV = "CMG_SITE_HOSTS";

/** Labels that are the apex under another name, never a game. */
export const RESERVED_SUBDOMAINS: ReadonlySet<string> = new Set(["www"]);

// The same base /characters reads (routes/characters/index.ts), so one
// CHARACTERS_DB points a deployment's every cloud lookup at another database.
export const LEVELS_DB = Deno.env.get("CHARACTERS_DB") ??
  "https://evil-invaders-default-rtdb.firebaseio.com";
export const LEVELS_PATH = "levels";
export const ALIASES_PATH = "levelAliases";
export const KEYS_CACHE_MS = 60_000;

export const GAME_URL = "/games/2028-ai";
export const NEW_GAME_URL = "/editor/";
// The MAME player, as the dashboard opens it (svelte-src/Dashboard.svelte
// launchArcade): ?rom=<the romset's zip>&bios=<its BIOS sets, comma-joined>.
export const ARCADE_URL = "/arcade/play.html";

// One DNS label: letters, digits and inner hyphens, 63 chars at most.
const LABEL_RE = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

/** The hostname a Host (or X-Forwarded-Host) value names: no port, lowercased. */
export function hostnameOf(hostHeader: string | null | undefined): string {
  if (!hostHeader) return "";
  const first = hostHeader.split(",")[0].trim().toLowerCase();
  if (first.startsWith("[")) return first.slice(1, first.indexOf("]"));
  const colon = first.lastIndexOf(":");
  const host = colon > 0 && !first.slice(colon + 1).includes(":")
    ? first.slice(0, colon)
    : first;
  // The root's own dot (`gs.example.com.`) names the same host.
  return host.endsWith(".") ? host.slice(0, -1) : host;
}

/**
 * The apex hosts whose subdomains are games: what CMG_SITE_HOSTS lists (commas
 * or spaces between them; a port, a case or a leading `*.` is looked past),
 * then the defaults. `configured` is injectable for tests; left out, it is read
 * from the environment on every call, so a launcher started with the variable
 * set picks it up without a rebuild.
 */
export function siteHosts(configured?: string | null): string[] {
  const raw = configured !== undefined ? configured : envSiteHosts();
  const hosts: string[] = [];
  for (const entry of (raw ?? "").split(/[\s,]+/)) {
    const host = hostnameOf(entry.replace(/^\*\./, ""));
    if (host && !hosts.includes(host)) hosts.push(host);
  }
  for (const host of DEFAULT_SITE_HOSTS) {
    if (!hosts.includes(host)) hosts.push(host);
  }
  return hosts;
}

function envSiteHosts(): string | null {
  try {
    return Deno.env.get(SITE_HOSTS_ENV) ?? null;
  } catch {
    // No env permission: the defaults are all there is.
    return null;
  }
}

/**
 * The game label a host names, or null: an apex itself, `www`, a host that is
 * not one of ours (a LAN address, the app's own deno.net URL), or a label that
 * is nested (`a.b.example.com`) all answer null. The longest site is tried
 * first, so with both `example.com` and `play.example.com` listed,
 * gs.play.example.com is `gs` under the second and not a nested label under
 * the first.
 */
export function subdomainOf(
  hostHeader: string | null | undefined,
  sites: readonly string[] = siteHosts(),
): string | null {
  const host = hostnameOf(hostHeader);
  if (!host || sites.includes(host)) return null;
  for (const site of [...sites].sort((a, b) => b.length - a.length)) {
    if (!host.endsWith("." + site)) continue;
    const label = host.slice(0, -(site.length + 1));
    if (
      label.includes(".") || RESERVED_SUBDOMAINS.has(label) ||
      !LABEL_RE.test(label)
    ) return null;
    return label;
  }
  return null;
}

/** One arcade board the build ships: a row of static/arcade/manifest.json. */
export interface ArcadeGame {
  /** The MAME short name, which is also its subdomain: `sfex2`. */
  rom: string;
  /** The romset's file in static/arcade/, which the player is handed. */
  file: string;
  /** The BIOS / device sets it needs mounted beside it. */
  bios: readonly string[];
}

/**
 * The boards in an arcade manifest (static/arcade/manifest.json, whatever it
 * holds on this build). A row without a short name and a file is dropped
 * rather than trusted, and anything that is not a list is no boards.
 */
export function arcadeGames(manifest: unknown): ArcadeGame[] {
  if (!Array.isArray(manifest)) return [];
  const games: ArcadeGame[] = [];
  for (const row of manifest) {
    if (!row || typeof row !== "object") continue;
    const { rom, file, bios } = row as Record<string, unknown>;
    if (typeof rom !== "string" || !rom) continue;
    if (typeof file !== "string" || !file) continue;
    games.push({
      rom,
      file,
      bios: Array.isArray(bios)
        ? bios.filter((b): b is string => typeof b === "string" && b !== "")
        : [],
    });
  }
  return games;
}

/**
 * The board a label names, or null: by its short name exactly, then by case,
 * then by slug (a romset called `sf_alpha` is `sf-alpha`), the way a cloud
 * game's key is found — matchLevelKey, with no aliases.
 */
export function matchArcadeGame(
  label: string,
  games: readonly ArcadeGame[],
): ArcadeGame | null {
  const rom = matchLevelKey(label, games.map((g) => g.rom));
  return rom === null ? null : games.find((g) => g.rom === rom) ?? null;
}

/** Alias name -> the level key it stands for. */
export type LevelAliases = Readonly<Record<string, string>>;

/** An alias is spelled the way a subdomain label is: one lowercase DNS label. */
export function isAliasName(name: string): boolean {
  return LABEL_RE.test(name) && !RESERVED_SUBDOMAINS.has(name);
}

/**
 * How a key is spelled as a DNS label: lowercase, every run of characters a
 * hostname cannot hold (a space, an underscore, a dot...) one hyphen, none at
 * the ends. `Master Arena Mod` is `master-arena-mod`. "" when nothing is left.
 */
export function levelSlug(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

/**
 * The stored key a label stands for: exact, then by case, then by slug (the
 * key as a label, levelSlug), then an alias whose game still exists, else
 * null. A game's own name, however it is spelled, beats an alias.
 */
export function matchLevelKey(
  label: string,
  keys: readonly string[],
  aliases: LevelAliases = {},
): string | null {
  if (keys.includes(label)) return label;
  const wanted = label.toLowerCase();
  const candidates = keys.filter((k) => k.toLowerCase() === wanted).sort();
  if (candidates.length) return candidates[0];
  const slugged = wanted
    ? keys.filter((k) => levelSlug(k) === wanted).sort()
    : [];
  if (slugged.length) return slugged[0];
  const aliased = Object.hasOwn(aliases, wanted) ? aliases[wanted] : undefined;
  return typeof aliased === "string" && keys.includes(aliased) ? aliased : null;
}

/**
 * What making `wanted` aliases of `level` would write to the index, or why it
 * cannot: the game must exist (found the way a subdomain finds it), each alias
 * must be a label, a label no game owns (the game would always win it) and not
 * one another game already answers to (taken back explicitly, with --remove,
 * never silently). An alias the game already has is skipped. `arcade` is the
 * boards a build ships, when the caller knows them: a board's name is refused
 * too, since its subdomain goes to the board and the alias would never be
 * asked.
 */
export function planAliases(
  level: string,
  wanted: readonly string[],
  keys: readonly string[],
  aliases: LevelAliases,
  arcade: readonly ArcadeGame[] = [],
): { key: string | null; set: Record<string, string>; errors: string[] } {
  const key = matchLevelKey(level, keys);
  const set: Record<string, string> = {};
  const errors: string[] = [];
  if (key === null) {
    return { key, set, errors: [`no game is called "${level}"`] };
  }
  for (const raw of wanted) {
    const name = raw.trim().toLowerCase();
    const held = Object.hasOwn(aliases, name) ? aliases[name] : undefined;
    if (!isAliasName(name)) {
      errors.push(
        `"${raw}" is not an alias: letters, digits and inner hyphens, as in a subdomain`,
      );
    } else if (
      keys.some((k) => k.toLowerCase() === name || levelSlug(k) === name)
    ) {
      errors.push(`"${name}" is already a game's own name`);
    } else if (matchArcadeGame(name, arcade) !== null) {
      errors.push(
        `"${name}" is an arcade board: its subdomain opens the board`,
      );
    } else if (held !== undefined && held !== key) {
      errors.push(`"${name}" already names "${held}"`);
    } else if (held !== key) {
      set[name] = key;
    }
  }
  return { key, set, errors };
}

// What the label decides, whichever way it goes: which game (`level`, `new`)
// or which board (`rom`, its `bios`, and `byob`, which would have the player
// wait for a board nobody is going to hand it). One the visitor typed as well
// is never carried: the host already said which.
const DECIDED_PARAMS: ReadonlySet<string> = new Set([
  "level",
  "new",
  "rom",
  "bios",
  "byob",
]);

/**
 * `path?name=value…`, then every parameter of the visitor's own query that the
 * label has not already decided: gs.<site>/?god=1 is the game with god mode
 * on, the way /games/2028-ai?level=gs&god=1 is.
 */
function withQuery(
  path: string,
  decided: ReadonlyArray<readonly [string, string]>,
  search: string,
): string {
  const params = new URLSearchParams();
  for (const [name, value] of decided) params.set(name, value);
  for (const [k, v] of new URLSearchParams(search)) {
    if (!DECIDED_PARAMS.has(k)) params.append(k, v);
  }
  return `${path}?${params.toString()}`;
}

/** The player's URL for a board, spelled the way the dashboard spells it. */
function arcadeTarget(game: ArcadeGame, search: string): string {
  const decided: Array<readonly [string, string]> = [["rom", game.file]];
  if (game.bios.length) decided.push(["bios", game.bios.join(",")]);
  return withQuery(ARCADE_URL, decided, search);
}

/**
 * Where a subdomain's root goes. `arcade` is the boards the build ships, asked
 * first and without the other two mattering. `keys` null means the game
 * listing could not be read, and `aliases` null that the alias index could not
 * ({} is an index that was read and is empty). Either way a label nothing
 * matched is not known to be free, so it goes to the game; only with both read
 * is it a NEW GAME. `search` is the visitor's own query, carried along
 * (withQuery).
 */
export function subdomainTarget(
  label: string,
  keys: readonly string[] | null,
  aliases: LevelAliases | null = {},
  search = "",
  arcade: readonly ArcadeGame[] = [],
): string {
  const board = matchArcadeGame(label, arcade);
  if (board !== null) return arcadeTarget(board, search);
  const known = aliases ?? {};
  if (keys === null) {
    const aliased = Object.hasOwn(known, label) ? known[label] : label;
    return withQuery(GAME_URL, [["level", aliased]], search);
  }
  const key = matchLevelKey(label, keys, known);
  if (key !== null) return withQuery(GAME_URL, [["level", key]], search);
  if (aliases === null) return withQuery(GAME_URL, [["level", label]], search);
  return withQuery(NEW_GAME_URL, [["new", label]], search);
}

/**
 * The game label a request's root names, or null when it is not a subdomain
 * root. The browser's own host wins over the one a tunnel proxy rewrote
 * (X-Forwarded-Host carries it, as lib/games-store.ts reads it), so a level
 * link through the dev tunnel still routes. GET and HEAD only: a 302's method
 * rewriting must never land on a form post. Reads nothing from the database.
 */
export function subdomainRootLabel(
  req: Request,
  sites: readonly string[] = siteHosts(),
): string | null {
  if (req.method !== "GET" && req.method !== "HEAD") return null;
  const url = new URL(req.url);
  if (url.pathname !== "/" && url.pathname !== "/index.html") return null;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ??
    url.host;
  return subdomainOf(host, sites);
}

/**
 * The redirect a request earns, or null when it is not a subdomain root.
 * `keys` and `aliases` are what cloudLevelKeys and cloudLevelAliases answered,
 * null included, and `arcade` the boards the build ships (subdomainTarget).
 */
export function subdomainRedirect(
  req: Request,
  keys: readonly string[] | null,
  aliases: LevelAliases | null = {},
  sites: readonly string[] = siteHosts(),
  arcade: readonly ArcadeGame[] = [],
): Response | null {
  const label = subdomainRootLabel(req, sites);
  if (label === null) return null;
  return new Response(null, {
    status: 302,
    headers: {
      location: subdomainTarget(
        label,
        keys,
        aliases,
        new URL(req.url).search,
        arcade,
      ),
      "cache-control": "no-store",
    },
  });
}

let keysCache: { at: number; keys: string[] } | null = null;

/**
 * Every game's key, from a shallow read of the database, cached for a minute;
 * null when the read fails and nothing is cached yet. `fetcher` and `now` are
 * injectable for tests.
 */
export async function cloudLevelKeys(
  db: string = LEVELS_DB,
  fetcher: typeof fetch = fetch,
  now: () => number = Date.now,
): Promise<string[] | null> {
  if (keysCache && now() - keysCache.at < KEYS_CACHE_MS) return keysCache.keys;
  try {
    const res = await fetcher(`${db}/${LEVELS_PATH}.json?shallow=true`, {
      signal: AbortSignal.timeout(5_000),
    });
    if (!res.ok) throw new Error(`${LEVELS_PATH}.json ${res.status}`);
    const body = await res.json() as Record<string, unknown> | null;
    const keys = body && typeof body === "object" ? Object.keys(body) : [];
    keysCache = { at: now(), keys };
    return keys;
  } catch (err) {
    console.warn(
      "level subdomains: could not list games:",
      (err as Error).message ?? err,
    );
    return keysCache ? keysCache.keys : null;
  }
}

let aliasesCache: { at: number; aliases: Record<string, string> } | null = null;

/**
 * The alias index, `levelAliases/*`, read whole (a few short strings) and
 * cached for a minute like the key listing; {} when there is none, null when
 * the read fails and nothing is cached yet. A value that is not a string or a
 * name that is not an alias is dropped rather than trusted.
 */
export async function cloudLevelAliases(
  db: string = LEVELS_DB,
  fetcher: typeof fetch = fetch,
  now: () => number = Date.now,
): Promise<Record<string, string> | null> {
  if (aliasesCache && now() - aliasesCache.at < KEYS_CACHE_MS) {
    return aliasesCache.aliases;
  }
  try {
    const res = await fetcher(`${db}/${ALIASES_PATH}.json`, {
      signal: AbortSignal.timeout(5_000),
    });
    if (!res.ok) throw new Error(`${ALIASES_PATH}.json ${res.status}`);
    const body = await res.json() as Record<string, unknown> | null;
    const aliases: Record<string, string> = {};
    if (body && typeof body === "object") {
      for (const [name, key] of Object.entries(body)) {
        if (isAliasName(name) && typeof key === "string" && key) {
          aliases[name] = key;
        }
      }
    }
    aliasesCache = { at: now(), aliases };
    return aliases;
  } catch (err) {
    console.warn(
      "level subdomains: could not read aliases:",
      (err as Error).message ?? err,
    );
    return aliasesCache ? aliasesCache.aliases : null;
  }
}

/**
 * What main.ts asks for every request: the redirect it earns, or null. This is
 * subdomainRedirect with the two database listings fetched only when the
 * answer depends on them — never for a request that is not a subdomain's root
 * (the apex, the deploy URL, a launcher on 127.0.0.1, every asset), and never
 * for a board the build ships, which is why sfex2.<site> opens with the
 * database down. `levelKeys` and `levelAliases` are injectable for tests.
 */
export async function subdomainRootRedirect(
  req: Request,
  options: {
    arcade?: readonly ArcadeGame[];
    sites?: readonly string[];
    levelKeys?: () => Promise<readonly string[] | null>;
    levelAliases?: () => Promise<LevelAliases | null>;
  } = {},
): Promise<Response | null> {
  const sites = options.sites ?? siteHosts();
  const arcade = options.arcade ?? [];
  const label = subdomainRootLabel(req, sites);
  if (label === null) return null;
  if (matchArcadeGame(label, arcade) !== null) {
    return subdomainRedirect(req, null, null, sites, arcade);
  }
  const [keys, aliases] = await Promise.all([
    (options.levelKeys ?? cloudLevelKeys)(),
    (options.levelAliases ?? cloudLevelAliases)(),
  ]);
  return subdomainRedirect(req, keys, aliases, sites, arcade);
}

/** Forget the cached listings (tests). */
export function resetLevelKeysCache(): void {
  keysCache = null;
  aliasesCache = null;
}
