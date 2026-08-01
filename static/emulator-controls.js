// Gamepad defaults for the EmulatorJS-based players (Saturn, PSX, NES, TG16).
//
// EmulatorJS ships one control table for every core, written for Xbox-labelled
// standard pads, and it stores whatever the player last used in localStorage.
// That leaves two gaps this file fills:
//
//   1. a per-CORE default, so a console boots with a sane layout the first time
//      it is ever launched, and
//   2. a per-GAME override, so a single game that wants its own layout (a
//      fighter that wants the shoulder buttons on the face row, a shmup that
//      wants rapid-fire somewhere reachable) can have one without touching the
//      console default.
//
// Arcade games have the equivalent already, one level down: MAME reads
// data/arcade-cfg/default.cfg for the whole library and data/arcade-cfg/
// <driver>.cfg per game.
//
// ── Table shape ────────────────────────────────────────────────────────────
// Keys are EmulatorJS control ids (RetroPad slots — what each one means depends
// on the core; see the per-core notes below). Values are
// { value: "<keyboard key>", value2: "<gamepad label>" }, and either half may
// be omitted to leave the shipped default alone.
//
// Gamepad labels are EmulatorJS's names for the standard-layout indices:
//   BUTTON_1 (0, face bottom)   BUTTON_2 (1, face right)
//   BUTTON_3 (2, face left)     BUTTON_4 (3, face top)
//   LEFT_TOP_SHOULDER (4, L1)   RIGHT_TOP_SHOULDER (5, R1)
//   LEFT_BOTTOM_SHOULDER (6, L2) RIGHT_BOTTOM_SHOULDER (7, R2)
//   SELECT (8)  START (9)  LEFT_STICK (10)  RIGHT_STICK (11)
//   DPAD_UP/DOWN/LEFT/RIGHT (12-15)
//   LEFT_STICK_X:+1 / LEFT_STICK_Y:-1 / … for axes
//
// CMGGamepadCompat re-expresses non-standard pads (the NSO SNES pad, anything
// with a mapping wizard profile) as standard-layout pads before EmulatorJS sees
// them, so one table serves every controller.
//
// ── Adding a per-game override ─────────────────────────────────────────────
// Add an entry under OVERRIDES[core], keyed by the game key: the ROM's file
// name lowercased, without extension or leading path (gameKey() below does
// this, so "Panzer Dragoon (USA).chd" -> "panzer dragoon (usa)"). Partial
// entries are fine — only the control ids named are changed:
//
//   segaSaturn: {
//     "panzer dragoon (usa)": {
//       12: { value2: "LEFT_TOP_SHOULDER" },   // Saturn L
//       13: { value2: "RIGHT_TOP_SHOULDER" },  // Saturn R
//     },
//   },
(function () {
  "use strict";

  // ── Sega Saturn (yabause) ────────────────────────────────────────────────
  // The core assigns RetroPad -> Saturn as B->A, A->B, R->C, Y->X, X->Y, L->Z,
  // L2->L, R2->R, so the control ids below read:
  //   0 = Saturn A    8 = Saturn B   11 = Saturn C
  //   1 = Saturn X    9 = Saturn Y   10 = Saturn Z
  //   12 = Saturn L  13 = Saturn R    3 = Start   2 = Select
  //
  // The layout puts the Saturn's third column on the right shoulder — punches
  // X/Y/Z across face-left, face-top, R1; kicks A/B/C across face-bottom,
  // face-right, R2 — and the Saturn's L/R triggers on L1/L2. On an SNES pad
  // that lands A/B/X/Y on their SNES twins. Keyboard values mirror the
  // EmulatorJS defaults, so keys are unchanged.
  var SATURN = {
    0: { value: "x", value2: "BUTTON_1" }, // Saturn A <- face bottom
    1: { value: "s", value2: "BUTTON_3" }, // Saturn X <- face left
    2: { value: "v", value2: "SELECT" },
    3: { value: "enter", value2: "START" },
    4: { value: "up arrow", value2: "DPAD_UP" },
    5: { value: "down arrow", value2: "DPAD_DOWN" },
    6: { value: "left arrow", value2: "DPAD_LEFT" },
    7: { value: "right arrow", value2: "DPAD_RIGHT" },
    8: { value: "z", value2: "BUTTON_2" }, // Saturn B <- face right
    9: { value: "a", value2: "BUTTON_4" }, // Saturn Y <- face top
    10: { value: "q", value2: "RIGHT_TOP_SHOULDER" }, // Saturn Z <- R1
    11: { value: "e", value2: "RIGHT_BOTTOM_SHOULDER" }, // Saturn C <- R2
    12: { value: "tab", value2: "LEFT_TOP_SHOULDER" }, // Saturn L <- L1
    13: { value: "r", value2: "LEFT_BOTTOM_SHOULDER" }, // Saturn R <- L2
  };

  // Per-core defaults. A core with no entry keeps EmulatorJS's own table.
  var DEFAULTS = {
    segaSaturn: SATURN,
  };

  // Per-core, per-game overrides layered on top of the core default.
  var OVERRIDES = {
    segaSaturn: {},
    psx: {},
    nes: {},
    mednafen_pce: {},
  };

  function gameKey(name) {
    if (!name) return "";
    return String(name)
      .split(/[\\/]/).pop()
      .replace(/\.(chd|iso|bin|cue|m3u|zip|7z|nes|pce|sgx|cue|img)$/i, "")
      .trim()
      .toLowerCase();
  }

  // Merge per control id, not per table: an override that names only control 12
  // leaves every other button on the core default.
  function mergePlayer(base, over) {
    var out = {};
    var id;
    for (id in base) {
      if (Object.prototype.hasOwnProperty.call(base, id)) {
        out[id] = { value: base[id].value, value2: base[id].value2 };
      }
    }
    for (id in over) {
      if (!Object.prototype.hasOwnProperty.call(over, id)) continue;
      var cur = out[id] || {};
      out[id] = {
        value: over[id].value !== undefined ? over[id].value : cur.value,
        value2: over[id].value2 !== undefined ? over[id].value2 : cur.value2,
      };
    }
    return out;
  }

  // Returns an EmulatorJS controls object ({0:{…},1:{},2:{},3:{}}) for player 1,
  // or null when neither a core default nor an override exists — in which case
  // the caller should leave EmulatorJS's own defaults alone.
  function resolve(core, name) {
    var base = DEFAULTS[core];
    var over = (OVERRIDES[core] || {})[gameKey(name)];
    if (!base && !over) return null;
    return { 0: mergePlayer(base || {}, over || {}), 1: {}, 2: {}, 3: {} };
  }

  // Seed EJS_defaultControls pre-boot AND patch the live table post-boot:
  // EmulatorJS resolves value2 labels per input event, so updating this in
  // place takes effect immediately (used when a pad appears mid-game).
  function apply(core, name) {
    var controls = resolve(core, name);
    if (!controls) return null;
    window.EJS_defaultControls = controls;
    try {
      var e = window.EJS_emulator;
      if (e && e.controls && e.controls[0]) {
        var mine = controls[0];
        for (var k in mine) {
          if (!Object.prototype.hasOwnProperty.call(mine, k)) continue;
          var cur = e.controls[0][k] || {};
          if (mine[k].value !== undefined) cur.value = mine[k].value;
          if (mine[k].value2 !== undefined) cur.value2 = mine[k].value2;
          e.controls[0][k] = cur;
        }
        if (typeof e.setupKeys === "function") e.setupKeys();
      }
    } catch (_) { /* pre-boot, or emulator not ready yet */ }
    return controls;
  }

  window.CMGEmuControls = {
    defaults: DEFAULTS,
    overrides: OVERRIDES,
    gameKey: gameKey,
    resolve: resolve,
    apply: apply,
  };
})();
