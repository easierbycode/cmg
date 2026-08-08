# Voland Switch section

Added 2026-08-04: cmg has a Nintendo Switch section (`screen === 'switch'`) backed by
Voland, cloned from the **PS2** section rather than Saturn — because Voland needs
`SharedArrayBuffer`, so the player is a **top-level navigation**, not the game iframe.

**Voland's real status (verified 2026-08-04, re-check before assuming it works):**
- The URL the user gave, `git.hubp.de/voland-emu/Voland`, **403s on every path**. Real
  home is `github.com/voland-emu/Voland` (GPL-2.0, C, created 2026-04-20).
- **No releases, no tags, no npm package, no CDN build.** `platform/web/package.json` is
  private. README: CPU backend is a no-op, nothing runs yet.
- Entire exported FFI is 9 `_*_ffi` functions (emulator create/destroy/run/step, layout,
  cpu reg/pc). **No ROM loader, no key loader.**

**The core IS built and installed** at `static/switch/core/switch_core.{js,wasm}`
(gitignored). It instantiates, reserves the 5.25 GiB memory, and answers every export —
`cpu_backend_id_ffi()` returns 0 (noop) and the core logs
`[cpu/noop] run() budget=1000 consumed, no instructions executed`. It cannot load a
cartridge. play.html reports this as "CORE ONLINE — CANNOT BOOT CARTRIDGES".

**Rebuilding it — two non-obvious blockers, both handled by `scripts/build-voland-core.sh`:**
1. **Must build in WSL, not Git Bash.** This machine is Windows-on-ARM and emsdk ships no
   windows-arm64 Emscripten (manifest has `url_windows` only for x86_64; arm64 gets
   macos/linux). linux-arm64 exists, so WSL Ubuntu builds natively. Also needs cmake ≥3.24
   (Ubuntu 22.04 ships 3.22 → `pip3 install --user cmake`), and WSL sudo needs a password
   so apt is unavailable.
2. **Upstream's web target does not link as committed.** `CMakeLists.txt` wraps
   `"-sEXPORTED_FUNCTIONS=[...]"` across several source lines; CMake keeps the newlines and
   emcc's `-s` parser stops at the first one → *"unterminated string list"*. Collapse those
   quoted `-sNAME=[...]` args to one line before configuring. Skip the submodule init —
   `externals/dynarmic` is a desktop backend the web build never references.
- Hard requirements: crossOriginIsolated + WebGPU + OPFS + **WASM memory64**, and the host
  builds the single shared `WebAssembly.Memory` (`-sIMPORTED_MEMORY=1`) at a fixed
  **5.25 GiB** (86016 pages). Canvas id must be `game` (upstream calls
  `transferControlToOffscreen`). Formats: `.xci`/`.nsp`/`.nro`; `.nsz`/`.xcz` unsupported;
  `.nro` needs no keys.

**Gotcha — COOP/COEP is configured in TWO places that must stay in sync:**
`ISOLATED_PLAYERS` in `main.ts` (production) *and* the `playerIsolationHeaders()` Vite
plugin in `vite.config.ts` (dev only — Vite serves static files itself and bypasses the
Fresh middleware chain). Adding a prefix to only one silently yields no SharedArrayBuffer
in that environment. This bit the Switch section during implementation.

**Key material:** `static/bios/prod.keys` (alongside the PSX/Saturn BIOS dumps).
`static/bios/` is gitignored, so git and git-based Deno Deploy are safe — but
`scripts/compile-launcher.ts` embeds all of `static/` (`includeRoots = ["_fresh","static"]`),
so **locally built launcher binaries do carry the keys**, and `deno task dev` opens a public
ngrok tunnel where `/bios/prod.keys` is a plain GET. See [Input origin rule & remote updates](cmg-input-origin-and-updates.md).
