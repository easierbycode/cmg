// Linux kiosk launcher — the Linux counterpart of scripts/launch-mac.ts.
//
// `deno task build:linux` compiles this into a self-contained binary that
// embeds the built Fresh app (_fresh) and static assets, then packages it as an
// AppImage. At runtime it serves the embedded Fresh app on localhost and opens
// Chrome/Chromium in kiosk mode pointing at it.
//
// Browser discovery honors $CMG_BROWSER first, then falls back to the common
// Chrome/Chromium executable names and locations.

import server from "../_fresh/server.js";

const PORT = Number(Deno.env.get("PORT") ?? 8000);
const TARGET_URL = `http://localhost:${PORT}`;

const home = Deno.env.get("HOME") ?? "";
const profileDir = `${home}/.config/cmg-chrome-profile`;

/** Resolve a command to an absolute path, mirroring `which`. */
function which(cmd: string): string | null {
  if (cmd.includes("/")) {
    try {
      if (Deno.statSync(cmd).isFile) return cmd;
    } catch { /* not here */ }
    return null;
  }
  for (const dir of (Deno.env.get("PATH") ?? "").split(":")) {
    if (!dir) continue;
    try {
      if (Deno.statSync(`${dir}/${cmd}`).isFile) return `${dir}/${cmd}`;
    } catch { /* not here */ }
  }
  return null;
}

function findBrowser(): string | null {
  const candidates = [
    Deno.env.get("CMG_BROWSER") ?? "",
    "google-chrome-stable",
    "google-chrome",
    "chromium",
    "chromium-browser",
    "brave-browser",
    "microsoft-edge",
    "/snap/bin/chromium",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].filter(Boolean);
  for (const candidate of candidates) {
    const found = which(candidate);
    if (found) return found;
  }
  return null;
}

const browser = findBrowser();
if (!browser) {
  console.error(
    "CMG: no Chrome/Chromium found. Install Google Chrome or Chromium, or set " +
      "CMG_BROWSER to the browser executable path.",
  );
  Deno.exit(1);
}

const ac = new AbortController();
const httpServer = Deno.serve(
  { port: PORT, signal: ac.signal, onListen: () => {} },
  (server as { fetch: (req: Request) => Response | Promise<Response> }).fetch,
);

await new Promise((r) => setTimeout(r, 300));

const chrome = new Deno.Command(browser, {
  args: [
    "--kiosk",
    `--user-data-dir=${profileDir}`,
    "--no-first-run",
    "--no-default-browser-check",
    TARGET_URL,
  ],
}).spawn();

const status = await chrome.status;
ac.abort();
await httpServer.finished.catch(() => {});
Deno.exit(status.code);
