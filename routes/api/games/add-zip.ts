// POST /api/games/add-zip — add a game from an uploaded .zip.
// multipart/form-data: file (the zip), name (defaults to the file's basename),
// subdir ("root" | "dist" | "docs" | a path). Local launcher only.
import { define } from "../../../utils.ts";
import {
  installArchive,
  localWriteGuard,
  slugify,
} from "../../../lib/games-store.ts";

export const handler = define.handlers({
  async POST(ctx) {
    const denied = localWriteGuard(ctx.req);
    if (denied) return denied;
    try {
      const form = await ctx.req.formData();
      const file = form.get("file");
      if (!(file instanceof File)) {
        return Response.json({ ok: false, error: "file required" }, {
          status: 400,
        });
      }
      const rawName = String(form.get("name") || "").trim() ||
        file.name.replace(/\.zip$/i, "") || "game";
      const subdir = String(form.get("subdir") || "root").trim() || "root";
      const id = slugify(rawName) || "game";
      const bytes = new Uint8Array(await file.arrayBuffer());
      await installArchive({
        bytes,
        id,
        subdir,
        sourceInfo: { source: "zip", subdir },
      });
      return Response.json({ ok: true, id });
    } catch (e) {
      return Response.json({ ok: false, error: (e as Error).message }, {
        status: 500,
      });
    }
  },
});
