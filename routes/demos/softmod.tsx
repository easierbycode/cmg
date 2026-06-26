import { Head } from "fresh/runtime";
import { define } from "../../utils.ts";

// "Soft Mod" — a self-contained Phaser 4.1.0 cinematic that re-imagines the
// classic original-Xbox MechAssault soft-mod (Penguin Script → Winbond TSOP
// flash → reboot) as an immersive in-engine sequence. It is the payload of the
// launcher's *opposite-corner* easter egg: the "normal secret touch" is the
// bottom-left + top-right two-finger tap that opens the in-game OSD
// (see svelte-src/Dashboard.svelte); touching the OPPOSITE corners — top-left +
// bottom-right — boots this scene instead.
//
// Sequence (only the storyboard's first and last frames are recreated as
// literal screens; everything between is simulated live in Phaser):
//   1. Blue "flutter orb" intro — point lights, drifting petals, camera
//      zoom/rotate/flash. Plays *before* the boot logo.
//   2. MechAssault "monkey logo" boot screen           (storyboard frame 1)
//   3. Penguin Script menu → TSOP FLASH
//   4. SELECT GAME SAVE → confirm
//   5. Terminal: the Tux penguin script streaming its log
//   6. Winbond TSOP flash progress bar → 100%
//   7. FLASH COMPLETE → simulated restart
//   8. Original-Xbox boot "jewel" logo                 (storyboard last frame)
// On completion it posts { type: "softmod-done" } to the parent so the launcher
// overlay (the "rebooted" console) closes. Same no-bundle, CDN-Phaser shape as
// the vertical-shooter / headphones-recommended demos: Phaser loads as a
// browser global, then the scene module boots itself.

export default define.page(function Softmod() {
  return (
    <>
      <Head>
        <title>Soft Mod — Phaser 4.1.0 cinematic</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
        />
        <meta name="theme-color" content="#000000" />
        <style>
          {`
          html, body {
            margin: 0;
            padding: 0;
            background: #000;
            overflow: hidden;
            width: 100%;
            height: 100%;
            height: 100dvh;
          }
          /* Full-viewport host. Phaser's Scale.FIT + CENTER_BOTH letterboxes the
             16:9 canvas itself, so the container must not also flex-centre it. */
          #game-container { width: 100vw; height: 100dvh; }
          #game-container canvas { display: block; }
          `}
        </style>
      </Head>
      <div id="game-container"></div>
      <script
        src="https://cdn.jsdelivr.net/npm/phaser@4.1.0/dist/phaser.min.js"
        defer
      >
      </script>
      <script type="module" src="/demos/softmod.js" defer></script>
    </>
  );
});
