import os
import glob
import subprocess
import base64
from PIL import Image

SCALLOP_PATH = (
    "M 0 0 L 0.6 0 A 1.4 1.4 0 0 1 3.4 0 L 4.0 0 L 4.6 0 A 1.4 1.4 0 0 1 7.4 0 L 8.0 0 L 8.6 0 A 1.4 1.4 0 0 1 11.4 0 L 12.0 0 L 12.6 0 A 1.4 1.4 0 0 1 15.4 0 L 16.0 0 L 16.6 0 A 1.4 1.4 0 0 1 19.4 0 L 20.0 0 L 20.6 0 A 1.4 1.4 0 0 1 23.4 0 L 24.0 0 L 24.6 0 A 1.4 1.4 0 0 1 27.4 0 L 28.0 0 L 28.6 0 A 1.4 1.4 0 0 1 31.4 0 L 32.0 0 L 32.6 0 A 1.4 1.4 0 0 1 35.4 0 L 36.0 0 L 36.6 0 A 1.4 1.4 0 0 1 39.4 0 L 40.0 0 L 40.6 0 A 1.4 1.4 0 0 1 43.4 0 L 44.0 0 L 44.6 0 A 1.4 1.4 0 0 1 47.4 0 L 48.0 0 "
    "L 48 0.7 A 1.4 1.4 0 0 1 48 3.5 L 48 4.1 L 48 4.8 A 1.4 1.4 0 0 1 48 7.6 L 48 8.3 L 48 9.0 A 1.4 1.4 0 0 1 48 11.8 L 48 12.4 L 48 13.1 A 1.4 1.4 0 0 1 48 15.9 L 48 16.6 L 48 17.2 A 1.4 1.4 0 0 1 48 20.0 L 48 20.7 L 48 21.4 A 1.4 1.4 0 0 1 48 24.2 L 48 24.9 L 48 25.5 A 1.4 1.4 0 0 1 48 28.3 L 48 29.0 L 48 29.7 A 1.4 1.4 0 0 1 48 32.5 L 48 33.1 L 48 33.8 A 1.4 1.4 0 0 1 48 36.6 L 48 37.3 L 48 38.0 A 1.4 1.4 0 0 1 48 40.8 L 48 41.4 L 48 42.1 A 1.4 1.4 0 0 1 48 44.9 L 48 45.6 L 48 46.2 A 1.4 1.4 0 0 1 48 49.0 L 48 49.7 L 48 50.4 A 1.4 1.4 0 0 1 48 53.2 L 48 53.9 L 48 54.5 A 1.4 1.4 0 0 1 48 57.3 L 48 58.0 "
    "L 47.4 58 A 1.4 1.4 0 0 1 44.6 58 L 44.0 58 L 43.4 58 A 1.4 1.4 0 0 1 40.6 58 L 40.0 58 L 39.4 58 A 1.4 1.4 0 0 1 36.6 58 L 36.0 58 L 35.4 58 A 1.4 1.4 0 0 1 32.6 58 L 32.0 58 L 31.4 58 A 1.4 1.4 0 0 1 28.6 58 L 28.0 58 L 27.4 58 A 1.4 1.4 0 0 1 24.6 58 L 24.0 58 L 23.4 58 A 1.4 1.4 0 0 1 20.6 58 L 20.0 58 L 19.4 58 A 1.4 1.4 0 0 1 16.6 58 L 16.0 58 L 15.4 58 A 1.4 1.4 0 0 1 12.6 58 L 12.0 58 L 11.4 58 A 1.4 1.4 0 0 1 8.6 58 L 8.0 58 L 7.4 58 A 1.4 1.4 0 0 1 4.6 58 L 4.0 58 L 3.4 58 A 1.4 1.4 0 0 1 0.6 58 L 0.0 58 "
    "L 0 57.3 A 1.4 1.4 0 0 1 0 54.5 L 0 53.9 L 0 53.2 A 1.4 1.4 0 0 1 0 50.4 L 0 49.7 L 0 49.0 A 1.4 1.4 0 0 1 0 46.2 L 0 45.6 L 0 44.9 A 1.4 1.4 0 0 1 0 42.1 L 0 41.4 L 0 40.8 A 1.4 1.4 0 0 1 0 38.0 L 0 37.3 L 0 36.6 A 1.4 1.4 0 0 1 0 33.8 L 0 33.1 L 0 32.5 A 1.4 1.4 0 0 1 0 29.7 L 0 29.0 L 0 28.3 A 1.4 1.4 0 0 1 0 25.5 L 0 24.9 L 0 24.2 A 1.4 1.4 0 0 1 0 21.4 L 0 20.7 L 0 20.0 A 1.4 1.4 0 0 1 0 17.2 L 0 16.6 L 0 15.9 A 1.4 1.4 0 0 1 0 13.1 L 0 12.4 L 0 11.8 A 1.4 1.4 0 0 1 0 9.0 L 0 8.3 L 0 7.6 A 1.4 1.4 0 0 1 0 4.8 L 0 4.1 L 0 3.5 A 1.4 1.4 0 0 1 0 0.7 L 0 0.0 Z"
)

