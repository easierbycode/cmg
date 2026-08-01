// Local "add game" store — a filesystem port of codemonkey-games-launcher's
// lib/utils.ts. Games added from a zip upload, a zip URL, or a GitHub repo are
// extracted into GAMES_DIR (env CMG_GAMES_DIR, else <app root>/games) and
// served back by routes/games/[...path].ts. This is a LOCAL-ONLY subsystem:
// the hosted Deno Deploy origin has a read-only filesystem, so every mutating
// route guards with localWriteGuard() (same policy as /api/install and
// /api/openemu/import).
import { basename, dirname, fromFileUrl, join } from "jsr:@std/path@^1.1.2";

// Minimal fs helpers (in place of jsr:@std/fs) so this module carries no extra
// dependency into the compiled/desktop launcher bundle.
async function ensureDir(p: string): Promise<void> {
  await Deno.mkdir(p, { recursive: true });
}
async function copyDir(src: string, dst: string): Promise<void> {
  await ensureDir(dst);
  for await (const entry of Deno.readDir(src)) {
    const s = join(src, entry.name);
    const d = join(dst, entry.name);
    if (entry.isDirectory) {
      await copyDir(s, d);
    } else if (entry.isSymlink) {
      // Skip symlinks entirely. A crafted archive (unzip/ditto restore Unix
      // symlinks) could contain `leak -> /etc/passwd`; following it with
      // copyFile would write an arbitrary host file's contents into the served
      // game dir. Games ship real files, not links, so dropping links is safe.
      console.warn(`[games-store] skipping symlink in archive: ${entry.name}`);
    } else {
      await Deno.copyFile(s, d);
    }
  }
}

// Repo root when run under the deno CLI; the executable's directory in a
// compiled launcher (deno compile / deno desktop), where import.meta.url
// points into the embedded snapshot rather than a writable directory.
export function appRoot(): string {
  const exe = basename(Deno.execPath()).toLowerCase();
  if (exe === "deno" || exe === "deno.exe") {
    return fromFileUrl(new URL("../", import.meta.url));
  }
  return dirname(Deno.execPath());
}

export const GAMES_DIR = Deno.env.get("CMG_GAMES_DIR") ??
  join(appRoot(), "games");

export function isDeploy(): boolean {
  return !!Deno.env.get("DENO_DEPLOYMENT_ID");
}

// sec-fetch-site is the primary signal — "none" is a user-initiated navigation
// (address bar, bookmark), which no attacker page can forge. Browsers that
// predate Fetch Metadata still attach Origin to every non-GET, so fall back to
// comparing its host against Host. A request carrying neither header is a
// non-browser client (curl, the repo's own scripts) and is not the CSRF threat
// model, so it passes — that is the policy the /api/games routes have always
// run under.
function isCrossSite(req: Request): boolean {
  const site = req.headers.get("sec-fetch-site");
  if (site) return site !== "same-origin" && site !== "none";
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host !== req.headers.get("host");
  } catch {
    return true; // an unparseable Origin is not something a browser sends
  }
}

// Cross-site half of localWriteGuard, usable on its own by the mutating local
// endpoints that keep their own "not on the hosted build" wording (/api/install,
// /api/build-apk). The wildcard-CORS middleware in main.ts opens every response
// to any origin, so same-origin policy protects nothing here — Fetch Metadata is
// the line of defense (openemu/import.ts established the pattern). What it buys:
// a cross-site page can issue a CORS-"simple" POST with no preflight — bodyless,
// or with a text/plain body that ctx.req.json() happily parses — so neither the
// method nor the body shape is CSRF protection on its own.
export function crossSiteGuard(req: Request): Response | null {
  if (!isCrossSite(req)) return null;
  return Response.json({ ok: false, error: "cross-site request" }, {
    status: 403,
  });
}

// Shared guard for every mutating endpoint: refuse on the read-only hosted
// origin, and reject cross-site requests.
export function localWriteGuard(req: Request): Response | null {
  if (isDeploy()) {
    return Response.json(
      {
        ok: false,
        error: "Game management is only available on a local launcher.",
      },
      { status: 403 },
    );
  }
  return crossSiteGuard(req);
}

export type SourceInfo = {
  source: "github" | "url" | "zip";
  repo?: string;
  branch?: string;
  url?: string;
  subdir?: string;
};

