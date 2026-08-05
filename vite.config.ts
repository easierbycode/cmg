import { defineConfig, type Plugin } from "vite";
import { fresh } from "@fresh/plugin-vite";
import { type WebSocket, WebSocketServer } from "ws";

// Dev-only relay for the Goofy multiplayer demo. The production handler lives
// at routes/api/ws-goofy.ts and uses Deno.upgradeWebSocket on Deno Deploy.
// Under `deno task dev` the request never reaches Deno's HTTP server (Vite
// wraps everything via @mjackson/node-fetch-server, which can't carry an
// HTTP upgrade), so we run a parallel ws server here that speaks the same
// protocol: a dumb fan-out relay. All room/role/coin logic lives client-side
// (see static/demos/goofy-game.js); the relay just forwards each message to
// every other connected client. Single process here, so no cross-isolate
// bridge is needed.
function goofyDevWs(): Plugin {
  const WS_PATH = "/api/ws-goofy";
  const clients = new Set<WebSocket>();

  return {
    name: "goofy-dev-ws",
    configureServer(server) {
      const wss = new WebSocketServer({ noServer: true });
      server.httpServer?.on("upgrade", (req, socket, head) => {
        if (!req.url || !req.url.startsWith(WS_PATH)) return;
        wss.handleUpgrade(req, socket, head, (ws) => {
          clients.add(ws);
          ws.on("message", (data) => {
            const str = data.toString();
            for (const peer of clients) {
              if (peer === ws || peer.readyState !== peer.OPEN) continue;
              try {
                peer.send(str);
              } catch { /* drop */ }
            }
          });
          const cleanup = () => {
            clients.delete(ws);
          };
          ws.on("close", cleanup);
          ws.on("error", cleanup);
        });
      });
    },
  };
}

// Dev parity for the cross-origin-isolated players. In production these
// COOP+COEP headers come from the main.ts middleware, but Vite serves static
// files itself in dev, bypassing the Fresh app — without this shim Play! (PS2)
// and Voland (Switch) have no SharedArrayBuffer under `deno task dev`. Keep
// this list in sync with ISOLATED_PLAYERS in main.ts.
const ISOLATED_PLAYERS = ["/ps2/", "/switch/"];

function playerIsolationHeaders(): Plugin {
  return {
    name: "player-isolation-headers",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && ISOLATED_PLAYERS.some((p) => req.url!.startsWith(p))) {
          res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
          res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [fresh(), goofyDevWs(), playerIsolationHeaders()],
  server: {
    // Allow ngrok tunnels (and any other host) to reach the dev server.
    // Dev-only — production builds aren't served by Vite.
    allowedHosts: true,
  },
});
