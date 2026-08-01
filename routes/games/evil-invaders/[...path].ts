import { define } from "../../../utils.ts";

// Same-origin reverse proxy for the externally-hosted "Evil Invaders" game.
//
// Evil Invaders is served from https://easierbycode.com/games/evil-invaders/…,
// a DIFFERENT site than the launcher (cmg.easierbycode.deno.net), so embedding
// it directly made the game iframe cross-site. Desktop browsers load that fine,
// but iPad Safari — with "Prevent Cross-Site Tracking" on by default — refuses
// the cross-site frame and shows a "Safari cannot open the page" error in an
// otherwise-empty iframe. (The same-origin demos, e.g. /demos/goofy-game, never
// hit this, which is why they keep working on the same iPad.)
//
// Routing the game through the launcher's own origin makes the iframe document
// first-party, so none of WebKit's cross-site treatment applies. This mirrors
// the direction already taken for 2028-ai (in-repo `url` → same-origin) — only
// here the bytes still live upstream, so we stream them through rather than
// vendoring 9.6 MB into the repo. Relative sub-resources resolve back through
// this same prefix; the browser caches them via the upstream cache headers, so
// only the first launch proxies.
//
// Deliberately scoped to the one game subtree (fixed upstream host + path
// prefix, traversal-checked) — this is not an open relay.

const UPSTREAM_BASE = "https://easierbycode.com/games/evil-invaders/";
const UPSTREAM_ORIGIN = "https://easierbycode.com";
const UPSTREAM_PREFIX = "/games/evil-invaders/";

// Response headers we must not copy onto our own response: the framing /
// cross-origin policies are exactly what we're routing around; cookies have no
// business crossing origins here; and the encoding/length/hop-by-hop headers go
// stale once Deno's fetch has decoded and re-streamed the body.
const STRIP_HEADERS = new Set([
  "x-frame-options",
  "content-security-policy",
  "content-security-policy-report-only",
  "cross-origin-opener-policy",
  "cross-origin-embedder-policy",
  "cross-origin-resource-policy",
  "set-cookie",
  "content-encoding",
  "content-length",
  "transfer-encoding",
  "connection",
]);

export const handler = define.handlers({
  async GET(ctx) {
    const rawPath = (ctx.params as Record<string, string | string[]>).path;
    const rest = (Array.isArray(rawPath) ? rawPath.join("/") : rawPath) ||
      "index.html";

    // Resolve the requested sub-path against the fixed upstream base and refuse
    // anything that escapes the evil-invaders subtree (path traversal / host
    // swap). Without this a crafted "../" could turn the proxy into an SSRF.
    let target: URL;
    try {
      target = new URL(rest, UPSTREAM_BASE);
    } catch {
      return new Response("Bad path", { status: 400 });
    }
    if (
      target.origin !== UPSTREAM_ORIGIN ||
      !target.pathname.startsWith(UPSTREAM_PREFIX)
    ) {
      return new Response("Forbidden", { status: 403 });
    }
    // Carry the original query string through (e.g. ?turbo=1&audio=1).
    target.search = new URL(ctx.req.url).search;

    // Forward Range so audio/large assets can be streamed/seeked on iOS.
    const range = ctx.req.headers.get("range");
    let upstream: Response;
    try {
      upstream = await fetch(target.href, {
        headers: range ? { range } : undefined,
        redirect: "follow",
      });
    } catch (_e) {
      return new Response("Upstream fetch failed", { status: 502 });
    }

    const headers = new Headers();
    for (const [k, v] of upstream.headers) {
      if (!STRIP_HEADERS.has(k.toLowerCase())) headers.set(k, v);
    }

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers,
    });
  },
});
