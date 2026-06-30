import { dirname, fromFileUrl, join } from "jsr:@std/path@^1.1.2";

// Anchor the embedded data dir to THIS module rather than the process CWD. The
// kiosk launcher is a `deno compile` binary (see scripts/compile-launcher.ts)
// that embeds dist/compile-assets via --include; at runtime those files live in
// the binary's virtual FS alongside this script. A CWD-relative path like
// "dist/compile-assets" instead resolves against the user's shell directory, so
// every embedded .wasm read returned NotFound whenever the binary was launched
// from anywhere but the repo root (e.g. `~`), and the request fell through to
// Fresh's static handler — which 404s because the .wasm was excluded from the
// compile. Resolving relative to import.meta.url works from any CWD, compiled or
// not (scripts/ -> ../dist/compile-assets).
const dataRoot = join(
  dirname(fromFileUrl(import.meta.url)),
  "..",
  "dist",
  "compile-assets",
);

function safeRelativePath(pathname: string): string | null {
  let decoded: string;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }

  const parts = decoded.replace(/^\/+/, "").split("/");
  if (
    parts.length === 0 ||
    parts.some((part) =>
      !part || part === "." || part === ".." || part.includes("\0")
    )
  ) {
    return null;
  }
  return parts.join("/");
}

function wasmDataCandidates(rel: string): string[] {
  if (rel.startsWith("_fresh/")) return [`${dataRoot}/${rel}.bin`];
  return [`${dataRoot}/static/${rel}.bin`, `${dataRoot}/${rel}.bin`];
}

export async function serveEmbeddedWasmAsset(
  req: Request,
): Promise<Response | null> {
  if (req.method !== "GET" && req.method !== "HEAD") return null;

  const url = new URL(req.url);
  if (!url.pathname.endsWith(".wasm")) return null;

  const rel = safeRelativePath(url.pathname);
  if (!rel) return null;

  for (const candidate of wasmDataCandidates(rel)) {
    try {
      const bytes = await Deno.readFile(candidate);
      return new Response(req.method === "HEAD" ? null : bytes, {
        headers: {
          "content-type": "application/wasm",
          "content-length": String(bytes.byteLength),
        },
      });
    } catch (err) {
      if (err instanceof Deno.errors.NotFound) continue;
      throw err;
    }
  }

  return null;
}
