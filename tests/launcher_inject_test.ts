// Unit tests for the launcher-detection marker injector (ported from
// codemonkey-games-launcher). Pure string transforms — no server needed.
// node:assert (not @std/assert) so the file runs with zero remote deps.
//
// Run with: deno test tests/launcher_inject_test.ts

import assert from "node:assert/strict";
import {
  injectLauncherMarker,
  LAUNCHER_MARKER,
} from "../lib/launcher-inject.ts";

Deno.test("marker lands immediately after <head>", () => {
  const html =
    "<!DOCTYPE html><html><head><title>g</title></head><body></body></html>";
  const out = injectLauncherMarker(html);
  assert.equal(
    out.indexOf(LAUNCHER_MARKER),
    out.indexOf("<head>") + "<head>".length,
  );
  assert.match(out, /inLauncher/);
  assert.match(out, /data-cmg-launcher/);
  assert.match(out, /__CMG_LAUNCHER__/);
});

Deno.test("head with attributes still matches", () => {
  const out = injectLauncherMarker('<html><head lang="en"></head></html>');
  assert.ok(out.includes('<head lang="en">' + LAUNCHER_MARKER));
});

Deno.test("no <head>: falls back to after <!doctype>", () => {
  const out = injectLauncherMarker("<!doctype html><body>hi</body>");
  assert.ok(out.startsWith("<!doctype html>" + LAUNCHER_MARKER));
});

Deno.test("no <head> or doctype: falls back to after <html>", () => {
  const out = injectLauncherMarker("<html><body>hi</body></html>");
  assert.ok(out.startsWith("<html>" + LAUNCHER_MARKER));
});

Deno.test("bare fragment: marker is prepended", () => {
  const out = injectLauncherMarker("<canvas></canvas>");
  assert.equal(out, LAUNCHER_MARKER + "<canvas></canvas>");
});

Deno.test("idempotent: already-stamped HTML is returned unchanged", () => {
  const once = injectLauncherMarker("<html><head></head></html>");
  assert.equal(injectLauncherMarker(once), once);
});

Deno.test("marker only activates when embedded", () => {
  // The stamp must be gated on window.parent !== window so a direct visit to
  // /games/<id>/ keeps the game's standalone chrome.
  assert.ok(LAUNCHER_MARKER.includes("window.parent === window"));
});
