import { Head } from "fresh/runtime";
import { define } from "../../utils.ts";

// "Headphones Recommended" — a Phaser 4.1.0 title/idle scene (ported from a
// Phaser 3 CodePen). Everything runs client-side: Phaser is loaded as a browser
// global from the CDN, then the scene module boots itself (see
// static/demos/headphones-recommended.js). Same self-contained, no-bundle shape
// as the goofy-game demo.
export default define.page(function HeadphonesRecommended() {
  return (
    <>
      <Head>
        <title>Headphones Recommended — Phaser 4.1.0 demo</title>
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
        src="https://cdn.jsdelivr.net/npm/phaser@4.1.0/dist/phaser.min.js"
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
