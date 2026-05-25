import { defineConfig, type Plugin } from "vite";
import { fresh } from "@fresh/plugin-vite";
import { WebSocketServer, type WebSocket } from "ws";

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
              try { peer.send(str); } catch { /* drop */ }
            }
          });
          const cleanup = () => { clients.delete(ws); };
          ws.on("close", cleanup);
          ws.on("error", cleanup);
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [fresh(), goofyDevWs()],
  server: {
    // Allow ngrok tunnels (and any other host) to reach the dev server.
    // Dev-only — production builds aren't served by Vite.
    allowedHosts: true,
  },
});
