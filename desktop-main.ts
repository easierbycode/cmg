// Entrypoint for the Deno Desktop packaging tasks (`deno task desktop:*`).
// Re-exports the built Fresh server's `{ fetch }` handler (the shape the
// desktop runtime's auto-serve requires — Fresh's App itself has no `fetch`,
// see main.ts) and opens the app in borderless fullscreen.
//
// The desktop runtime (Deno 2.9.1) has no fullscreen/maximize API and a
// window's frame can't be changed after creation, so this replaces the
// default bootstrap window: the first `new Deno.BrowserWindow()` adopts it,
// which we use to read the screen size, then a frameless window covering the
// whole screen is created in its place and navigated to the app once the
// server accepts requests. Both `screen.*` and `setSize()` speak logical
// (DPI-scaled) pixels, so the values transfer as-is.
export { default } from "./_fresh/server.js";

interface DesktopWindow {
  executeJs(script: string): Promise<unknown>;
  navigate(url: string): void;
  close(): void;
}

interface DesktopWindowOptions {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  frameless?: boolean;
}

const BrowserWindow = (Deno as unknown as {
  BrowserWindow?: new (options?: DesktopWindowOptions) => DesktopWindow;
}).BrowserWindow;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

if (BrowserWindow) {
  (async () => {
    // Adopt the (hidden) bootstrap window; its renderer answers `screen.*`
    // even on about:blank, but may need a moment after boot.
    const bootstrap = new BrowserWindow();
    let width = 0;
    let height = 0;
    for (let attempt = 0; attempt < 20 && !width; attempt++) {
      try {
        const dims = await bootstrap.executeJs(
          "({ w: screen.width, h: screen.height })",
        ) as { w?: number; h?: number } | null;
        if (dims && typeof dims.w === "number" && dims.w > 0 && dims.h) {
          width = dims.w;
          height = dims.h;
          break;
        }
      } catch {
        // renderer not ready yet
      }
      await sleep(250);
    }

    // The CEF backend's executeJs may not report values back; on Windows the
    // logical (DPI-scaled) desktop size is available from the OS. A non-DPI-
    // aware PowerShell reports Screen.Bounds in exactly the logical pixels
    // that setSize() expects.
    if (!width && Deno.build.os === "windows") {
      try {
        const out = await new Deno.Command("powershell", {
          args: [
            "-NoProfile",
            "-Command",
            'Add-Type -AssemblyName System.Windows.Forms; $b=[System.Windows.Forms.Screen]::PrimaryScreen.Bounds; "$($b.Width) $($b.Height)"',
          ],
          stdout: "piped",
          stderr: "null",
        }).output();
        const [w, h] = new TextDecoder().decode(out.stdout).trim().split(" ")
          .map(Number);
        if (w > 0 && h > 0) {
          width = w;
          height = h;
        }
      } catch {
        // fall through to the default window
      }
    }

    // The auto-serve address the runtime published before boot,
    // e.g. "tcp:127.0.0.1:49684".
    const addr = Deno.env.get("DENO_SERVE_ADDRESS")?.match(/^tcp:(.+)$/)?.[1];
    if (!width || !addr) {
      // Fall back to the default windowed behavior rather than show nothing.
      console.error(
        `[desktop] fullscreen unavailable (screen=${width}x${height}, addr=${addr}); keeping default window`,
      );
      return;
    }
    const url = `http://${addr}/`;

    const fullscreen = new BrowserWindow({
      width,
      height,
      x: 0,
      y: 0,
      frameless: true,
    });
    // Close the bootstrap window only after its replacement exists — with no
    // windows left the backend's event loop (and the app) would shut down.
    bootstrap.close();

    // Navigate once the server actually accepts requests, so the first paint
    // is the dashboard rather than a connection error.
    for (let attempt = 0; attempt < 60; attempt++) {
      try {
        const res = await fetch(url, { method: "HEAD" });
        await res.body?.cancel();
        if (res.status < 500) break;
      } catch {
        // server not up yet — auto-serve starts after module evaluation
      }
      await sleep(250);
    }
    fullscreen.navigate(url);
  })();
}
