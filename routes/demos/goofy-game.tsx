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
          #scoreboard {
            position: fixed;
            top: 12px;
            right: 12px;
            z-index: 10;
            display: flex;
            flex-direction: column;
            gap: 4px;
            font-family: 'Share Tech Mono', monospace;
            font-size: 13px;
            color: #f4f4f4;
            pointer-events: none;
          }
          #scoreboard .score-row {
            display: flex;
            align-items: center;
            gap: 8px;
            background: rgba(0, 0, 0, 0.55);
            border: 1px solid rgba(255, 255, 255, 0.18);
            padding: 4px 9px;
            border-radius: 6px;
            letter-spacing: 0.06em;
          }
          #scoreboard .score-row.me { border-color: rgba(210, 172, 56, 0.85); }
          #scoreboard .score-swatch {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.5);
          }
          #scoreboard .score-name { min-width: 56px; }
          #scoreboard .score-coins { margin-left: auto; color: #ffd95a; }
        `}</style>
      </Head>
      <div id="phaser-example"></div>
      <div id="role-badge" class="connecting">connecting…</div>
      <div id="scoreboard"></div>
      <script
        src="https://cdn.jsdelivr.net/npm/phaser@4.1.0/dist/phaser.min.js"
        defer
      >
      </script>
      <script type="module" src="/demos/goofy-game.js" defer></script>
    </>
  );
});
