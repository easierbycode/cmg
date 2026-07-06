import { define } from "../../utils.ts";
import { dirname, fromFileUrl, join } from "jsr:@std/path@^1.1.2";

// POST /api/build-apk — export a custom Firebase "Game" to an installable app.
//
// The heavy lifting lives in the sibling 2019-es7 repo's `tools/build-level`
// pipeline (pull /levels/<name> from the evil-invaders RTDB → bake the merged
// atlas → download custom BGM → cordova/electron compile). The cmg level editor
// (static/editor/index.html) POSTs here; we spawn that tool, wait for it, and
// return the artifact path(s) + a log tail.
//
// This is a LOCAL-ONLY capability: it spawns a subprocess and writes to disk, so
// it is refused on the read-only Deno Deploy origin (and Deploy can't spawn
// processes anyway). The desktop launcher and `deno task dev` both run with -A,
// where it works.

const PLATFORMS = new Set(["android", "ios", "linux", "all"]);

// Mirror 2019-es7's sanitizeLevelName: Firebase keys can't contain . # $ / [ ]
// and we additionally keep the arg to a benign charset. Args are passed to
// Deno.Command as an array (no shell), so this is belt-and-suspenders, not the
// only thing between us and injection.
function sanitizeLevelName(raw: string): string {
  return String(raw).replace(/[.#$/\[\]]/g, "_").replace(/[^\w \-]/g, "").trim()
    .slice(0, 64);
}

// Resolve the 2019-es7 checkout that holds tools/build-level. Prefer an explicit
// env override, else the conventional sibling of this repo.
function es7RepoPath(): string {
  const override = Deno.env.get("CMG_ES7_REPO");
  if (override) return override;
  // routes/api/build-apk.ts → repo root is two dirs up from routes/api.
  const here = dirname(fromFileUrl(import.meta.url)); // .../routes/api
  const cmgRoot = join(here, "..", "..");
  return join(cmgRoot, "..", "2019-es7");
}

async function pathExists(p: string): Promise<boolean> {
  try {
    await Deno.stat(p);
    return true;
  } catch (_e) {
    return false;
  }
}

// After a successful build, find the produced artifact(s) for the given level
// slug. build-level writes to build/<slug>/dist/. The tool derives the slug as
// the lowercase alphanumeric form of the level name (max 30 chars).
function slugFor(name: string): string {
  // Mirror 2019-es7 lib/slug.js slugify EXACTLY, including its "level" fallback
  // for a name that reduces to empty — otherwise findArtifacts would look in
  // build//dist and miss the artifact the tool wrote to build/level/dist.
  return name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 30) || "level";
}

async function findArtifacts(
  repo: string,
  slug: string,
  platform: string,
): Promise<string[]> {
  const distDir = join(repo, "build", slug, "dist");
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
    // Refuse on the deployed origin — subprocess + filesystem writes are a
    // local/desktop-only affordance.
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

    const repo = es7RepoPath();
    const toolDir = join(repo, "tools", "build-level");
    if (!(await pathExists(toolDir))) {
      return Response.json({
        ok: false,
        error:
          `2019-es7 build tool not found at ${toolDir}. Set CMG_ES7_REPO to the 2019-es7 checkout.`,
      }, { status: 500 });
    }

    // Pass the parent env through, defaulting the Android SDK location so a
    // fresh shell (where ANDROID_SDK_ROOT is unset) can still find it. Missing
    // toolchains surface as the tool's own error in the returned log.
    const env = Deno.env.toObject();
    if (platform === "android" || platform === "all") {
      if (!env.ANDROID_SDK_ROOT && !env.ANDROID_HOME) {
        const home = env.HOME || "";
        const guess = home ? join(home, "Library", "Android", "sdk") : "";
        if (guess && await pathExists(guess)) {
          env.ANDROID_SDK_ROOT = guess;
          env.ANDROID_HOME = guess;
        }
      }
    }

    let stdout = "", stderr = "", code = -1;
    try {
      const cmd = new Deno.Command("node", {
        args: ["tools/build-level", level, platform],
        cwd: repo,
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

    // Keep the response light: only the tail of the combined log.
    const log = (stdout + "\n" + stderr).slice(-6000);
    if (code !== 0) {
      return Response.json({
        ok: false,
        error: `build-level exited ${code} for "${level}" (${platform}).`,
        log,
      }, { status: 500 });
    }

    const artifacts = await findArtifacts(repo, slugFor(level), platform);
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
