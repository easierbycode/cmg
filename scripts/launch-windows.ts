// Windows kiosk launcher — the Windows counterpart of scripts/launch-mac.ts
// and scripts/launch-linux.ts.
//
// `deno task build:windows` compiles this into a self-contained .exe that
// embeds the built Fresh app (_fresh) and static assets. At runtime it serves
// the embedded app on localhost and opens a Chromium-family browser in kiosk
// mode pointing at it.
//
// This entrypoint is also the codemonkey:// protocol handler (see
// scripts/register-windows-protocol.ts): clicking a link like
//   codemonkey://add?repo=https://github.com/owner/game&branch=main&folder=
// makes Windows run `"<this exe>" "<the link>"`. The link is handled before
// the kiosk opens:
//   - if a launcher is already serving on PORT, the add is forwarded to its
//     /api/games/add-github / add-url endpoint and this instance exits —
//     otherwise every clicked link would race a second server+kiosk onto the
//     same port (upstream's main.ts just rolled to port+1, leaving two kiosks).
//   - if none is running, the game is installed directly (lib/protocol.ts),
//     then the launcher boots normally so it comes up showing the new game.
//
// Browser discovery mirrors launch-linux.ts: $CMG_BROWSER / $CHROME_PATH win,
// then the standard install paths of Chrome, Edge, and Brave; each candidate
// gets a grace period and the next is tried if it exits immediately.

// launcher-env must evaluate before the server bundle: it points the game
// store at a writable directory (GAMES_DIR is computed at module load).
import "./launcher-env.ts";
import server from "../_fresh/server.js";
import { serveEmbeddedWasmAsset } from "./serve-embedded-assets.ts";
import {
  findProtocolArg,
  handleProtocolAdd,
  parseProtocolUrl,
  type ProtocolAddRequest,
} from "../lib/protocol.ts";

const PORT = Number(Deno.env.get("PORT") ?? 8000);
const TARGET_URL = `http://localhost:${PORT}`;
const GRACE_MS = 2500;
// Discard the browser's stdout/stderr unless CMG_VERBOSE is set — see the
// rationale in scripts/launch-mac.ts.
const VERBOSE = (Deno.env.get("CMG_VERBOSE") ?? "") !== "";

const localAppData = Deno.env.get("LOCALAPPDATA") ?? "";
const profileDir = localAppData
  ? `${localAppData}\\cmg-chrome-profile`
  : `${Deno.env.get("USERPROFILE") ?? "."}\\cmg-chrome-profile`;

// ---------------------------------------------------------------------------
// codemonkey:// protocol handling
// ---------------------------------------------------------------------------

/**
 * Forward an add request to a launcher already serving on PORT. Returns true
 * when a running launcher accepted (or at least answered) the request; false
 * when nothing is listening, in which case this instance handles it itself.
 */
async function forwardToRunningLauncher(
  request: ProtocolAddRequest,
): Promise<boolean> {
  const endpoint = request.repo
    ? `${TARGET_URL}/api/games/add-github`
    : `${TARGET_URL}/api/games/add-url`;
  const body = request.repo
    ? {
      repo: request.repo,
      branch: request.branch,
      subdir: request.subdir,
      name: request.name,
    }
    : { url: request.url, subdir: request.subdir, name: request.name };
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(120_000),
    });
    const payload = await res.json().catch(() => null) as
      | { ok?: boolean; id?: string; error?: string }
      | null;
    if (res.ok && payload?.ok) {
      console.log(`CMG: added '${payload.id}' via the running launcher`);
    } else {
      console.error(
        `CMG: running launcher rejected the add: ${
          payload?.error ?? `HTTP ${res.status}`
        }`,
      );
    }
    return true;
  } catch (_e) {
    // Connection refused / timeout — no launcher on PORT, handle it here.
    return false;
  }
}

const protocolArg = findProtocolArg(Deno.args);
if (protocolArg) {
  let request: ProtocolAddRequest | null = null;
  try {
    request = parseProtocolUrl(protocolArg);
  } catch (err) {
    console.error(
      `CMG: ignoring bad protocol link: ${
        err instanceof Error ? err.message : err
      }`,
    );
  }
  if (request) {
    if (await forwardToRunningLauncher(request)) {
      // The already-running kiosk owns the screen; nothing more to do here.
      Deno.exit(0);
    }
    try {
      const { id } = await handleProtocolAdd(request);
      console.log(`CMG: installed '${id}' from protocol link`);
    } catch (err) {
      console.error(
        `CMG: protocol add failed: ${err instanceof Error ? err.message : err}`,
      );
    }
  }
}

