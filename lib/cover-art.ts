// Cover/boxart lookup against libretro-thumbnails — the keyless provider
// RetroArch itself uses (https://thumbnails.libretro.com). Pure module: no
// Deno APIs, so the dashboard bundle (svelte-src) and the icon pipeline
// (scripts/auto-icons.ts) share one copy of the naming rules.
//
// The server hosts one directory per system, holding Named_Boxarts /
// Named_Snaps / Named_Titles subdirs of PNGs named by the game's
// No-Intro/Redump title — which is exactly what our ROM filenames and the
// build-*-manifest cleaned names already are. Verified live 2026-08:
// 7 of our 8 systems are covered; Switch has no libretro directory at all
// (fetch its art from TheGamesDB/titledb behind a key later).

export const THUMB_BASE = "https://thumbnails.libretro.com";

export type CoverSystem =
  | "nes"
  | "tg16"
  | "psx"
  | "ps2"
  | "saturn"
  | "naomi"
  | "arcade"
  | "switch";

// Verbatim libretro directory names. NAOMI is a list because that section
// hosts NAOMI and Atomiswave ROM sets AND Dreamcast discs — flycast boots
// all three — so a lookup walks every plausible shelf.
const SYSTEM_DIRS: Record<CoverSystem, string[]> = {
  nes: ["Nintendo - Nintendo Entertainment System"],
  tg16: [
    "NEC - PC Engine - TurboGrafx 16",
    "NEC - PC Engine CD - TurboGrafx-CD",
  ],
  psx: ["Sony - PlayStation"],
  ps2: ["Sony - PlayStation 2"],
  saturn: ["Sega - Saturn"],
  naomi: ["Sega - Naomi", "Sega - Dreamcast", "Atomiswave", "Sega - Naomi 2"],
  arcade: ["MAME", "FBNeo - Arcade Games"],
  switch: [], // no libretro coverage
};

export type CoverKind = "Named_Boxarts" | "Named_Snaps" | "Named_Titles";

// libretro's documented filename rule: these characters in a game title are
// replaced with underscores in the thumbnail filename; everything else
// (apostrophes, periods, commas, parens, hyphens) is kept as-is.
export function sanitizeThumbName(name: string): string {
  return name.replace(/[&*/:`<>?\\|]/g, "_");
}

/** "Super Mario Bros. (World).nes" → "Super Mario Bros. (World)" */
export function stripRomExt(file: string): string {
  const base = file.split(/[\\/]/).pop() ?? file;
  return base.replace(/\.[A-Za-z0-9]{1,4}$/, "");
}

/** "Super Mario Bros. (World)" → "Super Mario Bros." — the tag-less title. */
export function shortTitle(name: string): string {
  return name.replace(/\s*[([].*$/, "").trim();
}

/**
 * Ordered candidate URLs for a game's art, most-exact first: the ROM's own
 * No-Intro/Redump filename (a first-try hit when it is one), then the
 * display name, per system shelf. Callers try them in order — the dashboard
 * steps an <img> through the list on error; the pipeline fetches until one
 * answers 200. MAME thumbnails are named by the full driver description,
 * never the romset short name, so for arcade the display name is the one
 * that matters.
 */
export function coverCandidates(
  system: CoverSystem,
  game: { name?: string; file?: string },
  kind: CoverKind = "Named_Boxarts",
): string[] {
  const dirs = SYSTEM_DIRS[system] ?? [];
  if (!dirs.length) return [];
  const names: string[] = [];
  const push = (n: string | undefined) => {
    const t = n?.trim();
    if (t && !names.includes(t)) names.push(t);
  };
  if (game.file) push(stripRomExt(game.file));
  push(game.name);
  const urls: string[] = [];
  for (const dir of dirs) {
    for (const n of names) {
      urls.push(
        `${THUMB_BASE}/${encodeURIComponent(dir)}/${kind}/` +
          `${encodeURIComponent(sanitizeThumbName(n))}.png`,
      );
    }
  }
  return urls;
}

/**
 * Match a game against a system's full thumbnail listing (the Apache index
 * of Named_Boxarts, one request per system — see fetchCoverIndex in
 * scripts/auto-icons.ts). Normalizes both sides to lowercase alphanumerics
 * with region/bracket tags stripped, then prefers exact stripped equality
 * in region order USA > World > Europe > Japan, else a prefix match. Used
 * by the pipeline as the fallback when the direct candidates all 404.
 */
export function matchCoverFromIndex(
  entries: string[],
  game: { name?: string; file?: string },
): string | null {
  const norm = (s: string) =>
    s.toLowerCase().replace(/\s*[([].*$/, "").replace(/[^a-z0-9]+/g, "");
  const wanted = [
    game.file ? norm(stripRomExt(game.file)) : "",
    game.name ? norm(game.name) : "",
  ].filter(Boolean);
  if (!wanted.length) return null;
  const stripped = entries.map((e) => ({
    entry: e,
    key: norm(e.replace(/\.png$/i, "")),
    region: /\(usa/i.test(e)
      ? 0
      : /\(world/i.test(e)
      ? 1
      : /\(europe/i.test(e)
      ? 2
      : /\(japan/i.test(e)
      ? 3
      : 4,
  }));
  for (const w of wanted) {
    const exact = stripped.filter((s) => s.key === w)
      .sort((a, b) => a.region - b.region);
    if (exact.length) return exact[0].entry;
  }
  for (const w of wanted) {
    const pre = stripped.filter((s) => s.key.startsWith(w) && w.length >= 4)
      .sort((a, b) => (a.region - b.region) || (a.key.length - b.key.length));
    if (pre.length) return pre[0].entry;
  }
  return null;
}

/** The Named_Boxarts listing URL for a system shelf (Apache autoindex HTML). */
export function coverIndexUrls(
  system: CoverSystem,
  kind: CoverKind = "Named_Boxarts",
): string[] {
  return (SYSTEM_DIRS[system] ?? []).map((dir) =>
    `${THUMB_BASE}/${encodeURIComponent(dir)}/${kind}/`
  );
}
