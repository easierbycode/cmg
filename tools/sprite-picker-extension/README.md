# CMG Sprite Picker

Chrome extension (Manifest V3) that detects individual sprites inside
sprite-sheet images on the web, lets you pick the ones you want, and beams them
into **CMG SpriteX** — the launcher boots the SpriteX app and your picks appear
packed as an atlas in its **View** tab, animation preview running.

The UI matches the CMG launcher OSD ("Guide"): green CRT glass, Orbitron type,
glossy yellow selection.

## Install (unpacked)

1. Open `chrome://extensions`, enable **Developer mode**.
2. **Load unpacked** → select `tools/sprite-picker-extension/`.

## Use

1. Open the CMG dashboard in a tab — local dev (`deno task dev` →
   `http://localhost:5173`), a desktop launcher, or the hosted dashboard
   (`https://cmg.easierbycode.deno.net`). The popup shows **LAUNCHER ONLINE**
   when it's found.
2. Browse to a sprite-sheet page (spriters-resource.com works out of the box;
   on any other site use the popup's **Inject picker on this tab**).
3. Click the **⊕** button (bottom-right) to enter pick mode, then click a
   sprite-sheet image. Detected sprites get lime boxes (right-clicking an image
   → **Detect Sprites in This Image** also works).
4. Click boxes to select (they turn yellow), review thumbnails in the panel,
   optionally set the sprite base name.
5. **SEND TO SPRITEX** — the CMG tab launches SpriteX with your sprites
   preloaded in the View tab.

## How it works

```
content.js (sprite site)            service worker              bridge (CMG dashboard tab)
  ⊕ pick → SpriteDetect ──SEND_SPRITES──► find CMG tab ──SPRITEX_PRELOAD──► window.postMessage
                                                                             {source:'cmg-sprite-picker',
                                                                              type:'spritex-preload', sprites}
                                                                                      │
                                                              Dashboard.svelte boots SpriteX in the game
                                                              frame and re-posts {type:'spritex-preload'}
                                                              into it until the app answers
                                                              {type:'spritex-preload-ack'}
                                                                                      │
                                                              spriteX (src/main.ts) packs the sprites with
                                                              buildAtlas → applyAtlasPreview → View tab
```

- Sprite detection (`lib/sprite-detect.js`) is the flood-fill /
  background-key-out algorithm ported from `spriteX/src/atlasManager.ts` —
  the same detection SpriteX runs in its Extract tab.
- Sprites travel as PNG data URLs: `{ name, dataURL, w, h }`.
- The launcher prefers its cached SpriteX build (`/cmg-net/spritex/…`); when
  not yet installed it downloads `spritex.zip` first so the preload receiver is
  guaranteed present, and only falls back to streaming the hosted build if the
  download fails.

## Files

- `manifest.json` — MV3; content scripts on sprite sites + CMG launcher origins.
- `background/service-worker.js` — CORS image proxy, CMG tab discovery, routing.
- `content/content.js` + `content.css` — pick mode, overlay, OSD-styled panel.
- `lib/sprite-detect.js` — detection algorithms (no dependencies).
- `bridge/cmg-bridge.js` — relays picks into the dashboard page.
- `popup/` — launcher status + inject-on-any-site.
- `fonts/Orbitron-Variable.woff2` — bundled so the panel matches the OSD on any site.
