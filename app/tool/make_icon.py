"""Draws the DebtLab app icon (same mark as the website logo).

    python tool/make_icon.py   ->  assets/icon/icon.png, icon_fg.png
Then: dart run flutter_launcher_icons
"""
from pathlib import Path

from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parent.parent / "assets" / "icon"
BLUE, GREEN, WHITE = (15, 82, 186), (74, 222, 128), (255, 255, 255)
S = 1024
SS = 4  # supersample for smooth edges


def mark(draw, scale, ox, oy):
    """Chart line + dot, drawn in a 32x32 design grid (matches the site SVG)."""
    p = lambda x, y: (ox + x * scale, oy + y * scale)  # noqa: E731
    draw.line([p(8, 22), p(13.5, 15), p(17.5, 18.5), p(24, 10)], fill=WHITE, width=int(2.8 * scale), joint="curve")
    for x, y in [(8, 22), (13.5, 15), (17.5, 18.5)]:
        r = 1.4 * scale
        cx, cy = p(x, y)
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=WHITE)
    r = 2.6 * scale
    cx, cy = p(24, 10)
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=GREEN)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    big = S * SS

    # Full icon (iOS + legacy Android): blue square, mark centered
    img = Image.new("RGB", (big, big), BLUE)
    mark(ImageDraw.Draw(img), big / 32, 0, 0)
    img.resize((S, S), Image.LANCZOS).save(OUT / "icon.png")

    # Android adaptive foreground: transparent, mark inside the 66% safe zone
    fg = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    scale = big * 0.62 / 32
    off = (big - 32 * scale) / 2
    mark(ImageDraw.Draw(fg), scale, off, off)
    fg.resize((S, S), Image.LANCZOS).save(OUT / "icon_fg.png")
    print("wrote", OUT)


if __name__ == "__main__":
    main()
