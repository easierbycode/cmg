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
  // Chrome on Android gets pad-layout tweaks of its own (see snesButtons).
  const IS_ANDROID = /Android/i.test(
    (root.navigator && root.navigator.userAgent) || "",
  );
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

  function isPressed(b) {
    return !!(b && b.pressed);
  }

  // Normalize an SNES pad's buttons to the standard-gamepad layout:
  // face 0-3 (bottom/right/left/top), L/R 4/5, L2/R2 6/7, Select/Start 8/9,
  // D-pad 12-15.
  //
  // Two non-standard families are handled (fingerprinted by axis count —
  // measured with the dashboard's ?paddebug=1 overlay):
  //   - Nintendo HID bit order (macOS Chrome generic-HID): ~10 axes with the
  //     D-pad as an encoded hat on axes[9]. Faces (B,A,Y,X at 0-3), L/R at
  //     4/5, ZL/L2 at 6, and Select/Start at 8/9 already match the standard
  //     layout; ZR/R2 reports at raw 15 and moves to the standard 7. The raw
  //     12-15 slots are never a D-pad here (Home/Capture bits + ZR), so the
  //     D-pad comes exclusively from the hat.
  //   - Linux joydev family (B,A,X,Y,L,R,Select,Start,...): few axes; the
  //     D-pad arrives as real buttons 12-15 and/or a digital hat pair on the
  //     low axes. Top/left faces swap and Select/Start move 6/7 → 8/9 (the
  //     vacated slots are cleared so they can't ghost as L2/R2).
  function snesButtons(pad) {
    const source = pad.buttons || [];
    const out = new Array(Math.max(source.length, 16));

    for (let i = 0; i < out.length; i++) {
      out[i] = source[i] || button(false);
    }

    if (pad.mapping !== "standard") {
      const axes = pad.axes || [];
      const joydevFamily = axes.length <= 9;

      if (joydevFamily) {
        // joydev family reports X (top) at 2 and Y (left) at 3 — standard
        // wants left at 2, top at 3.
        out[2] = source[3] || button(false);
        out[3] = source[2] || button(false);
        out[8] = button(isPressed(source[8]) || isPressed(source[6])); // Select
        out[9] = button(isPressed(source[9]) || isPressed(source[7])); // Start
        out[6] = button(false);
        out[7] = button(false);
      } else {
        // Nintendo HID order: ZR/R2 reports at raw 15 → standard R2 slot.
        // (ZL/L2 already sits at the standard 6; Select/Start at 8/9.)
        out[7] = button(isPressed(source[7]) || isPressed(source[15]));
      }

      // D-pad: raw buttons 12-15 are a real D-pad only in the joydev family;
      // in Nintendo HID order they hold Home/Capture/ZR bits and must not
      // leak in (ZR at 15 would read as a stuck D-pad-right).
      const dirs = snesDirs(pad);
      out[12] = button((joydevFamily && isPressed(source[12])) || dirs.up);
      out[13] = button((joydevFamily && isPressed(source[13])) || dirs.down);
      out[14] = button((joydevFamily && isPressed(source[14])) || dirs.left);
      out[15] = button((joydevFamily && isPressed(source[15])) || dirs.right);
    }

    // Chrome on Android: remap the SNES pad's R shoulder into the L2 slot,
    // universally (launcher and games alike). Runs after (and regardless of)
    // the family normalization above, so "R" is whatever landed in the
    // standard slot 5 — including on Android's standard-mapped pads. The
    // launcher pairs this with L/L2 list navigation and the SELECT+L2 OSD
    // chord on Android.
    if (IS_ANDROID) {
      out[6] = button(isPressed(out[5]) || isPressed(out[6]));
      out[5] = button(false);
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

  // Twin-Stick mode: re-express a pad as a dual-analog controller for
  // twin-stick shooters — D-pad drives the left stick (move), face buttons
  // drive the right stick (aim: top=up, right=right, bottom=down, left=left).
  // Expects standard-layout pads (run them through this plugin first), so it
  // works for the SNES pad and any standard pad alike. Real analog values
  // pass through whenever the digital override isn't pressed. Returns plain
  // snapshot objects (not proxies) so they can safely cross into a
  // same-origin game iframe's realm.
  function twinStickPads(pads) {
    const out = [];
    for (let i = 0; i < (pads ? pads.length : 0); i++) {
      const p = pads[i];
      if (!p || !p.connected) {
        out.push(null);
        continue;
      }
      const b = p.buttons || [];
      const pr = (j) => !!(b[j] && b[j].pressed);
      const axes = [];
      const srcAxes = p.axes || [];
      for (let a = 0; a < Math.max(srcAxes.length, 4); a++) {
        axes[a] = typeof srcAxes[a] === "number" ? srcAxes[a] : 0;
      }
      axes[0] = pr(14) ? -1 : pr(15) ? 1 : axes[0]; // D-pad → left stick X
      axes[1] = pr(12) ? -1 : pr(13) ? 1 : axes[1]; // D-pad → left stick Y
      axes[2] = pr(2) ? -1 : pr(1) ? 1 : axes[2]; // faces → right stick X
      axes[3] = pr(3) ? -1 : pr(0) ? 1 : axes[3]; // faces → right stick Y
      out.push({
        id: p.id,
        index: p.index,
        connected: true,
        mapping: "standard",
        timestamp: p.timestamp || 0,
        axes,
        buttons: Array.prototype.map.call(b, (x) => ({
          pressed: !!(x && x.pressed),
          touched: !!(x && (x.touched || x.pressed)),
          value: x && typeof x.value === "number" ? x.value : (x && x.pressed ? 1 : 0),
        })),
        vibrationActuator: p.vibrationActuator || null,
      });
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
    twinStick: twinStickPads,
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
