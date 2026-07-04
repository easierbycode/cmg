(function () {
  "use strict";

  const root = globalThis;
  if (!root.navigator) return;

  const existing = root.CMGGamepadCompat;
  if (existing && existing.install) {
    existing.install();
    return;
  }

  const SNES_PAD_RE =
    /SNES Controller|Nintendo.*SNES|Vendor:\s*057e\s+Product:\s*2017|057e.*2017/i;
  const XBOX_PAD_RE = /Xbox|XInput|Microsoft|Legion Go/i;
  const defaultOptions = {
    sourceParent: false,
    preferSinglePad: false,
    forceIndexZero: false,
    standardizeSnesMapping: true,
  };
  let options = { ...defaultOptions };
  const rawGetGamepads = typeof root.navigator.getGamepads === "function"
    ? root.navigator.getGamepads.bind(root.navigator)
    : null;
  let installed = false;
  const wrapCache = typeof WeakMap === "function" ? new WeakMap() : null;

  function merge(target, ...sources) {
    for (const source of sources) {
      for (const key in source || {}) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  }

  function isSnesPad(pad) {
    return !!(pad && SNES_PAD_RE.test(pad.id || ""));
  }

  function padPriority(pad) {
    const id = (pad && pad.id) || "";
    if (SNES_PAD_RE.test(id)) return 3;
    if (XBOX_PAD_RE.test(id)) return 2;
    return 1;
  }

  function decodeHat(value) {
    const dirs = { up: false, down: false, left: false, right: false };
    if (typeof value !== "number" || value < -1.05 || value > 1.05) {
      return dirs;
    }

    // Hats step through exactly 8 values (-1 .. 1 in 2/7 increments). A value
    // off that grid isn't a hat state — notably 0, which some stacks report
    // for an untouched axis; rounding it would fabricate a phantom "down".
    const scaled = (value + 1) * 3.5;
    if (Math.abs(scaled - Math.round(scaled)) > 0.25) return dirs;

    const state = ((Math.round(scaled) % 8) + 8) % 8;
    switch (state) {
      case 0:
        dirs.up = true;
        break;
      case 1:
        dirs.up = true;
        dirs.right = true;
        break;
      case 2:
        dirs.right = true;
        break;
      case 3:
        dirs.down = true;
        dirs.right = true;
        break;
      case 4:
        dirs.down = true;
        break;
      case 5:
        dirs.down = true;
        dirs.left = true;
        break;
      case 6:
        dirs.left = true;
        break;
      case 7:
        dirs.up = true;
        dirs.left = true;
        break;
    }
    return dirs;
  }

  function button(pressed) {
    return {
      pressed: !!pressed,
      touched: !!pressed,
      value: pressed ? 1 : 0,
    };
  }

  // An axis reporting only exact -1 / 0 / +1 is a digital D-pad axis (joydev
  // hat0x/hat0y, Android AXIS_HAT_X/Y). Safe to read aggressively on SNES-id
  // pads: they have no analog sticks, so nothing else produces these values.
  function isDigitalValue(v) {
    return typeof v === "number" &&
      (Math.abs(v) < 0.01 || Math.abs(Math.abs(v) - 1) < 0.01);
  }

  function orDigitalPair(axes, xi, yi, dirs) {
    const x = axes[xi];
    const y = axes[yi];
    if (!isDigitalValue(x) || !isDigitalValue(y)) return;
    if (x <= -0.99) dirs.left = true;
    else if (x >= 0.99) dirs.right = true;
    if (y <= -0.99) dirs.up = true;
    else if (y >= 0.99) dirs.down = true;
  }

  // The SNES pad reports its D-pad differently per platform/connection:
  //   - encoded hat on axes[9]  (Chrome generic-HID)
  //   - digital hat pair on axes[0]/[1], [2]/[3] or [4]/[5]  (Linux joydev)
  //   - digital hat pair on axes[6]/[7]  (Android)
  // OR every source; on this pad they can't conflict (no analog sticks).
  function snesDirs(pad) {
    const axes = pad.axes || [];
    const dirs = decodeHat(axes.length > 9 ? axes[9] : NaN);
    orDigitalPair(axes, 0, 1, dirs);
    orDigitalPair(axes, 2, 3, dirs);
    orDigitalPair(axes, 4, 5, dirs);
    orDigitalPair(axes, 6, 7, dirs);
    return dirs;
  }

  // Normalize an SNES pad's buttons to the standard-gamepad layout:
  // face 0-3 (bottom/right/left/top), L/R 4/5, Select/Start 8/9, D-pad 12-15.
  //
  // Two non-standard fingerprints are handled:
  //   - Nintendo HID bit order (B,A,Y,X,L,R,--,--,Select,Start,...), seen as
  //     ~18 buttons on Chrome generic-HID. Indices 0-9 already match the
  //     standard layout positionally — pass through.
  //   - Linux joydev / hid-nintendo order (B,A,X,Y,L,R,Select,Start), seen as
  //     ~8-12 buttons. Left/top faces and Select/Start need moving.
  //
  // The D-pad is rebuilt exclusively from the hat/digital axes: on this pad
  // the raw 12-15 slots are never a D-pad (they hold Home/Capture bits, or on
  // some platforms even Select/Start — which is how "Select scrolls the
  // launcher" bugs happen when 12/13 are trusted as up/down).
  function snesButtons(pad) {
    const source = pad.buttons || [];
    const out = new Array(Math.max(source.length, 16));

    for (let i = 0; i < out.length; i++) {
      out[i] = source[i] || button(false);
    }

    if (pad.mapping !== "standard") {
      if (source.length <= 12) {
        // joydev/hid-nintendo fingerprint
        out[2] = source[3] || button(false); // left face (Y)
        out[3] = source[2] || button(false); // top face (X)
        out[8] = source[6] || button(false); // Select
        out[9] = source[7] || button(false); // Start
        out[6] = button(false); // clear vacated slots so Select/Start
        out[7] = button(false); // don't ghost as L2/R2
      }

      const dirs = snesDirs(pad);
      out[12] = button(dirs.up);
      out[13] = button(dirs.down);
      out[14] = button(dirs.left);
      out[15] = button(dirs.right);
    }

    return out;
  }

  function cacheKey(opts) {
    return [
      opts.forceIndexZero ? "i0" : "idx",
      opts.standardizeSnesMapping ? "std" : "raw",
    ].join(":");
  }

  function wrapPad(pad, opts) {
    if (!pad || !isSnesPad(pad)) return pad;

    const key = cacheKey(opts);
    if (wrapCache) {
      const cachedForPad = wrapCache.get(pad);
      if (cachedForPad && cachedForPad[key]) return cachedForPad[key];
    }

    const wrapped = new Proxy(pad, {
      get(target, prop) {
        if (prop === "__cmgGamepadCompatWrapped") return true;
        if (prop === "buttons") return snesButtons(target);
        if (prop === "index" && opts.forceIndexZero) return 0;
        if (prop === "mapping" && opts.standardizeSnesMapping) {
          return "standard";
        }

        const value = target[prop];
        return typeof value === "function" ? value.bind(target) : value;
      },
    });

    if (wrapCache) {
      const next = wrapCache.get(pad) || {};
      next[key] = wrapped;
      wrapCache.set(pad, next);
    }

    return wrapped;
  }

  function readLocalPads() {
    return rawGetGamepads ? (rawGetGamepads() || []) : [];
  }

  function readParentPads() {
    try {
      const parentWindow = root.parent;
      if (
        !options.sourceParent ||
        !parentWindow ||
        parentWindow === root ||
        !parentWindow.navigator ||
        typeof parentWindow.navigator.getGamepads !== "function"
      ) {
        return null;
      }

      const pads = parentWindow.navigator.getGamepads() || [];
      for (let i = 0; i < pads.length; i++) {
        if (pads[i] && pads[i].connected) return pads;
      }
    } catch (_) {
      return null;
    }
    return null;
  }

  function sourcePads() {
    return readParentPads() || readLocalPads();
  }

  function selectPreferredPad(pads) {
    let best = null;
    let bestScore = -1;

    for (let i = 0; i < pads.length; i++) {
      const pad = pads[i];
      if (!pad || !pad.connected) continue;

      const score = padPriority(pad);
      if (score > bestScore) {
        best = pad;
        bestScore = score;
      }
    }

    return best;
  }

  function normalizedGamepads() {
    const pads = sourcePads();

    if (options.preferSinglePad) {
      const preferred = selectPreferredPad(pads);
      return preferred ? [wrapPad(preferred, options)] : [];
    }

    const out = new Array(pads.length);
    for (let i = 0; i < pads.length; i++) {
      out[i] = pads[i] ? wrapPad(pads[i], options) : pads[i];
    }
    return out;
  }

  function install(nextOptions) {
    options = merge({}, options, nextOptions || {});

    if (!installed && rawGetGamepads) {
      root.navigator.getGamepads = normalizedGamepads;
      installed = true;
    }

    return api;
  }

  const api = {
    version: "1.1.0",
    install,
    isSnesPad,
    decodeHat,
    selectPreferredPad,
    options() {
      return merge({}, options);
    },
    // Unwrapped pads, for diagnostics (e.g. the dashboard's ?paddebug=1
    // overlay) — shows what the browser actually reports before this plugin
    // normalizes it.
    raw() {
      return readLocalPads();
    },
  };

  root.CMGGamepadCompat = api;
  install();
})();
