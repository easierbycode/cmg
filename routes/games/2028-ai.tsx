import { Head } from "fresh/runtime";
import { define } from "../../utils.ts";

// "2028.Ai" — a self-contained, offline build of the 2019-es7 Phaser shooter,
// hosted inside cmg. The game scenes are shipped as one esbuild bundle
// (/games/2028-ai/game.bundle.js, built by scripts/build-2028-ai.ts) and the
// level (Firebase "foo", baked offline at /games/2028-ai/level-data.json) is
// resolved at runtime by the level-loader ScenePlugin. Phaser and every asset
// are served locally, so there is no network dependency at play time.
//
// The audio-unlock shim below patches AudioContext before Phaser constructs
// one, then resumes it on the first user gesture so the bundled BGM/SE play.

const AUDIO_UNLOCK = `
(function () {
  var ctxs = [];
  var OrigAC = window.AudioContext || window.webkitAudioContext;
  if (!OrigAC) return;
  function Patched() { var c = new OrigAC(); ctxs.push(c); return c; }
  Patched.prototype = OrigAC.prototype;
  if (window.AudioContext) window.AudioContext = Patched;
  if (window.webkitAudioContext) window.webkitAudioContext = Patched;
  function unlock() {
    for (var i = 0; i < ctxs.length; i++) {
      var c = ctxs[i];
      if (c && (c.state === "suspended" || c.state === "interrupted")) {
        c.resume().catch(function () {});
      }
    }
  }
  ["pointerdown", "touchstart", "mousedown", "keydown"].forEach(function (ev) {
    window.addEventListener(ev, unlock, { passive: true });
  });
})();
`;

export default define.page(function Game2028() {
  return (
    <>
      <Head>
        <title>2028.Ai</title>
        <style>
          {`
          html, body {
            margin: 0;
            padding: 0;
            background: #000;
            overflow: hidden;
            width: 100%;
            height: 100%;
          }
          #phaser-canvas {
            position: fixed;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          #phaser-canvas canvas {
            image-rendering: pixelated;
            image-rendering: crisp-edges;
            max-width: 100vw;
            max-height: 100vh;
            height: auto;
            width: auto;
          }
          `}
        </style>
        <script dangerouslySetInnerHTML={{ __html: AUDIO_UNLOCK }} />
      </Head>

      {/* baseUrl is read by the level-loader plugin's audio path */}
      <div id="baseUrl" hidden>/games/2028-ai/</div>
      <div id="phaser-canvas"></div>

      <script src="/games/2028-ai/lib/phaser.min.js" defer></script>
      <script src="/games/2028-ai/game.bundle.js" defer></script>
    </>
  );
});
