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

// this can also be defined via a file. feel free to delete this!
const exampleLoggerMiddleware = define.middleware((ctx) => {
  console.log(`${ctx.req.method} ${ctx.req.url}`);
  return ctx.next();
});
app.use(exampleLoggerMiddleware);

// Include file-system based routes here
app.fsRoutes();
