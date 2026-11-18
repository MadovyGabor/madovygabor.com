"""
Gallery generator.

Usage (from anywhere):
    python utils/generate_gallery.py            # incremental: only missing/outdated variants
    python utils/generate_gallery.py --force    # regenerate every responsive variant

Scans pictures/portfolio/, writes responsive WebP/AVIF variants into
pictures/responsive/ and rebuilds galleryData.json.
"""
import argparse
import json
import os
import re
import sys
import unicodedata
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from PIL import Image, ImageOps

try:  # optional AVIF plugin (Pillow >= 11.3 ships AVIF support natively)
    import pillow_avif  # noqa: F401
except ImportError:
    pass

try:
    from PIL import features as _pil_features
    AVIF_AVAILABLE = bool(_pil_features.check("avif"))
except Exception:
    AVIF_AVAILABLE = False

if not AVIF_AVAILABLE:
    try:  # plugin registered itself on import above
        import io
        _buf = io.BytesIO()
        Image.new("RGB", (8, 8)).save(_buf, format="AVIF")
        AVIF_AVAILABLE = True
    except Exception:
        AVIF_AVAILABLE = False

# Configure stdout to use UTF-8 to prevent print encoding errors on Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Settings
SCRIPT_DIR = Path(__file__).resolve().parent


def find_photo_page_dir():
    """Finds the root photography directory containing pictures/portfolio."""
    for candidate in (SCRIPT_DIR.parent, SCRIPT_DIR, SCRIPT_DIR.parent.parent):
        if (candidate / "pictures" / "portfolio").exists():
            return candidate
    return SCRIPT_DIR.parent


PHOTO_PAGE_DIR = find_photo_page_dir()
PICTURES_DIR = PHOTO_PAGE_DIR / "pictures" / "portfolio"
OUTPUT_FILE = PHOTO_PAGE_DIR / "galleryData.json"
METADATA_FILE = PHOTO_PAGE_DIR / "utils" / "image_metadata.json"
RESPONSIVE_DIR = PHOTO_PAGE_DIR / "pictures" / "responsive"

TARGET_WIDTHS = [480, 960, 1600, 2400]
WEBP_QUALITY = 78
AVIF_QUALITY = 55
FORCE = False
GENERATE_RESPONSIVE = False  # responsive WebP/AVIF variants disabled (not needed for this site)
_used_bases = {}


def slugify(text):
    """Creates a clean URL/HTML ID from accented folder names (e.g., 'Rendezvények' -> 'rendezvenyek')"""
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('utf-8')
    text = re.sub(r'[^\w\s-]', '', text).strip().lower()
    return re.sub(r'[-\s]+', '-', text)


def make_base(img_path):
    """Deterministic, URL-safe base path (no extension) for an image's responsive variants."""
    rel = img_path.relative_to(PICTURES_DIR)
    parts = [slugify(p) or "x" for p in rel.parent.parts] + [slugify(rel.stem) or "image"]
    base = "pictures/responsive/" + "/".join(parts)
    candidate, n = base, 2
    while _used_bases.get(candidate, img_path) != img_path:
        candidate = f"{base}-{n}"
        n += 1
    _used_bases[candidate] = img_path
    return candidate


def _is_fresh(target, source):
    return target.exists() and target.stat().st_mtime >= source.stat().st_mtime and target.stat().st_size > 0


def generate_variants(img, img_path, base, formats):
    """Writes <base>-<w>.<fmt> for every target width <= original width. Returns the widths."""
    orig_w, orig_h = img.size
    widths = [w for w in TARGET_WIDTHS if w <= orig_w]
    if not widths:
        return []

    for w in widths:
        h = max(1, round(orig_h * w / orig_w))
        resized = None
        for fmt in formats:
            out = PHOTO_PAGE_DIR / f"{base}-{w}.{fmt}"
            if not FORCE and _is_fresh(out, img_path):
                continue
            if resized is None:
                resized = img.resize((w, h), Image.LANCZOS)
            out.parent.mkdir(parents=True, exist_ok=True)
            if fmt == "webp":
                resized.save(out, "WEBP", quality=WEBP_QUALITY, method=4)
            else:
                resized.save(out, "AVIF", quality=AVIF_QUALITY, speed=7)
    return widths


