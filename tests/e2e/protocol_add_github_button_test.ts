// E2E: the "Add to CodeMonkey" GitHub button, from click to a game the
// launcher lists.
//
// Walks the whole deep-link chain a player triggers from github.com:
//   1. a real browser loads a GitHub-shaped repo page with the shipped
//      extension content script (tools/github-extension/content.js) running,
//   2. the injected "Add to CodeMonkey" button is clicked; its prompts are
//      answered (branch, folder),
//   3. the codemonkey://add?… link the page then navigates to is captured,
//   4. that link is handed to the real protocol handler (lib/protocol.ts —
//      exactly what scripts/launch-windows.ts runs when Windows invokes the
//      registered handler with the link as argv),
//   5. the game is asserted installed in the store and listed both by
//      listGames() and by the GET /api/games/local route the dashboard calls.
//
// Two seams are faked, both crossings out of the app's own code:
//   - the browser→OS protocol hop. Chrome hands codemonkey:// links to the
//     registry (see scripts/register-windows-protocol.ts), which a headless
//     test can't traverse. The navigation attempt itself IS observed — CDP's
//     Page.frameRequestedNavigation reports the exact URL the shipped
//     location.assign() tried to open — and the captured link is passed to the
//     handler the registry would have invoked.
//   - github.com itself: the repo page is a local stand-in (the real GitHub
//     header layouts change under our feet), and CMG_CODELOAD_BASE points the
//     store's zipball download at a local stub serving a fixture zip shaped
//     like GitHub's (<repo>-<branch>/ wrapper folder). The stub records what
//     it served, so the test proves the bytes really came through it.
//
// Run with: deno task test:e2e   (no network needed)
// Set CHROME_PATH to use an installed Chrome instead of the one astral
// downloads — astral's bundled win64 build fails to spawn on some Windows
// hosts ("side-by-side configuration is incorrect").

import { launch } from "@astral/astral";
import {
  assert,
  assertEquals,
  assertStringIncludes,
  assertThrows,
} from "@std/assert";
import { fromFileUrl, join } from "@std/path";

const PAGE_PORT = 8810;
const CODELOAD_PORT = 8811;

const REPO_OWNER = "easierbycode";
const REPO_NAME = "monkey-blaster";
const REPO_URL = `https://github.com/${REPO_OWNER}/${REPO_NAME}`;
// Typed into the branch prompt (the page defaults to "main") — proves the
// answer flows into the link rather than being ignored.
const BRANCH = "master";

// The games store computes GAMES_DIR when its module first evaluates, so both
// env seams are set before lib/protocol.ts (which imports it) loads. The
// dynamic imports keep that ordering explicit.
const gamesDir = await Deno.makeTempDir({ prefix: "cmg-protocol-e2e-" });
Deno.env.set("CMG_GAMES_DIR", gamesDir);
Deno.env.set("CMG_CODELOAD_BASE", `http://127.0.0.1:${CODELOAD_PORT}`);
const { findProtocolArg, handleProtocolUrl, parseProtocolUrl } = await import(
  "../../lib/protocol.ts"
);
const { listGames } = await import("../../lib/games-store.ts");

const contentJs = await Deno.readTextFile(
  fromFileUrl(
    new URL("../../tools/github-extension/content.js", import.meta.url),
  ),
);
const fixtureZip = await Deno.readFile(
  fromFileUrl(
    new URL("./fixtures/monkey-blaster-master.zip", import.meta.url),
  ),
);

// A GitHub-shaped page: the repo header with an action area matching the
// selectors the content script tries, plus the content script itself — loaded
// the way the extension would inject it.
function githubPage(title: string): string {
  return `<!doctype html>
<html>
  <head><title>${title}</title></head>
  <body>
    <div id="repository-container-header">
      <strong>${title}</strong>
      <div class="d-flex gap-2" id="repo-actions">
        <button type="button">Watch</button>
        <button type="button">Star</button>
      </div>
    </div>
    <script src="/ext/content.js"></script>
  </body>
</html>`;
}

function fakeGithub(port: number) {
  return Deno.serve(
    { port, hostname: "127.0.0.1", onListen: () => {} },
    (req) => {
      const { pathname } = new URL(req.url);
      if (pathname === "/ext/content.js") {
        return new Response(contentJs, {
          headers: { "content-type": "text/javascript" },
        });
      }
      if (pathname === `/${REPO_OWNER}/${REPO_NAME}`) {
        return new Response(githubPage(`${REPO_OWNER}/${REPO_NAME}`), {
          headers: { "content-type": "text/html" },
        });
      }
      // A non-repo page with the SAME header markup — the button must not
      // mount here (path shape, not selectors, decides).
      if (pathname === "/topics") {
        return new Response(githubPage("Topics"), {
          headers: { "content-type": "text/html" },
        });
      }
      return new Response("not found", { status: 404 });
    },
  );
}

