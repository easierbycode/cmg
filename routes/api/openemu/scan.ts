// GET /api/openemu/scan — enumerate the local OpenEmu game library for the
// dashboard's Settings → "Import OpenEmu Library" picker.
//
// Only meaningful where the repo and the OpenEmu library share a disk (a dev
// checkout / locally-run launcher). On Deno Deploy there is no OpenEmu
// library, scanSystem() returns null for every system, and the response is
// { available: false } — the picker shows its "library not found" state.
import { define } from "../../../utils.ts";
import { scanSystem, SYSTEMS } from "../../../scripts/openemu-lib.ts";

export const handler = define.handlers({
  async GET() {
    try {
      const systems = [];
      let available = false;
      for (const sys of SYSTEMS) {
        const scan = await scanSystem(sys);
        if (!scan) continue;
        available = true;
        systems.push({
          id: sys.id,
          label: sys.label,
          // srcs (absolute local paths) stay server-side.
          games: scan.games.map((g) => ({
            file: g.file,
            name: g.name,
            kind: g.kind,
            size: g.size,
            imported: g.imported,
          })),
        });
      }
      return Response.json({ available, systems });
    } catch {
      return Response.json({ available: false, systems: [] });
    }
  },
});
