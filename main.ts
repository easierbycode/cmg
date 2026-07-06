import { App, staticFiles } from "fresh";
import { define, type State } from "./utils.ts";

export const app = new App<State>();

app.use(async (ctx) => {
  const res = await ctx.next();
  res.headers.set("Access-Control-Allow-Origin", "*");
  return res;
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

// Default export so the app is a valid `deno serve` / `deno desktop` entry
// (Fresh's App exposes a `fetch` handler). The Vite dev/build path imports the
// App via the @fresh/plugin-vite convention and ignores this; it exists for the
// Deno Desktop packaging task (`deno task desktop:*`, see deno.json) which wraps
// this server in a native webview window.
export default app;
