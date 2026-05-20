// Run vite with a Deno Deploy tunnel. The tunnel exposes the local Vite
// server over a public HTTPS URL via Deno Deploy infrastructure — useful for
// testing Gamepad API / WebUSB / other secure-context-only features on a
// remote device.
//
// On first run Deno Deploy needs an org + app context. If `deno deploy switch`
// hasn't been run we surface a friendly prompt instead of the bare error.

const PORT = Number(Deno.env.get("PORT") ?? "5173");

async function hasDeployApp(): Promise<boolean> {
  // `deno deploy switch` writes the selected org + app into the project's
  // deno.json (or deno.jsonc) under a `deploy` block. Check for that.
  for (const path of ["deno.json", "deno.jsonc"]) {
    try {
      const txt = await Deno.readTextFile(path);
      // Strip // and /* */ comments so deno.jsonc parses as JSON.
      const stripped = txt
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/(^|[^:])\/\/.*$/gm, "$1");
      const json = JSON.parse(stripped);
      if (json?.deploy?.app && json?.deploy?.org) return true;
    } catch (_e) {
      // file missing / unparseable — keep looking
    }
  }
  return false;
}

async function readDeployConfig(): Promise<{ org: string; app: string } | null> {
  for (const path of ["deno.json", "deno.jsonc"]) {
    try {
      const txt = await Deno.readTextFile(path);
      const stripped = txt
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/(^|[^:])\/\/.*$/gm, "$1");
      const json = JSON.parse(stripped);
      if (json?.deploy?.app && json?.deploy?.org) {
        return { org: json.deploy.org, app: json.deploy.app };
      }
    } catch (_e) { /* keep looking */ }
  }
  return null;
}

const deploy = await readDeployConfig();
if (!deploy) {
  console.log(
    "\n[dev:tunnel] No Deno Deploy app selected yet.\n" +
      "             Run one of these once, then re-run `deno task dev:tunnel`:\n\n" +
      "   deno deploy switch          # pick an existing org + app\n" +
      "   deno deploy create          # create a new app for this project\n",
  );
  Deno.exit(1);
}
console.log(
  `\n[dev:tunnel] Tunneling http://localhost:${PORT} via Deno Deploy.\n` +
    `             App: ${deploy.org} / ${deploy.app}\n` +
    `             Public URL is the app's domain on Deno Deploy — find it at\n` +
    `             https://app.deno.com/${deploy.org}/${deploy.app}\n`,
);

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
