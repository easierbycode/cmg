// Deno-native HTTP + WebSocket proxy in front of Vite. Used by
// `deno task dev:tunnel` so the Deno Deploy tunnel has a real entrypoint
// (the tunnel only intercepts Deno's HTTP API; Vite's own Node-style server
// shows up as "Telemetry only" with no public URL on its own).

const VITE_PORT = Number(Deno.env.get("VITE_PORT") ?? "5173");
const TUNNEL_PORT = Number(Deno.env.get("TUNNEL_PORT") ?? "8000");
const VITE_HOST = `127.0.0.1:${VITE_PORT}`;

function proxyWebSocket(req: Request): Response {
  const { socket: clientSock, response } = Deno.upgradeWebSocket(req);
  const url = new URL(req.url);
  const upstreamUrl = `ws://${VITE_HOST}${url.pathname}${url.search}`;
  // Preserve subprotocol negotiation if Vite expects one.
  const proto = req.headers.get("sec-websocket-protocol");
  const upstreamSock = new WebSocket(
    upstreamUrl,
    proto ? proto.split(",").map((s) => s.trim()) : undefined,
  );

  const bufferedFromClient: (string | ArrayBufferLike | Blob)[] = [];
  let upstreamOpen = false;

  clientSock.addEventListener("message", (e) => {
    if (upstreamOpen) upstreamSock.send(e.data);
    else bufferedFromClient.push(e.data);
  });
  clientSock.addEventListener("close", () => {
    try {
      upstreamSock.close();
    } catch (_e) { /* ignore */ }
  });
  clientSock.addEventListener("error", () => {
    try {
      upstreamSock.close();
    } catch (_e) { /* ignore */ }
  });

  upstreamSock.addEventListener("open", () => {
    upstreamOpen = true;
    for (const msg of bufferedFromClient) upstreamSock.send(msg);
    bufferedFromClient.length = 0;
  });
  upstreamSock.addEventListener("message", (e) => {
    try {
      clientSock.send(e.data);
    } catch (_e) { /* ignore */ }
  });
  upstreamSock.addEventListener("close", () => {
    try {
      clientSock.close();
    } catch (_e) { /* ignore */ }
  });
  upstreamSock.addEventListener("error", () => {
    try {
      clientSock.close();
    } catch (_e) { /* ignore */ }
  });

  return response;
}

async function proxyHttp(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const upstreamUrl = `http://${VITE_HOST}${url.pathname}${url.search}`;
  const headers = new Headers(req.headers);
  headers.set("host", VITE_HOST);
  try {
    const upstream = await fetch(upstreamUrl, {
      method: req.method,
      headers,
      body: req.body,
      redirect: "manual",
    });
    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: upstream.headers,
    });
  } catch (e) {
    return new Response(
      `Upstream Vite (${VITE_HOST}) is not reachable: ${(e as Error).message}`,
      { status: 502, headers: { "content-type": "text/plain" } },
    );
  }
}

export default {
  fetch(req: Request): Response | Promise<Response> {
    const upgrade = req.headers.get("upgrade")?.toLowerCase();
    if (upgrade === "websocket") return proxyWebSocket(req);
    return proxyHttp(req);
  },
} satisfies Deno.ServeDefaultExport;

console.log(`[tunnel-proxy] forwarding :${TUNNEL_PORT} -> http://${VITE_HOST}`);
