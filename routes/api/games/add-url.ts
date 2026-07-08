// POST /api/games/add-url — add a game by downloading a .zip from a URL.
// JSON: { url, name?, subdir? }. Local launcher only.
import { define } from "../../../utils.ts";
import {
  downloadFromUrl,
  installArchive,
  localWriteGuard,
  slugify,
} from "../../../lib/games-store.ts";

export const handler = define.handlers({
  async POST(ctx) {
    const denied = localWriteGuard(ctx.req);
    if (denied) return denied;
    try {
      const body = await ctx.req.json().catch(() => ({}));
      const url = String(body?.url || "").trim();
      if (!url) {
        return Response.json({ ok: false, error: "url required" }, {
          status: 400,
        });
      }
      // Only http(s) — the fetch is server-side, so reject file:/data:/etc. that
      // would let a caller read local files through this endpoint.
      let scheme = "";
      try {
        scheme = new URL(url).protocol;
      } catch (_e) {
        return Response.json({ ok: false, error: "invalid url" }, {
          status: 400,
        });
      }
      if (scheme !== "http:" && scheme !== "https:") {
        return Response.json({ ok: false, error: "url must be http(s)" }, {
          status: 400,
        });
      }
      const subdir = String(body?.subdir || "root").trim() || "root";
      const derived = (() => {
        try {
          return new URL(url).pathname.split("/").pop()?.replace(
            /\.zip$/i,
            "",
          ) || "game";
        } catch (_e) {
          return "game";
        }
      })();
      const id = slugify(String(body?.name || "").trim() || derived) || "game";
      const bytes = await downloadFromUrl(url);
      await installArchive({
        bytes,
        id,
        subdir,
        sourceInfo: { source: "url", url, subdir },
      });
      return Response.json({ ok: true, id });
    } catch (e) {
      return Response.json({ ok: false, error: (e as Error).message }, {
        status: 500,
      });
    }
  },
});