// Stand-in for codeload.github.com. Records every path it serves so the test
// can prove the install's bytes came through here.
function codeloadStub(port: number, seen: string[]) {
  return Deno.serve(
    { port, hostname: "127.0.0.1", onListen: () => {} },
    (req) => {
      const { pathname } = new URL(req.url);
      seen.push(pathname);
      if (
        pathname === `/${REPO_OWNER}/${REPO_NAME}/zip/refs/heads/${BRANCH}`
      ) {
        return new Response(fixtureZip.slice(), {
          headers: { "content-type": "application/zip" },
        });
      }
      return new Response("no such ref", { status: 404 });
    },
  );
}

// deno-lint-ignore no-explicit-any
type Page = any;

async function waitFor<T>(
  check: () => Promise<T | null | false>,
  label: string,
  timeoutMs = 30000,
): Promise<T> {
  const deadline = Date.now() + timeoutMs;
  let last: unknown;
  while (Date.now() < deadline) {
    try {
      const value = await check();
      if (value) return value;
      last = value;
    } catch (error) {
      last = error;
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(
    `Timed out waiting for ${label} (last: ${Deno.inspect(last)})`,
  );
}

Deno.test("Add to CodeMonkey button → codemonkey:// link → game in the launcher", async () => {
  const seen: string[] = [];
  const site = fakeGithub(PAGE_PORT);
  const codeload = codeloadStub(CODELOAD_PORT, seen);
  const chrome = Deno.env.get("CHROME_PATH");
  const browser = await launch({
    headless: true,
    args: ["--no-sandbox"],
    ...(chrome ? { path: chrome } : {}),
  });

  try {
    const page: Page = await browser.newPage(
      `http://127.0.0.1:${PAGE_PORT}/${REPO_OWNER}/${REPO_NAME}`,
    );

    // --- the content script mounts the button into the repo's action area ---
    await waitFor(
      () =>
        page.evaluate(() =>
          !!document.getElementById("codemonkey-launcher-button")
        ),
      "the Add to CodeMonkey button to mount",
    );
    const mount = await page.evaluate(() => {
      const btn = document.getElementById("codemonkey-launcher-button")!;
      return {
        text: btn.innerText,
        parent: btn.parentElement?.id ?? "",
        floating: (btn as HTMLElement).style.position === "fixed",
        count: document.querySelectorAll("#codemonkey-launcher-button").length,
      };
    });
    assertEquals(mount.text, "Add to CodeMonkey");
    assertEquals(
      mount.parent,
      "repo-actions",
      "button should land in the action area, not the floating fallback",
    );
    assert(!mount.floating);
    assertEquals(mount.count, 1, "MutationObserver re-runs must not duplicate");

    // --- answer the prompts and record the announced link -------------------
    await page.evaluate((branch: string) => {
      // deno-lint-ignore no-explicit-any
      const g = globalThis as any;
      g.__launchUrls = [];
      document.addEventListener(
        "cmg-launcher-url",
        (e) => g.__launchUrls.push(String((e as CustomEvent).detail)),
      );
      const answers = [branch, ""]; // branch prompt, then folder prompt
      g.prompt = () => (answers.length ? answers.shift() : null);
    }, { args: [BRANCH] });

    // Watch the real navigation at the CDP layer: the browser→OS hop is the
    // one seam a headless test can't cross, but the attempt itself — the URL
    // the shipped location.assign() opened — is reported by Chrome.
    const celestial = page.unsafelyGetCelestialBindings();
    const requested: string[] = [];
    celestial.addEventListener(
      "Page.frameRequestedNavigation",
      // deno-lint-ignore no-explicit-any
      (e: any) => requested.push(String(e.detail?.url ?? "")),
    );

    // --- the click a player makes -------------------------------------------
    await page.evaluate(() =>
      document.getElementById("codemonkey-launcher-button")!.click()
    );

    const navUrl = await waitFor(
      () =>
        Promise.resolve(
          requested.find((u) => u.startsWith("codemonkey://")) ?? null,
        ),
      "the page to navigate to a codemonkey:// link",
    );
    // The link the page announced is the link the browser tried to open.
    assertEquals(
      await page.evaluate(() =>
        // deno-lint-ignore no-explicit-any
        (globalThis as any).__launchUrls as string[]
      ),
      [navUrl],
    );

    // The link honors the protocol contract: canonical repo url (not the
    // 127.0.0.1 page address), the prompted branch, root folder.
    const request = parseProtocolUrl(navUrl);
    assertEquals(request, {
      action: "add",
      repo: REPO_URL,
      url: undefined,
      branch: BRANCH,
      subdir: "root",
      name: undefined,
    });

    // --- what the registered handler does with the link ---------------------
    // Windows runs `"<launcher exe>" "<link>"` (register-windows-protocol.ts);
    // the launcher pulls the link out of argv and handles it — same calls,
    // same order, as scripts/launch-windows.ts.
    const argvLink = findProtocolArg(["--kiosk", `"${navUrl}"`]);
    assertEquals(argvLink, navUrl, "argv extraction should strip the quotes");
    const { id } = await handleProtocolUrl(argvLink!);
    assertEquals(id, REPO_NAME);

    // The zipball really came through the codeload endpoint, for the branch
    // that was typed into the prompt.
    assertEquals(seen, [
      `/${REPO_OWNER}/${REPO_NAME}/zip/refs/heads/${BRANCH}`,
    ]);

    // Installed on disk: the wrapper folder collapsed, provenance recorded.
    assertStringIncludes(
      await Deno.readTextFile(join(gamesDir, id, "index.html")),
      "monkey blaster",
    );
    const meta = JSON.parse(
      await Deno.readTextFile(join(gamesDir, id, "codemonkey.json")),
    );
    assertEquals(meta.sourceInfo, {
      source: "github",
      repo: REPO_URL,
      branch: BRANCH,
      subdir: "root",
    });

    // …and the launcher lists it: through the store —
    const entry = (await listGames()).find((g) => g.id === id);
    assert(entry, `listGames() should include '${id}'`);
    assertEquals(entry.launchPath, `/games/${id}/`);
    assertEquals(entry.sourceInfo?.source, "github");

    // — and through the API route the dashboard actually calls.
    const localRoute = await import("../../routes/api/games/local.ts");
    const res = await (localRoute.handler as unknown as {
      GET(): Promise<Response>;
    }).GET();
    const payload = await res.json() as {
      ok: boolean;
      games: { id: string; launchPath: string }[];
    };
    assert(payload.ok);
    assert(
      payload.games.some((g) => g.id === id),
      "/api/games/local should list the new game",
    );

    // --- and the button knows where it doesn't belong ------------------------
    // Same header markup on a non-repo path: no button.
    await page.goto(`http://127.0.0.1:${PAGE_PORT}/topics`);
    await new Promise((r) => setTimeout(r, 600)); // let the observer settle
    assertEquals(
      await page.evaluate(() =>
        !!document.getElementById("codemonkey-launcher-button")
      ),
      false,
      "non-repo pages must not grow the button",
    );
  } finally {
    await browser.close();
    await site.shutdown();
    await codeload.shutdown();
    await Deno.remove(gamesDir, { recursive: true }).catch(() => {});
  }
});

// ---------------------------------------------------------------------------
// The protocol contract itself — fast, no browser.
// ---------------------------------------------------------------------------

Deno.test("parseProtocolUrl: accepts the links the button builds", () => {
  const full = parseProtocolUrl(
    "codemonkey://add?repo=https%3A%2F%2Fgithub.com%2Fowner%2Fgame&branch=dev&folder=dist&name=My%20Game",
  );
  assertEquals(full, {
    action: "add",
    repo: "https://github.com/owner/game",
    url: undefined,
    branch: "dev",
    subdir: "dist",
    name: "My Game",
  });

  // Empty folder means the archive root; legacy subdir= still understood.
  assertEquals(
    parseProtocolUrl("codemonkey://add?repo=o/g&folder=").subdir,
    "root",
  );
  assertEquals(
    parseProtocolUrl("codemonkey://add?repo=o/g&subdir=docs").subdir,
    "docs",
  );
  // Branch defaults to main; the no-slashes spelling parses too.
  assertEquals(parseProtocolUrl("codemonkey:add?repo=o/g").branch, "main");
  // Direct zip urls are accepted (mirrors POST /api/games/add-url).
  assertEquals(
    parseProtocolUrl("codemonkey://add?url=https://example.com/game.zip").url,
    "https://example.com/game.zip",
  );
});

Deno.test("parseProtocolUrl: rejects what the handler must never run", () => {
  assertThrows(
    () => parseProtocolUrl("https://github.com/o/g"),
    Error,
    "scheme",
  );
  assertThrows(
    () => parseProtocolUrl("codemonkey://delete?repo=o/g"),
    Error,
    "action",
  );
  assertThrows(
    () => parseProtocolUrl("codemonkey://add"),
    Error,
    "repo= or url=",
  );
  // file:/data: zips would read local files into the store server-side.
  assertThrows(
    () => parseProtocolUrl("codemonkey://add?url=file:///C:/secrets.zip"),
    Error,
    "http(s)",
  );
  assertThrows(() => parseProtocolUrl("not a url at all"), Error, "invalid");
});

Deno.test("findProtocolArg: pulls the link out of a Windows argv", () => {
  assertEquals(
    findProtocolArg(["--flag", '"codemonkey://add?repo=o/g"', "other"]),
    "codemonkey://add?repo=o/g",
  );
  assertEquals(
    findProtocolArg(["CODEMONKEY://ADD?repo=o/g"]),
    "CODEMONKEY://ADD?repo=o/g",
  );
  assertEquals(findProtocolArg(["--kiosk", "http://x"]), null);
});