def get_image_data(img_path, meta_lookup=None, base=None):
    """Reads image dimensions, generates responsive variants and retrieves localized alt/title metadata"""
    width, height, aspect_ratio = 0, 0, 1.5
    widths = []
    base = None
    formats = ["avif", "webp"] if AVIF_AVAILABLE else ["webp"]
    try:
        with Image.open(img_path) as raw:
            img = ImageOps.exif_transpose(raw)  # respect EXIF orientation
            if img.mode not in ("RGB", "RGBA"):
                img = img.convert("RGBA" if "A" in img.getbands() or img.mode == "P" else "RGB")
            width, height = img.size
            if height > 0:
                aspect_ratio = width / height
            base = base or make_base(img_path)
            widths = generate_variants(img, img_path, base, formats) if GENERATE_RESPONSIVE else []
    except Exception as e:
        print(f"  Warning: Could not process image {img_path.name}: {e}")
        widths = []
    
    # Generate clean fallback alt text from filename
    filename = img_path.stem
    # Replace hyphens and underscores with spaces
    clean_name = filename.replace('-', ' ').replace('_', ' ')
    # Remove trailing numbering in parentheses (e.g. "Name (1)" -> "Name")
    clean_name = re.sub(r'\s*\(\d+\)\s*$', '', clean_name)
    # Strip whitespace
    clean_name = clean_name.strip()
    # Capitalize the first letter (keeping other capitals as-is)
    alt_text = ""
    if clean_name:
        alt_text = clean_name[0].upper() + clean_name[1:]
    
    web_path = img_path.relative_to(PHOTO_PAGE_DIR).as_posix()
    item_data = {
        "src": web_path,
        "width": width,
        "height": height,
        "aspect_ratio": aspect_ratio
    }
    if widths and base:
        item_data["base"] = base
        item_data["widths"] = widths
        item_data["formats"] = formats

    if meta_lookup and web_path in meta_lookup:
        entry = meta_lookup[web_path]
        if "alt" in entry and entry["alt"]:
            item_data["alt"] = entry["alt"]
        else:
            item_data["alt"] = alt_text
        if "title" in entry and entry["title"]:
            item_data["title"] = entry["title"]
    else:
        item_data["alt"] = alt_text

    return item_data


def get_images_in_dir(dir_path, meta_lookup=None):
    """Collects and processes all valid image files in a directory"""
    images = []
    if not dir_path.exists():
        return images
    
    paths = [dir_path / item for item in sorted(os.listdir(dir_path))]
    paths = [p for p in paths if p.is_file() and p.suffix.lower() in ('.jpg', '.jpeg', '.png', '.webp')]
    # make_base() is order-dependent (collision handling) -> reserve bases sequentially first
    bases = [make_base(p) for p in paths]
    with ThreadPoolExecutor(max_workers=min(4, os.cpu_count() or 2)) as pool:
        images = list(pool.map(lambda pb: get_image_data(pb[0], meta_lookup, pb[1]), zip(paths, bases)))
    return images


def ensure_unique_ids(gallery_data):
    """Guarantees unique section ids. First occurrence keeps its id; later ones get a parent prefix / numeric suffix."""
    seen = set()

    def unique(candidate, parent_id):
        if candidate not in seen:
            return candidate
        if parent_id:
            prefixed = f"{parent_id}-{candidate}"
            if prefixed not in seen:
                return prefixed
            candidate = prefixed
        n = 2
        while f"{candidate}-{n}" in seen:
            n += 1
        return f"{candidate}-{n}"

    def walk(nodes, parent_id):
        for node in nodes:
            node["id"] = unique(node["id"], parent_id)
            seen.add(node["id"])
            walk(node.get("subsections", []), node["id"])

    walk(gallery_data, "")


