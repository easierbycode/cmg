// Linux kiosk launcher — the Linux counterpart of scripts/launch-mac.ts.
//
// `deno task build:linux` compiles this into a self-contained binary that
// embeds the built Fresh app (_fresh) and static assets, then packages it as an
// AppImage. At runtime it serves the embedded Fresh app on localhost and opens
// a Chrome/Chromium-family browser in kiosk mode pointing at it.
//
// Browser selection is resilient. It tries, in order:
//   1. $CMG_BROWSER — a full launch command (e.g. "flatpak run com.google.Chrome"
//      or "/usr/bin/chromium").
//   2. Native Chrome/Chromium/Brave/Edge binaries found on PATH.
//   3. Flatpak browsers, launched correctly via `flatpak run <app-id>`.
// Flatpak-exported inner binaries are never executed directly — doing so bypasses
// the Flatpak sandbox and fails with errors like "/etc/opt/chrome/policies:
// permission denied" or "cobalt not found" (common on immutable distros such as
// SteamOS / Steam Deck). Each candidate is launched and given a short grace
// period; if it exits immediately with an error, the next candidate is tried.

import server from "../_fresh/server.js";

const PORT = Number(Deno.env.get("PORT") ?? 8000);
const TARGET_URL = `http://localhost:${PORT}`;
const home = Deno.env.get("HOME") ?? "";
const profileDir = `${home}/.config/cmg-chrome-profile`;
const GRACE_MS = 2500;

interface Candidate {
  argv: string[]; // [program, ...leading args] (kiosk flags + URL appended later)
  flatpak: boolean;
  label: string;
}

/** Resolve a bare command to an absolute path via PATH, skipping Flatpak exports. */
function which(cmd: string): string | null {
  if (cmd.includes("/")) {
    try {
      if (Deno.statSync(cmd).isFile) return cmd;
    } catch { /* not here */ }
    return null;
  }
  for (const dir of (Deno.env.get("PATH") ?? "").split(":")) {
    if (!dir) continue;
    const full = `${dir}/${cmd}`;
    // Flatpak-exported wrappers must be run via `flatpak run`, not directly.
    if (full.includes("/flatpak/")) continue;
    try {
      if (Deno.statSync(full).isFile) return full;
    } catch { /* not here */ }
  }
  return null;
}

function flatpakHas(appId: string): boolean {
  try {
    return new Deno.Command("flatpak", {
      args: ["info", appId],
      stdout: "null",
      stderr: "null",
    }).outputSync().success;
  } catch {
    return false; // flatpak not installed
  }
}

function buildCandidates(): Candidate[] {
  const list: Candidate[] = [];

  // 1) Explicit override — a full command line.
  const override = (Deno.env.get("CMG_BROWSER") ?? "").trim();
  if (override) {
    const argv = override.split(/\s+/);
    list.push({ argv, flatpak: argv[0] === "flatpak", label: override });
  }

  // 2) Native binaries on PATH.
  for (
    const name of [
      "google-chrome-stable",
      "google-chrome",
      "chromium",
      "chromium-browser",
      "brave-browser",
      "microsoft-edge-stable",
      "microsoft-edge",
      "vivaldi-stable",
    ]
  ) {
    const path = which(name);
    if (path) list.push({ argv: [path], flatpak: false, label: path });
  }

  // 3) Flatpak browsers, run through the sandbox.
  const seen = new Set<string>();
  for (
    const id of [
      "com.google.Chrome",
      "org.chromium.Chromium",
      "com.brave.Browser",
      "com.microsoft.Edge",
      "io.github.ungoogled_software.ungoogled_chromium",
    ]
  ) {
    const key = id.toLowerCase();
    if (seen.has(key) || !flatpakHas(id)) continue;
    seen.add(key);
    list.push({
      argv: ["flatpak", "run", id],
      flatpak: true,
      label: `flatpak run ${id}`,
    });
  }

  return list;
}

function kioskArgs(flatpak: boolean): string[] {
  const args = ["--kiosk", "--no-first-run", "--no-default-browser-check"];
  // A custom --user-data-dir usually isn't writable inside a Flatpak sandbox;
  // let Flatpak Chrome use its own profile instead.
  if (!flatpak) args.push(`--user-data-dir=${profileDir}`);
  args.push(TARGET_URL);
  return args;
}

/** Launch a candidate; return the child if it stays up, else null. */
async function tryLaunch(c: Candidate): Promise<Deno.ChildProcess | null> {
  let child: Deno.ChildProcess;
  try {
    child = new Deno.Command(c.argv[0], {
      args: [...c.argv.slice(1), ...kioskArgs(c.flatpak)],
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

/** Extract the Flatpak app-id from a candidate's argv (the arg after `run`). */
function flatpakAppId(argv: string[]): string | null {
  const runIdx = argv.indexOf("run");
  if (runIdx === -1) return null;
  for (let i = runIdx + 1; i < argv.length; i++) {
    if (!argv[i].startsWith("-")) return argv[i];
  }
  return null;
}

// Flatpak Chrome/Chromium can't see gamepads by default: the sandbox blocks
// /run/udev, so navigator.getGamepads() returns nothing (no menu nav, dead
// emulator input). This is the documented fix — grant read-only udev access.
// The override persists, so this is idempotent; we apply it on every launch so
// a fresh install or reset is healed automatically.
// See https://github.com/flathub/com.google.Chrome/issues/29
function grantFlatpakGamepadAccess(appId: string): void {
  try {
    const r = new Deno.Command("flatpak", {
      args: ["override", "--user", "--filesystem=/run/udev:ro", appId],
      stdout: "null",
      stderr: "piped",
    }).outputSync();
    if (r.success) {
      console.log(`CMG: granted gamepad (udev) access to ${appId}`);
    } else {
      console.warn(
        `CMG: could not grant udev access to ${appId} (gamepads may not work): ` +
          new TextDecoder().decode(r.stderr).trim(),
      );
    }
  } catch {
    // flatpak not present — native browser path, nothing to do.
  }
}

const candidates = buildCandidates();
if (candidates.length === 0) {
  console.error(
    "CMG: no browser found. Install Chrome/Chromium (native or Flatpak), or set\n" +
      "CMG_BROWSER to a launch command, e.g.\n" +
      "  CMG_BROWSER='flatpak run com.google.Chrome'\n" +
      "  CMG_BROWSER=/usr/bin/chromium",
  );
  Deno.exit(1);
}

const ac = new AbortController();
const httpServer = Deno.serve(
  { port: PORT, signal: ac.signal, onListen: () => {} },
  (server as { fetch: (req: Request) => Response | Promise<Response> }).fetch,
);
await new Promise((r) => setTimeout(r, 300));

let chrome: Deno.ChildProcess | null = null;
for (const candidate of candidates) {
  if (candidate.flatpak) {
    const appId = flatpakAppId(candidate.argv);
    if (appId) grantFlatpakGamepadAccess(appId);
  }
  console.log(`CMG: launching ${candidate.label}`);
  chrome = await tryLaunch(candidate);
  if (chrome) break;
}

if (!chrome) {
  console.error(
    "CMG: every browser candidate failed to start. If you use Flatpak Chrome on\n" +
      "an immutable distro (e.g. SteamOS / Steam Deck), confirm it runs:\n" +
      "  flatpak run com.google.Chrome --version\n" +
      "and reinstall if needed:\n" +
      "  flatpak install --reinstall flathub com.google.Chrome",
  );
  ac.abort();
  await httpServer.finished.catch(() => {});
  Deno.exit(1);
}

const status = await chrome.status;
ac.abort();
await httpServer.finished.catch(() => {});
Deno.exit(status.code);
