import { defineConfig, type Plugin } from "vite";
import { fresh } from "@fresh/plugin-vite";
import { WebSocketServer, type WebSocket } from "ws";

// Dev-only relay for the Goofy multiplayer demo. The production handler lives
// at routes/api/ws-goofy.ts and uses Deno.upgradeWebSocket on Deno Deploy.
// Under `deno task dev` the request never reaches Deno's HTTP server (Vite
// wraps everything via @mjackson/node-fetch-server, which can't carry an
// HTTP upgrade), so we run a parallel ws server here that speaks the same
// protocol.
function goofyDevWs(): Plugin {
  const WS_PATH = "/api/ws-goofy";
  type Role = "p1" | "p2";
  let p1: { socket: WebSocket; role: Role } | null = null;
  let p2: { socket: WebSocket; role: Role } | null = null;
  const peerOf = (r: Role) => (r === "p1" ? p2 : p1);
  const send = (ws: WebSocket, payload: unknown) => {
    if (ws.readyState !== ws.OPEN) return;
    try { ws.send(JSON.stringify(payload)); } catch { /* drop */ }
  };

  return {
    name: "goofy-dev-ws",
    configureServer(server) {
      const wss = new WebSocketServer({ noServer: true });
      server.httpServer?.on("upgrade", (req, socket, head) => {
        if (!req.url || !req.url.startsWith(WS_PATH)) return;
        wss.handleUpgrade(req, socket, head, (ws) => {
          let role: Role | null = null;
          if (p1 === null) { role = "p1"; p1 = { socket: ws, role }; }
          else if (p2 === null) { role = "p2"; p2 = { socket: ws, role }; }
          else {
            send(ws, { type: "full" });
            try { ws.close(1000, "room full"); } catch { /* drop */ }
            return;
          }
          send(ws, { type: "hello", role });
          const peer = peerOf(role);
          if (peer) {
            send(peer.socket, { type: "peer-joined", role });
            send(ws, { type: "peer-joined", role: peer.role });
          }
          ws.on("message", (data) => {
            if (!role) return;
            const peer = peerOf(role);
            if (!peer) return;
            try { peer.socket.send(data.toString()); } catch { /* drop */ }
          });
          const cleanup = () => {
            if (!role) return;
            if (role === "p1" && p1?.socket === ws) p1 = null;
            if (role === "p2" && p2?.socket === ws) p2 = null;
            const peer = peerOf(role);
            if (peer) send(peer.socket, { type: "peer-left", role });
            role = null;
          };
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
