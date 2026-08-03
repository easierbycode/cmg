// /api/phaser-editor — the Guide's "Edit Game" button.
//   GET  ?game=<id>  → is this game a Phaser Editor project on this machine?
//   POST { game }    → start (or reuse) its editor, answer with the frame URL.
// Local launcher only: it spawns a process and serves an IDE over a directory
// on this machine, so both verbs refuse on the hosted origin and POST also
// rejects cross-site callers (localWriteGuard — same policy as /api/games/*).
import { define } from "../../utils.ts";
import {
  crossSiteGuard,
  isDeploy,
  localWriteGuard,
} from "../../lib/games-store.ts";
import {
  editorInfo,
  ensureEditor,
  findProject,
  runningEditor,
} from "../../lib/phaser-editor.ts";

// The same-origin path routes/phaser-editor/[...path].ts proxies. Kept
// root-relative so the dashboard can drop it straight into the game frame.
// Explicit index.html for the same reason locally-added games use one: Fresh's
// catch-all route doesn't match a bare directory URL, and the trailing segment
// keeps the editor's relative asset/api URLs rooted at the project mount.
function frameUrl(name: string): string {
  return `/phaser-editor/${encodeURIComponent(name)}/index.html`;
}

export const handler = define.handlers({
  async GET(ctx) {
    const local = !isDeploy();
    if (!local) return Response.json({ available: false, local: false });
    // The probe answers with an absolute path on this machine — same-site only.
    const denied = crossSiteGuard(ctx.req);
    if (denied) return denied;

    const id = new URL(ctx.req.url).searchParams.get("game") ?? "";

    const project = await findProject(id);
    const { exec, version } = await editorInfo();
    const running = project ? !!runningEditor(project.dir) : false;
    return Response.json({
      available: !!project && !!exec,
      local: true,
      // Present but not installed is worth distinguishing: the dashboard stays
      // quiet, and `deno task phasereditor:vendor` is the fix.
      installed: !!exec,
      version,
      name: project?.name ?? null,
      project: project?.dir ?? null,
      running,
      url: project ? frameUrl(project.name) : null,
    });
  },

  async POST(ctx) {
    const denied = localWriteGuard(ctx.req);
    if (denied) return denied;

    let id = "";
    try {
      const body = await ctx.req.json();
      id = typeof body?.game === "string" ? body.game : "";
    } catch {
      return Response.json({ ok: false, error: "expected { game }" }, {
        status: 400,
      });
    }

    const project = await findProject(id);
    if (!project) {
      return Response.json(
        { ok: false, error: "not a Phaser Editor project" },
        { status: 404 },
      );
    }
    try {
      const editor = await ensureEditor(project);
      return Response.json({
        ok: true,
        name: project.name,
        project: project.dir,
        port: editor.port,
        url: frameUrl(project.name),
      });
    } catch (e) {
      return Response.json({ ok: false, error: (e as Error).message }, {
        status: 500,
      });
    }
  },
});
