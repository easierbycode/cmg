// POST /api/icons/fetch — pull cover/boxart from libretro-thumbnails and
// store it in the local icon store.
//   body: { id, system, name?, file? }   (system: lib/cover-art.ts CoverSystem)
//
// Tries the direct candidate URLs first (exact No-Intro/Redump filename,
// then display name), then falls back to scanning the system shelf's
// Apache index and fuzzy-matching — the same 3-tier order RetroArch uses.
// Local launcher only, like every other icon mutation; the dashboard's
// hotlinked <img> covers pure display on the hosted app.
import { define } from "../../../utils.ts";
import { localWriteGuard } from "../../../lib/games-store.ts";
import { isPng, saveIcon } from "../../../lib/icons-store.ts";
import {
  coverCandidates,
  coverIndexUrls,
  type CoverKind,
  type CoverSystem,
  matchCoverFromIndex,
} from "../../../lib/cover-art.ts";

const FETCH_TIMEOUT_MS = 15_000;

async function fetchPng(url: string): Promise<Uint8Array | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const bytes = new Uint8Array(await res.arrayBuffer());
    // A captive portal or proxy answers 200 with an HTML page. Treat anything
    // that isn't a PNG as a miss and move to the next candidate, rather than
    // letting saveIcon's magic-byte check abort the whole lookup.
    return isPng(bytes) ? bytes : null;
  } catch {
    return null;
  }
}

// Apache autoindex → the .png file names it links.
function parseIndexListing(html: string): string[] {
  const out: string[] = [];
  const re = /href="([^"]+\.png)"/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    try {
      out.push(decodeURIComponent(m[1]));
    } catch {
      out.push(m[1]);
    }
  }
  return out;
}

export const handler = define.handlers({
  async POST(ctx) {
    const denied = localWriteGuard(ctx.req);
    if (denied) return denied;
    try {
      const body = await ctx.req.json();
      const id = String(body?.id ?? "");
      const system = String(body?.system ?? "") as CoverSystem;
      const game = {
        name: body?.name ? String(body.name) : undefined,
        file: body?.file ? String(body.file) : undefined,
      };
      const kind = (body?.kind ?? "Named_Boxarts") as CoverKind;
      if (!id) throw new Error("id required");
      if (!game.name && !game.file) throw new Error("name or file required");

      for (const url of coverCandidates(system, game, kind)) {
        const bytes = await fetchPng(url);
        if (bytes) {
          const rec = await saveIcon(id, bytes);
          return Response.json({
            ok: true,
            id,
            source: url,
            url: `/api/icons/${rec.file}?v=${rec.updated}`,
          });
        }
      }

      // Fuzzy fallback: one shelf listing per system dir, matched locally.
      for (const indexUrl of coverIndexUrls(system, kind)) {
        try {
          const res = await fetch(indexUrl, {
            signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
          });
          if (!res.ok) continue;
          const entry = matchCoverFromIndex(
            parseIndexListing(await res.text()),
            game,
          );
          if (!entry) continue;
          const bytes = await fetchPng(indexUrl + encodeURIComponent(entry));
          if (bytes) {
            const rec = await saveIcon(id, bytes);
            return Response.json({
              ok: true,
              id,
              source: indexUrl + entry,
              url: `/api/icons/${rec.file}?v=${rec.updated}`,
            });
          }
        } catch {
          // listing unreachable — try the next shelf
        }
      }

      return Response.json({ ok: false, error: "no cover found" }, {
        status: 404,
      });
    } catch (e) {
      return Response.json({ ok: false, error: (e as Error).message }, {
        status: 400,
      });
    }
  },
});
