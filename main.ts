import { App, staticFiles } from "fresh";
import { define, type State } from "./utils.ts";
import {
  injectCaptureAgent,
  injectLauncherMarker,
} from "./lib/launcher-inject.ts";
import {
  cloudLevelAliases,
  cloudLevelKeys,
  subdomainRedirect,
  subdomainRootLabel,
} from "./lib/level-subdomain.ts";

export const app = new App<State>();

app.use(async (ctx) => {
  const res = await ctx.next();
  res.headers.set("Access-Control-Allow-Origin", "*");
  return res;
});

// Cross-origin isolation for the PS2 and Switch players only. Play!
// (static/ps2/) runs the emulated EE/IOP on pthreads and Voland
// (static/switch/) keeps guest RAM in a shared WebAssembly.Memory addressed
// by its CPU/GPU workers; both need SharedArrayBuffer, which browsers gate on
// crossOriginIsolated — the document must arrive with COOP + COEP. Scoped to
// these two prefixes because a site-wide COEP would break every other
// embedded game/demo (their cross-origin subresources lack CORP headers). The
// dashboard therefore opens both players as top-level navigations rather than
// game iframes: an iframe only isolates when the embedding page is isolated
// too.
const ISOLATED_PLAYERS = ["/ps2/", "/switch/"];
app.use(async (ctx) => {
  const res = await ctx.next();
  const path = new URL(ctx.req.url).pathname;
  if (ISOLATED_PLAYERS.some((p) => path.startsWith(p))) {
    res.headers.set("Cross-Origin-Opener-Policy", "same-origin");
    res.headers.set("Cross-Origin-Embedder-Policy", "require-corp");
  }
  return res;
});

// Stamp the launcher-detection marker (lib/launcher-inject.ts) into every
// game/demo HTML response, wherever it comes from: staticFiles() built-ins,
// the GAMES_DIR catch-all, per-game Fresh routes, and the evil-invaders
// proxy. Registered ahead of staticFiles() so it wraps those responses too.
// Gated to /games/* and /demos/* so the dashboard shell, editor, and players
// stay untouched. The marker script only activates when the page is actually
// embedded (window.parent !== window), so this also covers packaged launchers
// that resolve built-in games/demos against the deploy origin — cross-origin
// frames the client-side stamp in Dashboard.svelte can't reach. Validator
// headers are dropped along with content-length: a 304 against a
// pre-injection cached copy would otherwise keep serving unstamped HTML.
// The icon-capture agent (same file) rides along, and is ALSO stamped into
// the embedded emulator player pages (/nes, /psx, … play.html) — they never
// get the marker, but their WebGL canvases need the agent's armed
// preserveDrawingBuffer patch to be capturable, and it must run before the
// emulator boots. PS2 and Switch are top-level navigations with no parent
// frame, so the agent would be inert there and they are left out.
const PLAYER_PAGES =
  /^\/(nes|psx|saturn|turbografx16|arcade|naomi)\/play\.html$/i;
app.use(async (ctx) => {
  const res = await ctx.next();
  if (ctx.req.method !== "GET" || res.status !== 200) return res;
  const path = new URL(ctx.req.url).pathname;
  const isGameDoc = /^\/(games|demos)(\/|$)/.test(path);
  if (!isGameDoc && !PLAYER_PAGES.test(path)) return res;
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("text/html")) return res;
  let html = injectCaptureAgent(await res.text());
  if (isGameDoc) html = injectLauncherMarker(html);
  const headers = new Headers(res.headers);
  headers.delete("content-length");
  headers.delete("etag");
  headers.delete("last-modified");
  return new Response(html, { status: res.status, headers });
});

// `<name>.<site>/` is the game called <name>: a subdomain's root goes to the
// game with that level (/games/2028-ai?level=<its key>), or — when no game has
// the name — to the level editor's NEW GAME with the name filled in
// (/editor/?new=<name>). Only the root; every other path on a subdomain serves
// as the apex does. lib/level-subdomain.ts has the matching rules, the cached
// listing of `levels/*` and the alias index beside it (2019.<site> is 2019-PS2
// by alias), and which hosts count as a site: CMG_SITE_HOSTS, plus localhost.
// Ahead of staticFiles() and the dashboard route, GET and HEAD only. The
// database is read only for a request that is a subdomain's root, so the apex,
// the deploy URL and a launcher on 127.0.0.1 never wait on it.
app.use(async (ctx) => {
  if (subdomainRootLabel(ctx.req) === null) return ctx.next();
  const [keys, aliases] = await Promise.all([
    cloudLevelKeys(),
    cloudLevelAliases(),
  ]);
  return subdomainRedirect(ctx.req, keys, aliases ?? {}) ?? ctx.next();
});

app.use(staticFiles());

// The Linux launcher (.AppImage, ~150 MB) is built in CI and published to
// GitHub Releases — far too large to live in git or the Deno Deploy bundle.
// Expose a stable download URL by redirecting to the latest release asset.
// See .github/workflows/build-appimage.yml and `deno task build:linux`.
const APPIMAGE_URL =
  "https://github.com/easierbycode/cmg/releases/latest/download/cmg-x86_64.AppImage";
// Build the redirect by hand rather than Response.redirect(): the latter
// returns a response with immutable headers, which the CORS middleware above
// cannot amend (it would throw "headers are immutable").
app.get(
  "/app.AppImage",
  () =>
    new Response(null, { status: 302, headers: { location: APPIMAGE_URL } }),
);

// Pass a shared value from a middleware
app.use(async (ctx) => {
  ctx.state.shared = "hello";
  return await ctx.next();
});

// this is the same as the /api/:name route defined via a file. feel free to delete this!
app.get("/api2/:name", (ctx) => {
  const name = ctx.params.name;
  return new Response(
    `Hello, ${name.charAt(0).toUpperCase() + name.slice(1)}!`,
  );
});

// Per-request access log. Useful in dev but pure noise in the kiosk (one line per
// asset the emulators fetch), so it's gated on CMG_VERBOSE — the same switch the
// launchers use to surface Chrome's output. The env is read per request so the
// toggle works at runtime in the compiled launcher, not just at build time.
const requestLoggerMiddleware = define.middleware((ctx) => {
  if (Deno.env.get("CMG_VERBOSE")) {
    console.log(`${ctx.req.method} ${ctx.req.url}`);
  }
  return ctx.next();
});
app.use(requestLoggerMiddleware);

// Include file-system based routes here
app.fsRoutes();

// Default export for the @fresh/plugin-vite convention. Note this is NOT a
// valid `deno serve` / `deno desktop` entry: Fresh's App has no `fetch`
// property (only `handler()`/`listen()`), so auto-serve entries must use the
// built `_fresh/server.js`, which wraps the handler in `{ fetch }`. The
// `deno task start` and `desktop:*` tasks (see deno.json) do exactly that.
export default app;
