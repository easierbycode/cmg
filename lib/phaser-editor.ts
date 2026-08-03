// Phaser Editor 2D integration — the "Edit Game" button in the Guide.
//
// A game whose project directory carries a `phasereditor2d.config.json` is a
// Phaser Editor project. For those, the launcher can start the editor (the
// PhaserEditor2D binary vendored by `deno task phasereditor:vendor`) against
// that directory and show its IDE in the game frame, proxied onto the
// launcher's own origin by routes/phaser-editor/[...path].ts.
//
// LOCAL-ONLY, like the rest of the games-store subsystem: it spawns a process
// and hands out an IDE over a directory on this machine. The routes guard with
// localWriteGuard() (refused on the read-only Deno Deploy origin, and against
// cross-site callers); this module additionally refuses any project name that
// isn't a single plain directory segment, and any directory that doesn't hold
// the config file.

import { basename, dirname, join } from "jsr:@std/path@^1.1.2";
import { appRoot, GAMES_DIR } from "./games-store.ts";

export const CONFIG_FILE = "phasereditor2d.config.json";

// The editor's own default port. The launcher deliberately starts above it so a
// project the developer already opened by hand (`npm run editor`, which pins
// 1959) keeps its port.
const PORT_BASE = Number(Deno.env.get("CMG_PHASER_EDITOR_PORT") ?? 1960) ||
  1960;
const PORT_TRIES = 24;
const READY_TIMEOUT_MS =
  Number(Deno.env.get("CMG_PHASER_EDITOR_TIMEOUT_MS") ?? 30000) || 30000;

const EXE = Deno.build.os === "windows"
  ? "PhaserEditor2D.exe"
  : "PhaserEditor2D";
const PLATFORM = { windows: "windows", darwin: "macos", linux: "linux" }[
  Deno.build.os as "windows" | "darwin" | "linux"
] ?? Deno.build.os;

async function isFile(p: string): Promise<boolean> {
  try {
    return (await Deno.stat(p)).isFile;
  } catch {
    return false;
  }
}
async function isDir(p: string): Promise<boolean> {
  try {
    return (await Deno.stat(p)).isDirectory;
  } catch {
    return false;
  }
}

// ── locating the editor binary ───────────────────────────────────────────────

function cmpVersion(a: string, b: string): number {
  const pa = a.split(".").map((n) => parseInt(n, 10) || 0);
  const pb = b.split(".").map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] ?? 0) !== (pb[i] ?? 0)) return (pa[i] ?? 0) - (pb[i] ?? 0);
  }
  return 0;
}

// <home>/installs/PhaserEditor2D-core-<version>-<platform>/PhaserEditor2D/<exe>
// — the layout installEditor.js writes, which vendor-phaser-editor.ts mirrors.
// Newest matching version wins.
async function execUnder(home: string): Promise<string | null> {
  const installs = join(home, "installs");
  const suffix = `-${PLATFORM}`;
  const found: Array<{ version: string; exec: string }> = [];
  try {
    for await (const entry of Deno.readDir(installs)) {
      if (!entry.isDirectory) continue;
      const m = /^PhaserEditor2D-core-(\d+\.\d+\.\d+)-(.+)$/.exec(entry.name);
      if (!m || !entry.name.endsWith(suffix)) continue;
      const exec = join(installs, entry.name, "PhaserEditor2D", EXE);
      if (await isFile(exec)) found.push({ version: m[1], exec });
    }
  } catch {
    // no installs dir here
  }
  found.sort((a, b) => cmpVersion(a.version, b.version));
  return found.pop()?.exec ?? null;
}

// Vendored copy first (self-contained, what `deno task phasereditor:vendor`
// produces), then whatever `npx phasereditor2d-launcher` already installed into
// the home directory. CMG_PHASER_EDITOR_HOME overrides both.
export async function findEditorExec(): Promise<string | null> {
  const homes: string[] = [];
  const override = Deno.env.get("CMG_PHASER_EDITOR_HOME");
  if (override) homes.push(override);
  homes.push(join(appRoot(), "vendor", "phasereditor2d"));
  const userHome = Deno.env.get("HOME") ?? Deno.env.get("USERPROFILE");
  if (userHome) homes.push(join(userHome, ".phasereditor2d"));

  for (const home of homes) {
    const exec = await execUnder(home);
    if (exec) return exec;
  }
  return null;
}

// ── locating the project ─────────────────────────────────────────────────────

