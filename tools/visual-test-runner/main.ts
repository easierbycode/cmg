// CMG visual test runner — watch the E2E flow instead of reading a pass/fail.
//
//   deno task test:visual              run, open the report, leave it live
//   deno task test:visual --headed     watch the browser drive itself
//   deno task test:visual --once       write the report and exit (CI/no UI)
//
// Runs tests/e2e/gist_picker_flow.ts — the same ordered steps the Deno test
// asserts, not a copy — screenshotting the page after each one. The report is
// served from memory at http://127.0.0.1:<port>/ with a ▶ RE-RUN button, so
// after the first `deno task test:visual` every subsequent run is one click.
//
// A browser is found automatically (installed Chrome/Edge first, astral's
// download as a fallback); --chrome or CHROME_PATH overrides.

import { parseArgs } from "@std/cli/parse-args";
import { encodeBase64 } from "@std/encoding/base64";
import { ensureDir } from "@std/fs";
import { join } from "@std/path";
import {
  findBrowser,
  type FlowResult,
  type Page,
  runFlow,
  type StepResult,
} from "../../tests/e2e/gist_picker_flow.ts";

const args = parseArgs(Deno.args, {
  string: ["chrome", "port", "out-dir"],
  boolean: ["help", "headed", "once", "no-open"],
  alias: { h: "help" },
});

if (args.help) {
  console.log(`CMG visual test runner

  deno task test:visual [options]

  --headed           show the browser driving the page (default: headless)
  --once             run once, write the report to disk, exit (no server)
  --no-open          don't open the report in your browser
  --port <n>         report port (default: an OS-assigned free port)
  --chrome <path>    use a specific browser binary
  --out-dir <dir>    where --once writes (default out/visual-test)

Env: CHROME_PATH (or RECORD_CHROME) — same as --chrome.`);
  Deno.exit(0);
}

// ------------------------------------------------------------------ run ----

// WebP, not PNG: --once inlines every shot as a data: URI, and eleven
// full-viewport PNGs make a ~10MB file. At quality 80 the same run is well
// under 1MB and UI text stays legible.
const SHOT_FORMAT = "webp";
const SHOT_MIME = `image/${SHOT_FORMAT}`;

interface Shot {
  step: number;
  // Copied into a plain ArrayBuffer-backed view so it satisfies BodyInit.
  img: Uint8Array<ArrayBuffer>;
}

interface Run {
  result: FlowResult;
  shots: Shot[];
  at: string;
}

async function once(): Promise<Run> {
  const shots: Shot[] = [];
  console.log(
    `\n  running ${args.headed ? "headed" : "headless"} — ${
      findBrowser(args.chrome).label
    }\n`,
  );

  const result = await runFlow({
    chromePath: args.chrome,
    headless: !args.headed,
    onLog: (m) => console.log(m),
    onStep: async (r: StepResult, page: Page) => {
      // Bring the panel into frame before the shot; a step that failed early
      // may have left nothing to scroll to, hence the catch.
      await page.evaluate(() => {
        document.getElementById("title-script-panel")?.scrollIntoView({
          block: "center",
        });
      }).catch(() => {});
      try {
        shots.push({
          step: r.index,
          img: new Uint8Array(
            await page.screenshot({ format: SHOT_FORMAT, quality: 80 }),
          ),
        });
      } catch { /* a dead page still deserves a report */ }
    },
  });

  const pass = result.steps.filter((s) => s.status === "pass").length;
  console.log(
    `\n  ${
      result.ok ? "PASS" : "FAIL"
    } — ${pass}/${result.steps.length} steps` +
      ` in ${(result.durationMs / 1000).toFixed(1)}s\n`,
  );
  return { result, shots, at: new Date().toLocaleString() };
}

// --------------------------------------------------------------- report ----

const esc = (s: unknown) =>
  String(s).replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!),
  );

/** Values come from the page under test — including a deliberate XSS payload —
 * so everything interpolated here goes through esc(). */
function checkRow(c: {
  label: string;
  ok: boolean;
  actual?: unknown;
  expected?: unknown;
}) {
  const detail = c.ok
    ? c.actual !== undefined
      ? `<code>${esc(Deno.inspect(c.actual, { depth: 4 }))}</code>`
      : ""
    : `<div class="diff"><span class="got">got</span> <code>${
      esc(Deno.inspect(c.actual, { depth: 4 }))
    }</code>` +
      (c.expected !== undefined
        ? `<br><span class="want">want</span> <code>${
          esc(Deno.inspect(c.expected, { depth: 4 }))
        }</code>`
        : "") +
      `</div>`;
  return `<li class="${c.ok ? "ok" : "bad"}"><span class="tick">${
    c.ok ? "✓" : "✗"
  }</span><span class="lbl">${esc(c.label)}</span>${detail}</li>`;
}