export type GameEntry = {
  id: string;
  name: string;
  urlPath: string; // /games/<id>/
  launchPath: string; // /games/<id>/[<subdir>/]
  hasThumbnail: boolean;
  sourceInfo?: SourceInfo;
};

export function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(
    /^-+|-+$/g,
    "",
  );
}

// Ids are produced by slugify(), but the [id] routes accept arbitrary URL
// params — re-validate so a crafted request can never join() its way out of
// GAMES_DIR.
export function isSafeId(id: string): boolean {
  return /^[a-z0-9][a-z0-9-]*$/.test(id);
}

// "root" (or empty) means the archive root. Strips traversal segments so a
// hostile hint can't escape the extract dir.
function normalizeSubdirHint(subdirHint?: string | null): string {
  const raw = (subdirHint ?? "root").trim();
  if (!raw || raw.toLowerCase() === "root") return "";
  const cleaned = raw.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
  const segments = cleaned.split("/").filter((seg) =>
    seg && seg !== "." && seg !== ".."
  );
  return segments.join("/");
}

// "dist"/"docs" are flattened INTO the game root at extract time, so they are
// excluded from the launch path; any other subdir stays on disk and becomes
// part of the launch URL instead.
function resolveLaunchSubdir(subdirHint?: string | null): string {
  const normalized = normalizeSubdirHint(subdirHint);
  if (!normalized) return "";
  const lower = normalized.toLowerCase();
  if (lower === "dist" || lower === "docs") return "";
  return normalized;
}

export async function listGames(): Promise<GameEntry[]> {
  const entries: GameEntry[] = [];
  try {
    for await (const dirEntry of Deno.readDir(GAMES_DIR)) {
      if (!dirEntry.isDirectory) continue;
      const id = dirEntry.name;
      if (!isSafeId(id)) continue;
      const fsPath = join(GAMES_DIR, id);

      let hasThumbnail = false;
      try {
        hasThumbnail = (await Deno.stat(join(fsPath, "thumbnail.png"))).isFile;
      } catch (_e) {
        // no thumbnail
      }

      let metadata: { sourceInfo?: SourceInfo } = {};
      try {
        metadata = JSON.parse(
          await Deno.readTextFile(join(fsPath, "codemonkey.json")),
        );
      } catch (_e) {
        // missing/invalid metadata is fine — plain zip drop
      }

      const launchSubdir = resolveLaunchSubdir(metadata.sourceInfo?.subdir);
      entries.push({
        id,
        name: id.replace(/[-_]/g, " "),
        urlPath: `/games/${id}/`,
        launchPath: `/games/${id}/${launchSubdir ? `${launchSubdir}/` : ""}`,
        hasThumbnail,
        sourceInfo: metadata.sourceInfo,
      });
    }
  } catch (_e) {
    // GAMES_DIR doesn't exist yet — no local games.
  }
  entries.sort((a, b) => a.name.localeCompare(b.name));
  return entries;
}

