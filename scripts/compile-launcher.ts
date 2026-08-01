// Compile the kiosk launchers while embedding static WASM files as inert data.
//
// Deno treats files ending in .wasm passed through --include as WebAssembly
// modules and validates their imports during compile. The browser emulators load
// these files over HTTP instead, so copy them into an embedded data directory
// with a neutral extension and let the launcher serve them back as application/wasm.

import { dirname, join } from "jsr:@std/path@^1.1.2";

interface BuildTarget {
  entry: string;
  output: string;
  target: string;
}

const TARGETS: Record<string, BuildTarget> = {
  mac: {
    entry: "scripts/launch-mac.ts",
    output: "dist/cmg-mac-arm64",
    target: "aarch64-apple-darwin",
  },
  linux: {
    entry: "scripts/launch-linux.ts",
    output: "dist/cmg-linux-x86_64",
    target: "x86_64-unknown-linux-gnu",
  },
  windows: {
    entry: "scripts/launch-windows.ts",
    output: "dist/cmg-windows-x86_64.exe",
    target: "x86_64-pc-windows-msvc",
  },
};

const includeRoots = ["_fresh", "static"];
const dataRoot = "dist/compile-assets";

async function exists(path: string): Promise<boolean> {
  try {
    await Deno.stat(path);
    return true;
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) return false;
    throw err;
  }
}

async function* walkFiles(dir: string): AsyncGenerator<string> {
  for await (const entry of Deno.readDir(dir)) {
    const path = join(dir, entry.name);
    if (entry.isDirectory) {
      yield* walkFiles(path);
    } else if (entry.isFile) {
      yield path;
    }
  }
}

async function collectWasmFiles(): Promise<string[]> {
  const files: string[] = [];
  for (const root of includeRoots) {
    if (!(await exists(root))) continue;
    for await (const file of walkFiles(root)) {
      if (file.endsWith(".wasm")) files.push(file);
    }
  }
  files.sort();
  return files;
}

async function prepareWasmData(files: string[]): Promise<void> {
  await Deno.remove(dataRoot, { recursive: true }).catch((err) => {
    if (!(err instanceof Deno.errors.NotFound)) throw err;
  });

  for (const file of files) {
    const out = join(dataRoot, `${file}.bin`);
    await Deno.mkdir(dirname(out), { recursive: true });
    await Deno.copyFile(file, out);
  }
}

// Stamp the build's identity into static/app-version.json so the compiled
// binary knows what it is at runtime. /api/app-update compares this against
// the latest GitHub release to decide whether a self-update is available.
// Written before `deno compile` so `--include static` embeds it; gitignored.
function gitOut(args: string[]): string {
  try {
    const r = new Deno.Command("git", {
      args,
      stdout: "piped",
      stderr: "null",
    }).outputSync();
    return r.success ? new TextDecoder().decode(r.stdout).trim() : "";
  } catch {
    return "";
  }
}

async function stampVersion(): Promise<void> {
  const commit = gitOut(["rev-parse", "--short", "HEAD"]);
  const tag = gitOut(["describe", "--tags", "--exact-match"]);
  const stamp = {
    version: tag || (commit ? `git-${commit}` : "unknown"),
    commit: commit || null,
    builtAt: new Date().toISOString(),
  };
  await Deno.writeTextFile(
    "static/app-version.json",
    JSON.stringify(stamp, null, 2) + "\n",
  );
  console.log(`[compile-launcher] stamped ${stamp.version} (${stamp.builtAt})`);
}

async function main() {
  const name = Deno.args[0] ?? "";
  const target = TARGETS[name];
  if (!target) {
    console.error(
      "usage: deno run -A scripts/compile-launcher.ts <mac|linux|windows>",
    );
    Deno.exit(2);
  }

  await stampVersion();
  const wasmFiles = await collectWasmFiles();
  await prepareWasmData(wasmFiles);

  const args = [
    "compile",
    "--no-check",
    "-A",
    "--target",
    target.target,
    "--include",
    "_fresh",
    "--include",
    "static",
    "--include",
    dataRoot,
  ];

  for (const file of wasmFiles) {
    args.push("--exclude", file);
  }

  args.push("--output", target.output, target.entry);

  console.log(
    `[compile-launcher] ${name}: ${wasmFiles.length} wasm asset(s) embedded as data`,
  );
  const status = await new Deno.Command(Deno.execPath(), {
    args,
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
  }).spawn().status;

  Deno.exit(status.code);
}

await main();
