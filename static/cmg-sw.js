// CMG Network service worker — offline serving for "downloaded" e-shop games.
//
// The CMG Network screen (svelte-src/Dashboard.svelte) streams a game from its
// hosted streamUrl on first launch and, in the background, downloads the game's
// zip, unzips it, and stashes every file in Cache Storage under /cmg-net/<id>/…
// (that download/unzip/cache work happens in the page — see cmgnetDownload —
// where JSZip can be loaded on demand). On later launches the dashboard points
// the game iframe at /cmg-net/<id>/<entry> and THIS worker serves those files
// back from the cache, so the game runs with no network.
//
// The worker is deliberately passive: it only answers /cmg-net/* requests and
// needs no network at startup (so offline serving keeps working). Every other
// request passes straight through, so registering it doesn't change how the
// rest of the launcher loads.

const CACHE = "cmg-net-v1";
const PREFIX = "/cmg-net/";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener(
  "activate",
  (event) => event.waitUntil(self.clients.claim()),
);

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(PREFIX)) {
    return; // not ours — let the network/Fresh handle it
  }
  event.respondWith(
    caches.open(CACHE)
      .then((cache) => cache.match(url.pathname))
      // Cached file (stored by the page with its own Content-Type) wins; if it's
      // somehow missing, fall back to the network rather than hard-failing.
      .then((hit) => hit || fetch(event.request))
      .catch(() => new Response("Not cached", { status: 504 })),
  );
});
