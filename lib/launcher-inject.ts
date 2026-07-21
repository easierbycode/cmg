// Launcher-detection contract, ported from codemonkey-games-launcher (its
// routes/[...path].ts injects the same marker into every game it serves).
// Games hide their own standalone chrome — headers, attribution, instructions —
// when running inside the launcher via CSS keyed off these signals:
//
//   .inLauncher #info { display: none !important; }
//
// Signals stamped on the game document when it runs inside the launcher UI:
//   - window.__CMG_LAUNCHER__ === true and window.__CMG__.launcher === true
//   - <html data-cmg-launcher="1">
//   - class "inLauncher" on <html> and <body>
//
// One deliberate divergence from upstream: the launcher repo stamps
// unconditionally because its server exists only to back the kiosk window.
// CMG's routes are also the public web app, so the marker here fires only when
// the page is actually embedded (window.parent !== window) — a direct visit to
// /games/<id>/ keeps the game's standalone header. The dashboard always runs
// games in an iframe (web, kiosk, and desktop builds alike), so every real
// launcher launch is covered. This matches the convention CMG demos already
// use by hand (static/demos/akuma.js); the same stamp is applied from the
// launcher side for same-origin frames in svelte-src/Dashboard.svelte
// (injectLauncherMarkerIntoFrame) — both are idempotent.

export const LAUNCHER_MARKER = `\n<script id="cmg-launcher-marker">(function(){
  try {
    if (window.parent === window) return; /* standalone tab: keep the game's own chrome */
    window.__CMG_LAUNCHER__ = true;
    if (!window.__CMG__) { try { window.__CMG__ = Object.freeze({ launcher: true, name: "cmg" }); } catch(_){} }
    try { document.documentElement.setAttribute("data-cmg-launcher", "1"); } catch(_){}
    try { document.documentElement.classList.add("inLauncher"); } catch(_){}
    try {
      if (document.body) document.body.classList.add("inLauncher");
      else document.addEventListener("DOMContentLoaded", function(){ try { document.body && document.body.classList.add("inLauncher"); } catch(_){} }, { once: true });
    } catch(_){}
  } catch(_){}
})();</script>\n`;

// Insert the marker right after <head> so it runs before the game's own
// scripts. Fallback anchors mirror the upstream injector: after <!doctype>,
// after <html>, else prepended to fragment-only documents. Idempotent: a
// document that already carries the marker (e.g. stamped by both the
// middleware in main.ts and a route-level injector) is returned unchanged.
export function injectLauncherMarker(html: string): string {
  if (html.includes('id="cmg-launcher-marker"')) return html;
  if (/<head[^>]*>/i.test(html)) {
    return html.replace(/<head[^>]*>/i, (m) => m + LAUNCHER_MARKER);
  }
  if (/^<!doctype[^>]*>/i.test(html)) {
    return html.replace(/^<!doctype[^>]*>/i, (m) => m + LAUNCHER_MARKER);
  }
  if (/<html[^>]*>/i.test(html)) {
    return html.replace(/<html[^>]*>/i, (m) => m + LAUNCHER_MARKER);
  }
  return LAUNCHER_MARKER + html;
}
