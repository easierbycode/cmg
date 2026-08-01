// The scene-script GIST picker flow, as an ordered list of steps.
//
// This module owns the whole thing -- fixtures, the stand-in GitHub API, the
// browser hunt and the step list -- so that the two consumers stay honest
// about being the same run:
//
//   tests/e2e/scene_script_gist_picker_test.ts   asserts every check passes
//   tools/visual-test-runner/main.ts             screenshots each step
//
// Steps RETURN their checks rather than throwing, so a runner can render a
// failure instead of dying on it. runFlow() turns the first thrown error into
// a failed step and marks the rest skipped -- later steps assume the state the
// earlier ones built, so continuing past a failure would only produce noise.
//
// Exactly one seam is faked: SCENE_SCRIPT_DEFAULTS.gist*ApiBase is repointed
// at a local stand-in for api.github.com, so a run is deterministic and needs
// no network. Everything under it is the shipped editor code -- listSceneGists
// and fetchGistFile do real fetches, the "scene" filename/description filter
// runs for real, and the panel is rendered and clicked through its own
// handlers.

import { launch } from "@astral/astral";
import { serveDir } from "@std/http/file-server";
import { fromFileUrl } from "@std/path";

// Ambient views of the editor page's global lexical bindings (top-level `let`
// in static/editor/index.html). They exist only inside page.evaluate
// callbacks -- the stringified callbacks resolve them lexically in the browser
// -- but the declarations keep this file type-checkable.
// deno-lint-ignore no-explicit-any
declare let gameData: any;
// deno-lint-ignore no-explicit-any
declare let sceneScripts: any;

// deno-lint-ignore no-explicit-any
export type Page = any;

const staticRoot = fromFileUrl(new URL("../../static", import.meta.url));

/** The account typed into the picker. Asserted against what the stand-in
 * actually received, so a silently-ignored username field would fail. */
export const GIST_USER = "cmg-e2e";
/** Revision "PIN CURRENT" should resolve and store. */
export const PINNED_SHA = "9f1c0de7c0ffee1234567890abcdef0123456789";
/** The payload the saved-game and boss-pattern rows are also pinned against. */
export const XSS = `<img src=x onerror=alert(1)>" onmouseover="alert(2)`;
export const XSS_FILE = `${XSS} scene.js`;

/** Stand-in api.github.com payloads, in the shape listSceneGists parses.
 * Four of the five survive its filter; ee55 is the one it must drop. */
