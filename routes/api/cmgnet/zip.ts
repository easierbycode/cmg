// GET /api/cmgnet/zip?repo=<owner/name|url>&branch=<branch> — same-origin proxy
// for a GitHub branch zipball.
//
// The CMG Network e-shop installs a game entirely in the browser: fetch a zip,
// unzip with JSZip, cache under /cmg-net/<id>/ (see Dashboard.svelte's
// cmgnetDownload). That fetch runs with mode:"cors", but codeload.github.com
// sends NO CORS headers, so the browser can't read a codeload zip directly.
// This route fetches it server-side (no CORS restriction there) and streams it
// back from our own origin, so a catalog entry can point downloadUrl at
// /api/cmgnet/zip and install any easierbycode repo on demand — no committed
// zip required. Read-only (just proxies bytes), so it works on the hosted
// deploy as well as local launchers.
import { define } from "../../../utils.ts";
import { parseGithubRepo } from "../../../lib/games-store.ts";

export const handler = define.handlers({
  async GET(ctx) {
    const url = new URL(ctx.req.url);
    const repo = url.searchParams.get("repo") || "";
    const branch = (url.searchParams.get("branch") || "main").trim() || "main";
    if (!repo) {
      return Response.json({ ok: false, error: "repo required" }, {
        status: 400,
      });
    }
    let owner: string, name: string;
    try {
      ({ owner, name } = parseGithubRepo(repo));
    } catch (_e) {
      return Response.json({ ok: false, error: "invalid repo" }, {
        status: 400,
      });
    }
    // Build the codeload URL from parsed pieces only — never from a
    // caller-supplied URL — so this can't be turned into an open SSRF proxy.
    const zipUrl = `https://codeload.github.com/${encodeURIComponent(owner)}/${
      encodeURIComponent(name)
    }/zip/refs/heads/${branch.split("/").map(encodeURIComponent).join("/")}`;
    let upstream: Response;
    try {
      upstream = await fetch(zipUrl);
    } catch (e) {
      return Response.json(
        { ok: false, error: `upstream fetch failed: ${(e as Error).message}` },
        { status: 502 },
      );
    }
    if (!upstream.ok || !upstream.body) {
      return Response.json(
        {
          ok: false,
          error:
            `github returned HTTP ${upstream.status} for ${owner}/${name}@${branch}`,
        },
        { status: upstream.status === 404 ? 404 : 502 },
      );
    }
    // Stream the bytes straight through; the wildcard-CORS middleware in main.ts
    // adds Access-Control-Allow-Origin. Content-Length is usually absent on
    // codeload (chunked) — the client copes (progress just runs during unzip).
    return new Response(upstream.body, {
      headers: {
        "content-type": "application/zip",
        "cache-control": "no-store",
        "content-disposition": `attachment; filename="${name}-${branch}.zip"`,
      },
    });
  },
});
