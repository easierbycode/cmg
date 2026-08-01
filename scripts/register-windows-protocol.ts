// Register (or remove) the codemonkey:// URL protocol on Windows, pointing it
// at the compiled launcher so "Add to CodeMonkey" links from the GitHub
// extension (tools/github-extension) open the kiosk and install the game.
//
//   deno task register:windows:protocol            # after deno task build:windows
//   deno task register:windows:protocol -- --exe C:\path\to\CMG.exe
//   deno task unregister:windows:protocol
//
// Ported from codemonkey-games-launcher's register-protocol-windows.ts, with
// two changes: the registry is written with reg.exe instead of a PowerShell
// script (no execution-policy dependency), and --unregister is supported.
// Everything lives under HKCU\Software\Classes — per-user, no admin required:
//
//   HKCU\Software\Classes\codemonkey            (Default)="URL:CodeMonkey Games Launcher", "URL Protocol"=""
//   HKCU\Software\Classes\codemonkey\DefaultIcon (Default)="<exe>,0"
//   HKCU\Software\Classes\codemonkey\shell\open\command (Default)="<exe>" "%1"

import { isAbsolute, join, resolve } from "jsr:@std/path@^1.1.2";
import { PROTOCOL_SCHEME } from "../lib/protocol.ts";

const KEY = `HKCU\\Software\\Classes\\${PROTOCOL_SCHEME}`;
const DEFAULT_EXE = join("dist", "cmg-windows-x86_64.exe");

function parseArgs(
  args: string[],
): { exe: string | null; unregister: boolean } {
  let exe: string | null = null;
  let unregister = false;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--unregister") unregister = true;
    else if (arg === "--exe") exe = args[++i] ?? null;
    else if (arg.startsWith("--exe=")) exe = arg.slice("--exe=".length);
    else {
      console.error(`unknown argument: ${arg}`);
      console.error(
        "usage: deno run -A scripts/register-windows-protocol.ts [--exe <path>] [--unregister]",
      );
      Deno.exit(2);
    }
  }
  return { exe, unregister };
}

async function reg(...args: string[]): Promise<void> {
  const result = await new Deno.Command("reg", {
    args,
    stdout: "null",
    stderr: "piped",
  }).output();
  if (!result.success) {
    throw new Error(
      `reg ${args.join(" ")} failed: ${
        new TextDecoder().decode(result.stderr).trim()
      }`,
    );
  }
}

async function main() {
  if (Deno.build.os !== "windows") {
    console.error("register-windows-protocol.ts only applies to Windows.");
    Deno.exit(1);
  }

  const { exe, unregister } = parseArgs([...Deno.args]);

  if (unregister) {
    try {
      await reg("delete", KEY, "/f");
      console.log(`Removed the ${PROTOCOL_SCHEME}:// protocol registration.`);
    } catch (err) {
      // "unable to find the specified registry key" — nothing was registered.
      console.log(
        `Nothing to remove (${err instanceof Error ? err.message : err})`,
      );
    }
    return;
  }

  const exePath = resolve(
    exe ? (isAbsolute(exe) ? exe : join(Deno.cwd(), exe)) : DEFAULT_EXE,
  );
  try {
    if (!(await Deno.stat(exePath)).isFile) throw new Error("not a file");
  } catch (_e) {
    console.error(
      `Launcher executable not found: ${exePath}\n` +
        "Run `deno task build:windows` first, or point at a binary with --exe <path>.",
    );
    Deno.exit(1);
  }

  await reg(
    "add",
    KEY,
    "/ve",
    "/t",
    "REG_SZ",
    "/d",
    "URL:CodeMonkey Games Launcher",
    "/f",
  );
  await reg("add", KEY, "/v", "URL Protocol", "/t", "REG_SZ", "/d", "", "/f");
  await reg(
    "add",
    `${KEY}\\DefaultIcon`,
    "/ve",
    "/t",
    "REG_SZ",
    "/d",
    `"${exePath}",0`,
    "/f",
  );
  await reg(
    "add",
    `${KEY}\\shell\\open\\command`,
    "/ve",
    "/t",
    "REG_SZ",
    "/d",
    `"${exePath}" "%1"`,
    "/f",
  );

  console.log(
    `Registered ${PROTOCOL_SCHEME}:// for the current user -> ${exePath}\n` +
      `Try it: ${PROTOCOL_SCHEME}://add?repo=https://github.com/easierbycode/monkey-kong-jr&branch=master`,
  );
}

await main();
