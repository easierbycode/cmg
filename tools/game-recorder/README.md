# game-recorder

Records any game in the CMG catalog from a headless browser, cuts it for
vertical social, and publishes it to Instagram Reels / TikTok.

```sh
deno task record --list                       # what's recordable
deno task record --game games/2028-ai         # → out/recordings/games-2028-ai.reel.mp4
deno task record --game akuma --post instagram,tiktok --caption "..." --dry-run
deno task record:post --platform tiktok --video out/recordings/akuma.reel.mp4
deno task record:slides --tutorial slides/examples/hello-canvas.json
```

Needs `ffmpeg` on PATH (`FFMPEG`/`FFPROBE` override the binaries — that's the
Windows-ARM64 answer, where you point at a community arm64 build or let the x64
one run under Prism). Chrome is downloaded by
[astral](https://jsr.io/@astral/astral) on first use; `RECORD_CHROME` (or
`--chrome`) uses an installed one instead.

## Which games it can record

The catalog is read straight from [`data/games.json`](../../data/games.json) and
[`data/demos.json`](../../data/demos.json) — the same files the OTA manifest is
built from — so **adding a game to CMG makes it recordable with no entry to
duplicate here**. URLs resolve the way the dashboard resolves them: an in-repo
`url` against `CMG_ORIGIN` (default `http://localhost:5173`), anything else
against `CMG_EXTERNAL_BASE` (default `https://easierbycode.com`).

Point `CMG_ORIGIN` at the deploy to record what players actually get:

```sh
CMG_ORIGIN=https://cmg.easierbycode.deno.net deno task record --game games/2028-ai
```

## Per-game capture behaviour (optional)

Most games just want "record N seconds once it's booted", which is the default.
A game that knows its own state can say so with a `recorder` key on its catalog
entry:

```jsonc
{
  "id": "games/2028-ai",
  "name": "2028.Ai",
  "url": "/games/2028-ai",
  "recorder": {
    "query": "?attract=1&mute=1", // appended to the URL
    "width": 1280,
    "height": 960, // capture viewport
    "startWhen": "!!window.__ready", // JS predicate: begin capture
    "stopWhen": "window.__gameOver", // JS predicate: end capture
    "tailMs": 3000, // extra footage after stopWhen
    "durationMs": 20000, // used when there's no stopWhen
    "settleMs": 8000 // boot time for a heavy loader
  }
}
```

`startWhen` is how you skip a splash screen or loading bar; `stopWhen` is how
you end on a real beat instead of a stopwatch.

## Why the capture is deterministic

The default mode does **not** screen-record. Before any page script runs it
injects a virtual clock — `performance.now`, `Date.now`, and
`requestAnimationFrame` all come from the recorder — then steps the game one
exact `1/fps` tick at a time and reads each finished frame off the canvas at its
native backing-store resolution.

That buys three things:

- **No dropped frames, ever.** A busy CI runner or a heavy particle scene can't
  affect the output, because capture speed and playback speed are unrelated.
  Screen recording bakes every hitch in permanently, usually during exactly the
  moment worth posting.
- **Reproducibility.** The same game produces the same file.
- **Native resolution for free.** Games scaled with CSS keep their real backing
  store, so there's no viewport math and no resampling.

It needs nothing from the game — any rAF-driven canvas works as-is.

Boot is the one part that stays on real time: asset downloads run on the
network, which the virtual clock doesn't drive, while a loader only advances
when its update loop ticks. So the recorder steps the game at real-time pace
until the network goes quiet, _then_ takes over the clock.

`--mode screencast` keeps the older wall-clock CDP capture for pages animated by
timers or audio rather than rAF.

## Encoding

Because the encoder is fed frames, ffmpeg's OS-specific capture layer is never
loaded — only its portable half, which produces identical bytes on macOS, Linux,
and both Windows architectures.

Output is 1080x1920 H.264 High / yuv420p / BT.709 with a silent AAC track
(Instagram ingests reels with audio present far more reliably), fixed 2s GOP,
`+faststart`. Pixel art gets a nearest-neighbor upscale to an integer multiple
before the lanczos reduction — a direct 640→1080 (1.6875x) would smear every
hard pixel edge. `--no-pixel-art` skips that for smooth-art games.

## Publishing

- **Instagram** uses the official Graph API container flow. It only accepts a
  public URL, never an upload, so local files are served through a throwaway
  server behind an ngrok tunnel for the duration of the ingest (`ngrok` on PATH
  with an authtoken configured), or pass `--video-url` if the file is already
  hosted. Needs `IG_ACCESS_TOKEN` + `IG_USER_ID`.
- **TikTok** uses the Content Posting API with chunked upload. Needs
  `TIKTOK_ACCESS_TOKEN`. Defaults to `SELF_ONLY` — until an app passes TikTok's
  audit it cannot post publicly, and the tool refuses a privacy level the
  account doesn't allow rather than failing mid-upload.

Everything published is confined to the recordings directory: the tunnel makes
whatever it's handed world-readable, so an arbitrary `--video` path is refused.
`--dry-run` validates the whole path without posting.

## Tutorial slides

`deno task record:slides` renders a coding-tutorial typing video from a Tutorial
JSON (`{ description, commands, files }` — the shape
[pablo.gg's GPT-generated reels scripts](https://pablo.gg/en/blog/coding/creating-instagram-reels-coding-tutorials-automatically-with-openais-gpt/)
use) through the same deterministic recorder. The timed `steps` variant in
[`slides/types.ts`](slides/types.ts) is the seam a VS Code / Codespaces plugin
can emit into.
