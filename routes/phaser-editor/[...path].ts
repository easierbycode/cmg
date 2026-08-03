// Same-origin reverse proxy for a running Phaser Editor 2D server.
//
// URL shape: /phaser-editor/<project>/<rest> → http://127.0.0.1:<port>/editor/<rest>,
// where <port> is the server lib/phaser-editor.ts started for that project
// (POST /api/phaser-editor). The editor is a separate process on its own port,
// so framing it directly would make the IDE a cross-origin document: the
// dashboard could no longer stamp the launcher marker into it, nor install the
// in-frame two-corner gesture that opens the Guide (both are same-origin-only —
// see injectLauncherMarkerIntoFrame / injectEditorCornerGesture), and a
// packaged launcher served over https couldn't load it at all (mixed content).
// Routing it through the launcher's own origin keeps all of that working, the
// same trick /games/evil-invaders/ uses for an off-site game.
//
// Scoped to editors this process itself started, for a directory that holds a
// phasereditor2d.config.json — not an open relay. Local launcher only.
import { define } from "../../utils.ts";
import { crossSiteGuard, isDeploy } from "../../lib/games-store.ts";
import { projectName, runningEditorFor } from "../../lib/phaser-editor.ts";

// Request headers that must not be forwarded: hop-by-hop framing, the launcher
// origin's Host (the editor answers on 127.0.0.1), and the browser's
// accept-encoding (Deno's fetch negotiates and decodes its own).
const DROP_REQUEST = new Set([
  "host",
  "connection",
  "keep-alive",
  "transfer-encoding",
  "upgrade",
  "accept-encoding",
  "content-length",
]);

// Response headers that would either lie about the re-streamed body or undo the
// point of proxying (the framing policies).
const DROP_RESPONSE = new Set([
  "content-encoding",
  "content-length",
  "transfer-encoding",
  "connection",
  "keep-alive",
  "x-frame-options",
  "content-security-policy",
  "content-security-policy-report-only",
  "cross-origin-opener-policy",
  "cross-origin-embedder-policy",
  "cross-origin-resource-policy",
]);

const MOUNT = "/phaser-editor/";

// The editor is written for a server mounted at /editor/. Nearly everything it
// loads is relative to the document — which lands on the project mount by
// itself — but a handful of URLs are absolute and would escape to the
// launcher's own (unrelated) /editor/ level editor:
//   index.html   the splash image
//   the bundle   getPluginURL() → /editor/app/plugins/…  (every icon),
//                loadProduct() → /editor/product.json    (boot blocks on it),
//                the "open externally" link → //${host}/editor/external/…
// Point those at this project's mount instead. Deliberately narrow: only a
// "/editor/" that opens a string/template literal (or follows a template
// interpolation, as the external link does) is rewritten, so the bundle's
// `/// <reference path="../../editor/…">` comments are left alone.
function rebase(text: string, mount: string): string {
  return text.replace(/(["'`(}])\/editor\//g, `$1${mount}`);
}

// Content types whose bodies carry those URLs. Everything else (images, fonts,
// JSON data, uploads) streams through untouched.
function isRewritable(type: string): boolean {
  return /(^|\/|\+)(html|javascript|css)\b/.test(type) ||
    type.startsWith("text/html");
}

async function proxy(ctx: { req: Request }) {
  if (isDeploy()) return new Response("Not Found", { status: 404 });
  // Reads are guarded too, not just writes: while an editor is up this path
  // serves the project's own source files, and the launcher answers every
  // request with `Access-Control-Allow-Origin: *` (the middleware in main.ts),
  // so without this any page the player happens to visit could read the tree
  // straight off localhost. The editor frame is same-origin, so the real client
  // is never affected.
  const denied = crossSiteGuard(ctx.req);
  if (denied) return denied;

  // Read the sub-path off the URL rather than ctx.params: the catch-all
  // parameter comes back empty for the mount root ("/phaser-editor/<project>/"),
  // which is exactly the URL the frame is pointed at. Kept percent-encoded —
  // it is re-parsed as a URL below, not as a filesystem path.
  const reqUrl = new URL(ctx.req.url);
  if (!reqUrl.pathname.startsWith(MOUNT)) {
    return new Response("Not Found", { status: 404 });
  }
  const segments = reqUrl.pathname.slice(MOUNT.length).split("/");
  const name = projectName(decodeURIComponent(segments[0] ?? ""));
  if (!name) return new Response("Not Found", { status: 404 });

  const editor = await runningEditorFor(name);
  if (!editor) {
    // Nothing running for this project — the dashboard should POST
    // /api/phaser-editor first. 503 (not 404) so a reload after the editor
    // exits reads as "start it again", not "wrong URL".
    return new Response("Phaser Editor is not running for this project", {
      status: 503,
    });
  }

  const rest = segments.slice(1).join("/");
  // Resolve against the editor's own mount. `rest` comes from the URL path and
  // can contain "..", so re-check that the result stays inside /editor/.
  const target = new URL(
    `http://127.0.0.1:${editor.port}/editor/${rest}`,
  );
  if (!target.pathname.startsWith("/editor/")) {
    return new Response("Forbidden", { status: 403 });
  }
  target.search = reqUrl.search;

  const headers = new Headers();
  for (const [k, v] of ctx.req.headers) {
    if (!DROP_REQUEST.has(k.toLowerCase())) headers.set(k, v);
  }

  const method = ctx.req.method;
  const body = method === "GET" || method === "HEAD"
    ? undefined
    : await ctx.req.arrayBuffer();

  let upstream: Response;
  try {
    upstream = await fetch(target.href, {
      method,
      headers,
      body,
      redirect: "manual",
    });
  } catch (e) {
    return new Response(`Editor unreachable: ${(e as Error).message}`, {
      status: 502,
    });
  }

  const out = new Headers();
  for (const [k, v] of upstream.headers) {
    if (DROP_RESPONSE.has(k.toLowerCase())) continue;
    // A redirect the editor issues points back into its own /editor/ space;
    // keep the browser on the proxied path.
    if (k.toLowerCase() === "location" && v.startsWith("/editor/")) {
      out.set(k, `/phaser-editor/${name}/${v.slice("/editor/".length)}`);
      continue;
    }
    out.set(k, v);
  }

  const type = upstream.headers.get("content-type") ?? "";
  if (upstream.status === 200 && isRewritable(type)) {
    const body = rebase(await upstream.text(), `${MOUNT}${name}/`);
    // The validators and byte offsets describe the upstream bytes, not the
    // rewritten ones: a 304 would hand the browser an un-rebased cached copy,
    // and a range request would slice at the wrong offsets.
    out.delete("etag");
    out.delete("last-modified");
    out.delete("accept-ranges");
    return new Response(body, { status: upstream.status, headers: out });
  }
  return new Response(upstream.body, { status: upstream.status, headers: out });
}

export const handler = define.handlers({
  GET: proxy,
  HEAD: proxy,
  POST: proxy,
  PUT: proxy,
  PATCH: proxy,
  DELETE: proxy,
});
