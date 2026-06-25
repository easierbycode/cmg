// Convert OpenEmu MAME cfg files into the static arcade cfg directory consumed
// by static/arcade/play.html during AppImage builds. The source can be either
// the MAME directory or its cfg child:
//
//   CMG_MAME_CONFIG_SRC="/path/to/OpenEmu/MAME" deno task arcade:configs
//
// If the default local OpenEmu path is absent (CI/Linux), the step clears any
// stale generated cfg output and exits successfully.

const ROOT = new URL("../", import.meta.url);
const path = (rel: string) => new URL(rel, ROOT).pathname;

const DEFAULT_SRC =
  "/Users/danieljohnson/Library/Application Support/OpenEmu/MAME";
const requestedSrc = Deno.env.get("CMG_MAME_CONFIG_SRC") || DEFAULT_SRC;
const srcDir = requestedSrc.endsWith("/cfg")
  ? requestedSrc
  : `${requestedSrc}/cfg`;
const destDir = path("static/arcade/cfg");

async function isDir(p: string): Promise<boolean> {
  try {
    return (await Deno.stat(p)).isDirectory;
  } catch {
    return false;
  }
}

await Deno.remove(destDir, { recursive: true }).catch(() => {});

if (!(await isDir(srcDir))) {
  console.log(
    `[mame-configs] source cfg directory not found: ${srcDir}; skipped`,
  );
  Deno.exit(0);
}

await Deno.mkdir(destDir, { recursive: true });

let copied = 0;
let withInput = 0;
for await (const entry of Deno.readDir(srcDir)) {
  if (!entry.isFile || !/\.cfg$/i.test(entry.name)) continue;
  if (!/^[A-Za-z0-9_.-]+\.cfg$/.test(entry.name)) continue;

  const raw = await Deno.readFile(`${srcDir}/${entry.name}`);
  let text = new TextDecoder().decode(raw);
  text = text.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
  if (/<input\b|<port\b|JOYCODE|KEYCODE|GUNCODE|MOUSECODE/.test(text)) {
    withInput++;
  }
  await Deno.writeTextFile(`${destDir}/${entry.name}`, text);
  copied++;
}

console.log(
  `[mame-configs] converted ${copied} cfg file${
    copied === 1 ? "" : "s"
  } from ${srcDir} (${withInput} with explicit input mappings)`,
);
