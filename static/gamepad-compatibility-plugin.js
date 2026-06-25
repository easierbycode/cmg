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

    const state = ((Math.round((value + 1) * 3.5) % 8) + 8) % 8;
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

  function snesButtons(pad) {
    const axes = pad.axes || [];
    const source = pad.buttons || [];
    const dirs = decodeHat(axes[9]);
    const out = new Array(Math.max(source.length, 16));

    for (let i = 0; i < out.length; i++) {
      out[i] = source[i] || button(false);
    }

    if (dirs.up) out[12] = button(true);
    if (dirs.down) out[13] = button(true);
    if (dirs.left) out[14] = button(true);
    if (dirs.right) out[15] = button(true);

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
    version: "1.0.0",
    install,
    isSnesPad,
    decodeHat,
    selectPreferredPad,
    options() {
      return merge({}, options);
    },
  };

  root.CMGGamepadCompat = api;
  install();
})();