// Catalog ids carry more than a directory name: "games/2028-ai" (in-repo route
// prefix) and "evil-invaders-phaser4/?scene=MutoidScene" (path + query). Reduce
// one to the plain project directory name, or null when nothing safe is left.
// The result must be a single segment — no separators, no "..", no drive
// letters — so it can only ever name a direct child of a project root.
export function projectName(id: string): string | null {
  const first = String(id ?? "")
    .replace(/^\/+/, "")
    .replace(/^games\//, "")
    .split(/[?#]/)[0]
    .split("/")[0]
    .trim();
  if (!first || !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(first)) return null;
  if (first === "." || first === "..") return null;
  return first;
}

// Where a project directory may live. CMG_PHASER_PROJECT_DIRS (';'-separated)
// replaces the defaults, which are:
//   - GAMES_DIR — games added through Add Game, already served same-origin;
//   - the app root's parent — the developer layout, where the launcher checkout
//     and the game checkouts are siblings (C:\CODE\cmg, C:\CODE\evil-invaders-phaser4).
export function projectRoots(): string[] {
  const configured = Deno.env.get("CMG_PHASER_PROJECT_DIRS");
  if (configured) {
    return configured.split(";").map((s) => s.trim()).filter(Boolean);
  }
  const root = appRoot().replace(/[\\/]+$/, "");
  return [GAMES_DIR, dirname(root)];
}

export type PhaserProject = { name: string; dir: string };

// The project directory for a launched game id, or null when the game isn't a
// Phaser Editor project (or isn't on this machine at all).
export async function findProject(id: string): Promise<PhaserProject | null> {
  const name = projectName(id);
  if (!name) return null;
  for (const root of projectRoots()) {
    const dir = join(root, name);
    if (!await isDir(dir)) continue;
    if (!await isFile(join(dir, CONFIG_FILE))) continue;
    return { name, dir };
  }
  return null;
}

// ── running editors ──────────────────────────────────────────────────────────

type Editor = {
  dir: string;
  port: number;
  child: Deno.ChildProcess;
};

// Keyed by project directory: one editor server per project, reused across
// "Edit Game" presses (the editor is slow to boot and holds a file watcher).
const editors = new Map<string, Editor>();
// Serializes ensureEditor() per project so two near-simultaneous presses can't
// race two servers onto two ports.
const starting = new Map<string, Promise<Editor>>();

export function runningEditor(dir: string): Editor | null {
  return editors.get(dir) ?? null;
}

// The editor for a game id, if one is already up — what the proxy route needs.
export async function runningEditorFor(id: string): Promise<Editor | null> {
  const project = await findProject(id);
  return project ? (editors.get(project.dir) ?? null) : null;
}

// The editor binds the wildcard address, so a port is only free if nothing
// holds it on ANY interface — checking 127.0.0.1 alone succeeds against a
// server already bound to 0.0.0.0 (Windows), and the editor we then spawn dies
// on "address already in use" while our readiness probe cheerfully talks to the
// server that was there first.
function portFree(port: number): boolean {
  for (const hostname of ["0.0.0.0", "127.0.0.1"]) {
    try {
      const l = Deno.listen({ port, hostname });
      l.close();
    } catch {
      return false;
    }
  }
  return true;
}

function pickPort(): number {
  for (let i = 0; i < PORT_TRIES; i++) {
    const port = PORT_BASE + i;
    if (portFree(port)) return port;
  }
  throw new Error("no free port for the editor");
}

// The editor answers on /editor/ once its project scan finishes; until then the
// socket is open but the route 404s or the connection is refused. `alive` is
// checked every pass so a child that dies at startup (bad port, missing
// project) fails here in a second rather than after the whole timeout — and so
// a stranger already on this port can never be mistaken for our editor.
async function waitReady(
  port: number,
  deadline: number,
  alive: () => boolean,
): Promise<void> {
  let last = "no response";
  while (Date.now() < deadline) {
    if (!alive()) {
      throw new Error(`editor exited while starting on port ${port}`);
    }
    try {
      const r = await fetch(`http://127.0.0.1:${port}/editor/`, {
        signal: AbortSignal.timeout(2000),
      });
      const html = await r.text();
      if (r.ok && html.includes("Phaser Editor 2D")) return;
      last = r.ok ? "not the editor" : `HTTP ${r.status}`;
    } catch (e) {
      last = (e as Error).message;
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`editor did not come up on port ${port} (${last})`);
}

export async function ensureEditor(project: PhaserProject): Promise<Editor> {
  const live = editors.get(project.dir);
  if (live) return live;
  const pending = starting.get(project.dir);
  if (pending) return await pending;

  const task = (async () => {
    const exec = await findEditorExec();
    if (!exec) {
      throw new Error(
        "Phaser Editor is not installed. Run: deno task phasereditor:vendor",
      );
    }
    const port = pickPort();
    // No -public: the editor then refuses remote connections, and everything
    // that reaches it comes from this process over 127.0.0.1. -disable-open-browser
    // keeps it from popping a second window over the launcher, and
    // -disable-check-for-updates keeps startup off the network.
    const child = new Deno.Command(exec, {
      args: [
        "-project",
        project.dir,
        "-port",
        String(port),
        "-disable-open-browser",
        "-disable-check-for-updates",
      ],
      cwd: dirname(dirname(exec)),
      stdout: "null",
      stderr: "null",
      stdin: "null",
    }).spawn();

    const editor: Editor = { dir: project.dir, port, child };
    // Drop the entry as soon as the process dies so the next press starts a
    // fresh one instead of proxying to a closed port.
    let running = true;
    child.status.then(() => {
      running = false;
      if (editors.get(project.dir) === editor) editors.delete(project.dir);
    }).catch(() => {
      running = false;
    });

    try {
      await waitReady(port, Date.now() + READY_TIMEOUT_MS, () => running);
    } catch (e) {
      try {
        child.kill();
      } catch { /* already gone */ }
      throw e;
    }
    editors.set(project.dir, editor);
    return editor;
  })();

  starting.set(project.dir, task);
  try {
    return await task;
  } finally {
    starting.delete(project.dir);
  }
}

// Editors are children of the launcher, not daemons — take them down with it so
// a dev-server restart doesn't leak a server (and its port) per run.
export function stopAllEditors(): void {
  for (const editor of editors.values()) {
    try {
      editor.child.kill();
    } catch { /* already gone */ }
  }
  editors.clear();
}

if (!Deno.env.get("DENO_DEPLOYMENT_ID")) {
  globalThis.addEventListener("unload", stopAllEditors);
}

// Exposed for the availability probe: which vendored build (if any) would run.
export async function editorInfo(): Promise<
  { exec: string | null; version: string | null }
> {
  const exec = await findEditorExec();
  if (!exec) return { exec: null, version: null };
  const dist = basename(dirname(dirname(exec)));
  const m = /^PhaserEditor2D-core-(\d+\.\d+\.\d+)-/.exec(dist);
  return { exec, version: m ? m[1] : null };
}
