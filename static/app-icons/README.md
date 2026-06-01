# Launcher app icons

The code-monkey mascot — 🐵 (U+1F435) centered on an opaque **black square**,
matching the dashboard's boot/orb glyph. Every file here is generated from one
source by `scripts/gen-app-icons.py`, so don't hand-edit them.

```
python3 scripts/gen-app-icons.py      # needs Pillow + Apple Color Emoji (macOS)
```

The glyph is rendered from Apple Color Emoji's largest bitmap strike (160px),
so 256/384/512 are upscaled — fine for a glossy emoji at icon sizes.

## Files

| File | Size | Use |
|------|------|-----|
| `icon-{16,32}.png` | 16, 32 | favicon |
| `icon-{48..152}.png` | 48,72,96,128,144,152 | web / PWA |
| `icon-180.png` | 180 | `apple-touch-icon` |
| `icon-{192,256,384,512}.png` | 192–512 | PWA (192 & 512 required) |
| `maskable-{192,512}.png` | 192, 512 | PWA maskable (62% safe zone) |
| `launcher-{256,512}.png` | 256, 512 | Steam / desktop launcher |
| `cmg.ico` | 16–256 | Steam on Windows / favicon.ico |
| `android/<density>.png` | 36–192 | Cordova mipmap buckets |
| `android/playstore-512.png` | 512 | Play Store listing |

## Steam (the launcher binary)

The Linux AppImage build (`scripts/build-appimage.ts`) already embeds
`launcher-256.png` as its `.DirIcon`/desktop icon, so when the AppImage is added
to Steam as a non-Steam game it shows the monkey automatically. To set it by
hand on any shortcut: **Properties → click the icon** and choose
`launcher-512.png` (macOS/Linux) or `cmg.ico` (Windows).

## PWA

Serve `/app-icons/manifest.webmanifest` and add to your `<head>`:

```html
<link rel="manifest" href="/app-icons/manifest.webmanifest" />
<link rel="icon" href="/app-icons/icon-32.png" sizes="32x32" />
<link rel="apple-touch-icon" href="/app-icons/icon-180.png" />
<meta name="theme-color" content="#000000" />
```

(In this repo the `<head>` lives in `routes/index.tsx`.)

## Cordova / Android

In `config.xml`, under `<platform name="android">`:

```xml
<icon density="ldpi"    src="static/app-icons/android/ldpi.png" />
<icon density="mdpi"    src="static/app-icons/android/mdpi.png" />
<icon density="hdpi"    src="static/app-icons/android/hdpi.png" />
<icon density="xhdpi"   src="static/app-icons/android/xhdpi.png" />
<icon density="xxhdpi"  src="static/app-icons/android/xxhdpi.png" />
<icon density="xxxhdpi" src="static/app-icons/android/xxxhdpi.png" />
```
