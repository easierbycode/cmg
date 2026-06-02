import { Head } from "fresh/runtime";
import { define } from "../../utils.ts";

// "Akuma" — a Three.js character demo ported from Oxynt's three-mixamo example
// (the `akuma` game in codemonkey-games-launcher). An Akuma model idles with a
// looping dance and walks around a floor with WASD. Everything runs client-side:
// Three.js + FBXLoader load as ES modules from the CDN, then the scene module
// (static/demos/akuma.js) boots itself and loads the FBX meshes/animation +
// texture from /demos/akuma/. Same self-contained, no-bundle shape as the
// goofy-game and headphones-recommended demos.
export default define.page(function Akuma() {
  return (
    <>
      <Head>
        <title>Akuma — Three.js character demo</title>
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
          canvas { display: block; }
          /* Attribution + controls hint, mirrored from the original game. Hidden
             inside the launcher iframe — akuma.js adds .inLauncher to <html> when
             embedded; standalone visitors to /demos/akuma still see it. */
          #info {
            position: absolute;
            top: 0;
            width: 100%;
            padding: 10px;
            box-sizing: border-box;
            text-align: center;
            color: #fff;
            font-family: Monospace;
            font-size: 13px;
            line-height: 24px;
            user-select: none;
            pointer-events: none;
            z-index: 1;
          }
          #info a { color: #ff0; text-decoration: none; pointer-events: auto; }
          #info a:hover { text-decoration: underline; }
          .inLauncher #info { display: none !important; }
        `}
        </style>
      </Head>
      <div id="info">
        <a
          href="https://threejs.org/examples/webgl_loader_fbx.html"
          target="_blank"
          rel="noopener"
        >
          three.js
        </a>{" "}
        basic character control <br /> WASD to move
      </div>
      <script type="module" src="/demos/akuma.js" defer></script>
    </>
  );
});
