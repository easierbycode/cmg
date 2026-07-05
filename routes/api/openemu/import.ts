// POST /api/openemu/import { system, file } — import ONE game from the local
// OpenEmu library into the launcher's static ROM dir, then refresh that
// system's manifest. The dashboard picker calls this once per selected game
// so it can show per-game progress.
//
// The body only names a (system, file) pair — the server re-scans the OpenEmu
// library and matches the entry, so no client-supplied filesystem path is
// ever acted on.
import { define } from "../../../utils.ts";
import {
  importEntry,
  regenManifest,
  scanSystem,
  SYSTEMS,
} from "../../../scripts/openemu-lib.ts";

export const handler = define.handlers({
  async POST(ctx) {
    // Imports write to local disk — reject cross-site requests outright
    // (non-preflighted form POSTs would otherwise reach this handler).
    const site = ctx.req.headers.get("sec-fetch-site");
    if (site && site !== "same-origin" && site !== "none") {
      return Response.json({ error: "cross-site request" }, { status: 403 });
    }

    let body: unknown;
    try {
      body = await ctx.req.json();
    } catch {
      return Response.json({ error: "invalid JSON body" }, { status: 400 });
    }
    const { system, file } = (body ?? {}) as { system?: string; file?: string };
    const sys = SYSTEMS.find((s) => s.id === system);
    if (!sys || typeof file !== "string" || !file) {
      return Response.json({ error: "unknown system or file" }, {
        status: 400,
      });
    }

    const scan = await scanSystem(sys);
    if (!scan) {
      return Response.json({ error: "OpenEmu library not found" }, {
        status: 404,
      });
    }
    const entry = scan.games.find((g) => g.file === file);
    if (!entry) {
      return Response.json({ error: "game not in OpenEmu library" }, {
        status: 404,
      });
    }

    try {
      const status = await importEntry(sys, entry, { log: () => {} });
      const manifestRefreshed = await regenManifest(sys);
      return Response.json({ status, manifestRefreshed });
    } catch (e) {
      return Response.json({ error: (e as Error).message }, { status: 500 });
    }
  },
});