// ---------------------------------------------------------------------------
// serve the embedded app
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// find and launch a kiosk browser
// ---------------------------------------------------------------------------

interface Candidate {
  path: string;
  label: string;
}

function fileExists(path: string): boolean {
  try {
    return Deno.statSync(path).isFile;
  } catch {
    return false;
  }
}

function buildCandidates(): Candidate[] {
  const list: Candidate[] = [];

  // 1) Explicit overrides.
  for (const env of ["CMG_BROWSER", "CHROME_PATH"]) {
    const override = (Deno.env.get(env) ?? "").trim();
    if (override) list.push({ path: override, label: `$${env} (${override})` });
  }

  // 2) Standard install locations for Chromium-family browsers.
  const programFiles = Deno.env.get("ProgramFiles") ?? "C:\\Program Files";
  const programFilesX86 = Deno.env.get("ProgramFiles(x86)") ??
    "C:\\Program Files (x86)";
  const roots = [programFiles, programFilesX86, localAppData].filter(Boolean);
  const suffixes = [
    "Google\\Chrome\\Application\\chrome.exe",
    "Microsoft\\Edge\\Application\\msedge.exe",
    "BraveSoftware\\Brave-Browser\\Application\\brave.exe",
    "Chromium\\Application\\chrome.exe",
  ];
  for (const suffix of suffixes) {
    for (const root of roots) {
      const path = `${root}\\${suffix}`;
      if (fileExists(path)) list.push({ path, label: path });
    }
  }
  return list;
}

function kioskArgs(): string[] {
  return [
    "--kiosk",
    `--user-data-dir=${profileDir}`,
    "--no-first-run",
    "--no-default-browser-check",
    // Suppress the "Can't update Chrome / Reinstall Chrome" bubble on stale
    // installs — see kioskArgs() in scripts/launch-linux.ts for the story.
    "--disable-features=OutdatedBuildDetector",
    TARGET_URL,
  ];
}

/** Launch a candidate; return the child if it stays up, else null. */
async function tryLaunch(c: Candidate): Promise<Deno.ChildProcess | null> {
  let child: Deno.ChildProcess;
  try {
    child = new Deno.Command(c.path, {
      args: kioskArgs(),
      stdout: VERBOSE ? "inherit" : "null",
      stderr: VERBOSE ? "inherit" : "null",
    }).spawn();
  } catch (err) {
    console.error(
      `CMG: could not start ${c.label}: ${
        err instanceof Error ? err.message : err
      }`,
    );
    return null;
  }
  // If it dies immediately with an error, it didn't really start.
  const early = await Promise.race([
    child.status,
    new Promise<null>((r) => setTimeout(() => r(null), GRACE_MS)),
  ]);
  if (early && early.code !== 0) {
    console.error(
      `CMG: ${c.label} exited immediately (code ${early.code}) — trying next browser`,
    );
    return null;
  }
  return child;
}

const candidates = buildCandidates();
if (candidates.length === 0) {
  console.error(
    "CMG: no browser found. Install Chrome, Edge, or Brave, or set\n" +
      "CMG_BROWSER to a browser executable, e.g.\n" +
      '  set CMG_BROWSER=C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  );
  ac.abort();
  await httpServer.finished.catch(() => {});
  Deno.exit(1);
}

let chrome: Deno.ChildProcess | null = null;
for (const candidate of candidates) {
  console.log(`CMG: launching ${candidate.label}`);
  chrome = await tryLaunch(candidate);
  if (chrome) break;
}

if (!chrome) {
  console.error(
    "CMG: every browser candidate failed to start. Re-run with CMG_VERBOSE=1\n" +
      "to see the browser's own error output.",
  );
  ac.abort();
  await httpServer.finished.catch(() => {});
  Deno.exit(1);
}

const status = await chrome.status;
ac.abort();
await httpServer.finished.catch(() => {});
Deno.exit(status.code);
