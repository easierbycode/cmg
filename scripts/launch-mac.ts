import server from "../_fresh/server.js";
import { serveEmbeddedWasmAsset } from "./serve-embedded-assets.ts";

const PORT = Number(Deno.env.get("PORT") ?? 8000);
const URL = `http://localhost:${PORT}`;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const home = Deno.env.get("HOME") ?? "";
const profileDir = `${home}/Library/Application Support/cmg-chrome-profile`;

const app = server as {
  fetch: (req: Request) => Response | Promise<Response>;
};

async function fetchWithEmbeddedAssets(req: Request): Promise<Response> {
  const embedded = await serveEmbeddedWasmAsset(req);
  return embedded ?? app.fetch(req);
}

const ac = new AbortController();
const httpServer = Deno.serve(
  { port: PORT, signal: ac.signal, onListen: () => {} },
  fetchWithEmbeddedAssets,
);

await new Promise((r) => setTimeout(r, 300));

try {
  await Deno.stat(CHROME);
} catch {
  console.error(`Google Chrome not found at ${CHROME}`);
  ac.abort();
  Deno.exit(1);
}

// Google Chrome floods stderr with chatter the kiosk has no use for: the macOS
// GoogleUpdater waking on launch, GCM push registration ("DEPRECATED_ENDPOINT"),
// the PartitionAlloc "allocator multiple times" warning, TensorFlow Lite, and
// WebGPU adapter selection. None of it is actionable for a localhost kiosk, so we
// discard Chrome's stdout/stderr. Helper processes Chrome forks (GoogleUpdater,
// crash handlers) inherit those descriptors, so they fall silent too. We rely on
// the redirect rather than flags like --disable-background-networking: on current
// Chromium those don't reliably suppress the GCM/updater lines, and
// --disable-background-networking can even stall the page's own fetch/XHR — bad
// for an emulator that streams assets over localhost. The launcher's own console
// output uses the Deno process's stdio and is unaffected. Set CMG_VERBOSE=1 to
// pass Chrome's output straight through for debugging.
const verbose = (Deno.env.get("CMG_VERBOSE") ?? "") !== "";

const chrome = new Deno.Command(CHROME, {
  args: [
    "--kiosk",
    `--user-data-dir=${profileDir}`,
    "--no-first-run",
    "--no-default-browser-check",
    URL,
  ],
  stdout: verbose ? "inherit" : "null",
  stderr: verbose ? "inherit" : "null",
}).spawn();

const status = await chrome.status;
ac.abort();
await httpServer.finished.catch(() => {});
Deno.exit(status.code);
