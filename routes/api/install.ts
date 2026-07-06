import { define } from "../../utils.ts";
import { dirname, fromFileUrl, join } from "jsr:@std/path@^1.1.2";

// /api/install — build a native desktop binary of the launcher on demand with
// Deno Desktop (`deno desktop`, see the desktop:* tasks + "desktop" block in
// deno.json). GET reports whether a build is possible here; POST runs it.
//
// Deno Desktop requires Deno 2.9+ (the `desktop` subcommand does not exist in
// 2.7/2.8), so both verbs check the running version and, when too old, return a
// clear "run deno upgrade" message instead of a cryptic spawn failure. Like
// /api/build-apk this is a LOCAL-ONLY affordance — refused on the read-only
// Deno Deploy origin.

const MIN_MAJOR = 2;
const MIN_MINOR = 9;

interface DenoInfo {
  version: string;
  ok: boolean; // >= 2.9
}

function denoVersion(): DenoInfo {
  const version = Deno.version.deno;
  const [maj, min] = version.split(".").map((n) => parseInt(n, 10));
  const ok = maj > MIN_MAJOR || (maj === MIN_MAJOR && (min ?? 0) >= MIN_MINOR);
  return { version, ok };
}

// darwin → desktop:mac, linux → desktop:linux. Windows/others: no task wired.
function taskForOs(): { task: string; artifact: string } | null {
  if (Deno.build.os === "darwin") {
    return { task: "desktop:mac", artifact: "dist/CMG.app" };
  }
  if (Deno.build.os === "linux") {
    return { task: "desktop:linux", artifact: "dist/CMG.AppImage" };
  }
  return null;
}

function repoRoot(): string {
  const here = dirname(fromFileUrl(import.meta.url)); // .../routes/api
  return join(here, "..", "..");
}

async function pathExists(p: string): Promise<boolean> {
  try {
    await Deno.stat(p);
    return true;
  } catch (_e) {
    return false;
  }
}

function isDeploy(): boolean {
  return !!Deno.env.get("DENO_DEPLOYMENT_ID");
}

export const handler = define.handlers({
  // Availability probe used by the launcher to decide what to show/say.
  GET() {
    const { version, ok } = denoVersion();
    const target = taskForOs();
    const available = !isDeploy() && ok && !!target;
    let reason: string | null = null;
    if (isDeploy()) reason = "Not available on the hosted build.";
    else if (!target) reason = `No desktop build for ${Deno.build.os}.`;
    else if (!ok) {
      reason =
        `Deno Desktop needs Deno ${MIN_MAJOR}.${MIN_MINOR}+ (have ${version}). Run: deno upgrade`;
    }
    return Response.json({
      available,
      // Distinguishes a local launcher (where Install is meaningful, even if the
      // Deno toolchain needs upgrading) from the hosted deploy (where it should
      // not be offered at all).
      local: !isDeploy(),
      os: Deno.build.os,
      denoVersion: version,
      denoOk: ok,
      task: target?.task ?? null,
      reason,
    });
  },

  async POST() {
    if (isDeploy()) {
      return Response.json(
        { ok: false, error: "Install is only available on a local launcher." },
        { status: 403 },
      );
    }
    const { version, ok } = denoVersion();
    if (!ok) {
      return Response.json({
        ok: false,
        needsUpgrade: true,
        error:
          `Deno Desktop requires Deno ${MIN_MAJOR}.${MIN_MINOR}+ (current ${version}). Run 'deno upgrade' and retry.`,
      }, { status: 501 });
    }
    const target = taskForOs();
    if (!target) {
      return Response.json({
        ok: false,
        error: `No desktop build configured for ${Deno.build.os}.`,
      }, { status: 501 });
    }

    const root = repoRoot();
    let stdout = "", stderr = "", code = -1;
    try {
      const cmd = new Deno.Command(Deno.execPath(), {
        args: ["task", target.task],
        cwd: root,
        env: Deno.env.toObject(),
        stdout: "piped",
        stderr: "piped",
      });
      const result = await cmd.output();
      code = result.code;
      stdout = new TextDecoder().decode(result.stdout);
      stderr = new TextDecoder().decode(result.stderr);
    } catch (e) {
      return Response.json({
        ok: false,
        error: `Failed to spawn desktop build: ${(e as Error).message}`,
      }, { status: 500 });
    }

    const log = (stdout + "\n" + stderr).slice(-6000);
    if (code !== 0) {
      return Response.json({
        ok: false,
        error: `deno task ${target.task} exited ${code}.`,
        log,
      }, { status: 500 });
    }
    const artifactPath = join(root, target.artifact);
    return Response.json({
      ok: true,
      task: target.task,
      artifact: artifactPath,
      built: await pathExists(artifactPath),
      log,
    });
  },
});
