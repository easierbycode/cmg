// POST /api/icons/auto — capture a game's icon headless, server-side.
//   body: { id, url, advanceMs?, settleMs?, startWhen? }
//
// The dashboard uses this for games whose frame it cannot read itself
// (cross-origin games without the capture agent, or bulk background fill),
// sending the same absolute URL it would launch. The capture runs in a
// spawned `deno run` of tools/game-recorder/icon-cli.ts, so astral (and its
// Chrome) never enter the server bundle — which also means this endpoint
// needs the dev checkout: a compiled launcher has neither the deno CLI nor
// the tool sources, and answers { available: false } instead of erroring
// (the phaser-editor degrade pattern).
import { basename, join } from "jsr:@std/path@^1.1.2";
import { define } from "../../../utils.ts";
import {
  appRoot,
  isDeploy,
  localWriteGuard,
} from "../../../lib/games-store.ts";
import { saveIcon } from "../../../lib/icons-store.ts";

// The CLI enforces its own deadline and closes the browser in a finally, so
// it normally exits cleanly on its own. This kill is only the backstop for a
// CLI wedged before that deadline can fire, and sits well above it: killing
// the deno child does NOT stop the Chrome it spawned (no job object on
// Windows, no signal forwarding on POSIX), so the in-process deadline has to
// be what ends a slow capture.
const CAPTURE_DEADLINE_MS = 90_000;
const CAPTURE_KILL_MS = CAPTURE_DEADLINE_MS + 30_000;

// Where this endpoint may point a real browser. The dashboard only ever asks
// for a game it could itself launch — this origin, the OTA deploy, or the
// external game host — so anything else is a request to render some other
// server's page (an internal service, a router admin panel) and hand the
// pixels back through GET /api/icons. Origins are matched, not hosts, so
// http:// to a private address never qualifies unless the launcher itself is
// served from it. CMG_ICON_ORIGINS (comma-separated) extends the list for a
// developer serving games from somewhere else.
const STATIC_ALLOWED_ORIGINS = [
  "https://cmg.easierbycode.deno.net",
  "https://easierbycode.com",
  "https://www.easierbycode.com",
];

function captureUrlAllowed(target: URL, req: Request): boolean {
  const allowed = new Set(STATIC_ALLOWED_ORIGINS);
  for (const extra of (Deno.env.get("CMG_ICON_ORIGINS") ?? "").split(",")) {
    const trimmed = extra.trim();
    if (trimmed) allowed.add(trimmed);
  }
  // This launcher's own origin, however it was addressed (the dev tunnel
  // rewrites Host — see selfHosts in lib/games-store.ts).
  for (const header of ["host", "x-forwarded-host"]) {
    const host = req.headers.get(header)?.split(",")[0].trim();
    if (!host) continue;
    allowed.add(`http://${host}`);
    allowed.add(`https://${host}`);
  }
  try {
    allowed.add(new URL(req.url).origin);
  } catch { /* unparseable request URL */ }
  return allowed.has(target.origin);
}

async function cliPath(): Promise<string | null> {
  const exe = basename(Deno.execPath()).toLowerCase();
  if (exe !== "deno" && exe !== "deno.exe") return null;
  const path = join(appRoot(), "tools", "game-recorder", "icon-cli.ts");
  try {
    if ((await Deno.stat(path)).isFile) return path;
  } catch {
    // sources not on disk (compiled snapshot)
  }
  return null;
}

export const handler = define.handlers({
  // Availability probe, so the dashboard only offers server-side capture
  // where it can actually run.
  async GET(_ctx) {
    if (isDeploy()) return Response.json({ available: false, local: false });
    return Response.json({ available: (await cliPath()) != null, local: true });
  },
  async POST(ctx) {
    const denied = localWriteGuard(ctx.req);
    if (denied) return denied;
    const cli = await cliPath();
    if (!cli) {
      return Response.json({
        ok: false,
        error:
          "Headless capture needs the dev checkout (deno CLI + tools/game-recorder).",
      }, { status: 501 });
    }
    // Bad input is the caller's fault (400); a capture that starts and then
    // fails is ours (500) — same split as the sibling icon routes.
    let id: string;
    let parsed: URL;
    let advanceMs: number | null;
    let settleMs: number | null;
    try {
      const body = await ctx.req.json();
      id = String(body?.id ?? "");
      if (!id) throw new Error("id required");
      parsed = new URL(String(body?.url ?? "")); // throws on garbage
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        throw new Error("url must be http(s)");
      }
      if (!captureUrlAllowed(parsed, ctx.req)) {
        throw new Error(`refusing to capture ${parsed.origin}`);
      }
      // Only finite numbers are forwarded, and they are re-stringified from
      // the parsed value — so no caller-controlled string ever reaches the
      // CLI's argv, where @std/cli would read a `--flag=value`-shaped token
      // as a flag of its own (which would let a request redirect --out or
      // --chrome). `parsed.href` is safe for the same reason: it always
      // starts with the scheme.
      const num = (v: unknown) => {
        const n = Number(v);
        return Number.isFinite(n) && n >= 0 && n <= 600_000 ? n : null;
      };
      advanceMs = num(body?.advanceMs);
      settleMs = num(body?.settleMs);
    } catch (e) {
      return Response.json({ ok: false, error: (e as Error).message }, {
        status: 400,
      });
    }

    try {
      const tmpDir = await Deno.makeTempDir({ prefix: "cmg-icon-" });
      const out = join(tmpDir, "icon.png");
      const cliArgs = [
        "run",
        "-A",
        cli,
        "--url",
        parsed.href,
        "--out",
        out,
        "--timeout-ms",
        String(CAPTURE_DEADLINE_MS),
      ];
      if (advanceMs != null) cliArgs.push("--advance-ms", String(advanceMs));
      if (settleMs != null) cliArgs.push("--settle-ms", String(settleMs));

      const child = new Deno.Command(Deno.execPath(), {
        args: cliArgs,
        cwd: appRoot(),
        stdout: "piped",
        stderr: "piped",
      }).spawn();
      const killer = setTimeout(() => {
        try {
          child.kill();
        } catch { /* already gone */ }
      }, CAPTURE_KILL_MS);
      const result = await child.output();
      clearTimeout(killer);

      try {
        if (!result.success) {
          const err = new TextDecoder().decode(result.stderr).trim();
          throw new Error(err.split("\n").pop() || "capture failed");
        }
        const png = await Deno.readFile(out);
        const rec = await saveIcon(id, png);
        return Response.json({
          ok: true,
          id,
          url: `/api/icons/${rec.file}?v=${rec.updated}`,
        });
      } finally {
        await Deno.remove(tmpDir, { recursive: true }).catch(() => {});
      }
    } catch (e) {
      return Response.json({ ok: false, error: (e as Error).message }, {
        status: 500,
      });
    }
  },
});
