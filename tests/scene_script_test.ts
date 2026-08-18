import assert from "node:assert/strict";
import { resolveScriptUrl } from "../static/phaser-plugins/scene-script.js";

Deno.test("resolveScriptUrl handles absolute URLs without modification", () => {
  const httpUrl = "http://example.com/script.js";
  const httpsUrl = "https://example.com/script.ts";
  const blobUrl = "blob:http://example.com/uuid";
  const protoRelUrl = "//example.com/script.js";

  assert.strictEqual(resolveScriptUrl(httpUrl), httpUrl);
  assert.strictEqual(resolveScriptUrl(httpsUrl), httpsUrl);
  assert.strictEqual(resolveScriptUrl(blobUrl), blobUrl);
  assert.strictEqual(resolveScriptUrl(protoRelUrl), protoRelUrl);
});

Deno.test("resolveScriptUrl resolves root-relative and relative URLs against baseURI", () => {
  const originalDoc = globalThis.document;
  try {
    Object.defineProperty(globalThis, "document", {
      value: { baseURI: "http://easierbycode.com/2019-turbo/" },
      configurable: true,
      writable: true,
    });

    assert.strictEqual(
      resolveScriptUrl("/examples/scene-scripts/DemoTitleScene.ts"),
      "http://easierbycode.com/2019-turbo/examples/scene-scripts/DemoTitleScene.ts",
    );
    assert.strictEqual(
      resolveScriptUrl("examples/scene-scripts/demo-adv-replace.js"),
      "http://easierbycode.com/2019-turbo/examples/scene-scripts/demo-adv-replace.js",
    );
    assert.strictEqual(
      resolveScriptUrl("./examples/scene-scripts/DemoAdvScene.svelte"),
      "http://easierbycode.com/2019-turbo/examples/scene-scripts/DemoAdvScene.svelte",
    );
  } finally {
    Object.defineProperty(globalThis, "document", {
      value: originalDoc,
      configurable: true,
      writable: true,
    });
  }
});