BRAIN_DIR = "/Users/didsirwynreyes/.gemini/antigravity/brain/f6751d87-c877-4cd0-88e2-586293460779"
PUBLIC_STAMPS_DIR = "/Users/didsirwynreyes/Documents/dids/letters_to_casper/public/stamps"
BRAIN_STAMPS_DIR = os.path.join(BRAIN_DIR, "stamps")

target_ratio = 39.0 / 49.0  # standard stamp inner artwork aspect ratio (width / height)

def compose_stamp(entry):
    city_key = entry["city_key"]
    name = entry["name"]
    src_img = entry["src_img"]
    frame = entry["frame"]
    bg = entry["bg"]
    inner_name = entry["inner_name"]
    public_city_png = entry["public_city_png"]
    public_ncr_png = entry["public_ncr_png"]
    inset_x = entry.get("inset_x", 0)
    y_start = entry.get("y_start", 0)

    if not os.path.exists(src_img):
        print(f"Error: {src_img} does not exist!")
        return False

    print(f"Processing {name} from {src_img}")
    im = Image.open(src_img).convert("RGB")
    w, h = im.size

    crop_w = w - 2 * inset_x
    needed_h = int(crop_w / target_ratio)

    if y_start + needed_h > h:
        y_start = max(0, h - needed_h)

    im_cropped = im.crop((inset_x, y_start, inset_x + crop_w, y_start + needed_h))
    print(f"{name} cropped size: {im_cropped.size}, aspect: {im_cropped.size[0]/im_cropped.size[1]:.4f} (target: {target_ratio:.4f})")

    # 1. Save inner art PNG
    inner_art_png = os.path.join(PUBLIC_STAMPS_DIR, inner_name)
    im_cropped.save(inner_art_png, "PNG")
    print(f"{name} saved inner art PNG -> {inner_art_png}")

    # Brain copy of inner art
    brain_inner = os.path.join(BRAIN_DIR, inner_name)
    im_cropped.save(brain_inner, "PNG")

    with open(inner_art_png, "rb") as f:
        b64_data = base64.b64encode(f.read()).decode("ascii")

    # 2. Build complete SVG stamp preserving existing stamp frame & scallop border
    full_svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 48 58" width="600" height="725">\n'
        f'  <!-- Perforated scallop border -->\n'
        f'  <path d="{SCALLOP_PATH}" fill="#ffffff" stroke="#eab308" stroke-width="0.8" stroke-linejoin="round" />\n'
        f'  <!-- Outer contrasting border frame -->\n'
        f'  <rect x="3" y="3" width="42" height="52" rx="0.5" fill="{frame}" />\n'
        f'  <!-- Inner canvas background -->\n'
        f'  <rect x="4.5" y="4.5" width="39" height="49" fill="{bg}" />\n'
        f'  <!-- Fine interior frame line -->\n'
        f'  <rect x="5.5" y="5.5" width="37" height="47" fill="none" stroke="{frame}" stroke-width="0.4" opacity="0.3" />\n'
        f'  <!-- Redesigned Hand-Drawn Engraved Subject Artwork -->\n'
        f'  <image href="data:image/png;base64,{b64_data}" x="4.5" y="4.5" width="39" height="49" preserveAspectRatio="none" />\n'
        f'</svg>'
    )

    out_svg = os.path.join(BRAIN_STAMPS_DIR, f"city_{city_key}.svg")
    with open(out_svg, "w") as f:
        f.write(full_svg)

    # 3. Render high-res 600x725 PNG using rsvg-convert
    out_city_png = os.path.join(PUBLIC_STAMPS_DIR, public_city_png)
    subprocess.run(["/opt/homebrew/bin/rsvg-convert", "-w", "600", "-h", "725", "-o", out_city_png, out_svg], check=True)
    print(f"Rendered {out_city_png} via rsvg-convert!")

    # Brain copy of city stamp
    brain_city_png = os.path.join(BRAIN_STAMPS_DIR, f"city_{city_key}.png")
    subprocess.run(["/opt/homebrew/bin/rsvg-convert", "-w", "600", "-h", "725", "-o", brain_city_png, out_svg], check=True)

    # 4. Render thumbnail 300x362
    thumb = Image.open(out_city_png).resize((300, 362), Image.Resampling.LANCZOS)
    out_ncr_png = os.path.join(PUBLIC_STAMPS_DIR, public_ncr_png)
    thumb.save(out_ncr_png, "PNG")
    print(f"Saved thumbnail {out_ncr_png} (300, 362)")

    # Brain copy of thumbnail
    brain_ncr_png = os.path.join(BRAIN_STAMPS_DIR, public_ncr_png)
    thumb.save(brain_ncr_png, "PNG")

    print(f"All formats for {name} generated successfully!\n")
    return True
