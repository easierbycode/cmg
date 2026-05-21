import server from "../_fresh/server.js";

const PORT = Number(Deno.env.get("PORT") ?? 8000);
const URL = `http://localhost:${PORT}`;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const home = Deno.env.get("HOME") ?? "";
const profileDir = `${home}/Library/Application Support/cmg-chrome-profile`;

const ac = new AbortController();
const httpServer = Deno.serve(
  { port: PORT, signal: ac.signal, onListen: () => {} },
  (server as { fetch: (req: Request) => Response | Promise<Response> }).fetch,
);

await new Promise((r) => setTimeout(r, 300));

try {
  await Deno.stat(CHROME);
} catch {
  console.error(`Google Chrome not found at ${CHROME}`);
  ac.abort();
  Deno.exit(1);
}

const chrome = new Deno.Command(CHROME, {
  args: [
    "--kiosk",
    `--user-data-dir=${profileDir}`,
    "--no-first-run",
    "--no-default-browser-check",
    URL,
  ],
}).spawn();

const status = await chrome.status;
ac.abort();
await httpServer.finished.catch(() => {});
Deno.exit(status.code);
