import { define } from "../../utils.ts";

interface Tg16Rom {
  file: string;
  name: string;
  url: string;
  size: string;
  date: string;
}

export const handler = define.handlers({
  async GET() {
    const dirUrl = new URL("../../static/TurboGrafx-16/", import.meta.url);
    const games: Tg16Rom[] = [];
    try {
      for await (const entry of Deno.readDir(dirUrl)) {
        if (!entry.isFile) continue;
        if (!/\.pce$/i.test(entry.name)) continue;
        const stat = await Deno.stat(new URL(entry.name, dirUrl));
        const sizeMb = (stat.size / (1024 * 1024)).toFixed(1);
        const d = stat.mtime ?? new Date();
        const date =
          `${String(d.getMonth() + 1).padStart(2, "0")}.${
            String(d.getDate()).padStart(2, "0")
          }.${String(d.getFullYear()).slice(-2)}`;
        const display = entry.name
          .replace(/\.pce$/i, "")
          .replace(/\s*\(USA\)\s*$/i, "")
          .trim();
        games.push({
          file: entry.name,
          name: display,
          url: `/TurboGrafx-16/${encodeURIComponent(entry.name)}`,
          size: `${sizeMb} MB`,
          date,
        });
      }
    } catch (_e) {
      // directory missing — return empty list
    }
    games.sort((a, b) => a.name.localeCompare(b.name));
    return new Response(JSON.stringify(games), {
      headers: {
        "content-type": "application/json",
        "cache-control": "no-store",
      },
    });
  },
});
