// Run vite with a Deno Deploy tunnel. The tunnel exposes the local Vite
// server over a public HTTPS URL via Deno Deploy infrastructure — useful for
// testing Gamepad API / WebUSB / other secure-context-only features on a
// remote device.
//
// Deno Deploy tunnels only intercept Deno's HTTP API, so Vite's own server is
// invisible to them (the Deploy console reports it as "Telemetry only" with
// no URL). We spawn Vite + a small Deno-native HTTP/WS proxy in front of it
// (scripts/tunnel-proxy.ts), then run that proxy under `deno serve --tunnel`.
//
// On first run Deno Deploy needs an org + app context. If `deno deploy switch`
// hasn't been run we surface a friendly prompt instead of the bare error.

const VITE_PORT = Number(Deno.env.get("VITE_PORT") ?? "5173");
const TUNNEL_PORT = Number(Deno.env.get("TUNNEL_PORT") ?? "8000");

async function readDeployConfig(): Promise<
  { org: string; app: string } | null
> {
  for (const path of ["deno.json", "deno.jsonc"]) {
    try {
      const txt = await Deno.readTextFile(path);
      const stripped = txt
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/(^|[^:])\/\/.*$/gm, "$1");
      const json = JSON.parse(stripped);
      if (json?.deploy?.app && json?.deploy?.org) {
        return { org: json.deploy.org, app: json.deploy.app };
      }
    } catch (_e) { /* keep looking */ }
  }
  return null;
}

const deploy = await readDeployConfig();
if (!deploy) {
  console.log(
    "\n[dev:tunnel] No Deno Deploy app selected yet.\n" +
      "             Run one of these once, then re-run `deno task dev:tunnel`:\n\n" +
      "   deno deploy switch          # pick an existing org + app\n" +
      "   deno deploy create          # create a new app for this project\n",
  );
  Deno.exit(1);
}
console.log(
  `\n[dev:tunnel] Tunneling Vite (http://localhost:${VITE_PORT}) via Deno Deploy.\n` +
    `             App: ${deploy.org} / ${deploy.app}\n` +
    `             Public URL is the app's domain on Deno Deploy — find it at\n` +
    `             https://app.deno.com/${deploy.org}/${deploy.app}/tunnels\n`,
);

// 1. Spawn Vite on VITE_PORT.
const vite = new Deno.Command(Deno.execPath(), {
  args: ["task", "dev:vite", "--port", String(VITE_PORT)],
  stdout: "inherit",
  stderr: "inherit",
}).spawn();

// 2. Wait until Vite is reachable so the first tunnel request doesn't 502.
async function waitForVite(timeoutMs = 20_000): Promise<boolean> {
  const start = performance.now();
  while (performance.now() - start < timeoutMs) {
    try {
      const r = await fetch(`http://127.0.0.1:${VITE_PORT}/`, {
        signal: AbortSignal.timeout(1000),
      });
      await r.body?.cancel();
      return true;
    } catch (_e) {
      await new Promise((r) => setTimeout(r, 250));
    }
  }
  return false;
}

// 3. Spawn `deno serve --tunnel scripts/tunnel-proxy.ts` so Deno Deploy has a
//    real Deno-native HTTP entrypoint to expose. The proxy forwards to Vite.
let proxy: Deno.ChildProcess | null = null;

const cleanup = () => {
  try {
    proxy?.kill("SIGTERM");
  } catch (_e) { /* ignore */ }
  try {
    vite.kill("SIGTERM");
  } catch (_e) { /* ignore */ }
};
Deno.addSignalListener("SIGINT", () => {
  cleanup();
  Deno.exit(130);
});
Deno.addSignalListener("SIGTERM", () => {
  cleanup();
  Deno.exit(143);
});

const viteReady = await waitForVite();
if (!viteReady) {
  console.log(
    "[dev:tunnel] Vite did not become ready in 20s — aborting tunnel.",
  );
  cleanup();
  Deno.exit(1);
}

proxy = new Deno.Command(Deno.execPath(), {
  args: [
    "serve",
    "--allow-net",
    "--allow-env",
    "--allow-read",
    "--tunnel",
    "--port",
    String(TUNNEL_PORT),
    "scripts/tunnel-proxy.ts",
  ],
  stdout: "inherit",
  stderr: "inherit",
  env: {
    VITE_PORT: String(VITE_PORT),
    TUNNEL_PORT: String(TUNNEL_PORT),
  },
}).spawn();

const status = await Promise.race([vite.status, proxy.status]);
cleanup();
Deno.exit(status.code);
