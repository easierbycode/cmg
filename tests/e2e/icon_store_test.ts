// The icon store, through the real route handlers the dashboard calls:
// save a capture, list it, serve it, delete it — plus the guard rails (PNG
// validation, traversal-proof file names, Deploy refusal, cross-site
// refusal), the capture-agent HTML injection, and the pure cover-art naming
// rules the dashboard and pipeline share. Route handlers are invoked
// directly (the protocol E2E's pattern) — no server, no network, no browser.
//
// Run with: deno task test:e2e

import { assert, assertEquals, assertStringIncludes } from "@std/assert";

// ICONS_DIR derives from GAMES_DIR at module evaluation, so the env seam is
// set before anything imports the store (same pattern as the protocol E2E).
const gamesDir = await Deno.makeTempDir({ prefix: "cmg-icon-e2e-" });
Deno.env.set("CMG_GAMES_DIR", gamesDir);

const iconsRoute = await import("../../routes/api/icons/index.ts");
const fileRoute = await import("../../routes/api/icons/[file].ts");
const {
  coverCandidates,
  matchCoverFromIndex,
  sanitizeThumbName,
} = await import("../../lib/cover-art.ts");
const { injectCaptureAgent, injectLauncherMarker } = await import(
  "../../lib/launcher-inject.ts"
);
const { iconFileFor } = await import("../../lib/icons-store.ts");

type Ctx = { req: Request; params: Record<string, string> };
type Handlers = Record<string, (ctx: Ctx) => Response | Promise<Response>>;
const icons = iconsRoute.handler as unknown as Handlers;
const iconFile = fileRoute.handler as unknown as Handlers;

function ctx(
  init: RequestInit & { path?: string; params?: Record<string, string> } = {},
): Ctx {
  const { path, params, ...rest } = init;
  return {
    req: new Request("http://localhost" + (path ?? "/api/icons"), rest),
    params: params ?? {},
  };
}
function jsonInit(body: unknown, headers: Record<string, string> = {}) {
  return {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  };
}

// A real 1x1 PNG — the store validates magic bytes, so a fake won't do.
const PNG_B64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
const PNG_DATA_URL = "data:image/png;base64," + PNG_B64;

// Ids are arbitrary catalog strings — slashes and query strings included.
const GAME_ID = "games/2028-ai?turbo=1";

Deno.test("icon store round-trip: save → list → serve → delete", async () => {
  // Empty store answers, and identifies this machine as writable.
  let res = await icons.GET(ctx());
  assertEquals(res.status, 200);
  assertEquals(await res.json(), { ok: true, local: true, icons: {} });

  // Save under a slash-and-query id.
  res = await icons.POST(ctx(jsonInit({ id: GAME_ID, dataUrl: PNG_DATA_URL })));
  const saved = await res.json();
  assertEquals(res.status, 200);
  assert(saved.ok, "save should succeed");
  assertStringIncludes(saved.url, "/api/icons/" + iconFileFor(GAME_ID));

  // Listed under the exact id, cache-busted.
  res = await icons.GET(ctx());
  const listed = await res.json();
  assert(listed.icons[GAME_ID], "saved id should be listed");

  // Served back as a PNG with the original bytes.
  res = await iconFile.GET(ctx({ params: { file: iconFileFor(GAME_ID) } }));
  assertEquals(res.status, 200);
  assertEquals(res.headers.get("content-type"), "image/png");
  assertEquals(res.headers.get("cache-control"), "no-store");
  const bytes = new Uint8Array(await res.arrayBuffer());
  assertEquals(
    bytes,
    Uint8Array.from(atob(PNG_B64), (c) => c.charCodeAt(0)),
  );

  // Delete → gone from the list and the file route.
  res = await icons.DELETE(ctx({
    method: "DELETE",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id: GAME_ID }),
  }));
  assertEquals((await res.json()).ok, true);
  res = await icons.GET(ctx());
  assertEquals((await res.json()).icons, {});
  res = await iconFile.GET(ctx({ params: { file: iconFileFor(GAME_ID) } }));
  assertEquals(res.status, 404);
  await res.body?.cancel();
});

Deno.test("icon store validation: bad payloads are refused", async () => {
  // Not a data URL at all.
  let res = await icons.POST(ctx(jsonInit({ id: "x", dataUrl: "hello" })));
  assertEquals(res.status, 400);
  await res.body?.cancel();

  // Right envelope, but the bytes aren't a PNG.
  res = await icons.POST(ctx(jsonInit({
    id: "x",
    dataUrl: "data:image/png;base64," + btoa("not a png at all"),
  })));
  assertEquals(res.status, 400);
  await res.body?.cancel();

  // A file name that isn't a store-shaped slug never touches the disk.
  res = await iconFile.GET(ctx({ params: { file: "../../codemonkey.json" } }));
  assertEquals(res.status, 404);
  await res.body?.cancel();
});

Deno.test("icon store guards: Deploy is read-only, cross-site is refused", async () => {
  Deno.env.set("DENO_DEPLOYMENT_ID", "test-deploy");
  try {
    const list = await icons.GET(ctx());
    const data = await list.json();
    assertEquals(data.local, false, "Deploy must identify as non-writable");
    const res = await icons.POST(
      ctx(jsonInit({ id: "x", dataUrl: PNG_DATA_URL })),
    );
    assertEquals(res.status, 403);
    await res.body?.cancel();
  } finally {
    Deno.env.delete("DENO_DEPLOYMENT_ID");
  }

  const res = await icons.POST(ctx(jsonInit(
    { id: "x", dataUrl: PNG_DATA_URL },
    { "sec-fetch-site": "cross-site" },
  )));
  assertEquals(res.status, 403);
  await res.body?.cancel();
});