const GISTS = [
  {
    id: "aa11",
    description: "Scene: neon title takeover",
    updated_at: "2026-07-20T18:04:11Z",
    html_url: "https://gist.github.com/cmg-e2e/aa11",
    files: {
      // Two files, one matching /scene/i -- the FILE dropdown should offer
      // both while the list row advertises only the scene one.
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
    // No "scene" in any filename, but the description carries it -- kept, and
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
    // Neither a matching filename nor a matching description -- the one row
    // the filter must drop.
    description: "unrelated dotfile notes",
    updated_at: "2026-03-03T03:03:03Z",
    html_url: "https://gist.github.com/cmg-e2e/ee55",
    files: { "notes.md": { filename: "notes.md", content: "# notes" } },
  },
];

/** Rows listSceneGists should keep, in order, by their sceneFiles join. */
export const EXPECTED_ROWS = [
  "titleScene.js",
  "advScene.ts",
  XSS_FILE,
  "main.ts",
];

// ---------------------------------------------------------------- checks ---

export interface Check {
  label: string;
  ok: boolean;
  actual?: unknown;
  expected?: unknown;
}

const same = (a: unknown, b: unknown) =>
  JSON.stringify(a) === JSON.stringify(b);

/** A check that two values match. */
export function eq(label: string, actual: unknown, expected: unknown): Check {
  return { label, ok: same(actual, expected), actual, expected };
}

/** A check that a condition holds, with optional detail for the report. */
export function is(label: string, cond: boolean, actual?: unknown): Check {
  return { label, ok: cond, actual };
}

// ----------------------------------------------------------------- steps ---

export interface StepCtx {
  page: Page;
  /** Every path the stand-in GitHub API has served, in order. Some checks are
   * about what went over the wire, not what the page shows. */
  seen: string[];
  /** Scratch space for values one step captures and a later one asserts on. */
  state: Record<string, unknown>;
}

export interface Step {
  name: string;
  detail: string;
  run(ctx: StepCtx): Promise<Check[]>;
}

// --- small page helpers, shared by the steps -------------------------------

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

/** Click a control in the title panel by its visible label, through the same
 * onclick a real pointer would hit. Throws if there is no such control. */
async function click(page: Page, label: string): Promise<void> {
  const hit = await page.evaluate((text: string) => {
    const host = document.getElementById("title-script-panel");
    if (!host) return false;
    const el = Array.from(
      host.querySelectorAll<HTMLElement>(".ss-pill, .ss-btn"),
    ).find((n) => (n.textContent || "").trim() === text);
    if (!el) return false;
    el.click();
    return true;
  }, { args: [label] });
  if (!hit) {
    throw new Error(`no control labelled "${label}" in the title panel`);
  }
}

/** The panel's status line, as the user would read it. */
function status(page: Page): Promise<string> {
  return page.evaluate(() => {
    const el = document.getElementById("ss-status-title");
    return el ? (el.textContent || "") : "(no status element)";
  });
}

export const STEPS: Step[] = [
  {
    name: "Boot the editor",
    detail:
      "Load /editor/?game=2028-ai and wait for the scene-script bridge, then " +
      "point the gist picker at the local stand-in API.",
    async run({ page }) {
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
        "the editor to boot and expose the scene-script bridge",
      );
      // Capture any dialog the page raises -- a payload that detonated would
      // land here as alert(1).
      const wired = await page.evaluate(() => {
        // deno-lint-ignore no-explicit-any
        const g = globalThis as any;
        g.__dialogs = [];
        g.alert = (m: unknown) => g.__dialogs.push("alert:" + String(m));
        g.confirm = () => true;
        globalThis.addEventListener(
          "error",
          (e) => g.__dialogs.push("error:" + e.message),
        );
        return typeof g.SCENE_SCRIPT_DEFAULTS === "object";
      });
      return [is("scene-script bridge is on the page", wired)];
    },
  },
  {
    name: "Open the Title editor",
    detail: "The modal that hosts the CUSTOM SCRIPT — TITLE SCENE panel.",
    async run({ page }) {
      await page.evaluate(async () => {
        // deno-lint-ignore no-explicit-any
        await (globalThis as any).showTitleEditor();
      });
      const seen = await page.evaluate(() => ({
        open: !document.getElementById("title-editor-modal")!.classList
          .contains("hidden"),
        panel: !!document.querySelector("#title-script-panel .ss-pill"),
      }));
      return [
        is("the modal is open", seen.open),
        is("the scene-script panel rendered", seen.panel),
      ];
    },
  },
  {
    name: "Switch the source to GIST",
    detail: "Click the GIST pill in the OFF / LINK / CODE / GIST row.",
    async run({ page }) {
      await click(page, "GIST");
      return [
        eq(
          "the entry's source type",
          await page.evaluate(() => sceneScripts.title.sourceType),
          "gist",
        ),
      ];
    },
  },
  {
    name: `Load gists for @${GIST_USER}`,
    detail:
      "Type the account into GITHUB USER and press LOAD GISTS. Five gists " +
      "come back; the filter keeps the four with 'scene' in a filename or " +
      "the description.",
    async run({ page, seen, state }) {
      await page.evaluate((user: string) => {
        (document.getElementById("ss-gist-user-title") as HTMLInputElement)
          .value = user;
      }, { args: [GIST_USER] });
      await click(page, "LOAD GISTS");

      const rows = await waitFor(
        async () => {
          const got = await page.evaluate(() =>
            Array.from(
              document.querySelectorAll("#title-script-panel .ss-gist-item"),
            ).map((el) => ({
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
      state.rows = rows;

      return [
        eq("the API path that was hit", seen[0], `/users/${GIST_USER}/gists`),
        eq("rows rendered (5 gists, 1 filtered out)", rows.length, 4),
        eq(
          "row filenames",
          rows.map((r: { files: string }) => r.files),
          EXPECTED_ROWS,
        ),
        // Set before the re-render ssLoadGists ends with, so this only holds
        // because the status survives that re-render.
        eq("the status line", await status(page), "4 scene gist(s) found"),
      ];
    },
  },
  {
    name: "Hostile gist renders as inert text",
    detail:
      "One fixture's filename AND description are an XSS payload -- any " +
      "GitHub account could publish that. It must arrive as text, not markup.",
    async run({ page, state }) {
      // deno-lint-ignore no-explicit-any
      const hostile = (state.rows as any[])[2];
      const clean = await page.evaluate(() =>
        document.querySelectorAll("#title-script-panel img").length +
        Array.from(document.querySelectorAll("#title-script-panel *"))
          .filter((el) =>
            el.getAttribute("onerror") || el.getAttribute("onmouseover")
          ).length
      );
      return [
        eq("the filename reads back verbatim", hostile.files, XSS_FILE),
        eq(
          "the description reads back verbatim",
          hostile.desc,
          `${XSS} · updated 2026-05-01`,
        ),
        eq("<img> elements inside the row", hostile.imgs, 0),
        eq("child nodes (files div + desc div)", hostile.kids, 2),
        eq("injected elements or inline handlers in the panel", clean, 0),
      ];
    },
  },
  {
    name: "Pick a gist",
    detail: "Click the first row. It highlights, and a FILE dropdown appears " +
      "offering every file in that gist with the scene one preselected.",
    async run({ page }) {
      const picked = await page.evaluate(() => {
        const items = document.querySelectorAll<HTMLElement>(
          "#title-script-panel .ss-gist-item",
        );
        items[0].click();
        const after = document.querySelectorAll<HTMLElement>(
          "#title-script-panel .ss-gist-item",
        );
        const sel = document.querySelector<HTMLSelectElement>(
          "#title-script-panel select",
        );
        return {
          selected: after[0].classList.contains("sel"),
          others: Array.from(after).slice(1).filter((el) =>
            el.classList.contains("sel")
          ).length,
          options: sel
            ? Array.from(sel.options).map((o) => o.value)
            : [],
          chosen: sel ? sel.value : null,
          gist: gameData.sceneScripts.title.gist,
        };
      });
      return [
        is("the clicked row is highlighted", picked.selected),
        eq("other rows highlighted", picked.others, 0),
        eq("files offered", picked.options, ["titleScene.js", "helpers.js"]),
        eq("file preselected", picked.chosen, "titleScene.js"),
        eq("stored gist id", picked.gist.id, "aa11"),
        eq("stored gist user", picked.gist.user, GIST_USER),
        eq("stored gist file", picked.gist.file, "titleScene.js"),
        eq("stored revision", picked.gist.rev, "latest"),
      ];
    },
  },
  {
    name: "Change which file runs",
    detail: "Pick helpers.js from the FILE dropdown.",
    async run({ page }) {
      const file = await page.evaluate(() => {
        const sel = document.querySelector<HTMLSelectElement>(
          "#title-script-panel select",
        )!;
        sel.value = "helpers.js";
        sel.dispatchEvent(new Event("change"));
        return gameData.sceneScripts.title.gist.file;
      });
      return [eq("stored gist file", file, "helpers.js")];
    },
  },
  {
    name: "Pin the current revision",
    detail:
      "PIN CURRENT resolves the gist's newest sha and stores it, so the " +
      "level stops tracking the gist's head.",
    async run({ page, seen }) {
      await click(page, "PIN CURRENT");
      const rev = await waitFor(
        async () => {
          const r = await page.evaluate(() =>
            gameData.sceneScripts.title.gist.rev
          );
          return r && r !== "latest" ? r : null;
        },
        "the pinned revision to resolve",
      );
      const pillShown = await page.evaluate((sha: string) =>
        Array.from(
          document.querySelectorAll("#title-script-panel .ss-pill"),
        ).some((p) =>
          (p.textContent || "").trim() === "PINNED @ " + sha.slice(0, 10)
        ), { args: [PINNED_SHA] });
      return [
        eq("stored revision", rev, PINNED_SHA),
        is(
          "the gist detail was fetched",
          seen.includes("/gists/aa11"),
          seen.join(", "),
        ),
        eq(
          "the status line",
          await status(page),
          "pinned @ " + PINNED_SHA.slice(0, 10),
        ),
        is("the pill reads back the sha", pillShown),
      ];
    },
  },
  {
    name: "Unpin, back to latest",
    detail: "LATEST resumes tracking head -- and retires the now-untrue " +
      '"pinned @ …" status rather than leaving it on screen.',
    async run({ page }) {
      await click(page, "LATEST (pull on play)");
      return [
        eq(
          "stored revision",
          await page.evaluate(() => gameData.sceneScripts.title.gist.rev),
          "latest",
        ),
        eq("the status line is cleared", await status(page), ""),
      ];
    },
  },
  {
    name: "Switching source clears the status",
    detail:
      "A gist count means nothing once you're on CODE, so the message is " +
      "dropped rather than carried across.",
    async run({ page }) {
      await click(page, "CODE");
      const afterCode = await status(page);
      await click(page, "GIST");
      return [eq("the status line after switching to CODE", afterCode, "")];
    },
  },
  {
    name: "What Save Game would persist",
    detail:
      "gameData.sceneScripts.title is the object the level record carries " +
      "and the runtime's resolveSceneScriptEntries reads back.",
    async run({ page }) {
      const entry = await page.evaluate(() => {
        const t = gameData.sceneScripts.title;
        return { mode: t.mode, sourceType: t.sourceType, gist: t.gist };
      });
      const dialogs = await page.evaluate(() =>
        (globalThis as never as { __dialogs: string[] }).__dialogs
      );
      return [
        eq("the persisted entry", entry, {
          mode: "hook",
          sourceType: "gist",
          gist: {
            user: GIST_USER,
            id: "aa11",
            file: "helpers.js",
            rev: "latest",
          },
        }),
        eq("dialogs raised during the run", dialogs, []),
      ];
    },
  },
];

// -------------------------------------------------------------- browser ----

export interface FoundBrowser {
  path?: string;
  label: string;
}

const exists = (p: string) => {
  try {
    return Deno.statSync(p).isFile;
  } catch {
    return false;
  }
};

function onPath(bin: string): string | undefined {
  try {
    const out = new Deno.Command(
      Deno.build.os === "windows" ? "where" : "which",
      {
        args: [bin],
        stdout: "piped",
        stderr: "null",
      },
    ).outputSync();
    if (!out.success) return undefined;
    const first = new TextDecoder().decode(out.stdout).split(/\r?\n/)[0].trim();
    return first || undefined;
  } catch {
    return undefined;
  }
}

/** Find a Chromium to drive.
 *
 * astral downloads its own Chrome, but that build fails to start on some
 * Windows hosts ("side-by-side configuration is incorrect", os error 14001),
 * which is exactly the machine this was written on -- so prefer an installed
 * browser and fall back to astral's only if there is nothing else.
 *
 * CHROME_PATH is the documented override; RECORD_CHROME is honoured too
 * because tools/game-recorder already established it in this repo. */
export function findBrowser(explicit?: string): FoundBrowser {
  const env = explicit ?? Deno.env.get("CHROME_PATH") ??
    Deno.env.get("RECORD_CHROME");
  if (env) {
    if (!exists(env)) {
      throw new Error(
        `browser not found at ${env} (from CHROME_PATH/--chrome)`,
      );
    }
    return { path: env, label: env };
  }

  const pf = Deno.env.get("ProgramFiles") ?? "C:\\Program Files";
  const pf86 = Deno.env.get("ProgramFiles(x86)") ?? "C:\\Program Files (x86)";
  const local = Deno.env.get("LOCALAPPDATA") ?? "";

  const candidates: string[] = Deno.build.os === "windows"
    ? [
      `${pf}\\Google\\Chrome\\Application\\chrome.exe`,
      `${pf86}\\Google\\Chrome\\Application\\chrome.exe`,
      `${local}\\Google\\Chrome\\Application\\chrome.exe`,
      `${pf}\\Microsoft\\Edge\\Application\\msedge.exe`,
      `${pf86}\\Microsoft\\Edge\\Application\\msedge.exe`,
    ]
    : Deno.build.os === "darwin"
    ? [
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Chromium.app/Contents/MacOS/Chromium",
      "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
      "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    ]
    : [
      "/usr/bin/google-chrome-stable",
      "/usr/bin/google-chrome",
      "/usr/bin/chromium",
      "/usr/bin/chromium-browser",
      "/snap/bin/chromium",
    ];

  for (const c of candidates) if (exists(c)) return { path: c, label: c };

  if (Deno.build.os === "linux") {
    for (
      const bin of [
        "google-chrome-stable",
        "google-chrome",
        "chromium",
        "chromium-browser",
      ]
    ) {
      const p = onPath(bin);
      if (p) return { path: p, label: p };
    }
  }

  // Nothing installed -- let astral use its own download and hope it runs.
  return { label: "astral's bundled Chrome (no installed browser found)" };
}

// ----------------------------------------------------------------- runner --

export interface StepResult {
  index: number;
  name: string;
  detail: string;
  status: "pass" | "fail" | "skipped";
  checks: Check[];
  error?: string;
  durationMs: number;
}

export interface FlowResult {
  ok: boolean;
  browser: string;
  headless: boolean;
  steps: StepResult[];
  durationMs: number;
}

export interface FlowOptions {
  chromePath?: string;
  headless?: boolean;
  /** Called after each step, while the page is still open -- the visual
   * runner uses it to screenshot. */
  onStep?: (r: StepResult, page: Page) => Promise<void>;
  /** Progress line for a terminal runner. */
  onLog?: (msg: string) => void;
}

function serveStatic() {
  return Deno.serve(
    { port: 0, hostname: "127.0.0.1", onListen: () => {} },
    (req) =>
      serveDir(req, { fsRoot: staticRoot, enableCors: true, quiet: true }),
  );
}

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "*",
  "content-type": "application/json",
};

/** Stand-in for the two api.github.com endpoints the picker touches. Records
 * every path it serves so checks can be about the wire, not just the DOM. */
function serveGithubStub(seen: string[]) {
  return Deno.serve(
    { port: 0, hostname: "127.0.0.1", onListen: () => {} },
    (req) => {
      const { pathname } = new URL(req.url);
      if (req.method === "OPTIONS") {
        return new Response(null, { headers: CORS });
      }
      seen.push(pathname);

      if (/^\/users\/[^/]+\/gists$/.test(pathname)) {
        return new Response(JSON.stringify(GISTS), { headers: CORS });
      }
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

const portOf = (s: Deno.HttpServer) => (s.addr as Deno.NetAddr).port;

/** Run every step once. Never throws for a step failure -- inspect .ok. */
export async function runFlow(opts: FlowOptions = {}): Promise<FlowResult> {
  const started = Date.now();
  const headless = opts.headless ?? true;
  const browserInfo = findBrowser(opts.chromePath);
  const seen: string[] = [];
  const state: Record<string, unknown> = {};

  // Port 0 throughout: the OS picks free ports, so a visual run and a
  // `deno test` run can never collide with each other or with the other e2e
  // tests.
  const site = serveStatic();
  const api = serveGithubStub(seen);
  const browser = await launch({
    headless,
    args: ["--no-sandbox"],
    ...(browserInfo.path ? { path: browserInfo.path } : {}),
  });

  const steps: StepResult[] = [];
  try {
    const page: Page = await browser.newPage(
      `http://127.0.0.1:${portOf(site)}/editor/?game=2028-ai`,
    );
    await page.setViewportSize({ width: 1280, height: 900 });

    // The picker's only faked seam. Done here rather than in a step so that
    // step 1 can already report the bridge as wired.
    const apiBase = `http://127.0.0.1:${portOf(api)}`;
    let failed = false;

    for (const [index, step] of STEPS.entries()) {
      if (failed) {
        const r: StepResult = {
          index,
          name: step.name,
          detail: step.detail,
          status: "skipped",
          checks: [],
          durationMs: 0,
        };
        steps.push(r);
        opts.onLog?.(`  -  ${step.name} (skipped)`);
        continue;
      }

      const t0 = Date.now();
      let r: StepResult;
      try {
        // Repoint the API bases as soon as the bridge exists, before any step
        // can reach for the network.
        if (index === 1) {
          await page.evaluate((base: string) => {
            // deno-lint-ignore no-explicit-any
            const g = globalThis as any;
            g.SCENE_SCRIPT_DEFAULTS.gistUserApiBase = base + "/users";
            g.SCENE_SCRIPT_DEFAULTS.gistApiBase = base + "/gists";
          }, { args: [apiBase] });
        }
        const checks = await step.run({ page, seen, state });
        const ok = checks.every((c) => c.ok);
        r = {
          index,
          name: step.name,
          detail: step.detail,
          status: ok ? "pass" : "fail",
          checks,
          durationMs: Date.now() - t0,
        };
      } catch (error) {
        r = {
          index,
          name: step.name,
          detail: step.detail,
          status: "fail",
          checks: [],
          error: error instanceof Error ? error.message : String(error),
          durationMs: Date.now() - t0,
        };
      }
      if (r.status === "fail") failed = true;
      steps.push(r);
      opts.onLog?.(
        `  ${
          r.status === "pass" ? "✓" : "✗"
        }  ${step.name} (${r.durationMs}ms)`,
      );
      await opts.onStep?.(r, page);
    }
  } finally {
    await browser.close();
    await api.shutdown();
    await site.shutdown();
  }

  return {
    ok: steps.every((s) => s.status === "pass"),
    browser: browserInfo.label,
    headless,
    steps,
    durationMs: Date.now() - started,
  };
}
