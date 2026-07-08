import { define } from "../../utils.ts";
import { dirname, fromFileUrl, join } from "jsr:@std/path@^1.1.2";

// POST /api/build-apk — export a custom Firebase "Game" to an installable app.
//
// The build pipeline now lives IN this repo at tools/build-level and compiles
// cmg's own 2028-ai game (static/games/2028-ai) — there is no external 2019-es7
// checkout and no CMG_ES7_REPO env var any more. The level editor
// (static/editor/index.html) POSTs here; we spawn `node tools/build-level`,
// wait for it, and return the artifact path(s) + a log tail.
//
// LOCAL-ONLY: it spawns a subprocess and writes to disk, so it is refused on the
// read-only Deno Deploy origin. It runs under `deno task dev` (and any -A local
// run). It does NOT run inside the packaged desktop binary, where the repo lives
// in a read-only VFS that `node` can't execute against — see the tool-not-found
// branch below, which tells the user to run the export from `deno task dev`.

const PLATFORMS = new Set(["android", "ios", "linux", "all"]);

// Mirror the tool's slugify: keep the arg to a benign charset. Args are passed
// to Deno.Command as an array (no shell), so this is belt-and-suspenders.
function sanitizeLevelName(raw: string): string {
  return String(raw).replace(/[.#$/\[\]]/g, "_").replace(/[^\w \-]/g, "").trim()
    .slice(0, 64);
}

// Mirror tools/build-level/lib/slug.js slugify EXACTLY (incl. the "level"
// fallback) so findArtifacts looks in the same build/<slug>/dist the tool wrote.
function slugFor(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 30) || "level";
}

async function pathExists(p: string): Promise<boolean> {
  try {
    await Deno.stat(p);
    return true;
  } catch (_e) {
    return false;
  }
}

// After a successful build, find the produced artifact(s) for the given slug.
// The tool writes to build/<slug>/dist/.
async function findArtifacts(
  cmgRoot: string,
  slug: string,
  platform: string,
): Promise<string[]> {
  const distDir = join(cmgRoot, "build", slug, "dist");
  if (!(await pathExists(distDir))) return [];
  const wantExt = platform === "linux"
    ? ".appimage"
    : platform === "ios"
    ? ".ipa"
    : ".apk";
  const out: string[] = [];
  try {
    for await (const entry of Deno.readDir(distDir)) {
      if (!entry.isFile) continue;
      const lower = entry.name.toLowerCase();
      if (platform === "all" || lower.endsWith(wantExt)) {
        out.push(join(distDir, entry.name));
      }
    }
  } catch (_e) { /* dir vanished mid-read — treat as none */ }
  return out;
}

export const handler = define.handlers({
  async POST(ctx) {
    if (Deno.env.get("DENO_DEPLOYMENT_ID")) {
      return Response.json(
        {
          ok: false,
          error: "APK export is only available on a local install.",
        },
        { status: 403 },
      );
    }

    let body: { level?: string; platform?: string };
    try {
      body = await ctx.req.json();
    } catch (_e) {
      return Response.json({ ok: false, error: "Invalid JSON body." }, {
        status: 400,
      });
    }

    const level = sanitizeLevelName(body.level || "");
    if (!level) {
      return Response.json(
        { ok: false, error: "Missing or invalid 'level' name." },
        { status: 400 },
      );
    }
    const platform = String(body.platform || "android").toLowerCase();
    if (!PLATFORMS.has(platform)) {
      return Response.json(
        { ok: false, error: `Unknown platform '${platform}'.` },
        { status: 400 },
      );
    }

    // routes/api/build-apk.ts → repo root is two dirs up from routes/api.
    const cmgRoot = join(dirname(fromFileUrl(import.meta.url)), "..", "..");
    const toolEntry = join(cmgRoot, "tools", "build-level", "index.js");
    if (!(await pathExists(toolEntry))) {
      // In the packaged desktop binary import.meta.url resolves inside the
      // read-only deno-compile VFS, so the tool isn't on real disk and `node`
      // can't run it. Point the user at the source-mode run instead.
      return Response.json({
        ok: false,
        error:
          "Build tool not found on disk. APK export must be run from a source " +
          "checkout (`deno task dev`), not the packaged desktop app.",
      }, { status: 500 });
    }

    // Pass the parent env through, defaulting the Android SDK location so a
    // fresh shell (where ANDROID_SDK_ROOT is unset) can still find it. Missing
    // toolchains surface as the tool's own error in the returned log.
    const env = Deno.env.toObject();
    if (platform === "android" || platform === "all") {
      if (!env.ANDROID_SDK_ROOT && !env.ANDROID_HOME) {
        const home = env.HOME || env.USERPROFILE || "";
        const guesses = home
          ? [
            join(home, "Library", "Android", "sdk"),
            join(home, "AppData", "Local", "Android", "Sdk"),
          ]
          : [];
        for (const guess of guesses) {
          if (await pathExists(guess)) {
            env.ANDROID_SDK_ROOT = guess;
            env.ANDROID_HOME = guess;
            break;
          }
        }
      }
    }

    let stdout = "", stderr = "", code = -1;
    try {
      const cmd = new Deno.Command("node", {
        args: ["tools/build-level", level, platform],
        cwd: cmgRoot,
        env,
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
        error: `Failed to spawn build (is Node installed and on PATH?): ${
          (e as Error).message
        }`,
      }, { status: 500 });
    }

    const log = (stdout + "\n" + stderr).slice(-6000);
    if (code !== 0) {
      return Response.json({
        ok: false,
        error: `build-level exited ${code} for "${level}" (${platform}).`,
        log,
      }, { status: 500 });
    }

    const artifacts = await findArtifacts(cmgRoot, slugFor(level), platform);
    return Response.json({
      ok: true,
      level,
      platform,
      slug: slugFor(level),
      artifacts,
      log,
    });
  },
});
