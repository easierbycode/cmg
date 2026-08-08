// Captured/fetched game icons — a LOCAL-ONLY store, same policy as
// lib/games-store.ts. Icons live in GAMES_DIR/.icons (override with
// CMG_ICONS_DIR): the dot-directory inherits the launcher's existing
// writability probing/XDG relocation (scripts/launcher-env.ts repoints
// CMG_GAMES_DIR when the exe dir is read-only) and is invisible to both
// listGames() (isSafeId rejects the leading dot) and the /games catch-all.
// On Deno Deploy the directory can never exist: reads answer empty, writes
// are refused by localWriteGuard in the routes.
//
// Catalog ids are arbitrary strings ("games/2028-ai",
// "evil-invaders/index.html?turbo=1&audio=1", "nes:Super Mario Bros.nes"),
// so files are named by a slug + FNV-1a hash of the exact id — collision-
// free and deterministic — and .icons/index.json maps ids to files.
import { join } from "jsr:@std/path@^1.1.2";
import { GAMES_DIR } from "./games-store.ts";

export const ICONS_DIR = Deno.env.get("CMG_ICONS_DIR") ??
  join(GAMES_DIR, ".icons");

const INDEX_FILE = "index.json";
const MAX_ICON_BYTES = 8 * 1024 * 1024;

const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

export function isPng(bytes: Uint8Array): boolean {
  return bytes.length > PNG_MAGIC.length &&
    PNG_MAGIC.every((b, i) => bytes[i] === b);
}

function fnv1a(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

/** Deterministic, filesystem-safe file name for an arbitrary game id. */
export function iconFileFor(id: string): string {
  const slug = id.toLowerCase().replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "").slice(0, 48);
  return `${slug ? slug + "-" : ""}${fnv1a(id)}.png`;
}

/** Served file names are exactly what iconFileFor emits — validate before join. */
export function isSafeIconFile(file: string): boolean {
  return /^[a-z0-9][a-z0-9-]*\.png$/.test(file) && file.length <= 64;
}

export type IconRecord = { file: string; updated: number };
type IconIndex = { version: 1; icons: Record<string, IconRecord> };

async function readIndex(): Promise<IconIndex> {
  try {
    const parsed = JSON.parse(
      await Deno.readTextFile(join(ICONS_DIR, INDEX_FILE)),
    );
    if (parsed && typeof parsed.icons === "object") {
      return { version: 1, icons: parsed.icons };
    }
  } catch {
    // missing/corrupt index — treated as empty
  }
  return { version: 1, icons: {} };
}

// Serialize index read-modify-writes; the store is single-process but two
// concurrent captures (background + manual) must not drop each other's entry.
// The write is atomic (temp + rename) for the same reason the PNGs are: a
// reader racing it — or a kiosk killed mid-write — must never find a
// truncated index.json and conclude the store is empty.
let indexChain: Promise<unknown> = Promise.resolve();
function withIndex<T>(fn: (idx: IconIndex) => Promise<T>): Promise<T> {
  const next = indexChain.then(async () => {
    const idx = await readIndex();
    const result = await fn(idx);
    await Deno.mkdir(ICONS_DIR, { recursive: true });
    const tmp = join(ICONS_DIR, `.${INDEX_FILE}.${crypto.randomUUID()}.tmp`);
    await Deno.writeTextFile(tmp, JSON.stringify(idx, null, 2));
    await Deno.rename(tmp, join(ICONS_DIR, INDEX_FILE));
    return result;
  });
  indexChain = next.catch(() => {});
  return next;
}

export async function saveIcon(
  id: string,
  bytes: Uint8Array,
): Promise<IconRecord> {
  if (!id || id.length > 512) throw new Error("invalid game id");
  if (bytes.length > MAX_ICON_BYTES) throw new Error("icon too large");
  if (!isPng(bytes)) throw new Error("not a PNG");
  await Deno.mkdir(ICONS_DIR, { recursive: true });
  const file = iconFileFor(id);
  // Atomic publish: never serve a half-written PNG. The temp name is unique
  // per call, not per id — two saves racing on the same game (the background
  // fill and a Guide capture) would otherwise write the same temp file and
  // publish each other's half-written bytes.
  const tmp = join(ICONS_DIR, `.${file}.${crypto.randomUUID()}.tmp`);
  try {
    await Deno.writeFile(tmp, bytes);
    await Deno.rename(tmp, join(ICONS_DIR, file));
  } catch (e) {
    await Deno.remove(tmp).catch(() => {});
    throw e;
  }
  const record: IconRecord = { file, updated: Date.now() };
  await withIndex((idx) => {
    idx.icons[id] = record;
    return Promise.resolve();
  });
  return record;
}

export async function deleteIcon(id: string): Promise<boolean> {
  const file = iconFileFor(id);
  let existed = false;
  try {
    await Deno.remove(join(ICONS_DIR, file));
    existed = true;
  } catch {
    // nothing on disk — still drop any index entry
  }
  await withIndex((idx) => {
    if (idx.icons[id]) existed = true;
    delete idx.icons[id];
    return Promise.resolve();
  });
  return existed;
}

/** id → served URL (cache-busted by mtime) for every icon on disk. */
export async function listIcons(): Promise<Record<string, string>> {
  const idx = await readIndex();
  const out: Record<string, string> = {};
  for (const [id, rec] of Object.entries(idx.icons)) {
    if (!rec || !isSafeIconFile(rec.file)) continue;
    try {
      await Deno.stat(join(ICONS_DIR, rec.file));
      out[id] = `/api/icons/${rec.file}?v=${rec.updated}`;
    } catch {
      // file vanished — skip (index is advisory, disk is truth)
    }
  }
  return out;
}

export async function readIconFile(
  file: string,
): Promise<Uint8Array<ArrayBuffer> | null> {
  if (!isSafeIconFile(file)) return null;
  try {
    return await Deno.readFile(join(ICONS_DIR, file));
  } catch {
    return null;
  }
}

/** Decode a data:image/png;base64 payload, enforcing the same limits as saveIcon. */
export function decodePngDataUrl(dataUrl: string): Uint8Array {
  const m = /^data:image\/png;base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl ?? "");
  if (!m) throw new Error("expected a data:image/png;base64 URL");
  if (m[1].length > MAX_ICON_BYTES * 1.4) throw new Error("icon too large");
  const bin = atob(m[1]);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}
