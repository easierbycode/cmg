// Run vite with a Deno Deploy tunnel. The tunnel exposes the local Vite
// server over a public HTTPS URL via Deno Deploy infrastructure — useful for
// testing Gamepad API / WebUSB / other secure-context-only features on a
// remote device.
//
// On first run Deno Deploy needs an org + app context. If `deno deploy switch`
// hasn't been run we surface a friendly prompt instead of the bare error.

const PORT = Number(Deno.env.get("PORT") ?? "5173");

async function hasDeployApp(): Promise<boolean> {
  // `deno deploy switch` prints "No application was selected" with no stdout
  // when nothing is set. We probe by running `--help` (always succeeds) and
  // then checking the projects list, but the simplest reliable test is to try
  // a no-op command and inspect output.
  try {
    const cmd = new Deno.Command(Deno.execPath(), {
      args: ["deploy", "switch", "--help"],
      stdout: "null",
      stderr: "null",
    });
    const out = await cmd.output();
    if (!out.success) return false;
  } catch (_e) {
    return false;
  }
  // Read the config that `deno deploy switch` writes to know if an app is set.
  // Path: ~/Library/Application Support/deno/deploy.json on macOS,
  // ~/.config/deno/deploy.json on Linux, %APPDATA%/deno/deploy.json on Windows.
  const home = Deno.env.get("HOME") ?? "";
  const appData = Deno.env.get("APPDATA");
  const candidates = [
    appData ? `${appData}/deno/deploy.json` : null,
    `${home}/Library/Application Support/deno/deploy.json`,
    `${home}/.config/deno/deploy.json`,
  ].filter((p): p is string => !!p);
  for (const path of candidates) {
    try {
      const txt = await Deno.readTextFile(path);
      const json = JSON.parse(txt);
      if (json && (json.app || json.application)) return true;
    } catch (_e) {
      // file not found / unreadable — keep looking
    }
  }
  return false;
}

if (!(await hasDeployApp())) {
  console.log(
    "\n[dev:tunnel] No Deno Deploy app selected yet.\n" +
      "             Run one of these once, then re-run `deno task dev:tunnel`:\n\n" +
      "   deno deploy switch          # pick an existing org + app\n" +
      "   deno deploy create          # create a new app for this project\n",
  );
  Deno.exit(1);
}

const cmd = new Deno.Command(Deno.execPath(), {
  args: ["task", "--tunnel", "dev:vite", "--port", String(PORT)],
  stdout: "inherit",
  stderr: "inherit",
  stdin: "inherit",
});
const child = cmd.spawn();

const cleanup = () => { try { child.kill("SIGTERM"); } catch (_e) { /* ignore */ } };
Deno.addSignalListener("SIGINT", () => { cleanup(); Deno.exit(130); });
Deno.addSignalListener("SIGTERM", () => { cleanup(); Deno.exit(143); });

const status = await child.status;
Deno.exit(status.code);
