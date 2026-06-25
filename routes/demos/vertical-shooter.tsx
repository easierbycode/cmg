import { Head } from "fresh/runtime";
import { define } from "../../utils.ts";

// "Vertical Shooter" — a Phaser 4.1.0 vertical shmup (TATE) demo whose headline
// feature is a toggleable CRT post-processing shader ("TATE Mode"), ported from
// OpenEmu's tate_shmup_time.glsl to Phaser 4's Filters system. Everything runs
// client-side: Phaser loads as a browser global from the CDN, then the scene
// module boots itself (static/demos/vertical-shooter.js). Same self-contained,
// no-bundle shape as the headphones-recommended / goofy-game demos.
//
// The game advertises its live toggles to the launcher's in-game Guide/OSD the
// same way games advertise cheats — by postMessage'ing
// { type: 'cmg-plugins', plugins: [...] } to the parent on boot. Opening the
// OSD (SELECT + Down on a gamepad) then shows a "TATE Mode" toggle; flipping it
// posts { type: 'cmg-plugin-set', id, value } back into this frame, applied live.
//
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

export default define.page(function VerticalShooter() {
  return (
    <>
      <Head>
        <script src="/gamepad-compatibility-plugin.js"></script>
        <script dangerouslySetInnerHTML={{ __html: OSD_BRIDGE }} />
        <title>Vertical Shooter — Phaser 4.1.0 TATE CRT demo</title>
        <style>
          {`
          html, body {
            margin: 0;
            padding: 0;
            background: #05060f;
            overflow: hidden;
            width: 100%;
            height: 100%;
          }
          /* Full-viewport host. Phaser's Scale.FIT + CENTER_BOTH centres the
             portrait canvas via margins, so the container must NOT also
             flex-centre it (that double-centres and shifts it off to one side). */
          #game-container {
            width: 100vw;
            height: 100vh;
          }
        `}
        </style>
      </Head>
      <div id="game-container"></div>
      <script
        src="https://cdn.jsdelivr.net/npm/phaser@4.1.0/dist/phaser.min.js"
        defer
      >
      </script>
      <script
        type="module"
        src="/demos/vertical-shooter.js"
        defer
      >
      </script>
    </>
  );
});
