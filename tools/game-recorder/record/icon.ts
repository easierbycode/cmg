// One-shot icon capture — the auto-icon counterpart of deterministic.ts.
// Boots a game headless with the same virtual-clock injection (so WebGL
// canvases are readable and the same game + same tick count always yields
// the same icon), advances it past its splash, and reads a single frame:
// the largest visible canvas when there is one (native backing-store
// resolution), else a CDP viewport screenshot — which is what makes this
// path work for DOM/vanilla-JS games too.
//
// Used by scripts/auto-icons.ts (the pipeline) and spawned as a subprocess
// by POST /api/icons/auto via ../icon-cli.ts.

import { launch } from "@astral/astral";
import { decodeBase64 } from "@std/encoding/base64";
import { injection, settleBoot } from "./deterministic.ts";

export interface IconCaptureOptions {
  /** Absolute URL to load. */
  url: string;
  width?: number;
  height?: number;
  fps?: number;
  /** Real-time boot grace, as in the recorder (default 3000). */
  settleMs?: number;
  maxSettleMs?: number;
  /** JS predicate — advance (without capturing) until truthy. */
  startWhen?: string;
  /** Virtual time to advance past the settle/startWhen point (default 4000). */
  advanceMs?: number;
  /** Downscale the longest side to this (0 keeps native resolution). */
  maxDim?: number;
  /**
   * Overall wall-clock budget. Every phase checks it, so a slow or wedged
   * page ends by throwing here rather than running past whatever timeout the
   * CALLER has — which matters because killing this process does not stop
   * the browser it spawned (no job object on Windows, no signal forwarding
   * on POSIX): only the finally in this function closes it. Default 90s.
   */
  timeoutMs?: number;
  chromePath?: string;
  chromeArgs?: string[];
}

export interface IconCaptureResult {
  png: Uint8Array;
  width: number;
  height: number;
  /** Which strategy produced the pixels. */
  source: "canvas" | "screenshot";
}

// Where a real browser lives. astral's own pinned Chromium download is only
// the last resort: it does not start on every machine (the x64 build dies
// with a side-by-side error under Windows ARM64), while any machine running
// the launcher by definition has Chrome/Edge/Brave installed — the same
// discovery order as scripts/launch-windows.ts buildCandidates().
export function findChrome(): string | undefined {
  for (const env of ["RECORD_CHROME", "CMG_BROWSER", "CHROME_PATH"]) {
    const v = (Deno.env.get(env) ?? "").trim();
    if (v) return v;
  }
  const exists = (p: string) => {
    try {
      return Deno.statSync(p).isFile;
    } catch {
      return false;
    }
  };
  if (Deno.build.os === "windows") {
    const roots = [
      Deno.env.get("ProgramFiles") ?? "C:\\Program Files",
      Deno.env.get("ProgramFiles(x86)") ?? "C:\\Program Files (x86)",
      Deno.env.get("LOCALAPPDATA") ?? "",
    ].filter(Boolean);
    const suffixes = [
      "Google\\Chrome\\Application\\chrome.exe",
      "Microsoft\\Edge\\Application\\msedge.exe",
      "BraveSoftware\\Brave-Browser\\Application\\brave.exe",
      "Chromium\\Application\\chrome.exe",
    ];
    for (const s of suffixes) {
      for (const r of roots) {
        const p = `${r}\\${s}`;
        if (exists(p)) return p;
      }
    }
  } else if (Deno.build.os === "darwin") {
    for (
      const p of [
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
        "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
      ]
    ) if (exists(p)) return p;
  } else {
    for (
      const p of [
        "/usr/bin/google-chrome",
        "/usr/bin/chromium",
        "/usr/bin/chromium-browser",
        "/usr/bin/microsoft-edge",
        "/usr/bin/brave-browser",
      ]
    ) if (exists(p)) return p;
  }
  return undefined;
}

// Read the largest visible canvas through an offscreen 2D copy. Returns
// { dataUrl, blank } — blank when every sampled pixel is identical (the
// cleared-WebGL-backbuffer signature), so the caller can step further and
// retry instead of saving a black square.
const frameExpr = (maxDim: number) =>
  `(() => {
  const all = [];
  const walk = (root) => {
    for (const c of root.querySelectorAll('canvas')) all.push(c);
    for (const el of root.querySelectorAll('*')) {
      if (el.shadowRoot) walk(el.shadowRoot);
    }
  };
  walk(document);
  const visible = all.filter((c) =>
    c.offsetWidth > 0 && c.offsetHeight > 0 && c.width > 1 && c.height > 1
  );
  visible.sort((a, b) => a.width * a.height - b.width * b.height);
  const src = visible.pop();
  if (!src) return null;
  let w = src.width, h = src.height;
  const maxDim = ${maxDim};
  if (maxDim && Math.max(w, h) > maxDim) {
    const s = maxDim / Math.max(w, h);
    w = Math.max(1, Math.round(w * s));
    h = Math.max(1, Math.round(h * s));
  }
  const off = document.createElement('canvas');
  off.width = w;
  off.height = h;
  const ctx = off.getContext('2d');
  ctx.drawImage(src, 0, 0, w, h);
  let blank = true;
  try {
    const d = ctx.getImageData(0, 0, w, h).data;
    const r0 = d[0], g0 = d[1], b0 = d[2], a0 = d[3];
    // Sample by an ODD pixel step so the walk crosses columns instead of
    // landing on one every time (a step that divides the row width reads a
    // single column, which is uniform in plenty of real frames).
    const px = w * h;
    let step = Math.max(1, Math.floor(px / 512));
    if (step % 2 === 0) step++;
    for (let p = 0; p < px; p += step) {
      const i = p * 4;
      if (d[i] !== r0 || d[i+1] !== g0 || d[i+2] !== b0 || d[i+3] !== a0) {
        blank = false;
        break;
      }
    }
  } catch (_e) { blank = false; }
  // Tainted canvases throw HERE too (getImageData above is only the first
  // tripwire) — report it so the caller falls back to a CDP screenshot,
  // which is immune to taint, instead of failing the whole capture.
  try {
    return { dataUrl: off.toDataURL('image/png'), blank: blank };
  } catch (_e) {
    return { tainted: true };
  }
})()`;

