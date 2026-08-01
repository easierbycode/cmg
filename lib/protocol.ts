// codemonkey:// deep-link contract, ported from codemonkey-games-launcher
// (its main.ts parses the same URLs out of Deno.args at boot). The Chrome
// extension's "Add to CodeMonkey" button on github.com builds these links, and
// the OS-registered protocol handler (scripts/register-windows-protocol.ts)
// relaunches the compiled launcher with the link as argv[1]:
//
//   codemonkey://add?repo=<github url|owner/name>&branch=<b>&folder=<f>&name=<n>
//   codemonkey://add?url=<direct .zip url>&name=<n>&folder=<f>
//
// Parsing lives here — separate from any entrypoint — so the compiled Windows
// launcher (scripts/launch-windows.ts) and the E2E suite exercise the exact
// same code. Divergences from upstream, on purpose:
//   - `url=` zip sources are accepted, mirroring POST /api/games/add-url.
//   - non-http(s) `url=` values are rejected for the same reason add-url.ts
//     rejects them: the fetch runs server-side, so file:/data: would read
//     local files into the game store.
//   - parse errors throw (upstream logged and carried on booting); the caller
//     decides whether a bad link is fatal.

import {
  addGameFromGithub,
  downloadFromUrl,
  installArchive,
  slugify,
} from "./games-store.ts";

export const PROTOCOL_SCHEME = "codemonkey";

export type ProtocolAddRequest = {
  action: "add";
  /** GitHub repo (url or owner/name shorthand) — present on repo adds. */
  repo?: string;
  /** Direct http(s) .zip url — present on url adds. */
  url?: string;
  branch: string;
  subdir: string;
  name?: string;
};

/**
 * Pick the protocol link out of a raw argv. Windows hands the handler the
 * clicked URL as an argument (`"<exe>" "%1"`); stray surrounding quotes are
 * stripped like upstream did, since shells occasionally leave them on.
 */
export function findProtocolArg(args: readonly string[]): string | null {
  for (const arg of args) {
    const cleaned = arg.replace(/^['"]+|['"]+$/g, "");
    if (cleaned.toLowerCase().startsWith(`${PROTOCOL_SCHEME}://`)) {
      return cleaned;
    }
  }
  return null;
}

/** Parse a codemonkey:// link into an add request. Throws on anything else. */
export function parseProtocolUrl(raw: string): ProtocolAddRequest {
  const cleaned = raw.replace(/^['"]+|['"]+$/g, "").trim();
  let url: URL;
  try {
    url = new URL(cleaned);
  } catch (_e) {
    throw new Error(`invalid protocol url: ${raw}`);
  }
  if (url.protocol !== `${PROTOCOL_SCHEME}:`) {
    throw new Error(`unsupported scheme: ${url.protocol}`);
  }

  // codemonkey://add?… parses the action as the host; codemonkey:add?… (no
  // slashes) parses it as the pathname. Accept both spellings.
  const action = (url.hostname || url.pathname.replace(/^\/+/, ""))
    .toLowerCase();
  if (action !== "add") {
    throw new Error(`unsupported protocol action: ${action || "(none)"}`);
  }

  const repo = url.searchParams.get("repo")?.trim() || undefined;
  const zipUrl = url.searchParams.get("url")?.trim() || undefined;
  if (!repo && !zipUrl) {
    throw new Error("protocol add link needs a repo= or url= parameter");
  }
  if (zipUrl && !repo) {
    let scheme = "";
    try {
      scheme = new URL(zipUrl).protocol;
    } catch (_e) {
      throw new Error("invalid url parameter");
    }
    if (scheme !== "http:" && scheme !== "https:") {
      throw new Error("url parameter must be http(s)");
    }
  }

  // The extension sends `folder=`; older links may say `subdir=`. Empty means
  // the archive root, which the games store spells "root".
  const subdirHint = url.searchParams.get("folder") ??
    url.searchParams.get("subdir") ?? "root";
  const subdir = subdirHint.trim() === "" ? "root" : subdirHint.trim();

  return {
    action: "add",
    repo,
    url: repo ? undefined : zipUrl,
    branch: url.searchParams.get("branch")?.trim() || "main",
    subdir,
    name: url.searchParams.get("name")?.trim() || undefined,
  };
}

/**
 * Execute a parsed add request against the local game store. Returns the
 * installed game id — the same id GET /api/games/local then lists.
 */
export async function handleProtocolAdd(
  request: ProtocolAddRequest,
): Promise<{ id: string }> {
  if (request.repo) {
    return await addGameFromGithub({
      repo: request.repo,
      branch: request.branch,
      subdir: request.subdir,
      name: request.name,
    });
  }

  // Direct zip url — same derivation as POST /api/games/add-url.
  const zipUrl = request.url!;
  const derived = (() => {
    try {
      return new URL(zipUrl).pathname.split("/").pop()?.replace(
        /\.zip$/i,
        "",
      ) || "game";
    } catch (_e) {
      return "game";
    }
  })();
  const id = slugify(request.name || derived) || "game";
  const bytes = await downloadFromUrl(zipUrl);
  return await installArchive({
    bytes,
    id,
    subdir: request.subdir,
    sourceInfo: { source: "url", url: zipUrl, subdir: request.subdir },
  });
}

/** Parse + execute in one step — what the launcher entrypoint calls. */
export async function handleProtocolUrl(raw: string): Promise<{ id: string }> {
  return await handleProtocolAdd(parseProtocolUrl(raw));
}
