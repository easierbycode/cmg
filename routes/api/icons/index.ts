// /api/icons — the captured/fetched icon store (lib/icons-store.ts).
//   GET    → { ok, local, icons: { <gameId>: "/api/icons/<file>.png?v=…" } }
//            Read-only and degrade-gracefully: the hosted Deploy origin (and
//            a launcher that has captured nothing) answers an empty map, so
//            the dashboard can call it unconditionally (same policy as
//            /api/games/local). `local` tells the client whether captures
//            can be saved here at all.
//   POST   → { id, dataUrl } (data:image/png;base64) — save an icon.
//   DELETE → { id } — remove one.
// Mutations are local-launcher-only, like every /api/games mutator.
import { define } from "../../../utils.ts";
import { isDeploy, localWriteGuard } from "../../../lib/games-store.ts";
import {
  decodePngDataUrl,
  deleteIcon,
  listIcons,
  saveIcon,
} from "../../../lib/icons-store.ts";

export const handler = define.handlers({
  async GET(_ctx) {
    const local = !isDeploy();
    const icons = local ? await listIcons() : {};
    return Response.json({ ok: true, local, icons });
  },
  async POST(ctx) {
    const denied = localWriteGuard(ctx.req);
    if (denied) return denied;
    try {
      const body = await ctx.req.json();
      const id = String(body?.id ?? "");
      const bytes = decodePngDataUrl(String(body?.dataUrl ?? ""));
      const rec = await saveIcon(id, bytes);
      return Response.json({
        ok: true,
        id,
        url: `/api/icons/${rec.file}?v=${rec.updated}`,
      });
    } catch (e) {
      return Response.json({ ok: false, error: (e as Error).message }, {
        status: 400,
      });
    }
  },
  async DELETE(ctx) {
    const denied = localWriteGuard(ctx.req);
    if (denied) return denied;
    try {
      const body = await ctx.req.json().catch(() => ({}));
      const id = String(
        body?.id ?? new URL(ctx.req.url).searchParams.get("id") ?? "",
      );
      if (!id) throw new Error("id required");
      const existed = await deleteIcon(id);
      return Response.json({ ok: true, existed });
    } catch (e) {
      return Response.json({ ok: false, error: (e as Error).message }, {
        status: 400,
      });
    }
  },
});
