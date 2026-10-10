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

stamps_to_build = [
    {
        "city_key": "manila",
        "name": "Manila",
        "inner_name": "manila_intramuros_inner.png",
        "public_full_name": "manila_intramuros.png",
        "brain_standalone": "manila_intramuros_redesign.png",
        "src_file": os.path.join(BRAIN_DIR, "manila_kalesa_illustration_1791357042169.jpg"),
        "frame": "#7c2d12",
        "bg": "#faf8f5",
        "inset_x": 24,
        "y_start": 20,
        "extra_brain_copies": ["ncr_manila.png"]
    },
    {
        "city_key": "muntinlupa",
        "name": "Muntinlupa",
        "inner_name": "muntinlupa_lake_inner.png",
        "public_full_name": "muntinlupa_lake.png",
        "brain_standalone": "muntinlupa_lake_redesign.png",
        "src_file": os.path.join(BRAIN_DIR, "jamboree_lake_illustration_1791357066347.jpg"),
        "frame": "#065f46",
        "bg": "#f0fdf4",
        "inset_x": 24,
        "y_start": 20,
        "extra_brain_copies": ["ncr_muntinlupa.png"]
    },
    {
        "city_key": "quezon_city",
        "name": "Quezon City",
        "inner_name": "qc_monument_inner.png",
        "public_full_name": "qc_monument.png",
        "brain_standalone": "qc_monument_redesign.png",
        "src_file": os.path.join(BRAIN_DIR, "quezon_memorial_shrine_illustration_1791357077284.jpg"),
        "frame": "#0f172a",
        "bg": "#fafafa",
        "inset_x": 20,
        "y_start": 16,
        "extra_brain_copies": ["ncr_quezon_city.png"]
    },
    {
        "city_key": "alaminos",
        "name": "Alaminos",
        "inner_name": "alaminos_hundred_islands_inner.png",
        "public_full_name": "alaminos_hundred_islands.png",
        "brain_standalone": "alaminos_hundred_islands_redesign.png",
        "src_file": os.path.join(BRAIN_DIR, "pilgrimage_island_christ_illustration_1791357091785.jpg"),
        "frame": "#065f46",
        "bg": "#f0fdf4",
        "inset_x": 20,
        "y_start": 16,
        "extra_brain_copies": []
    },
    {
        "city_key": "general_trias",
        "name": "General Trias",
        "inner_name": "gentrias_tejeros_inner.png",
        "public_full_name": "gentrias_tejeros.png",
        "brain_standalone": "gentrias_tejeros_redesign.png",
        "src_file": os.path.join(BRAIN_DIR, "first_cry_of_cavite_illustration_1791357104538.jpg"),
        "frame": "#334155",
        "bg": "#f8fafc",
        "inset_x": 0,
        "y_start": 10,
        "extra_brain_copies": []
    }
]

target_ratio = 39.0 / 49.0

def compose_all():
    os.makedirs(PUBLIC_STAMPS_DIR, exist_ok=True)
    os.makedirs(BRAIN_STAMPS_DIR, exist_ok=True)
    
    for s in stamps_to_build:
        name = s["name"]
        city_key = s["city_key"]
        frame = s["frame"]
        bg = s["bg"]
        standalone_filename = s["brain_standalone"]
        public_filename = s["public_full_name"]
        src_img = s["src_file"]
        
        if not os.path.exists(src_img):
            print(f"Error: {src_img} does not exist!")
            continue
            
        print(f"Processing {name} from {src_img}")
        im = Image.open(src_img)
        w, h = im.size
        
        inset_x = s.get("inset_x", 0)
        y_start = s.get("y_start", 0)
        
        # Inset width
        crop_w = w - 2 * inset_x
        # Height required for target 39:49 ratio
        needed_h = int(crop_w / target_ratio)
        
        if y_start + needed_h > h:
            y_start = max(0, h - needed_h)
            
        im_cropped = im.crop((inset_x, y_start, inset_x + crop_w, y_start + needed_h))
        print(f"{name} cropped size: {im_cropped.size}, aspect: {im_cropped.size[0]/im_cropped.size[1]:.4f} (target: {target_ratio:.4f})")

        inner_art_png = os.path.join(PUBLIC_STAMPS_DIR, s["inner_name"])
        im_cropped.save(inner_art_png, "PNG")
        print(f"{name} saved inner art PNG -> {inner_art_png}")

        with open(inner_art_png, "rb") as f:
            b64_data = base64.b64encode(f.read()).decode("ascii")

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
            f'  <!-- Redesigned Hand-Drawn Engraved Subject Artwork (Preserving existing series frame) -->\n'
            f'  <image href="data:image/png;base64,{b64_data}" x="4.5" y="4.5" width="39" height="49" preserveAspectRatio="none" />\n'
            f'</svg>'
        )

        out_svg = os.path.join(BRAIN_STAMPS_DIR, f"city_{city_key}.svg")
        with open(out_svg, "w") as f:
            f.write(full_svg)

        out_png = os.path.join(BRAIN_STAMPS_DIR, f"city_{city_key}.png")
        subprocess.run(["/opt/homebrew/bin/rsvg-convert", "-w", "600", "-h", "725", "-o", out_png, out_svg], check=True)

        standalone_png = os.path.join(BRAIN_DIR, standalone_filename)
        subprocess.run(["/opt/homebrew/bin/rsvg-convert", "-w", "600", "-h", "725", "-o", standalone_png, out_svg], check=True)

        public_png = os.path.join(PUBLIC_STAMPS_DIR, public_filename)
        subprocess.run(["/opt/homebrew/bin/rsvg-convert", "-w", "600", "-h", "725", "-o", public_png, out_svg], check=True)

        for extra in s.get("extra_brain_copies", []):
            extra_path = os.path.join(BRAIN_STAMPS_DIR, extra)
            subprocess.run(["/opt/homebrew/bin/rsvg-convert", "-w", "600", "-h", "725", "-o", extra_path, out_svg], check=True)

        print(f"{name} all stamp formats generated successfully!")

if __name__ == "__main__":
    compose_all()