// IHDR is always the first chunk of a PNG, so width/height sit at fixed
// offsets 16/20 — but only for a real PNG, so fall back to 0x0 rather than
// reporting garbage from a short or non-PNG buffer.
function pngDims(png: Uint8Array): { width: number; height: number } {
  if (png.length < 24) return { width: 0, height: 0 };
  const dv = new DataView(png.buffer, png.byteOffset, png.byteLength);
  return { width: dv.getUint32(16), height: dv.getUint32(20) };
}

/**
 * Astral rejects page.evaluate with a raw CDP ExceptionDetails object — no
 * `message` — so an uncaught page error would otherwise surface to the CLI
 * and /api/icons/auto as "undefined". Dig the real text out.
 */
export function describeCaptureError(e: unknown): string {
  if (e instanceof Error && e.message) return e.message;
  const d = e as {
    exceptionDetails?: { exception?: { description?: string }; text?: string };
    exception?: { description?: string };
    text?: string;
  } | null;
  const description = d?.exception?.description ??
    d?.exceptionDetails?.exception?.description ?? d?.text ??
    d?.exceptionDetails?.text;
  if (description) return String(description).split("\n")[0];
  try {
    return JSON.stringify(e) ?? String(e);
  } catch {
    return String(e);
  }
}

export async function captureIconPng(
  opts: IconCaptureOptions,
): Promise<IconCaptureResult> {
  const fps = opts.fps ?? 30;
  const width = opts.width ?? 1280;
  const height = opts.height ?? 960;
  const advanceTicks = Math.max(
    1,
    Math.round(((opts.advanceMs ?? 4000) / 1000) * fps),
  );

  // One budget for the whole capture. Every phase below consults it, so the
  // function always reaches its finally (and closes the browser) instead of
  // being killed from outside with Chrome still running.
  const deadline = Date.now() + (opts.timeoutMs ?? 90_000);
  const left = () => deadline - Date.now();
  const checkDeadline = (phase: string) => {
    if (left() <= 0) throw new Error(`icon capture timed out during ${phase}`);
  };

  const ci = Deno.env.get("CI") != null;
  const chromePath = opts.chromePath ?? findChrome();
  const browser = await launch({
    headless: true,
    args: [
      `--window-size=${width},${height}`,
      "--force-device-scale-factor=1",
      "--mute-audio",
      ...(ci ? ["--no-sandbox"] : []),
      ...(opts.chromeArgs ?? []),
    ],
    ...(chromePath ? { path: chromePath } : {}),
  });

  try {
    const page = await browser.newPage();
    await page.setViewportSize({ width, height });

    const celestial = page.unsafelyGetCelestialBindings();
    await celestial.Page.addScriptToEvaluateOnNewDocument({
      source: injection(fps),
    });

    await page.goto(opts.url, { waitUntil: "load" });
    await page.evaluate("document.fonts.ready.then(() => true)");

    checkDeadline("boot");
    await settleBoot(page, celestial, {
      fps,
      settleMs: opts.settleMs ?? 3000,
      // Leave at least a third of the budget for the capture itself.
      maxSettleMs: Math.min(
        opts.maxSettleMs ?? 45_000,
        Math.max(1000, Math.floor(left() * 0.66)),
      ),
    });

    const maxTicks = Math.max(advanceTicks * 4, fps * 60);
    let tick = 0;
    if (opts.startWhen) {
      while (tick < maxTicks) {
        checkDeadline("startWhen");
        if (await page.evaluate(opts.startWhen)) break;
        await page.evaluate("window.__cmgStep()");
        tick++;
      }
      if (tick >= maxTicks) {
        throw new Error(
          `startWhen never became true (${opts.startWhen})`,
        );
      }
    }

    for (let i = 0; i < advanceTicks; i++) {
      checkDeadline("advance");
      await page.evaluate("window.__cmgStep()");
    }

    // Canvas readback with blank-detect: a game that renders nothing yet
    // (or a cleared GL buffer that slipped past the injection — e.g. a
    // context created in a worker) gets a few more seconds of stepping
    // before we fall back to a plain viewport screenshot.
    const maxDim = opts.maxDim ?? 0;
    for (let attempt = 0; attempt < 4; attempt++) {
      checkDeadline("readback");
      const frame = await page.evaluate(frameExpr(maxDim)) as
        | { dataUrl?: string; blank?: boolean; tainted?: boolean }
        | null;
      if (frame?.tainted) break; // unreadable by script — screenshot below
      if (frame?.dataUrl && !frame.blank) {
        const png = decodeBase64(
          frame.dataUrl.slice("data:image/png;base64,".length),
        );
        return { png, ...pngDims(png), source: "canvas" };
      }
      if (!frame) break; // no canvas at all — DOM game, screenshot below
      for (let i = 0; i < fps; i++) await page.evaluate("window.__cmgStep()");
    }

    const shot = await page.screenshot({ format: "png" });
    const png = shot instanceof Uint8Array ? shot : new Uint8Array(shot);
    return { png, ...pngDims(png), source: "screenshot" };
  } finally {
    await browser.close().catch(() => {});
  }
}