def generate_gallery_json():
    """Scans pictures/portfolio/ recursively and generates the structured gallery JSON file"""
    gallery_data = []

    if not PICTURES_DIR.exists():
        print(f"ERROR: Pictures folder not found at: {PICTURES_DIR}")
        return

    meta_lookup = {}
    # 1. Load from image_metadata.json if available
    if METADATA_FILE.exists():
        try:
            with open(METADATA_FILE, 'r', encoding='utf-8') as f:
                meta_lookup.update(json.load(f))
        except Exception as e:
            print(f"Warning: Could not read metadata file {METADATA_FILE}: {e}")

    # 2. Harvest any existing rich metadata from galleryData.json to avoid overwriting
    if OUTPUT_FILE.exists():
        try:
            with open(OUTPUT_FILE, 'r', encoding='utf-8') as f:
                old_data = json.load(f)

                def harvest_meta(item):
                    if isinstance(item, dict):
                        if 'src' in item and (item.get('alt') or item.get('title')):
                            if item['src'] not in meta_lookup:
                                meta_lookup[item['src']] = {}
                                if item.get('alt'):
                                    meta_lookup[item['src']]['alt'] = item['alt']
                                if item.get('title'):
                                    meta_lookup[item['src']]['title'] = item['title']
                        for v in item.values():
                            if isinstance(v, list):
                                for child in v:
                                    harvest_meta(child)

                harvest_meta(old_data)
        except Exception as e:
            print(f"Warning: Could not read existing galleryData.json: {e}")

    print(f"Scanning folder structure starting from: {PICTURES_DIR}")

    # Level 1: Categories (e.g., Concerts, Portraits, Events, Travel)
    for category in sorted(os.listdir(PICTURES_DIR)):
        cat_path = PICTURES_DIR / category
        if not cat_path.is_dir():
            continue

        print(f"Category (L1): {category}")
        cat_data = {
            "title": category,
            "id": slugify(category),
            "subsections": []
        }

        # Level 2: Subsections / Projects / Events
        for subcat in sorted(os.listdir(cat_path)):
            sub_path = cat_path / subcat
            if not sub_path.is_dir():
                continue

            # Check if Level 2 directory contains subdirectories (Level 3)
            child_dirs = [d for d in sub_path.iterdir() if d.is_dir()]

            if child_dirs:
                # Level 3 scenario: Subcategories exist under Level 2 (e.g., Festival -> Band / Artist)
                print(f"  Subsection (L2 with L3 children): {subcat}")
                subcat_data = {
                    "title": subcat,
                    "id": slugify(subcat),
                    "subsections": []
                }

                for child_dir in sorted(child_dirs, key=lambda d: d.name):
                    print(f"    Sub-subsection (L3): {child_dir.name}")
                    images = get_images_in_dir(child_dir, meta_lookup)
                    if images:
                        subcat_data["subsections"].append({
                            "title": child_dir.name,
                            "id": slugify(child_dir.name),
                            "images": images
                        })

                if subcat_data["subsections"]:
                    cat_data["subsections"].append(subcat_data)
            else:
                # Level 2 scenario: Direct image collections under Level 2 (e.g., Portraits -> Studio Set)
                print(f"  Subsection (L2 with direct images): {subcat}")
                images = get_images_in_dir(sub_path, meta_lookup)
                if images:
                    cat_data["subsections"].append({
                        "title": subcat,
                        "id": slugify(subcat),
                        "images": images
                    })

        if cat_data["subsections"]:
            gallery_data.append(cat_data)

    ensure_unique_ids(gallery_data)

    # Save to output JSON file
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(gallery_data, f, ensure_ascii=False, indent=4)
    
    print(f"\nSuccess! Gallery data generated successfully at:\n{OUTPUT_FILE}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate responsive images and galleryData.json")
    parser.add_argument("--force", action="store_true", help="regenerate all responsive variants")
    FORCE = parser.parse_args().force
    print(f"AVIF output: {'enabled' if AVIF_AVAILABLE else 'unavailable -> WebP only'}")
    generate_gallery_json()