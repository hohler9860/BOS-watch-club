#!/usr/bin/env python3
"""
Boston Watch Club — Ticker Build Script

Drop any watch images (.png, .jpg, .jpeg, .webp) into the watches/ folder,
then run this script to process them and update the marquee ticker.

Usage:
    python3 build.py
"""

import os
import glob
import re
from PIL import Image

ROOT = os.path.dirname(os.path.abspath(__file__))
WATCHES_DIR = os.path.join(ROOT, "watches")
ASSETS_DIR = os.path.join(ROOT, "assets")
INDEX_PATH = os.path.join(ROOT, "index.html")
TARGET_H = 280


def detect_bg(img):
    """Detect whether image has a dark or light background by sampling corners."""
    w, h = img.size
    corners = []
    for x, y in [(0, 0), (w-1, 0), (0, h-1), (w-1, h-1)]:
        px = img.getpixel((x, y))
        if len(px) == 4:
            r, g, b, a = px
            if a < 50:
                continue
        else:
            r, g, b = px[:3]
        corners.append((r + g + b) / 3)
    if not corners:
        return "transparent"
    avg = sum(corners) / len(corners)
    return "dark" if avg < 128 else "light"


def remove_background(img, bg_type):
    """Remove background pixels based on detected type."""
    img = img.convert("RGBA")
    data = list(img.getdata())
    new_data = []
    for pixel in data:
        r, g, b, a = pixel
        if bg_type == "dark":
            brightness = max(r, g, b)
            if brightness < 25:
                new_data.append((r, g, b, 0))
            elif brightness < 55:
                alpha = int((brightness - 25) / 30 * 255)
                new_data.append((r, g, b, min(alpha, a)))
            else:
                new_data.append(pixel)
        else:
            if r > 235 and g > 235 and b > 235:
                new_data.append((r, g, b, 0))
            elif r > 210 and g > 210 and b > 210:
                darkness = 255 - min(r, g, b)
                alpha = int(darkness / 45 * 255)
                new_data.append((r, g, b, min(alpha, a)))
            else:
                new_data.append(pixel)
    img.putdata(new_data)
    return img


def get_brand(filename):
    """Extract brand name from filename for grouping."""
    name = os.path.basename(filename).lower()
    brands = [
        ("audemars_piguet", "AP"), ("a_lange", "Lange"), ("de_bethune", "DeBethune"),
        ("fpjourne", "FPJ"), ("mbf", "MBF"), ("omega", "Omega"),
        ("patek", "Patek"), ("richard_mille", "RM"), ("rolex", "Rolex"),
        ("vacheron", "VC"), ("cartier", "Cartier"), ("hublot", "Hublot"),
        ("iwc", "IWC"), ("jaeger", "JLC"), ("breguet", "Breguet"),
    ]
    for key, brand in brands:
        if key in name:
            return brand
    return "Other"


def spread_brands(sources):
    """Reorder so no two watches from the same brand are adjacent."""
    from collections import defaultdict
    groups = defaultdict(list)
    for src in sources:
        groups[get_brand(src)].append(src)

    # Sort groups largest first for best interleaving
    buckets = sorted(groups.values(), key=len, reverse=True)
    result = []
    while any(buckets):
        for bucket in buckets:
            if bucket:
                result.append(bucket.pop(0))
        buckets = [b for b in buckets if b]
    return result


def process_watches():
    """Process all images in watches/ folder into uniform assets."""
    extensions = ("*.png", "*.jpg", "*.jpeg", "*.webp")
    sources = []
    for ext in extensions:
        sources.extend(glob.glob(os.path.join(WATCHES_DIR, ext)))
    sources.sort()

    if not sources:
        print("No watch images found in watches/ folder.")
        return []

    # Spread brands apart
    sources = spread_brands(sources)
    print("  Brand order: " + " / ".join(get_brand(s) for s in sources) + "\n")

    # Clean old watch assets
    for old in glob.glob(os.path.join(ASSETS_DIR, "watch-*.png")):
        os.remove(old)

    filenames = []
    for i, src in enumerate(sources, 1):
        out_name = f"watch-{i}.png"
        out_path = os.path.join(ASSETS_DIR, out_name)

        img = Image.open(src).convert("RGBA")
        bg_type = detect_bg(img)

        if bg_type != "transparent":
            img = remove_background(img, bg_type)

        # Crop to bounding box
        bbox = img.getbbox()
        if bbox:
            img = img.crop(bbox)

        # Resize to uniform height
        ratio = TARGET_H / img.height
        new_w = int(img.width * ratio)
        img = img.resize((new_w, TARGET_H), Image.LANCZOS)

        img.save(out_path, "PNG", optimize=True)
        filenames.append(out_name)
        print(f"  [{i}/{len(sources)}] {os.path.basename(src)} -> {out_name} ({new_w}x{TARGET_H})")

    return filenames


def update_html(filenames):
    """Update the marquee section in index.html with current watch images."""
    with open(INDEX_PATH, "r") as f:
        html = f.read()

    # Build image tags — one set, then duplicate for seamless loop
    tags = []
    for name in filenames:
        tags.append(f'            <img class="marquee-watch" src="assets/{name}" alt="TIMEPIECE">')

    all_tags = "\n".join(tags + tags)  # duplicate for infinite scroll

    # Replace marquee content
    pattern = r'(<!-- MARQUEE -->\s*<div class="marquee">\s*<div class="marquee-track">)\s*.*?\s*(</div>\s*</div>)'
    replacement = rf'\1\n{all_tags}\n        \2'
    new_html = re.sub(pattern, replacement, html, flags=re.DOTALL)

    with open(INDEX_PATH, "w") as f:
        f.write(new_html)

    print(f"\n  Updated index.html with {len(filenames)} watches ({len(filenames) * 2} total in ticker)")


if __name__ == "__main__":
    print("BOSTON WATCH CLUB — Building ticker\n")
    print(f"Scanning: {WATCHES_DIR}/\n")
    filenames = process_watches()
    if filenames:
        update_html(filenames)
        print("\nDone.")
    else:
        print("\nAdd images to the watches/ folder and run again.")
