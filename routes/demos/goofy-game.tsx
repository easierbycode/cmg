import { Head } from "fresh/runtime";
import { define } from "../../utils.ts";

// The Goofy multiplayer demo. Renders a Phaser 4 scene where two players
// each control their own Goofy walking the same globe. Players connect via
// the WebSocket relay at /api/ws-goofy — first to connect is P1, second is
// P2; P2's goofy has a color-cycling tint.
//
// Everything runs client-side. The scene code is shipped as one big inline
// script so the demo is self-contained — no separate bundle to build.
export default define.page(function GoofyGame() {
  return (
    <>
      <Head>
        <title>Goofy Game — multiplayer demo</title>
        <style>{`
          html, body {
            margin: 0;
            padding: 0;
            background: #1a2238;
            overflow: hidden;
            width: 100%;
            height: 100%;
          }
          #phaser-example {
            width: 100vw;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          #role-badge {
            position: fixed;
            top: 12px;
            left: 12px;
            z-index: 10;
            font-family: 'Share Tech Mono', monospace;
            font-size: 14px;
            color: #d2ac38;
            background: rgba(0, 0, 0, 0.55);
            border: 1px solid rgba(210, 172, 56, 0.5);
            padding: 6px 10px;
            border-radius: 6px;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            pointer-events: none;
          }
          #role-badge.connecting { color: #888; border-color: #666; }
          #role-badge.full { color: #ff7070; border-color: #aa4040; }
        `}</style>
      </Head>
      <div id="phaser-example"></div>
      <div id="role-badge" class="connecting">connecting…</div>
      <script
        src="https://cdn.jsdelivr.net/npm/phaser@4.1.0/dist/phaser.min.js"
        defer
      >
      </script>
      <script type="module" src="/demos/goofy-game.js" defer></script>
    </>
  );
});