// Extract a zip with OS tools (no zip library, same approach as the original
// launcher): `unzip` where available, `ditto` on macOS, PowerShell
// Expand-Archive on Windows. The temp file keeps a .zip suffix — Expand-Archive
// refuses archives whose extension doesn't match the format.
export async function extractArchiveToDir(
  archiveBytes: Uint8Array,
  targetDir: string,
  subdirHint?: string,
): Promise<void> {
  await ensureDir(targetDir);
  const extractRoot = await Deno.makeTempDir();
  const tmpArchive = await Deno.makeTempFile({ suffix: ".zip" });
  await Deno.writeFile(tmpArchive, archiveBytes);

  let extracted = false;
  try {
    const unzip = new Deno.Command("unzip", {
      args: ["-q", "-o", tmpArchive, "-d", extractRoot],
      stderr: "null",
      stdout: "null",
    });
    extracted = (await unzip.output()).success;
  } catch (_e) { /* unzip not on PATH */ }
  if (!extracted && Deno.build.os === "darwin") {
    try {
      const ditto = new Deno.Command("/usr/bin/ditto", {
        args: ["-x", "-k", tmpArchive, extractRoot],
        stderr: "null",
        stdout: "null",
      });
      extracted = (await ditto.output()).success;
    } catch (_e) { /* ignore */ }
  }
  if (!extracted && Deno.build.os === "windows") {
    try {
      const zipPath = tmpArchive.replace(/'/g, "''");
      const outPath = extractRoot.replace(/'/g, "''");
      const psScript = `$ErrorActionPreference='Stop';` +
        `Expand-Archive -LiteralPath '${zipPath}' -DestinationPath '${outPath}' -Force`;
      const ps = new Deno.Command("powershell.exe", {
        args: [
          "-NoProfile",
          "-NonInteractive",
          "-ExecutionPolicy",
          "Bypass",
          "-Command",
          psScript,
        ],
        stderr: "null",
        stdout: "null",
      });
      extracted = (await ps.output()).success;
    } catch (_e) { /* ignore */ }
  }

  if (!extracted) {
    await cleanup(tmpArchive, extractRoot);
    throw new Error(
      "Failed to extract archive (.zip only). Ensure unzip, ditto, or PowerShell is available.",
    );
  }

  // A zip with exactly one top-level FOLDER (GitHub's <repo>-<branch>/ wrapper,
  // or a zipped project folder) collapses so index.html lands at the game root.
  // Only when it's a directory — a zip of a single loose file (e.g. a bare
  // index.html) must stay put, else we'd try to copy a file as a directory.
  let base = extractRoot;
  const topLevel: Deno.DirEntry[] = [];
  for await (const e of Deno.readDir(extractRoot)) topLevel.push(e);
  if (topLevel.length === 1 && topLevel[0].isDirectory) {
    base = join(extractRoot, topLevel[0].name);
  }

  const normalizedSubdir = normalizeSubdirHint(subdirHint);
  const lowerSubdir = normalizedSubdir.toLowerCase();
  if (lowerSubdir === "dist" || lowerSubdir === "docs") {
    base = join(base, normalizedSubdir);
  } else if (normalizedSubdir) {
    // Any other subdir stays in place and is served via launchPath; just warn
    // when it's missing so a typo is diagnosable.
    try {
      const info = await Deno.stat(join(base, normalizedSubdir));
      if (!info.isDirectory) {
        console.warn(
          `[games-store] subdir '${normalizedSubdir}' is not a directory; using archive root.`,
        );
      }
    } catch (_e) {
      console.warn(
        `[games-store] subdir '${normalizedSubdir}' not found in archive; using archive root.`,
      );
    }
  }
  await ensureDir(targetDir);
  await copyDir(base, targetDir);
  await cleanup(tmpArchive, extractRoot);
}

async function cleanup(tmpArchive: string, extractRoot: string) {
  try {
    await Deno.remove(tmpArchive);
  } catch (_e) { /* ignore */ }
  try {
    await Deno.remove(extractRoot, { recursive: true });
  } catch (_e) { /* ignore */ }
}

// Extract + record provenance in <game>/codemonkey.json. Metadata merges over
// whatever the archive shipped so a game's own codemonkey.json keys survive.
export async function installArchive(options: {
  bytes: Uint8Array;
  id: string;
  subdir?: string;
  sourceInfo: SourceInfo;
}): Promise<{ id: string }> {
  const { bytes, id, subdir, sourceInfo } = options;
  if (!isSafeId(id)) throw new Error("invalid game id");
  const target = join(GAMES_DIR, id);
  // Clean reinstall: wipe any existing copy first so an update (or a re-add
  // onto the same slug) can't leave behind files the new archive dropped —
  // stale service workers / renamed bundles would otherwise keep being served.
  try {
    await Deno.remove(target, { recursive: true });
  } catch (_e) {
    // first install — nothing to remove
  }
  await ensureDir(target);
  await extractArchiveToDir(bytes, target, subdir ?? sourceInfo.subdir);

  const metadataPath = join(target, "codemonkey.json");
  let metadata: Record<string, unknown> = {};
  try {
    metadata = JSON.parse(await Deno.readTextFile(metadataPath));
  } catch (_e) {
    metadata = {};
  }
  metadata.sourceInfo = sourceInfo;
  await Deno.writeTextFile(metadataPath, JSON.stringify(metadata, null, 2));
  return { id };
}

export function parseGithubRepo(
  repo: string,
): { owner: string; name: string } {
  const cleaned = String(repo).trim().replace(/^git\+/, "");

  // URL parsing first — robust against extra path segments (/tree/<branch>…).
  const looksLikeUrl = /^https?:\/\//i.test(cleaned) ||
    cleaned.toLowerCase().startsWith("github.com/");
  if (looksLikeUrl) {
    try {
      const url = new URL(
        cleaned.startsWith("http") ? cleaned : `https://${cleaned}`,
      );
      if (url.hostname.toLowerCase().includes("github.com")) {
        const [owner, name] = url.pathname.replace(/^\/+/, "").split("/")
          .filter(Boolean);
        if (owner && name && !owner.startsWith(":")) {
          return { owner, name: name.replace(/\.git$/, "") };
        }
      }
    } catch (_e) {
      // fall through to regex parsing
    }
  }

  const match =
    cleaned.match(/github\.com[:/]+([^/]+)\/([^/]+?)(?:\.git)?$/i) ||
    cleaned.match(/^([^/]+)\/([^/]+?)(?:\.git)?$/);
  if (match?.[1] && match?.[2]) {
    return { owner: match[1], name: match[2].replace(/\.git$/, "") };
  }
  throw new Error("invalid repo url");
}

export async function downloadFromGithub(
  repo: string,
  branch: string,
): Promise<Uint8Array> {
  const { owner, name } = parseGithubRepo(repo);
  const useBranch = branch || "main";
  // CMG_CODELOAD_BASE is a test seam: the protocol-handler E2E repoints it at a
  // local stub so the full add-from-github chain runs without the network.
  // Read per-call (not at module load) so a test can set it after import.
  const codeloadBase = Deno.env.get("CMG_CODELOAD_BASE") ??
    "https://codeload.github.com";
  const zipUrl = `${codeloadBase}/${encodeURIComponent(owner)}/${
    encodeURIComponent(name)
  }/zip/refs/heads/${useBranch.split("/").map(encodeURIComponent).join("/")}`;
  const resp = await fetch(zipUrl);
  if (!resp.ok) {
    throw new Error(
      `download failed (HTTP ${resp.status} for ${owner}/${name}@${useBranch})`,
    );
  }
  return new Uint8Array(await resp.arrayBuffer());
}

export async function downloadFromUrl(url: string): Promise<Uint8Array> {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`download failed (HTTP ${resp.status})`);
  return new Uint8Array(await resp.arrayBuffer());
}

export async function addGameFromGithub(options: {
  repo: string;
  branch?: string;
  subdir?: string;
  name?: string;
}): Promise<{ id: string }> {
  const { repo, branch, subdir, name } = options;
  if (!repo) throw new Error("repo required");
  const { name: repoName } = parseGithubRepo(repo);
  const bytes = await downloadFromGithub(repo, branch ?? "main");
  const id = slugify(name || repoName) || "game";
  const subdirForStorage = normalizeSubdirHint(subdir) || "root";
  return await installArchive({
    bytes,
    id,
    subdir: subdirForStorage,
    sourceInfo: {
      source: "github",
      repo,
      branch: branch ?? "main",
      subdir: subdirForStorage,
    },
  });
}

export async function deleteGame(id: string): Promise<void> {
  if (!isSafeId(id)) throw new Deno.errors.NotFound("bad id");
  const target = join(GAMES_DIR, id);
  const stat = await Deno.stat(target); // throws NotFound
  if (!stat.isDirectory) throw new Deno.errors.NotFound("not a game dir");
  await Deno.remove(target, { recursive: true });
}

// Re-pull a github/url-sourced game from its recorded source (zip uploads have
// nothing to re-fetch). Tolerates the legacy layout where sourceInfo fields
// lived at the top level of codemonkey.json.
export async function updateGame(id: string): Promise<{ id: string }> {
  if (!isSafeId(id)) throw new Error("invalid game id");
  const metadataPath = join(GAMES_DIR, id, "codemonkey.json");
  let metadata: Record<string, unknown>;
  try {
    metadata = JSON.parse(await Deno.readTextFile(metadataPath));
  } catch (_e) {
    throw new Error("game has no source metadata");
  }
  const sourceInfo = (metadata.sourceInfo ?? metadata) as SourceInfo;
  if (sourceInfo.source === "github" && sourceInfo.repo) {
    const bytes = await downloadFromGithub(
      sourceInfo.repo,
      sourceInfo.branch || "main",
    );
    return await installArchive({
      bytes,
      id,
      subdir: sourceInfo.subdir,
      sourceInfo,
    });
  }
  if (sourceInfo.source === "url" && sourceInfo.url) {
    const bytes = await downloadFromUrl(sourceInfo.url);
    return await installArchive({
      bytes,
      id,
      subdir: sourceInfo.subdir,
      sourceInfo,
    });
  }
  throw new Error("Game is not updatable");
}
