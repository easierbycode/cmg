import { define } from "../../utils.ts";
import { localWriteGuard } from "../../lib/games-store.ts";

// /api/app-update — remote self-update for the packaged launcher.
//
// GET reports the running build (static/app-version.json, stamped by
// scripts/compile-launcher.ts) against the latest GitHub release, and whether
// this process can apply an update. POST downloads the latest AppImage and
// atomically replaces the running one ($APPIMAGE — set by the AppImage
// runtime, pointing at the outer file, NOT the read-only squashfs mount that
// Deno.execPath() lives on). The swap takes effect on the next start; the
// running mount keeps the old inode, so this is safe to do live.
//
// Like /api/install this is a LOCAL-ONLY affordance — refused on Deploy, and
// cross-site requests are rejected (localWriteGuard).

const REPO = "easierbycode/cmg";
const ASSET = "cmg-x86_64.AppImage";
const LATEST_ASSET_URL =
  `https://github.com/${REPO}/releases/latest/download/${ASSET}`;

function isDeploy(): boolean {
  return !!Deno.env.get("DENO_DEPLOYMENT_ID");
}

interface VersionStamp {
  version?: string;
  commit?: string | null;
  builtAt?: string;
}

// The stamp is a static asset, so ask the running server for it rather than
// resolving a filesystem path — that works identically in dev (repo checkout),
// the compiled binary (embedded static/), and on Deploy.
async function runningVersion(reqUrl: string): Promise<VersionStamp | null> {
  try {
    const r = await fetch(new URL("/app-version.json", reqUrl));
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

interface LatestRelease {
  tag: string | null;
  publishedAt: string | null;
}

async function latestRelease(): Promise<LatestRelease | null> {
  try {
    const r = await fetch(
      `https://api.github.com/repos/${REPO}/releases/latest`,
      { headers: { accept: "application/vnd.github+json" } },
    );
    if (!r.ok) return null;
    const j = await r.json();
    return { tag: j.tag_name ?? null, publishedAt: j.published_at ?? null };
  } catch {
    return null;
  }
}

// A release counts as newer when its tag differs from the build's tag AND it
// was published meaningfully after the build. The slack absorbs the CI gap
// between compiling the asset and publishing the release, which would
// otherwise make every release-built binary see "itself" as an update.
const PUBLISH_SLACK_MS = 30 * 60 * 1000;

function isNewer(
  running: VersionStamp | null,
  latest: LatestRelease | null,
): boolean {
  if (!latest?.publishedAt) return false;
  if (!running?.builtAt) return false;
  if (running.version && latest.tag && running.version === latest.tag) {
    return false;
  }
  const built = Date.parse(running.builtAt);
  const published = Date.parse(latest.publishedAt);
  if (!Number.isFinite(built) || !Number.isFinite(published)) return false;
  return published > built + PUBLISH_SLACK_MS;
}

export const handler = define.handlers({
  async GET(ctx) {
    const running = await runningVersion(ctx.req.url);
    const latest = await latestRelease();
    const appImage = Deno.env.get("APPIMAGE") || null;
    return Response.json({
      local: !isDeploy(),
      running,
      latest,
      updateAvailable: !isDeploy() && isNewer(running, latest),
      // Applying needs the AppImage runtime ($APPIMAGE) — a dev checkout or
      // bare compiled binary can check but not self-swap.
      canApply: !isDeploy() && !!appImage && Deno.build.os === "linux",
    });
  },

  async POST(ctx) {
    const guard = localWriteGuard(ctx.req);
    if (guard) return guard;
    const appImage = Deno.env.get("APPIMAGE");
    if (!appImage || Deno.build.os !== "linux") {
      return Response.json({
        ok: false,
        error:
          "Self-update needs the AppImage runtime (APPIMAGE is unset). Download manually from /app.AppImage.",
      }, { status: 501 });
    }

    // Stage next to the target so the final rename is atomic (same fs).
    const staged = `${appImage}.new`;
    try {
      const res = await fetch(LATEST_ASSET_URL, { redirect: "follow" });
      if (!res.ok || !res.body) {
        return Response.json({
          ok: false,
          error: `Download failed: HTTP ${res.status} from ${LATEST_ASSET_URL}`,
        }, { status: 502 });
      }
      const f = await Deno.open(staged, {
        write: true,
        create: true,
        truncate: true,
      });
      await res.body.pipeTo(f.writable); // closes the file
      const size = (await Deno.stat(staged)).size;
      // An error page or truncated body is never a plausible AppImage.
      if (size < 10_000_000) {
        await Deno.remove(staged).catch(() => {});
        return Response.json({
          ok: false,
          error:
            `Downloaded file is implausibly small (${size} bytes) — aborted.`,
        }, { status: 502 });
      }
      await Deno.chmod(staged, 0o755);
      await Deno.rename(staged, appImage);
      const latest = await latestRelease();
      return Response.json({
        ok: true,
        applied: appImage,
        bytes: size,
        version: latest?.tag ?? null,
        note: "Update staged over the AppImage — restart CMG to run it.",
      });
    } catch (e) {
      await Deno.remove(staged).catch(() => {});
      return Response.json({
        ok: false,
        error: `Self-update failed: ${(e as Error).message}`,
      }, { status: 500 });
    }
  },
});