Deno.test("icon store survives a never-captured launcher and concurrent saves", async () => {
  // A store whose directory doesn't exist yet: reads are empty and a delete
  // is a no-op, not a crash (withIndex used to write index.json into a
  // missing directory).
  const fresh = await Deno.makeTempDir({ prefix: "cmg-icon-fresh-" });
  const dir = fresh + "/never-captured/.icons";
  Deno.env.set("CMG_ICONS_DIR", dir);
  try {
    const store = await import(
      "../../lib/icons-store.ts?fresh=" + encodeURIComponent(dir)
    );
    assertEquals(await store.listIcons(), {});
    assertEquals(await store.deleteIcon("never-saved"), false);

    // Two saves racing on one id must publish one whole PNG, never a mix.
    const png = Uint8Array.from(atob(PNG_B64), (c) => c.charCodeAt(0));
    await Promise.all([
      store.saveIcon("racy", png),
      store.saveIcon("racy", png),
    ]);
    const listed = await store.listIcons();
    assert(listed["racy"], "concurrent saves should leave the icon listed");
    assertEquals(await store.readIconFile(store.iconFileFor("racy")), png);
    // No temp files left behind.
    const leftovers: string[] = [];
    for await (const e of Deno.readDir(dir)) {
      if (e.name.endsWith(".tmp")) leftovers.push(e.name);
    }
    assertEquals(leftovers, []);
  } finally {
    Deno.env.delete("CMG_ICONS_DIR");
    await Deno.remove(fresh, { recursive: true }).catch(() => {});
  }
});

Deno.test("headless capture endpoint refuses foreign origins and argv injection", async () => {
  const autoRoute = await import("../../routes/api/icons/auto.ts");
  const auto = autoRoute.handler as unknown as Handlers;

  // SSRF: the endpoint drives a real browser, so it may only be pointed at
  // origins this launcher itself serves games from.
  for (
    const url of [
      "http://192.168.1.1/",
      "http://169.254.169.254/latest/meta-data/",
      "https://evil.example.com/page",
    ]
  ) {
    const res = await auto.POST(ctx(jsonInit({ id: "x", url })));
    assertEquals(res.status, 400, `${url} must be refused`);
    assertStringIncludes((await res.json()).error, "refusing to capture");
  }

  // Bad input is 400, not 500.
  let res = await auto.POST(
    ctx(jsonInit({ id: "", url: "http://localhost/" })),
  );
  assertEquals(res.status, 400);
  await res.body?.cancel();
  res = await auto.POST(ctx(jsonInit({ id: "x", url: "file:///etc/passwd" })));
  assertEquals(res.status, 400);
  await res.body?.cancel();

  // The launcher's own origin is allowed — and a `--flag=value`-shaped
  // startWhen can no longer reach the CLI's argv (the field is gone, and
  // numbers are re-stringified from the parsed value).
  const src = await Deno.readTextFile(
    new URL("../../routes/api/icons/auto.ts", import.meta.url),
  );
  assert(
    !src.includes("--start-when"),
    "auto.ts must not forward a caller-supplied predicate into argv",
  );
  assertStringIncludes(src, "captureUrlAllowed");
});

Deno.test("capture agent rides the game/player HTML injection", () => {
  const html =
    "<!doctype html><html><head><title>g</title></head><body></body></html>";
  const once = injectCaptureAgent(injectLauncherMarker(html));
  assertStringIncludes(once, 'id="cmg-icon-capture-agent"');
  assertStringIncludes(once, 'id="cmg-launcher-marker"');
  // Pre-script placement: both land before the game's own <title>.
  assert(once.indexOf("cmg-icon-capture-agent") < once.indexOf("<title>"));
  // Idempotent — a doubly-stamped document is returned unchanged.
  assertEquals(injectCaptureAgent(once), once);
});

Deno.test("cover-art naming: candidates, sanitization, fuzzy index match", () => {
  // No-Intro filename first, display name second, libretro's exact dir.
  const urls = coverCandidates("nes", {
    name: "Super Mario Bros",
    file: "Super Mario Bros. (World).nes",
  });
  assertStringIncludes(
    urls[0],
    "Nintendo%20-%20Nintendo%20Entertainment%20System/Named_Boxarts/Super%20Mario%20Bros.%20(World).png",
  );
  assert(urls.length >= 2);

  // The documented &*/:`<>?\| → _ substitution.
  assertEquals(
    sanitizeThumbName("3 Count Bout / Fire Suplex"),
    "3 Count Bout _ Fire Suplex",
  );

  // Switch has no libretro shelf — no candidates, no crash.
  assertEquals(coverCandidates("switch", { name: "Anything" }), []);

  // Fuzzy match strips region/translation tags and prefers USA > Japan.
  const entries = [
    "Mitsume ga Tooru (Japan).png",
    "Metroid (USA).png",
    "Metroid (Japan).png",
  ];
  assertEquals(
    matchCoverFromIndex(entries, {
      file: "Mitsume ga Tooru (J) [T-Eng1.01].nes",
    }),
    "Mitsume ga Tooru (Japan).png",
  );
  assertEquals(
    matchCoverFromIndex(entries, { name: "Metroid" }),
    "Metroid (USA).png",
  );
  assertEquals(matchCoverFromIndex(entries, { name: "Zelda" }), null);
});
