// Unit tests for the CSRF guard shared by the local mutating endpoints
// (/api/install, /api/build-apk, /api/openemu/import, /api/games/*).
// node:assert (not @std/assert) so the file runs with zero remote deps.
//
// Run with: deno test -A tests/cross_site_guard_test.ts

import assert from "node:assert/strict";
import { crossSiteGuard } from "../lib/games-store.ts";

function allowed(headers: Record<string, string>): boolean {
  const req = new Request("http://127.0.0.1:5173/api/install", {
    method: "POST",
    headers,
  });
  return crossSiteGuard(req) === null;
}

Deno.test("sec-fetch-site decides when present", () => {
  assert.ok(allowed({ "sec-fetch-site": "same-origin" }));
  assert.ok(allowed({ "sec-fetch-site": "none" })); // address bar / bookmark
  assert.ok(!allowed({ "sec-fetch-site": "cross-site" }));
  assert.ok(!allowed({ "sec-fetch-site": "same-site" }));
  // Origin is not consulted at all once Fetch Metadata is available.
  assert.ok(allowed({
    "sec-fetch-site": "same-origin",
    origin: "https://evil.example",
    host: "127.0.0.1:5173",
  }));
});

Deno.test("neither header means a non-browser client, so it passes", () => {
  assert.ok(allowed({}));
  assert.ok(allowed({ host: "127.0.0.1:5173" }));
});

Deno.test("Origin falls back to a Host comparison", () => {
  assert.ok(allowed({
    origin: "http://127.0.0.1:5173",
    host: "127.0.0.1:5173",
  }));
  assert.ok(
    !allowed({
      origin: "https://evil.example",
      host: "127.0.0.1:5173",
    }),
  );
  assert.ok(!allowed({ origin: "null", host: "127.0.0.1:5173" }));
});

// scripts/tunnel-proxy.ts rewrites Host to Vite's before forwarding, so the
// public tunnel host only survives in X-Forwarded-Host.
Deno.test("Origin may name the forwarded public host", () => {
  assert.ok(allowed({
    origin: "https://cmg.deno.net",
    host: "127.0.0.1:5173",
    "x-forwarded-host": "cmg.deno.net",
  }));
  // ...but a forwarded host does not open the door to any other origin.
  assert.ok(
    !allowed({
      origin: "https://evil.example",
      host: "127.0.0.1:5173",
      "x-forwarded-host": "cmg.deno.net",
    }),
  );
  // Multi-proxy chains list the client-addressed host first.
  assert.ok(allowed({
    origin: "https://cmg.deno.net",
    host: "127.0.0.1:5173",
    "x-forwarded-host": "cmg.deno.net, inner.internal",
  }));
});
