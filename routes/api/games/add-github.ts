// POST /api/games/add-github — add a game from a GitHub repo (branch zipball).
// JSON: { repo, branch?, name?, subdir? }. repo accepts owner/name shorthand or
// a full github.com URL. Local launcher only.
import { define } from "../../../utils.ts";
import {
  addGameFromGithub,
  localWriteGuard,
} from "../../../lib/games-store.ts";

export const handler = define.handlers({
  async POST(ctx) {
    const denied = localWriteGuard(ctx.req);
    if (denied) return denied;
    try {
      const body = await ctx.req.json().catch(() => ({}));
      const repo = String(body?.repo || "").trim();
      if (!repo) {
        return Response.json({ ok: false, error: "repo required" }, {
          status: 400,
        });
      }
      const { id } = await addGameFromGithub({
        repo,
        branch: body?.branch ? String(body.branch).trim() : undefined,
        subdir: body?.subdir ? String(body.subdir).trim() : undefined,
        name: body?.name ? String(body.name).trim() : undefined,
      });
      return Response.json({ ok: true, id });
    } catch (e) {
      return Response.json({ ok: false, error: (e as Error).message }, {
        status: 500,
      });
    }
  },
});
