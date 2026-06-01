#!/usr/bin/env python3
"""
Generate the code-monkey launcher icon set from the 🐵 (U+1F435) glyph.

The monkey is rendered once (Apple Color Emoji's 160px strike, the largest it
ships) and scaled per target. Backgrounds are TRANSPARENT everywhere a platform
can render alpha — favicons, web/PWA "any" icons, Android mipmaps, the Steam
launcher icon, and the .ico.

Two sets must stay OPAQUE, so they're flattened onto FILL (a muted leaf green,
#66994D) — the least-noticeable border for these square-bound icons, and a
natural pairing with the brown/tan monkey:
  - iOS app icons: Apple rejects an alpha channel and flattens any transparency
    onto black on the Home Screen, so a truly "transparent" iOS icon can't
    exist. Opaque-on-the-glyph's-own-tone is the closest compliant look.
  - PWA maskable icons: the launcher masks them to a shape; transparent corners
    would punch holes, so they need a filled background.

Outputs (under static/app-icons/):
  icon-{16..512}.png      web / PWA / favicons / apple-touch source  [transparent]
  maskable-{192,512}.png  PWA maskable (extra safe-zone padding)     [opaque fill]
  launcher-{256,512}.png  Steam / desktop (AppImage embeds the 256)  [transparent]
  cmg.ico                 multi-size ICO (Steam on Windows/favicon)  [transparent]
  android/<density>.png   Cordova mipmap buckets + playstore-512     [transparent]
  ios/icon-<px>.png       Cordova iOS app-icon set (incl. 1024)      [opaque fill]

Run:  python3 scripts/gen-app-icons.py      (needs Pillow + Apple Color Emoji)
"""

import os
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "static", "app-icons")
EMOJI_FONT = "/System/Library/Fonts/Apple Color Emoji.ttc"
GLYPH = "\U0001F435"  # 🐵 monkey face
STRIKE = 160          # Apple Color Emoji's largest bitmap strike

SAFE_STD = 0.83       # glyph's larger side as a fraction of the square
SAFE_MASK = 0.62      # tighter, so a circular/squircle mask never clips the face
SAFE_IOS = 0.92       # near-full-bleed — minimal edge, since iOS rounds the corners
FILL = (0x66, 0x99, 0x4D)  # #66994D — opaque-icon background (iOS + maskable)

# Web/PWA + favicon (16,32) + apple-touch source (180). 192 & 512 are PWA musts.
GENERAL = [16, 32, 48, 72, 96, 128, 144, 152, 180, 192, 256, 384, 512]
MASKABLE = [192, 512]
LAUNCHER = [256, 512]                       # Steam / desktop; AppImage embeds 256
ICO_SIZES = [16, 32, 48, 64, 128, 256]      # entries inside cmg.ico
ANDROID = {                                 # Cordova mipmap density buckets
    "ldpi": 36, "mdpi": 48, "hdpi": 72,
    "xhdpi": 96, "xxhdpi": 144, "xxxhdpi": 192,
}
ANDROID_PLAYSTORE = 512
# Cordova iOS app-icon pixel sizes — every @1x/@2x/@3x the platform asks for,
# from the 20pt notification icon up to the 1024 App Store marketing icon.
# All flattened (no alpha): Apple's hard requirement.
IOS = [20, 29, 40, 58, 60, 76, 80, 87, 120, 152, 167, 180, 1024]


def render_glyph():
    """Render 🐵 at the 160 strike and tight-crop to its visible bounds."""
    font = ImageFont.truetype(EMOJI_FONT, STRIKE)
    img = Image.new("RGBA", (STRIKE, STRIKE), (0, 0, 0, 0))
    ImageDraw.Draw(img).text(
        (STRIKE / 2, STRIKE / 2), GLYPH, font=font,
        embedded_color=True, anchor="mm",
    )
    bbox = img.getbbox()
    if not bbox:
        raise SystemExit("emoji render came back empty — wrong font/glyph?")
    return img.crop(bbox)


def square(glyph, n, safe, bg=None):
    """Monkey scaled to `safe` of an n×n square, centered.

    bg=None    → transparent RGBA (alpha preserved).
    bg=(r,g,b) → flattened onto an opaque square, returned as RGB (no alpha) so
                 it satisfies iOS / maskable's no-transparency rule.
    """
    gw, gh = glyph.size
    scale = (safe * n) / max(gw, gh)
    nw, nh = max(1, round(gw * scale)), max(1, round(gh * scale))
    g = glyph.resize((nw, nh), Image.LANCZOS)
    fill = (0, 0, 0, 0) if bg is None else bg + (255,)
    canvas = Image.new("RGBA", (n, n), fill)
    canvas.alpha_composite(g, ((n - nw) // 2, (n - nh) // 2))
    return canvas if bg is None else canvas.convert("RGB")


def save(img, *parts):
    p = os.path.join(OUT, *parts)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    img.save(p)
    print("wrote", os.path.relpath(p, ROOT), f"{img.width}x{img.height}",
          "rgba" if img.mode == "RGBA" else "opaque")


def main():
    glyph = render_glyph()
    fill = FILL
    print(f"glyph {glyph.size[0]}x{glyph.size[1]} from {GLYPH!r}; "
          f"opaque fill #{fill[0]:02x}{fill[1]:02x}{fill[2]:02x}")

    for n in GENERAL:
        save(square(glyph, n, SAFE_STD), f"icon-{n}.png")              # transparent
    for n in MASKABLE:
        save(square(glyph, n, SAFE_MASK, fill), f"maskable-{n}.png")   # opaque fill
    for n in LAUNCHER:
        save(square(glyph, n, SAFE_STD), f"launcher-{n}.png")          # transparent
    for density, n in ANDROID.items():
        save(square(glyph, n, SAFE_STD), "android", f"{density}.png")  # transparent
    save(square(glyph, ANDROID_PLAYSTORE, SAFE_STD), "android", "playstore-512.png")
    for n in IOS:
        save(square(glyph, n, SAFE_IOS, fill), "ios", f"icon-{n}.png")  # opaque fill

    # Multi-size .ico from the 256 master, transparent (Pillow downscales each).
    ico = square(glyph, 256, SAFE_STD)
    ico_path = os.path.join(OUT, "cmg.ico")
    ico.save(ico_path, format="ICO", sizes=[(s, s) for s in ICO_SIZES])
    print("wrote", os.path.relpath(ico_path, ROOT), "ico", ICO_SIZES)


if __name__ == "__main__":
    main()
