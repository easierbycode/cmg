// WebSocket relay for the Goofy multiplayer demo.
//
// This is a dumb fan-out relay: every message a client sends is forwarded
// verbatim to every *other* connected client. All room/role/coin logic lives
// client-side, keyed by a per-client id, so the relay holds no game state of
// its own beyond the set of live sockets.
//
// Cross-isolate: Deno Deploy may place clients in different isolates, where
// module-level state is NOT shared — that's why the old pair-by-isolate scheme
// made every client think it was P1 (each was alone in its own isolate). To
// bridge isolates we relay through a BroadcastChannel, which IS shared across
// isolates of the same deployment: each isolate fans local messages out to its
// own sockets and republishes them on the channel; channel messages from other
// isolates get fanned out to local sockets.

import { define } from "../../utils.ts";

const sockets = new Set<WebSocket>();

// Identifies this isolate so we can ignore the echo of our own publishes.
const ISOLATE_ID = crypto.randomUUID();

let channel: BroadcastChannel | null = null;
try {
  channel = new BroadcastChannel("goofy-room");
  channel.onmessage = (e: MessageEvent) => {
    const payload = e.data as { from?: string; data?: string } | undefined;
    if (!payload || payload.from === ISOLATE_ID || !payload.data) return;
    fanOutLocal(payload.data);
  };
} catch (_) {
  // BroadcastChannel unavailable in this runtime — single-isolate only.
  channel = null;
}

function fanOutLocal(data: string, except?: WebSocket) {
  for (const s of sockets) {
    if (s === except || s.readyState !== WebSocket.OPEN) continue;
    try {
      s.send(data);
    } catch (_) { /* peer closing — drop */ }
  }
}

export const handler = define.handlers({
  GET(ctx) {
    const upgrade = ctx.req.headers.get("upgrade") ?? "";
    if (upgrade.toLowerCase() !== "websocket") {
      return new Response("Expected a WebSocket upgrade", { status: 426 });
    }

    const { socket, response } = Deno.upgradeWebSocket(ctx.req);

    socket.onopen = () => {
      sockets.add(socket);
    };

    socket.onmessage = (e) => {
      const data = typeof e.data === "string" ? e.data : "";
      if (!data) return;
      // Everyone else in this isolate...
      fanOutLocal(data, socket);
      // ...plus sockets living in other isolates.
      if (channel) {
        try {
          channel.postMessage({ from: ISOLATE_ID, data });
        } catch (_) { /* drop */ }
      }
    };

    const cleanup = () => {
      sockets.delete(socket);
    };
    socket.onclose = cleanup;
    socket.onerror = cleanup;

    return response;
  },
});
