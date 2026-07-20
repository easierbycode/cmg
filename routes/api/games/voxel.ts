// POST /api/games/voxel — publish a Voxel 3D export from the level editor so
// it is served at a stable URL (/games/voxel-<slug>/, via the games catch-all
// route) instead of existing only as a blob download. Body: { name, html }.
// Local launcher only — same localWriteGuard policy as the other /api/games
// mutating routes. This static sibling wins over the dynamic [id].ts route.
import { define } from "../../../utils.ts";
import { join } from "jsr:@std/path@^1.1.2";
import {
  GAMES_DIR,
  isSafeId,
  localWriteGuard,
  slugify,
} from "../../../lib/games-store.ts";

// Exports embed Phaser + the voxel atlas + all sounds as data URLs; a "foo"
// sized level lands around 20-40 MB. Cap well above that but below anything
// that could exhaust memory.
const MAX_HTML_BYTES = 96 * 1024 * 1024;

export const handler = define.handlers({
  async POST(ctx) {
    const denied = localWriteGuard(ctx.req);
    if (denied) return denied;
    try {
      const body = await ctx.req.json().catch(() => null);
      const name = String(body?.name || "").trim();
      const html = typeof body?.html === "string" ? body.html : "";
      if (!name) {
        return Response.json({ ok: false, error: "name required" }, {
          status: 400,
        });
      }
      if (!html || !/^<!doctype html>/i.test(html.trimStart())) {
        return Response.json(
          { ok: false, error: "html document required" },
          { status: 400 },
        );
      }
      if (html.length > MAX_HTML_BYTES) {
        return Response.json({ ok: false, error: "html too large" }, {
          status: 413,
        });
      }
      const id = "voxel-" + (slugify(name) || "game");
      if (!isSafeId(id)) {
        return Response.json({ ok: false, error: "bad name" }, { status: 400 });
      }
      const dir = join(GAMES_DIR, id);
      await Deno.mkdir(dir, { recursive: true });
      await Deno.writeTextFile(join(dir, "index.html"), html);
      // Provenance so listGames()/the dashboard surface it like other local games.
      await Deno.writeTextFile(
        join(dir, "codemonkey.json"),
        JSON.stringify(
          {
            name: `${name} (Voxel 3D)`,
            sourceInfo: {
              source: "url",
              url: "internal://level-editor/voxel3d",
            },
            addedAt: new Date().toISOString(),
          },
          null,
          2,
        ),
      );
      // No trailing slash: the dev middleware 404s directory-shaped /games/…/
      // URLs before the catch-all route sees them, while the no-slash form is
      // served everywhere (the export is self-contained, so it needs no base).
      return Response.json({ ok: true, id, url: `/games/${id}` });
    } catch (e) {
      return Response.json({ ok: false, error: (e as Error).message }, {
        status: 500,
      });
    }
  },
});
