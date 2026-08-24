// /api/dezaemon-saves — the level editor's SAVED GAMES picker.
//   GET              → { available, saves: [{ file, title }] }
//   GET ?file=<name> → the raw .sav bytes for one listed save
//
// The community save collection ("Dez 2 - *.sav" cart dumps) is local-only —
// it is copyrighted user-created content that never ships with the repo (see
// .gitignore's dev-fixtures note) — so this route serves it from the first
// fixtures directory that holds any: this repo's own dev-fixtures/, then the
// sibling 2019-es7 checkouts' (CMG_ES7_ROOT first, same convention as
// scripts/vendor-dezaemon-import.ts). On the hosted origin it answers
// { available: false } and the editor hides the picker's rows.
import { fromFileUrl } from "@std/path";
import { define } from "../../utils.ts";
import { isDeploy } from "../../lib/games-store.ts";

const ROOT = fromFileUrl(new URL("../../", import.meta.url));

function candidateDirs(): string[] {
  const dirs = [`${ROOT}dev-fixtures`];
  const es7 = Deno.env.get("CMG_ES7_ROOT");
  if (es7) dirs.push(`${es7}/dev-fixtures`);
  dirs.push(
    `${ROOT}../2019-es7-0822/dev-fixtures`,
    `${ROOT}../2019-es7/dev-fixtures`,
  );
  return dirs;
}

async function listSaves(dir: string): Promise<string[]> {
  const files: string[] = [];
  try {
    for await (const entry of Deno.readDir(dir)) {
      if (entry.isFile && /\.sav$/i.test(entry.name)) files.push(entry.name);
    }
  } catch {
    return [];
  }
  return files.sort();
}

async function savesDir(): Promise<{ dir: string; files: string[] } | null> {
  for (const dir of candidateDirs()) {
    const files = await listSaves(dir);
    if (files.length) return { dir, files };
  }
  return null;
}

// "Dez 2 - Blast Noodles Gaiden.sav" -> "Blast Noodles Gaiden";
// "Dezaemon 2 (DAIOH).sav" -> "DAIOH". The trailing ")" is stripped only in
// the parenthesized form — a dash-form name may legitimately end with one
// ("Dez 2 - Kakukai2 (Front Stage).sav").
function titleOf(file: string): string {
  const base = file.replace(/\.sav$/i, "");
  const paren = base.match(/^Dez(?:aemon)?\s*2\s*\(\s*(.*?)\s*\)\s*$/i);
  if (paren) return paren[1].trim();
  return base.replace(/^Dez(?:aemon)?\s*2\s*-\s*/i, "").trim();
}

export const handler = define.handlers({
  async GET(ctx) {
    if (isDeploy()) {
      return Response.json({ available: false, saves: [] });
    }
    const found = await savesDir();
    const url = new URL(ctx.req.url);
    const file = url.searchParams.get("file");

    if (file) {
      // Only a name from the listing is servable — no separators, no
      // traversal, nothing outside the fixtures directory.
      if (!found || !found.files.includes(file)) {
        return Response.json({ ok: false, error: "unknown save" }, {
          status: 404,
        });
      }
      const bytes = await Deno.readFile(`${found.dir}/${file}`);
      return new Response(bytes, {
        headers: { "content-type": "application/octet-stream" },
      });
    }

    return Response.json({
      available: !!found,
      saves: (found?.files ?? []).map((f) => ({ file: f, title: titleOf(f) })),
    });
  },
});
