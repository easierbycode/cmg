import { Head } from "fresh/runtime";
import { define } from "../../utils.ts";

// "Headphones Recommended" — a Phaser 4.2.1 title/idle scene (ported from a
// Phaser 3 CodePen). Everything runs client-side: Phaser is loaded as a browser
// global from the CDN, then the scene module boots itself (see
// static/demos/headphones-recommended.js). Same self-contained, no-bundle shape
// as the goofy-game demo.
// Launcher OSD bridge. Once this game has keyboard focus the parent launcher
// stops receiving keydowns, so its own ` / ~ / Esc handler never fires. When
// embedded in cmg — which can be cross-origin in packaged/online builds, where
// the launcher can't inject a forwarder itself — forward those keys up so it
// can toggle the in-game Guide/OSD. Capture phase + stopImmediatePropagation so
// the game doesn't also act on them. No-op when the page is opened standalone.
const OSD_BRIDGE = `
(function () {
  if (window.parent === window) return; // standalone — leave keys to the game
  window.addEventListener("keydown", function (e) {
    if (e.code === "Backquote" || e.key === "\`" || e.key === "~" ||
        e.keyCode === 192 || e.key === "Escape") {
      e.preventDefault();
      e.stopImmediatePropagation();
      try { window.parent.postMessage({ type: "tg16-toggle-controls" }, "*"); } catch (_) {}
    }
  }, true);
})();
`;

export default define.page(function HeadphonesRecommended() {
  return (
    <>
      <Head>
        <script src="/gamepad-compatibility-plugin.js"></script>
        <script dangerouslySetInnerHTML={{ __html: OSD_BRIDGE }} />
        <title>Headphones Recommended — Phaser 4.2.1 demo</title>
        <style>
          {`
          html, body {
            margin: 0;
            padding: 0;
            background: #092344;
            overflow: hidden;
            width: 100%;
            height: 100%;
          }
          /* Full-viewport host. Phaser's Scale.FIT + CENTER_BOTH centres the
             canvas via margins, so the container must NOT also flex-centre it
             (that double-centres and shifts the canvas off to one side). */
          #game-container {
            width: 100vw;
            height: 100vh;
          }
        `}
        </style>
      </Head>
      <div id="game-container"></div>
      <script
        src="https://cdn.jsdelivr.net/npm/phaser@4.2.1/dist/phaser.min.js"
        defer
      >
      </script>
      <script
        type="module"
        src="/demos/headphones-recommended.js"
        defer
      >
      </script>
    </>
  );
});
