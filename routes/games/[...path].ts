// Serve files for locally-added games from GAMES_DIR (games added via
// /api/games/add-*). URL shape: /games/<id>/<relPath>. This is the lowest-
// priority /games route: staticFiles() (main.ts) serves the built-in static
// games first, and more specific routes — /games/2028-ai and
// /games/evil-invaders/[...path] — win over this catch-all, so it only handles
// ids that are actual directories under GAMES_DIR.
import { define } from "../../utils.ts";
import { contentType } from "jsr:@std/media-types@^1";
import { extname, join, normalize } from "jsr:@std/path@^1.1.2";
import { GAMES_DIR, isSafeId } from "../../lib/games-store.ts";

function guessType(filePath: string): string {
  const ext = extname(filePath);
  const ct = contentType(ext);
  if (ct) return ct;
  const lower = filePath.toLowerCase();
  if (lower.endsWith(".js") || lower.endsWith(".mjs")) return "text/javascript";
  if (lower.endsWith(".html") || lower.endsWith(".htm")) {
    return "text/html; charset=utf-8";
  }
  if (lower.endsWith(".css")) return "text/css";
  if (lower.endsWith(".wasm")) return "application/wasm";
  return "application/octet-stream";
}

export const handler = define.handlers({
  async GET(ctx) {
    const raw = ctx.params.path || "";
    const segments = raw.split("/").filter(Boolean);
    const id = segments[0] || "";
    if (!id || !isSafeId(id)) return new Response("Not Found", { status: 404 });

    // The game directory must exist under GAMES_DIR, else this isn't ours.
    try {
      const st = await Deno.stat(join(GAMES_DIR, id));
      if (!st.isDirectory) return new Response("Not Found", { status: 404 });
    } catch (_e) {
      return new Response("Not Found", { status: 404 });
    }

    let rel = decodeURIComponent(segments.slice(1).join("/"));
    const isIndex = rel === "" || raw.endsWith("/");
    if (isIndex) {
      rel = rel ? `${rel.replace(/\/+$/, "")}/index.html` : "index.html";
    }

    // Resolve and confine to the game directory (block ../ traversal).
    const gameRoot = join(GAMES_DIR, id);
    const filePath = normalize(join(gameRoot, rel));
    if (
      filePath !== gameRoot && !filePath.startsWith(gameRoot + "/") &&
      !filePath.startsWith(gameRoot + "\\")
    ) {
      return new Response("Forbidden", { status: 403 });
    }

    // Stat first so a directory-shaped path (e.g. /games/<id>/src with no
    // trailing slash) resolves to a clean 404 instead of a 500 — Deno.readFile
    // on a directory throws a non-NotFound error the caller shouldn't see.
    try {
      const info = await Deno.stat(filePath);
      if (!info.isFile) return new Response("Not Found", { status: 404 });
    } catch (e) {
      if (e instanceof Deno.errors.NotFound) {
        return new Response("Not Found", { status: 404 });
      }
      throw e;
    }
    const data = await Deno.readFile(filePath);
    return new Response(data, {
      headers: { "content-type": guessType(filePath) },
    });
  },
});
