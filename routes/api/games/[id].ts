// /api/games/:id — manage a locally-added game.
//   DELETE  → remove it from GAMES_DIR.
//   POST    → re-pull from its recorded github/url source (an "update").
// Static sibling routes (local.ts, add-*.ts) win over this dynamic segment, so
// :id only ever matches a real game id. Local launcher only.
import { define } from "../../../utils.ts";
import {
  deleteGame,
  localWriteGuard,
  updateGame,
} from "../../../lib/games-store.ts";

export const handler = define.handlers({
  async DELETE(ctx) {
    const denied = localWriteGuard(ctx.req);
    if (denied) return denied;
    try {
      await deleteGame(ctx.params.id);
      return Response.json({ ok: true });
    } catch (e) {
      if (e instanceof Deno.errors.NotFound) {
        return Response.json({ ok: false, error: "not found" }, {
          status: 404,
        });
      }
      return Response.json({ ok: false, error: (e as Error).message }, {
        status: 500,
      });
    }
  },
  async POST(ctx) {
    const denied = localWriteGuard(ctx.req);
    if (denied) return denied;
    try {
      const { id } = await updateGame(ctx.params.id);
      return Response.json({ ok: true, id });
    } catch (e) {
      if (e instanceof Deno.errors.NotFound) {
        return Response.json({ ok: false, error: "not found" }, {
          status: 404,
        });
      }
      return Response.json({ ok: false, error: (e as Error).message }, {
        status: 500,
      });
    }
  },
});