function stepCard(s: StepResult, hasShot: boolean) {
  const badge = { pass: "PASS", fail: "FAIL", skipped: "SKIPPED" }[s.status];
  return `<section class="step ${s.status}">
  <header>
    <span class="n">${String(s.index + 1).padStart(2, "0")}</span>
    <h2>${esc(s.name)}</h2>
    <span class="badge">${badge}</span>
    <span class="ms">${s.durationMs}ms</span>
  </header>
  <p class="detail">${esc(s.detail)}</p>
  ${s.error ? `<pre class="err">${esc(s.error)}</pre>` : ""}
  ${
    s.checks.length
      ? `<ul class="checks">${s.checks.map(checkRow).join("")}</ul>`
      : ""
  }
  ${
    hasShot
      ? `<a class="shot" href="/shot/${s.index}.${SHOT_FORMAT}" target="_blank">
           <img src="/shot/${s.index}.${SHOT_FORMAT}" alt="screenshot after ${
        esc(s.name)
      }" loading="lazy">
         </a>`
      : ""
  }
</section>`;
}

// Palette lifted from the editor's own :root so the report looks like the
// thing it is testing.
const CSS = `
:root { --bg:#050b06; --panel:rgba(4,24,10,.6); --edge:rgba(140,255,110,.28);
        --ink:#d6ffc4; --sub:rgba(220,255,180,.55); --acc:#9CFF6B;
        --sel:#F6FF4A; --bad:#ff6b6b; }
* { box-sizing:border-box; }
body { margin:0; padding:28px 20px 60px; background:var(--bg); color:var(--ink);
       font-family:'Share Tech Mono',ui-monospace,Consolas,monospace; }
.wrap { max-width:1100px; margin:0 auto; }
h1 { font-size:15px; letter-spacing:.18em; margin:0; color:var(--acc); }
.top { display:flex; align-items:center; gap:14px; flex-wrap:wrap;
       border-bottom:1px solid var(--edge); padding-bottom:14px; margin-bottom:22px; }
.meta { color:var(--sub); font-size:11px; line-height:1.7; }
.summary { font-size:13px; letter-spacing:.12em; padding:4px 12px; border-radius:8px;
           border:1px solid var(--edge); }
.summary.pass { color:#0b1a08; background:var(--acc); }
.summary.fail { color:#fff; background:var(--bad); }
button { font-family:inherit; font-size:12px; letter-spacing:.14em; cursor:pointer;
         background:transparent; color:var(--sel); border:1px solid var(--sel);
         border-radius:9px; padding:9px 18px; }
button:hover { background:rgba(246,255,74,.12); }
button[disabled] { opacity:.45; cursor:progress; }
.step { border:1px solid var(--edge); border-radius:12px; background:var(--panel);
        padding:14px 16px; margin-bottom:14px; }
.step.fail { border-color:var(--bad); box-shadow:0 0 22px rgba(255,107,107,.18); }
.step.skipped { opacity:.5; }
.step header { display:flex; align-items:center; gap:10px; }
.step h2 { font-size:13px; margin:0; flex:1; letter-spacing:.06em; font-weight:600; }
.n { color:var(--sub); font-size:11px; }
.badge { font-size:9px; letter-spacing:.16em; padding:2px 8px; border-radius:6px;
         border:1px solid var(--edge); color:var(--sub); }
.step.pass .badge { color:var(--acc); border-color:var(--acc); }
.step.fail .badge { color:#fff; background:var(--bad); border-color:var(--bad); }
.ms { color:var(--sub); font-size:10px; }
.detail { color:var(--sub); font-size:11px; line-height:1.6; margin:8px 0 10px; }
.checks { list-style:none; margin:0 0 12px; padding:0; font-size:11px; }
.checks li { display:flex; gap:8px; align-items:baseline; padding:3px 0; flex-wrap:wrap; }
.tick { width:12px; }
.checks .ok .tick { color:var(--acc); }
.checks .bad { color:var(--bad); }
.lbl { flex:0 0 auto; }
code { color:var(--sub); font-size:10px; word-break:break-all; }
.checks .bad code { color:#ffd7d7; }
.diff { flex-basis:100%; padding:6px 0 2px 20px; }
.got,.want { display:inline-block; width:34px; font-size:9px; letter-spacing:.1em; }
.err { color:var(--bad); font-size:11px; background:rgba(255,107,107,.08);
       border:1px solid rgba(255,107,107,.35); border-radius:8px; padding:8px 10px;
       white-space:pre-wrap; }
.shot { display:block; border:1px solid var(--edge); border-radius:9px; overflow:hidden; }
.shot img { display:block; width:100%; }
`;

