// Vendor the Dezaemon 2 save importer into the level editor.
//
// The importer is developed and tested in the sibling 2019-es7 checkout
// (tools/dezaemon-import: Node unit tests + Playwright specs + FORMAT.md). The
// editor here is a static page, so it needs those ESM modules served from this
// repo rather than reached across the filesystem.
//
// Unlike vendor-phaser-editor / vendor-flycast-core, the output is COMMITTED:
// it is ~70 KB of plain ESM, it has no build step, and the editor must work in
// a packaged desktop build and on a fresh clone where the sibling checkout does
// not exist.
//
//   deno task dezaemon:vendor            # copy from ../2019-es7
//   deno task dezaemon:vendor -- --check # verify the copy is current (CI)
//
// Point somewhere else with CMG_ES7_ROOT=/path/to/2019-es7.

import { dirname, fromFileUrl, join, relative } from "jsr:@std/path@^1.1.2";

// fromFileUrl, not URL.pathname: the latter renders file:///C:/… as "/C:/…",
// which Windows file APIs reject (os error 123).
const ROOT = fromFileUrl(new URL("../", import.meta.url));
const DEST = join(ROOT, "static", "editor", "dezaemon", "lib");
const ES7_IMPORTER = join(
  Deno.env.get("CMG_ES7_ROOT") ?? join(ROOT, "..", "2019-es7"),
  "tools",
  "dezaemon-import",
);
const SRC = join(ES7_IMPORTER, "lib");

// Loose files beside lib/ that both editors read, as [source, destination]
// relative to the importer dir and this repo. games-db.json is the community
// title/developer/genre table both level-editor forks look imports up in (it
// feeds the runtime's STAFF ROLL) — vendoring it here is what keeps the two
// copies from drifting silently, the way the forked editors themselves do.
const EXTRA_FILES: Array<[string, string]> = [
  ["games-db.json", join("static", "editor", "dezaemon", "games-db.json")],
];

const check = Deno.args.includes("--check");

async function walk(dir: string, base = dir): Promise<string[]> {
  const out: string[] = [];
  for await (const entry of Deno.readDir(dir)) {
    const full = join(dir, entry.name);
    if (entry.isDirectory) out.push(...await walk(full, base));
    else if (entry.name.endsWith(".js")) out.push(relative(base, full));
  }
  return out.sort();
}

if (!await exists(SRC)) {
  console.error(
    `Dezaemon importer source not found at ${SRC}\n` +
      `Clone easierbycode/2019-es7 next to this repo, or set CMG_ES7_ROOT.`,
  );
  Deno.exit(check ? 0 : 1); // --check must not fail a clone without the sibling
}

const files = await walk(SRC);
let changed = 0;

for (const rel of files) {
  const from = join(SRC, rel);
  const to = join(DEST, rel);
  const source = await Deno.readTextFile(from);
  const current = await exists(to) ? await Deno.readTextFile(to) : null;
  // Compare ignoring line endings — git autocrlf rewrites the committed copy.
  if (
    current !== null &&
    current.replace(/\r\n/g, "\n") === source.replace(/\r\n/g, "\n")
  ) continue;
  changed++;
  if (check) {
    console.error(
      `stale: static/editor/dezaemon/lib/${rel.replace(/\\/g, "/")}`,
    );
    continue;
  }
  await Deno.mkdir(dirname(to), { recursive: true });
  await Deno.writeTextFile(to, source);
  console.log(`vendored ${rel.replace(/\\/g, "/")}`);
}

for (const [rel, destRel] of EXTRA_FILES) {
  const from = join(ES7_IMPORTER, rel);
  if (!await exists(from)) continue;
  const to = join(ROOT, destRel);
  const source = await Deno.readTextFile(from);
  const current = await exists(to) ? await Deno.readTextFile(to) : null;
  if (
    current !== null &&
    current.replace(/\r\n/g, "\n") === source.replace(/\r\n/g, "\n")
  ) continue;
  changed++;
  if (check) {
    console.error(`stale: ${destRel.replace(/\\/g, "/")}`);
    continue;
  }
  await Deno.mkdir(dirname(to), { recursive: true });
  await Deno.writeTextFile(to, source);
  console.log(`vendored ${rel}`);
}

// Anything left over from a module that was renamed or deleted upstream.
const stale = (await exists(DEST) ? await walk(DEST) : []).filter((f) =>
  !files.includes(f)
);
for (const rel of stale) {
  changed++;
  if (check) {
    console.error(
      `orphaned: static/editor/dezaemon/lib/${rel.replace(/\\/g, "/")}`,
    );
    continue;
  }
  await Deno.remove(join(DEST, rel));
  console.log(`removed ${rel.replace(/\\/g, "/")}`);
}

if (check && changed) {
  console.error(
    `\n${changed} file(s) differ from ${ES7_IMPORTER}.\n` +
      `Run: deno task dezaemon:vendor`,
  );
  Deno.exit(1);
}
console.log(
  check
    ? `dezaemon importer is up to date (${files.length} modules)`
    : `dezaemon importer vendored: ${files.length} modules, ${changed} updated`,
);

async function exists(path: string) {
  try {
    await Deno.stat(path);
    return true;
  } catch {
    return false;
  }
}
