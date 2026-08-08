// GET /api/icons/<file>.png — serve one stored icon. File names are the
// slug-hash outputs of iconFileFor(); anything else 404s before touching
// the filesystem. no-store because a recapture reuses the same file name —
// the ?v= cache-buster in the index URLs is advisory, this is the backstop.
// Static siblings (index.ts, auto.ts, fetch.ts) win over this segment.
import { define } from "../../../utils.ts";
import { readIconFile } from "../../../lib/icons-store.ts";

export const handler = define.handlers({
  async GET(ctx) {
    const bytes = await readIconFile(ctx.params.file);
    if (!bytes) return new Response("not found", { status: 404 });
    return new Response(bytes, {
      headers: {
        "content-type": "image/png",
        "cache-control": "no-store",
      },
    });
  },
});
