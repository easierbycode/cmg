// Unit tests for static/gamepad-compatibility-plugin.js — the shipped file,
// evaluated against a shimmed `globalThis` (Deno's real navigator is
// non-writable, so the plugin IIFE gets its own fake root) and driven through
// its public surface: what navigator.getGamepads() hands back.
//
// What's covered:
//   1. generic non-standard pads get a D-pad rebuilt from an encoded hat on
//      axes[9] or a digital pair on axes[6]/[7],
//   2. neutral gating — a trigger-style axis resting at -1, or an analog axis
//      seen sweeping through intermediates, is never read as a D-pad,
//   3. SNES joydev pads are normalized (Select 6 -> 8, D-pad from axes,
//      phantom stick axes zeroed, mapping standardized),
//   4. an already-wrapped pad passes through untouched (the sourceParent
//      double-normalization fix),
//   5. wizard profiles translate raw indices exactly once — never re-resolved
//      against the normalized view when a child frame re-wraps.
//
// Run with: deno task test:e2e   (no browser, no network)

import { assert, assertEquals, assertStrictEquals } from "@std/assert";
import { fromFileUrl } from "@std/path";

// The wrapped pads coming back out of the plugin are Proxies inspected loosely
// on purpose — the point is what a consumer polling getGamepads() would see.
// deno-lint-ignore no-explicit-any
type Any = any;

type Btn = { pressed: boolean; touched: boolean; value: number };
const btn = (pressed = false): Btn => ({
  pressed,
  touched: pressed,
  value: pressed ? 1 : 0,
});

type RawPad = {
  id: string;
  index: number;
  connected: boolean;
  mapping: string;
  timestamp: number;
  buttons: Btn[];
  axes: number[];
};

function makePad(over: Partial<RawPad> = {}): RawPad {
  return {
    id: "generic pad",
    index: 0,
    connected: true,
    mapping: "",
    timestamp: 1,
    buttons: Array.from({ length: 10 }, () => btn()),
    // axes[9] parked on the hat REST sentinel (~9/7) marks an encoded-hat
    // D-pad the way Chrome's generic-HID backend reports one.
    axes: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1.2857142857142856],
    ...over,
  };
}

let pads: unknown[] = [];
const store: Record<string, string> = {};
const fakeRoot: Record<string, unknown> = {
  navigator: {
    userAgent: "TestAgent",
    getGamepads: () => pads,
  },
  localStorage: {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => {
      store[k] = v;
    },
  },
  addEventListener: () => {},
  WeakMap,
  Proxy,
  JSON,
  Math,
  Array,
  Object,
};
const src = await Deno.readTextFile(
  fromFileUrl(
    new URL("../../static/gamepad-compatibility-plugin.js", import.meta.url),
  ),
);
new Function("globalThis", src)(fakeRoot);

const compat = (fakeRoot as Any).CMGGamepadCompat;
const wrapped = (): Any => (fakeRoot as Any).navigator.getGamepads()[0];

