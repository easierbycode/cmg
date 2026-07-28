// Runtime environment defaults for the compiled kiosk launchers.
//
// Must be imported BEFORE ../_fresh/server.js: lib/games-store.ts computes
// GAMES_DIR at module-evaluation time, so the env var has to exist first.
//
// Inside an AppImage, Deno.execPath() points into the read-only squashfs
// mount, so the default game store (a `games` dir next to the binary) can
// never accept installs — Add Game / updates silently fail. When that default
// location isn't writable, point CMG_GAMES_DIR at the user's XDG data dir
// instead. An explicit CMG_GAMES_DIR always wins, and a writable exec-dir
// store (plain compiled binary use) is left alone so existing installs keep
// working.

function dirWritable(dir: string): boolean {
  try {
    Deno.mkdirSync(dir, { recursive: true });
    const probe = `${dir}/.cmg-write-test`;
    Deno.writeTextFileSync(probe, "");
    Deno.removeSync(probe);
    return true;
  } catch {
    return false;
  }
}

if (!Deno.env.get("CMG_GAMES_DIR")) {
  const exeDir = Deno.execPath().replace(/[/\\][^/\\]+$/, "");
  if (!dirWritable(`${exeDir}/games`)) {
    const home = Deno.env.get("HOME") ?? "";
    const xdgData = Deno.env.get("XDG_DATA_HOME") ||
      (home ? `${home}/.local/share` : "");
    if (xdgData) {
      const dir = `${xdgData}/cmg/games`;
      if (dirWritable(dir)) Deno.env.set("CMG_GAMES_DIR", dir);
    }
  }
}