function reportHtml(run: Run): string {
  const { result } = run;
  const pass = result.steps.filter((s) => s.status === "pass").length;
  const shots = new Set(run.shots.map((s) => s.step));
  return `<!doctype html><html><head><meta charset="utf-8">
<title>${result.ok ? "PASS" : "FAIL"} — gist picker visual run</title>
<style>${CSS}</style></head><body><div class="wrap">
<div class="top">
  <h1>SCENE-SCRIPT GIST PICKER</h1>
  <span class="summary ${result.ok ? "pass" : "fail"}">${
    result.ok ? "PASS" : "FAIL"
  } ${pass}/${result.steps.length}</span>
  <button id="rerun" onclick="rerun()">▶ RE-RUN</button>
  <div class="meta">
    ${esc(run.at)} · ${(result.durationMs / 1000).toFixed(1)}s ·
    ${result.headless ? "headless" : "headed"}<br>${esc(result.browser)}
  </div>
</div>
${result.steps.map((s) => stepCard(s, shots.has(s.index))).join("\n")}
</div>
<script>
async function rerun() {
  const b = document.getElementById('rerun');
  b.disabled = true; b.textContent = '… RUNNING';
  try { await fetch('/rerun', { method: 'POST' }); location.reload(); }
  catch (e) { b.disabled = false; b.textContent = '▶ RE-RUN (' + e.message + ')'; }
}
</script></body></html>`;
}

// ----------------------------------------------------------------- main ----

let run = await once();

if (args.once) {
  const outDir = args["out-dir"] ?? join("out", "visual-test");
  await ensureDir(outDir);
  // Inline the shots so the file stands alone.
  let html = reportHtml(run);
  for (const s of run.shots) {
    // encodeBase64, not btoa(String.fromCharCode(...)) — a full-page PNG runs
    // to hundreds of thousands of bytes and spreading that overflows the stack.
    const b64 = encodeBase64(s.img);
    html = html.replaceAll(
      `/shot/${s.step}.${SHOT_FORMAT}`,
      `data:${SHOT_MIME};base64,${b64}`,
    );
  }
  const file = join(outDir, "index.html");
  await Deno.writeTextFile(file, html);
  console.log(`  report: ${file}\n`);
  Deno.exit(run.result.ok ? 0 : 1);
}

let running: Promise<Run> | null = null;

const server = Deno.serve(
  {
    port: args.port ? Number(args.port) : 0,
    hostname: "127.0.0.1",
    onListen: () => {},
  },
  async (req) => {
    const { pathname } = new URL(req.url);

    if (req.method === "POST" && pathname === "/rerun") {
      // Coalesce double-clicks onto one run.
      running ??= once().finally(() => {
        running = null;
      });
      run = await running;
      return Response.json({ ok: run.result.ok });
    }

    const shot = pathname.match(/^\/shot\/(\d+)\.png$/);
    if (shot) {
      const hit = run.shots.find((s) => s.step === Number(shot[1]));
      if (!hit) return new Response("no screenshot", { status: 404 });
      return new Response(hit.img, {
        headers: { "content-type": SHOT_MIME, "cache-control": "no-store" },
      });
    }

    return new Response(reportHtml(run), {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  },
);

const url = `http://127.0.0.1:${(server.addr as Deno.NetAddr).port}/`;
console.log(`  report: ${url}`);
console.log(`  press the RE-RUN button to run again, ctrl-c to stop\n`);

if (!args["no-open"]) {
  const [cmd, ...pre] = Deno.build.os === "windows"
    ? ["cmd", "/c", "start", ""]
    : Deno.build.os === "darwin"
    ? ["open"]
    : ["xdg-open"];
  new Deno.Command(cmd, { args: [...pre, url], stdout: "null", stderr: "null" })
    .spawn().unref();
}
