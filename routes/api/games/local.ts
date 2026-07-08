// GET /api/games/local — list games added locally (zip / url / github), served
// from GAMES_DIR by routes/games/[...path].ts. The dashboard merges these into
// its Games list (like graduated CMG Network installs). Read-only, so it is not
// gated to local launchers — the hosted app just returns an empty list.
import { define } from "../../../utils.ts";
import { listGames } from "../../../lib/games-store.ts";

export const handler = define.handlers({
  async GET() {
    try {
      return Response.json({ ok: true, games: await listGames() });
    } catch (e) {
      return Response.json(
        { ok: false, error: (e as Error).message, games: [] },
        { status: 500 },
      );
    }
  },
});
