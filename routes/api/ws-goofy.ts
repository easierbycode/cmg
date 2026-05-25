// WebSocket relay for the Goofy multiplayer demo. Pairs the first two clients
// that connect into the same isolate as P1 / P2 and forwards any messages each
// sends to the other. State is per-isolate by design — Deno Deploy may serve
// users from different isolates, in which case each one becomes a P1 waiting
// for a peer. Fine for a demo.

import { define } from "../../utils.ts";

type Role = "p1" | "p2";

interface Client {
  socket: WebSocket;
  role: Role;
}

let p1: Client | null = null;
let p2: Client | null = null;

function send(socket: WebSocket, payload: unknown) {
  if (socket.readyState !== WebSocket.OPEN) return;
  try {
    socket.send(JSON.stringify(payload));
  } catch (_) { /* peer is closing — drop */ }
}

function peerOf(role: Role): Client | null {
  return role === "p1" ? p2 : p1;
}

export const handler = define.handlers({
  GET(ctx) {
    const upgrade = ctx.req.headers.get("upgrade") ?? "";
    if (upgrade.toLowerCase() !== "websocket") {
      return new Response("Expected a WebSocket upgrade", { status: 426 });
    }

    const { socket, response } = Deno.upgradeWebSocket(ctx.req);

    let role: Role | null = null;

    socket.onopen = () => {
      if (p1 === null) {
        role = "p1";
        p1 = { socket, role };
      } else if (p2 === null) {
        role = "p2";
        p2 = { socket, role };
      } else {
        // Room is full — let the third joiner know and close.
        send(socket, { type: "full" });
        try { socket.close(1000, "room full"); } catch (_) {}
        return;
      }

      send(socket, { type: "hello", role });

      const peer = peerOf(role);
      if (peer) {
        send(peer.socket, { type: "peer-joined", role });
        // Tell the freshly-joined client that a peer is already here so it
        // can render the remote goofy immediately, even before any state
        // message arrives.
        send(socket, { type: "peer-joined", role: peer.role });
      }
    };

    socket.onmessage = (e) => {
      if (!role) return;
      const peer = peerOf(role);
      if (!peer) return;
      // Forward as-is. We don't parse — the protocol lives in the client.
      try {
        peer.socket.send(typeof e.data === "string" ? e.data : e.data);
      } catch (_) { /* drop */ }
    };

    const cleanup = () => {
      if (!role) return;
      if (role === "p1" && p1?.socket === socket) p1 = null;
      if (role === "p2" && p2?.socket === socket) p2 = null;
      const peer = peerOf(role);
      if (peer) send(peer.socket, { type: "peer-left", role });
      role = null;
    };
    socket.onclose = cleanup;
    socket.onerror = cleanup;

    return response;
  },
});
