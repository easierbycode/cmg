import * as esbuild from "esbuild";
// deno-types: esbuild-svelte's default export is a plugin factory; Deno's CJS
// interop types miss the call signature, so cast to a callable.
import sveltePluginImport from "esbuild-svelte";
const sveltePlugin = sveltePluginImport as unknown as (
  opts?: { compilerOptions?: Record<string, unknown> },
) => esbuild.Plugin;

const outfile = new URL("../static/dashboard.bundle.js", import.meta.url)
  .pathname;
const entry = new URL("../svelte-src/entry.js", import.meta.url).pathname;

const result = await esbuild.build({
  entryPoints: [entry],
  bundle: true,
  minify: true,
  format: "esm",
  outfile,
  // Inject component <style> (Osd.svelte) into the JS bundle so there's still a
  // single artifact to serve — no separate dashboard.bundle.css to link.
  plugins: [sveltePlugin({ compilerOptions: { css: "injected" } })],
  logLevel: "info",
});

if (result.warnings.length) {
  console.warn(`${result.warnings.length} warning(s) during build.`);
}

await esbuild.stop();
