// E2E: the level editor's scene-script GIST picker, driven in a real browser.
//
// Walks the flow a player runs by hand in the Title editor: switch the script
// source to GIST, type a GitHub username, LOAD GISTS, pick one from the list,
// choose which file inside it to run, and PIN the current revision — then
// checks that what lands in gameData.sceneScripts (the object Save Game
// persists, and that the runtime's resolveSceneScriptEntries reads back) is
// the gist spec those clicks described.
//
// Exactly one seam is faked: SCENE_SCRIPT_DEFAULTS.gist*ApiBase is repointed at
// a local stand-in for api.github.com, so the run is deterministic and needs no
// network. Everything under that is the shipped code — listSceneGists and
// fetchGistFile do real fetches, the "scene" filename/description filter runs
// for real, and the panel is rendered and clicked through its own handlers.
//
// The listing deliberately carries a gist whose filename AND description are an
// XSS payload. Those strings are attacker-chosen — any GitHub account can
// publish a gist and the picker will list it — and they used to be interpolated
// into innerHTML, so the test also pins that they arrive as inert text.
//
// Run with: deno task test:e2e   (no network needed)
// Set CHROME_PATH to use an installed Chrome instead of the one astral
// downloads — astral's bundled win64 build fails to spawn on some Windows
// hosts ("side-by-side configuration is incorrect").

import { launch } from "@astral/astral";
import { serveDir } from "@std/http/file-server";
import { assert, assertEquals } from "@std/assert";
import { fromFileUrl } from "@std/path";

// Ambient views of the editor page's global lexical bindings (top-level `let`
// in static/editor/index.html) — see the note in level_editor_firebase_test.ts.
// deno-lint-ignore no-explicit-any
declare let gameData: any;
// deno-lint-ignore no-explicit-any
declare let sceneScripts: any;

const CMG_PORT = 8805;
const GITHUB_PORT = 8806;
const cmgRoot = fromFileUrl(new URL("../../static", import.meta.url));

// The account we type into the picker — asserted against what the stand-in API
// actually received, so a silently-ignored username field would fail.
const GIST_USER = "cmg-e2e";
// Revision the "PIN CURRENT" button should resolve and store.
const PINNED_SHA = "9f1c0de7c0ffee1234567890abcdef0123456789";
// Same payload the boss-pattern/saved-game rows are pinned against.
const XSS = `<img src=x onerror=alert(1)>" onmouseover="alert(2)`;
const XSS_FILE = `${XSS} scene.js`;

// Stand-in api.github.com payloads, in the shape listSceneGists parses.
// Four of these five survive its filter; ee55 is dropped.
const GISTS = [
  {
    id: "aa11",
    description: "Scene: neon title takeover",
    updated_at: "2026-07-20T18:04:11Z",
    html_url: "https://gist.github.com/cmg-e2e/aa11",
    files: {
      // Two files, one matching /scene/i — the FILE dropdown should offer both
      // while the list row advertises only the scene one.
      "titleScene.js": {
        filename: "titleScene.js",
        content: "export default {};",
      },
      "helpers.js": { filename: "helpers.js", content: "export const x = 1;" },
    },
  },
  {
    id: "bb22",
    description: "adv scene interlude",
    updated_at: "2026-06-02T09:15:00Z",
    html_url: "https://gist.github.com/cmg-e2e/bb22",
    files: {
      "advScene.ts": { filename: "advScene.ts", content: "export default {};" },
    },
  },
  {
    id: "cc33",
    description: XSS,
    updated_at: "2026-05-01T00:00:00Z",
    html_url: "https://gist.github.com/cmg-e2e/cc33",
    files: {
      [XSS_FILE]: { filename: XSS_FILE, content: "export default {};" },
    },
  },
  {
    id: "dd44",
    // No "scene" in any filename, but the description carries it — kept, and
    // sceneFiles falls back to the full file list.
    description: "a scene script for the intro",
    updated_at: "2026-04-10T12:00:00Z",
    html_url: "https://gist.github.com/cmg-e2e/dd44",
    files: {
      "main.ts": { filename: "main.ts", content: "export default {};" },
    },
  },
  {
    id: "ee55",
    // Neither a matching filename nor a matching description — the one row the
    // filter must drop.
    description: "unrelated dotfile notes",
    updated_at: "2026-03-03T03:03:03Z",
    html_url: "https://gist.github.com/cmg-e2e/ee55",
    files: { "notes.md": { filename: "notes.md", content: "# notes" } },
  },
];