Deno.test("gamepad compat plugin normalizes pads through getGamepads()", async (t) => {
  await t.step("plugin installs and reports its version", () => {
    assertEquals(compat?.version, "1.3.0");
  });

  await t.step("generic pad: encoded hat on axes[9] rebuilds the D-pad", () => {
    const pad = makePad();
    pads = [pad];
    // Observe the hat REST sentinel first — real consumers poll every frame,
    // and hat detection happens inside the buttons getter.
    assert(Array.isArray(wrapped().buttons));
    pad.axes[9] = -1; // hat "up"
    const w = wrapped();
    assertEquals(w.buttons[12]?.pressed, true, "hat up should press 12");
    assertEquals(w.__cmgGamepadCompatWrapped, true);
    assertEquals(w.mapping, "", "the generic rebuild keeps the raw mapping");
  });

  await t.step("analog axes[9] resting at -1 is NOT decoded as a hat", () => {
    const pad = makePad({ id: "hotas throttle" });
    pad.axes[9] = -1; // throttle at idle from the very first frame
    pads = [pad];
    assert(Array.isArray(wrapped().buttons));
    assert(
      wrapped().buttons[12]?.pressed !== true,
      "a throttle never seen at the rest sentinel must not press D-pad up",
    );
  });

  await t.step("analog sweep on axes[7] blacklists the axis", () => {
    const pad = makePad({ id: "analog67 pad" });
    pads = [pad];
    assert(Array.isArray(wrapped().buttons)); // neutral seen on 6/7
    pad.axes[7] = 0.4; // analog sweep sample — blacklists the axis
    assert(Array.isArray(wrapped().buttons));
    pad.axes[7] = 1; // full deflection
    assert(
      wrapped().buttons[13]?.pressed !== true,
      "an axis seen at intermediate values must never fabricate D-pad down",
    );
  });

  await t.step("digital pair on axes[6]/[7] is gated on neutral-seen", () => {
    // Trigger-style: axis 7 rests at -1 and is NEVER seen at 0 -> no phantom.
    const trigger = makePad({ id: "trigger pad" });
    trigger.axes[7] = -1;
    pads = [trigger];
    assert(
      wrapped().buttons[12]?.pressed !== true,
      "resting -1 on axes[7] must not be read as up",
    );

    // D-pad style: axis seen at neutral first, then deflects.
    const pad = makePad({ id: "hatxy pad" });
    pads = [pad];
    assert(Array.isArray(wrapped().buttons)); // neutral seen
    pad.axes[7] = -1;
    assertEquals(wrapped().buttons[12]?.pressed, true, "axes[7]=-1 -> up");
    pad.axes[7] = 1;
    assertEquals(wrapped().buttons[13]?.pressed, true, "axes[7]=1 -> down");
    pad.axes[6] = -1;
    assertEquals(wrapped().buttons[14]?.pressed, true, "axes[6]=-1 -> left");
  });

  await t.step("SNES joydev pad: buttons normalized, stick axes zeroed", () => {
    const pad = makePad({
      id: "SNES Controller",
      mapping: "",
      buttons: Array.from({ length: 16 }, () => btn()),
      axes: [0, 1, 0, 0, 0, 0, 0, 0, 0], // 9 axes -> joydev; "down" on axes[1]
    });
    pad.buttons[6] = btn(true); // joydev Select at 6
    pads = [pad];
    const w = wrapped();
    assertEquals(w.buttons[8]?.pressed, true, "joydev Select 6 -> standard 8");
    assertEquals(w.buttons[13]?.pressed, true, "D-pad axes[1]=1 -> down 13");
    assert(
      w.axes[0] === 0 && w.axes[1] === 0,
      `phantom stick axes should be zeroed, got ${
        Deno.inspect(w.axes.slice(0, 4))
      }`,
    );
    assertEquals(w.mapping, "standard");
  });

  await t.step("already-wrapped pad passes through unchanged", () => {
    const pad = makePad({
      id: "SNES Controller",
      axes: [0, 0, 0, 0, 0, 0, 0, 0, 0],
    });
    pads = [pad];
    const first = wrapped();
    // Simulate a child frame re-wrapping the parent's normalized pad.
    pads = [first];
    assertStrictEquals(wrapped(), first);
  });

  await t.step("wizard profile applied once, raw indices respected", () => {
    store["cmgPadProfiles"] = JSON.stringify({
      "weird pad": {
        buttons: { 12: { kind: "button", index: 5 } }, // D-pad up at raw 5
        axes: {},
      },
    });
    compat.invalidateProfiles();
    try {
      const pad = makePad({ id: "weird pad" });
      pad.buttons[5] = btn(true);
      pads = [pad];
      const w = wrapped();
      assertEquals(w.buttons[12]?.pressed, true, "profile: raw 5 -> 12");
      assertEquals(w.mapping, "standard");
      // Re-wrap the already-profiled pad (child frame) — the binding must NOT
      // be re-resolved against the normalized view, where 5 is unpressed.
      pads = [w];
      assertEquals(
        wrapped().buttons[12]?.pressed,
        true,
        "a profiled pad must not be double-translated",
      );
    } finally {
      delete store["cmgPadProfiles"];
      compat.invalidateProfiles();
    }
  });
});
