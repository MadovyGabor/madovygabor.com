import json
import os
import re
import sys
import unicodedata
from pathlib import Path
from PIL import Image

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


def slugify(text):
    """Creates a clean URL/HTML ID from accented folder names (e.g., 'Rendezvények' -> 'rendezvenyek')"""
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('utf-8')
    text = re.sub(r'[^\w\s-]', '', text).strip().lower()
    return re.sub(r'[-\s]+', '-', text)


def get_image_data(img_path, meta_lookup=None):
    """Reads image dimensions, calculates aspect ratio, and generates or retrieves localized alt/title metadata"""
    width, height, aspect_ratio = 0, 0, 1.5
    try:
        with Image.open(img_path) as img:
            width, height = img.size
            if height > 0:
                aspect_ratio = width / height
    except Exception as e:
        print(f"  Warning: Could not read image dimensions for {img_path.name}: {e}")
    
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
    
    for item in sorted(os.listdir(dir_path)):
        img_path = dir_path / item
        if img_path.is_file() and img_path.suffix.lower() in ('.jpg', '.jpeg', '.png', '.webp'):
            images.append(get_image_data(img_path, meta_lookup))
    return images


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

    # Save to output JSON file
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(gallery_data, f, ensure_ascii=False, indent=4)
    
    print(f"\nSuccess! Gallery data generated successfully at:\n{OUTPUT_FILE}")


if __name__ == "__main__":
    generate_gallery_json()