// Rows listSceneGists should keep, in order, as [id, sceneFiles.join(", ")].
const EXPECTED_ROWS = [
  ["aa11", "titleScene.js"],
  ["bb22", "advScene.ts"],
  ["cc33", XSS_FILE],
  ["dd44", "main.ts"],
];

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "*",
  "content-type": "application/json",
};

function staticServer(port: number, fsRoot: string) {
  return Deno.serve(
    { port, hostname: "127.0.0.1", onListen: () => {} },
    (req) => serveDir(req, { fsRoot, enableCors: true, quiet: true }),
  );
}

// Minimal stand-in for the two api.github.com endpoints the picker touches.
// Records every path it serves so the test can prove the page really went over
// the wire rather than reading some cached/stubbed listing.
function githubStub(port: number, seen: string[]) {
  return Deno.serve(
    { port, hostname: "127.0.0.1", onListen: () => {} },
    (req) => {
      const { pathname } = new URL(req.url);
      if (req.method === "OPTIONS") {
        return new Response(null, {
          headers: CORS,
        });
      }
      seen.push(pathname);

      const list = pathname.match(/^\/users\/([^/]+)\/gists$/);
      if (list) return new Response(JSON.stringify(GISTS), { headers: CORS });

      const one = pathname.match(/^\/gists\/([^/]+)$/);
      if (one) {
        const gist = GISTS.find((g) => g.id === one[1]);
        if (!gist) return new Response("{}", { status: 404, headers: CORS });
        // fetchGistFile reads history[0].version for the pinned revision.
        return new Response(
          JSON.stringify({ ...gist, history: [{ version: PINNED_SHA }] }),
          { headers: CORS },
        );
      }
      return new Response("{}", { status: 404, headers: CORS });
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

// Click a control in the title panel by its visible label, through the same
// onclick the user's pointer would hit. Returns false if no such control.
function clickByText(page: Page, label: string): Promise<boolean> {
  return page.evaluate((text: string) => {
    const host = document.getElementById("title-script-panel");
    if (!host) return false;
    const hit = Array.from(
      host.querySelectorAll<HTMLElement>(".ss-pill, .ss-btn"),
    )
      .find((el) => (el.textContent || "").trim() === text);
    if (!hit) return false;
    hit.click();
    return true;
  }, { args: [label] });
}

Deno.test("scene-script gist picker: list, select, choose file, pin revision", async () => {
  const seen: string[] = [];
  const site = staticServer(CMG_PORT, cmgRoot);
  const api = githubStub(GITHUB_PORT, seen);
  const chrome = Deno.env.get("CHROME_PATH");
  const browser = await launch({
    headless: true,
    args: ["--no-sandbox"],
    ...(chrome ? { path: chrome } : {}),
  });

  try {
    const page: Page = await browser.newPage(
      `http://127.0.0.1:${CMG_PORT}/editor/?game=2028-ai`,
    );

    // Editor boot: the base game plus the scene-script module bridge. Firebase
    // is irrelevant here, so unlike the save test we don't wait on it.
    await waitFor(
      () =>
        page.evaluate(() => {
          try {
            // deno-lint-ignore no-explicit-any
            const g = globalThis as any;
            return !!(gameData && typeof g.listSceneGists === "function" &&
              typeof g.showTitleEditor === "function");
          } catch (_e) {
            return false; // bindings don't exist until the editor script runs
          }
        }),
      "editor to boot and expose the scene-script bridge",
    );

    // Point the picker at the stand-in API and capture any dialog the page
    // raises — an XSS payload that detonated would land here as alert(1).
    await page.evaluate((base: string) => {
      // deno-lint-ignore no-explicit-any
      const g = globalThis as any;
      g.SCENE_SCRIPT_DEFAULTS.gistUserApiBase = base + "/users";
      g.SCENE_SCRIPT_DEFAULTS.gistApiBase = base + "/gists";
      g.__dialogs = [];
      g.alert = (m: unknown) => g.__dialogs.push("alert:" + String(m));
      g.confirm = () => true;
      globalThis.addEventListener(
        "error",
        (e) => g.__dialogs.push("error:" + e.message),
      );
    }, { args: [`http://127.0.0.1:${GITHUB_PORT}`] });

    // --- open the Title editor and switch the script source to GIST ---------
    await page.evaluate(async () => {
      // deno-lint-ignore no-explicit-any
      await (globalThis as any).showTitleEditor();
    });
    assert(
      await page.evaluate(() =>
        !document.getElementById("title-editor-modal")!.classList.contains(
          "hidden",
        ) &&
        !!document.querySelector("#title-script-panel .ss-pill")
      ),
      "Title editor modal should be open with the scene-script panel rendered",
    );

    assert(await clickByText(page, "GIST"), "GIST source pill should exist");
    assertEquals(
      await page.evaluate(() => sceneScripts.title.sourceType),
      "gist",
      "GIST pill should switch the entry's source type",
    );

    // --- type a username and LOAD GISTS -------------------------------------
    await page.evaluate((user: string) => {
      (document.getElementById("ss-gist-user-title") as HTMLInputElement)
        .value = user;
    }, { args: [GIST_USER] });
    assert(
      await clickByText(page, "LOAD GISTS"),
      "LOAD GISTS button should exist",
    );

    const rows = await waitFor(
      async () => {
        const got = await page.evaluate(() =>
          Array.from(
            document.querySelectorAll("#title-script-panel .ss-gist-item"),
          )
            .map((el) => ({
              files: (el.firstElementChild?.textContent || "").trim(),
              desc: (el.querySelector(".ss-gist-desc")?.textContent || "")
                .trim(),
              imgs: el.querySelectorAll("img").length,
              kids: el.children.length,
            }))
        );
        return got.length ? got : null;
      },
      "the gist listing to render",
    );

    // The stand-in really was hit, for the account that was typed.
    assertEquals(seen[0], `/users/${GIST_USER}/gists`);

    // Filter: 4 of 5 kept; ee55 (no "scene" in a filename or the description)
    // is dropped. NB: nothing here asserts the "N scene gist(s) found" status
    // line — ssLoadGists sets it and then calls renderSceneScriptPanel, which
    // clears the panel and rebuilds the status element empty, so that message
    // never actually reaches the screen.
    assertEquals(rows.length, EXPECTED_ROWS.length, "one row per scene gist");
    assertEquals(
      rows.map((r: { files: string }) => r.files),
      EXPECTED_ROWS.map((r) => r[1]),
    );

    // The hostile row: payload intact as TEXT, no markup, no handlers, no boom.
    const hostile = rows[2];
    assertEquals(
      hostile.files,
      XSS_FILE,
      "filename should read back verbatim as text",
    );
    assertEquals(hostile.desc, `${XSS} · updated 2026-05-01`);
    assertEquals(hostile.imgs, 0, "payload must not become an <img>");
    assertEquals(
      hostile.kids,
      2,
      "row is exactly the files div + the desc div",
    );
    assertEquals(
      await page.evaluate(() =>
        document.querySelectorAll("#title-script-panel img").length +
        Array.from(document.querySelectorAll("#title-script-panel *"))
          .filter((el) =>
            el.getAttribute("onerror") || el.getAttribute("onmouseover")
          ).length
      ),
      0,
      "no injected elements or inline handlers anywhere in the panel",
    );

    // --- pick a gist --------------------------------------------------------
    const picked = await page.evaluate(() => {
      const items = document.querySelectorAll<HTMLElement>(
        "#title-script-panel .ss-gist-item",
      );
      items[0].click();
      const after = document.querySelectorAll<HTMLElement>(
        "#title-script-panel .ss-gist-item",
      );
      const fileSel = document.querySelector<HTMLSelectElement>(
        "#title-script-panel select",
      );
      return {
        selected: after[0].classList.contains("sel"),
        othersSelected: Array.from(after).slice(1).filter((el) =>
          el.classList.contains("sel")
        ).length,
        options: fileSel
          ? Array.from(fileSel.options).map((o) => o.value)
          : [],
        chosen: fileSel ? fileSel.value : null,
        gist: gameData.sceneScripts.title.gist,
      };
    });
    assert(picked.selected, "clicked row should get the .sel highlight");
    assertEquals(
      picked.othersSelected,
      0,
      "only one row highlighted at a time",
    );
    // Both of the gist's files are offered; the scene one is preselected.
    assertEquals(picked.options, ["titleScene.js", "helpers.js"]);
    assertEquals(picked.chosen, "titleScene.js");
    assertEquals(picked.gist.id, "aa11");
    assertEquals(picked.gist.user, GIST_USER);
    assertEquals(picked.gist.file, "titleScene.js");
    assertEquals(picked.gist.rev, "latest");

    // --- switch which file inside the gist runs -----------------------------
    assertEquals(
      await page.evaluate(() => {
        const sel = document.querySelector<HTMLSelectElement>(
          "#title-script-panel select",
        )!;
        sel.value = "helpers.js";
        sel.dispatchEvent(new Event("change"));
        return gameData.sceneScripts.title.gist.file;
      }),
      "helpers.js",
      "changing the FILE dropdown should update the stored entry",
    );

    // --- pin the current revision -------------------------------------------
    assert(
      await clickByText(page, "PIN CURRENT"),
      "PIN CURRENT pill should exist",
    );
    const pinned = await waitFor(
      async () => {
        const rev = await page.evaluate(() =>
          gameData.sceneScripts.title.gist.rev
        );
        return rev && rev !== "latest" ? rev : null;
      },
      "the pinned revision to resolve",
    );
    assertEquals(pinned, PINNED_SHA);
    assert(
      seen.includes("/gists/aa11"),
      `pinning should have fetched the gist detail (saw ${Deno.inspect(seen)})`,
    );
    // The pill label is the surviving user-visible proof of the pin (the
    // "pinned @ …" status line is wiped by the re-render, as above).
    assert(
      await page.evaluate(
        (sha: string) =>
          Array.from(document.querySelectorAll("#title-script-panel .ss-pill"))
            .some((p) =>
              (p.textContent || "").trim() === "PINNED @ " + sha.slice(0, 10)
            ),
        {
          args: [PINNED_SHA],
        },
      ),
      "the pill should read back the pinned sha",
    );

    // --- and back to latest --------------------------------------------------
    assert(
      await clickByText(page, "LATEST (pull on play)"),
      "LATEST pill should exist",
    );
    assertEquals(
      await page.evaluate(() => gameData.sceneScripts.title.gist.rev),
      "latest",
      "LATEST should unpin",
    );

    // What Save Game would persist, and what the runtime reads back.
    assertEquals(
      await page.evaluate(() => {
        const t = gameData.sceneScripts.title;
        return { mode: t.mode, sourceType: t.sourceType, gist: t.gist };
      }),
      {
        mode: "hook",
        sourceType: "gist",
        gist: {
          user: GIST_USER,
          id: "aa11",
          file: "helpers.js",
          rev: "latest",
        },
      },
    );

    // Nothing the listing carried ever executed.
    assertEquals(
      await page.evaluate(() =>
        (globalThis as never as { __dialogs: string[] }).__dialogs
      ),
      [],
    );
  } finally {
    await browser.close();
    await api.shutdown();
    await site.shutdown();
  }
});
