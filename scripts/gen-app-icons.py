#!/usr/bin/env python3
"""
Generate the code-monkey launcher icon set from the 🐵 (U+1F435) glyph.

Every icon is the monkey centered on an opaque black square — the launcher's
mascot, matching the dashboard's boot/orb glyph. One master render (Apple Color
Emoji's 160px strike, the largest it ships) is scaled down per target.

Outputs (under static/app-icons/):
  icon-{16..512}.png      web / PWA / favicons / apple-touch (180)
  maskable-{192,512}.png  PWA maskable (extra safe-zone padding)
  launcher-{256,512}.png  Steam / desktop launcher (AppImage embeds the 256)
  cmg.ico                 multi-size ICO (Steam on Windows / favicon)
  android/<density>.png   Cordova mipmap buckets + playstore-512

Run:  python3 scripts/gen-app-icons.py      (needs Pillow + Apple Color Emoji)
"""

import os
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "static", "app-icons")
EMOJI_FONT = "/System/Library/Fonts/Apple Color Emoji.ttc"
GLYPH = "\U0001F435"  # 🐵 monkey face
STRIKE = 160          # Apple Color Emoji's largest bitmap strike
BG = (0, 0, 0)        # black square
SAFE_STD = 0.83       # glyph's larger side as a fraction of the square (≈160/192)
SAFE_MASK = 0.62      # tighter, so a circular/squircle mask never clips the face

# Web/PWA + favicon (16,32) + apple-touch (180). 192 & 512 are the PWA musts.
GENERAL = [16, 32, 48, 72, 96, 128, 144, 152, 180, 192, 256, 384, 512]
MASKABLE = [192, 512]
LAUNCHER = [256, 512]                       # Steam / desktop; AppImage embeds 256
ICO_SIZES = [16, 32, 48, 64, 128, 256]      # entries inside cmg.ico
ANDROID = {                                 # Cordova mipmap density buckets
    "ldpi": 36, "mdpi": 48, "hdpi": 72,
    "xhdpi": 96, "xxhdpi": 144, "xxxhdpi": 192,
}
ANDROID_PLAYSTORE = 512


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


def square(glyph, n, safe):
    """Monkey scaled to `safe` of an n×n opaque-black square, centered."""
    gw, gh = glyph.size
    scale = (safe * n) / max(gw, gh)
    nw, nh = max(1, round(gw * scale)), max(1, round(gh * scale))
    g = glyph.resize((nw, nh), Image.LANCZOS)
    canvas = Image.new("RGBA", (n, n), BG + (255,))
    canvas.alpha_composite(g, ((n - nw) // 2, (n - nh) // 2))
    return canvas.convert("RGB")


def save(img, *parts):
    p = os.path.join(OUT, *parts)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    img.save(p)
    print("wrote", os.path.relpath(p, ROOT), f"{img.width}x{img.height}")


def main():
    glyph = render_glyph()
    print(f"glyph {glyph.size[0]}x{glyph.size[1]} from {GLYPH!r}")

    for n in GENERAL:
        save(square(glyph, n, SAFE_STD), f"icon-{n}.png")
    for n in MASKABLE:
        save(square(glyph, n, SAFE_MASK), f"maskable-{n}.png")
    for n in LAUNCHER:
        save(square(glyph, n, SAFE_STD), f"launcher-{n}.png")
    for density, n in ANDROID.items():
        save(square(glyph, n, SAFE_STD), "android", f"{density}.png")
    save(square(glyph, ANDROID_PLAYSTORE, SAFE_STD), "android", "playstore-512.png")

    # Multi-size .ico from the 256 master (Pillow downscales each entry).
    ico = square(glyph, 256, SAFE_STD)
    ico_path = os.path.join(OUT, "cmg.ico")
    ico.save(ico_path, format="ICO", sizes=[(s, s) for s in ICO_SIZES])
    print("wrote", os.path.relpath(ico_path, ROOT), "ico", ICO_SIZES)


if __name__ == "__main__":
    main()
