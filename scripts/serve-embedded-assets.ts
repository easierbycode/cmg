const dataRoot = "dist/compile-assets";

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
