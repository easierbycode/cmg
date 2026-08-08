// icon-capture.js — capture one frame of a running game as a PNG data URL.
//
// One module, two callers, so every game type has exactly one capture
// implementation:
//   - the dashboard (svelte-src/Dashboard.svelte) dynamic-imports
//     /icon-capture.js and points it at a same-origin game frame's window
//     (built-in games, GAMES_DIR games, and the EmulatorJS players alike);
//   - the capture agent injected into /games and /demos HTML
//     (lib/launcher-inject.ts) imports it from its own origin and answers
//     the dashboard over postMessage when the frame is cross-origin. The
//     agent owns that message protocol — this module only exports the
//     capture itself, so there is exactly one responder per document.
//
// Note it runs against ANOTHER window's document (the game frame's), so
// nothing here may use instanceof against this realm's constructors — a
// Blob or Uint8Array from the frame fails every such check.
//
// Strategy chain — most faithful first, every step guarded and timeboxed:
//   1. EmulatorJS: EJS_emulator.gameManager.screenshot() — core-rendered
//      pixels, immune to WebGL back-buffer clearing.
//   2. Phaser: game.renderer.snapshot() — reads during the renderer's own
//      post-render hook, so it works without preserveDrawingBuffer.
//   3. Largest visible canvas (shadow DOM included — Ruffle's player keeps
//      its canvas behind a shadow root), copied inside a rAF so a WebGL
//      buffer is read in the same task that drew it, with a blank-frame
//      detector and retries. Reliable when the launcher's capture agent
//      armed preserveDrawingBuffer (sessionStorage "cmg-icon-capture"),
//      best-effort otherwise.
//   4. DOM rasterization through an SVG foreignObject for canvas-less
//      vanilla-JS/DOM games — same-origin images are inlined as data URIs
//      first so the rasterized SVG stays readable (no html2canvas, no CDN).

const DEFAULTS = { maxDim: 512, timeoutMs: 12000 };

function withTimeout(promise, ms, label) {
  return new Promise((resolve) => {
    const t = setTimeout(() => resolve(null), ms);
    promise.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      () => {
        clearTimeout(t);
        resolve(null);
      },
    );
  });
}

function collectCanvases(root, out) {
  for (const c of root.querySelectorAll("canvas")) out.push(c);
  for (const el of root.querySelectorAll("*")) {
    if (el.shadowRoot) collectCanvases(el.shadowRoot, out);
  }
  return out;
}

function largestVisibleCanvas(doc) {
  const all = collectCanvases(doc, []);
  const visible = all.filter((c) =>
    c.width > 1 && c.height > 1 &&
    (c.offsetWidth > 0 || c.getClientRects().length > 0)
  );
  visible.sort((a, b) => a.width * a.height - b.width * b.height);
  return visible.pop() || null;
}

// Copy a source (canvas or image) into a fresh canvas, downscaled to
// maxDim, and return { dataUrl, blank }. blank = every sampled pixel is
// identical — the signature of a cleared WebGL back buffer.
function copyToDataUrl(source, srcW, srcH, maxDim) {
  let w = srcW, h = srcH;
  if (maxDim && Math.max(w, h) > maxDim) {
    const s = maxDim / Math.max(w, h);
    w = Math.max(1, Math.round(w * s));
    h = Math.max(1, Math.round(h * s));
  }
  const off = document.createElement("canvas");
  off.width = w;
  off.height = h;
  const ctx = off.getContext("2d");
  ctx.drawImage(source, 0, 0, w, h);
  let blank = true;
  try {
    const d = ctx.getImageData(0, 0, w, h).data;
    const r0 = d[0], g0 = d[1], b0 = d[2], a0 = d[3];
    // Step by an ODD number of pixels so the walk crosses columns. A step
    // that divides the row width samples a single column, which is uniform
    // in plenty of real frames (letterboxed or portrait games especially) —
    // that would report a good capture as blank and throw it away.
    const px = w * h;
    let step = Math.max(1, Math.floor(px / 512));
    if (step % 2 === 0) step++;
    for (let p = 0; p < px; p += step) {
      const i = p * 4;
      if (d[i] !== r0 || d[i + 1] !== g0 || d[i + 2] !== b0 || d[i + 3] !== a0) {
        blank = false;
        break;
      }
    }
  } catch (_e) {
    // tainted canvas — toDataURL below throws too, and the caller moves on
    blank = false;
  }
  return { dataUrl: off.toDataURL("image/png"), blank };
}

function bytesToDataUrl(bytes, maxDim) {
  return new Promise((resolve) => {
    const blob = bytes instanceof Blob
      ? bytes
      : new Blob([bytes], { type: "image/png" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      try {
        const r = copyToDataUrl(img, img.naturalWidth, img.naturalHeight, maxDim);
        resolve(r.blank ? null : r.dataUrl);
      } catch (_e) {
        resolve(null);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}

// --- 1. EmulatorJS ---------------------------------------------------------
async function captureEmulatorJs(win, maxDim) {
  const gm = win.EJS_emulator && win.EJS_emulator.gameManager;
  if (!gm || typeof gm.screenshot !== "function") return null;
  const raw = await withTimeout(
    Promise.resolve().then(() => gm.screenshot()),
    4000,
    "ejs",
  );
  if (!raw) return null;
  if (typeof raw === "string" && raw.startsWith("data:image/")) {
    const img = new Image();
    img.src = raw;
    await new Promise((r) => {
      img.onload = r;
      img.onerror = r;
    });
    if (!img.naturalWidth) return null;
    const r = copyToDataUrl(img, img.naturalWidth, img.naturalHeight, maxDim);
    return r.blank ? null : r.dataUrl;
  }
  // Duck-typing, not instanceof: this module runs in the DASHBOARD's realm
  // while the emulator's Blob/Uint8Array come from the game frame's, so
  // `raw instanceof Blob` is false for every real EmulatorJS return value.
  if (raw && typeof raw === "object") {
    if (typeof raw.arrayBuffer === "function" && "size" in raw) {
      return await bytesToDataUrl(raw, maxDim); // Blob-shaped
    }
    if (typeof raw.byteLength === "number") {
      const view = raw.buffer
        ? new Uint8Array(raw.buffer, raw.byteOffset || 0, raw.byteLength)
        : new Uint8Array(raw);
      return await bytesToDataUrl(new Uint8Array(view), maxDim);
    }
  }
  return null;
}

// --- 2. Phaser -------------------------------------------------------------
function findPhaserGame(win) {
  // Each probe is guarded: `window.game` is also the named-property lookup
  // for <iframe name="game">, and touching a cross-origin WindowProxy's
  // properties throws SecurityError synchronously.
  for (const key of ["game", "__PHASER_GAME__", "phaserGame"]) {
    try {
      const g = win[key];
      if (g && g.renderer && typeof g.renderer.snapshot === "function") {
        return g;
      }
    } catch (_e) { /* not reachable from here — try the next name */ }
  }
  return null;
}

function capturePhaser(win, maxDim) {
  let game = null;
  try {
    game = findPhaserGame(win);
  } catch (_e) {
    return Promise.resolve(null);
  }
  if (!game) return Promise.resolve(null);
  return withTimeout(
    new Promise((resolve) => {
      try {
        game.renderer.snapshot((image) => {
          try {
            if (image && image.naturalWidth) {
              // A snapshot that renders nothing (some renderers hand back a
              // cleared frame) must not win over the readback strategies.
              const r = copyToDataUrl(image, image.naturalWidth, image.naturalHeight, maxDim);
              resolve(r.blank ? null : r.dataUrl);
            } else resolve(null);
          } catch (_e) {
            resolve(null);
          }
        });
      } catch (_e) {
        resolve(null);
      }
    }),
    4000,
    "phaser",
  );
}

// --- 3. Canvas readback ----------------------------------------------------
function canvasReadbackOnce(win, canvas, maxDim) {
  return new Promise((resolve) => {
    let done = false;
    let timer = null;
    const attempt = () => {
      if (done) return;
      done = true;
      if (timer !== null) clearTimeout(timer);
      try {
        resolve(copyToDataUrl(canvas, canvas.width, canvas.height, maxDim));
      } catch (_e) {
        resolve(null); // tainted or detached — no point retrying
      }
    };
    // Read inside the frame's own rAF so a WebGL buffer drawn this frame is
    // still intact; the timeout covers pages whose rAF is throttled/paused
    // (then we just read the current state directly).
    try {
      win.requestAnimationFrame(attempt);
    } catch (_e) {
      /* fall through to timeout */
    }
    timer = setTimeout(attempt, 250);
  });
}

async function captureCanvas(win, maxDim) {
  let canvas;
  try {
    canvas = largestVisibleCanvas(win.document);
  } catch (_e) {
    return null;
  }
  if (!canvas) return null;
  for (let i = 0; i < 8; i++) {
    const result = await canvasReadbackOnce(win, canvas, maxDim);
    if (result === null) return null; // tainted — DOM fallback won't help either
    if (!result.blank) return result.dataUrl;
    await new Promise((r) => setTimeout(r, 120));
  }
  // Every read came back uniform: either a cleared GL back buffer or a game
  // that hasn't rendered yet. Fail rather than hand back a black square —
  // a saved-forever blank tile is worse than retrying on a later pass.
  return null;
}

// --- 4. DOM rasterization --------------------------------------------------
async function inlineImages(root, baseDoc) {
  const jobs = [];
  for (const img of root.querySelectorAll("img")) {
    const src = img.getAttribute("src");
    if (!src || src.startsWith("data:")) continue;
    jobs.push(
      (async () => {
        try {
          const abs = new URL(src, baseDoc.baseURI);
          if (abs.origin !== baseDoc.defaultView.location.origin) {
            img.removeAttribute("src"); // cross-origin would taint the raster
            return;
          }
          const res = await fetch(abs.href);
          if (!res.ok) return;
          const blob = await res.blob();
          const dataUrl = await new Promise((resolve) => {
            const fr = new FileReader();
            fr.onload = () => resolve(fr.result);
            fr.onerror = () => resolve(null);
            fr.readAsDataURL(blob);
          });
          if (dataUrl) img.setAttribute("src", dataUrl);
          else img.removeAttribute("src");
        } catch (_e) {
          img.removeAttribute("src");
        }
      })(),
    );
  }
  await Promise.all(jobs);
}

function collectCssText(doc) {
  let css = "";
  for (const sheet of doc.styleSheets) {
    try {
      for (const rule of sheet.cssRules) css += rule.cssText + "\n";
    } catch (_e) {
      // cross-origin stylesheet — skip
    }
  }
  return css;
}

async function captureDom(win, maxDim) {
  try {
    const doc = win.document;
    const w = Math.max(1, win.innerWidth);
    const h = Math.max(1, win.innerHeight);
    const clone = doc.body.cloneNode(true);
    for (const s of clone.querySelectorAll("script")) s.remove();
    // Canvases don't serialize; swap each for its current pixels.
    const liveCanvases = collectCanvases(doc.body, []);
    const cloneCanvases = clone.querySelectorAll("canvas");
    cloneCanvases.forEach((c, i) => {
      try {
        const live = liveCanvases[i];
        const img = doc.createElement("img");
        img.src = live.toDataURL("image/png");
        img.style.cssText = c.style.cssText;
        img.width = live.offsetWidth || live.width;
        img.height = live.offsetHeight || live.height;
        c.replaceWith(img);
      } catch (_e) {
        c.remove();
      }
    });
    await inlineImages(clone, doc);

    const css = collectCssText(doc);
    const xhtml = new XMLSerializer().serializeToString(clone);
    const bg = win.getComputedStyle(doc.body).backgroundColor;
    // The stylesheet goes in as XML text, so a bare & or < anywhere in it
    // (a `url(a.png?v=1&x=2)` cache-buster, an inline data:image/svg+xml
    // background) would make the whole document unparsable and the raster
    // silently fail. Escaping both is enough and leaves the CSS meaning
    // intact once the XML parser decodes it.
    const cssXml = css.replace(/&/g, "&amp;").replace(/</g, "&lt;");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">` +
      `<foreignObject width="100%" height="100%">` +
      `<div xmlns="http://www.w3.org/1999/xhtml" style="width:${w}px;height:${h}px;overflow:hidden;background:${bg}">` +
      `<style>${cssXml}</style>${xhtml}` +
      `</div></foreignObject></svg>`;
    const svgUrl = "data:image/svg+xml;charset=utf-8," +
      encodeURIComponent(svg);

    return await withTimeout(
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          try {
            const r = copyToDataUrl(img, w, h, maxDim);
            resolve(r.blank ? null : r.dataUrl);
          } catch (_e) {
            resolve(null);
          }
        };
        img.onerror = () => resolve(null);
        img.src = svgUrl;
      }),
      6000,
      "dom",
    );
  } catch (_e) {
    return null;
  }
}

// --- entry -----------------------------------------------------------------
export async function captureGameDocument(win, opts = {}) {
  const { maxDim, timeoutMs } = { ...DEFAULTS, ...opts };
  const deadline = Date.now() + timeoutMs;
  const remaining = () => Math.max(500, deadline - Date.now());

  let dataUrl = await withTimeout(
    captureEmulatorJs(win, maxDim),
    remaining(),
    "ejs",
  );
  if (dataUrl) return dataUrl;

  dataUrl = await withTimeout(capturePhaser(win, maxDim), remaining(), "phaser");
  if (dataUrl) return dataUrl;

  dataUrl = await withTimeout(captureCanvas(win, maxDim), remaining(), "canvas");
  if (dataUrl) return dataUrl;

  dataUrl = await withTimeout(captureDom(win, maxDim), remaining(), "dom");
  if (dataUrl) return dataUrl;

  throw new Error("no capturable content found");
}
