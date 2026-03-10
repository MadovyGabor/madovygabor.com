import json
import os
import re
import unicodedata
from pathlib import Path

from PIL import Image

# Settings
SCRIPT_DIR = Path(__file__).resolve().parent


def find_photo_page_dir():
    for candidate in (SCRIPT_DIR, SCRIPT_DIR.parent, SCRIPT_DIR.parent.parent):
        if (candidate / "pictures" / "portfolio").exists():
            return candidate
    return SCRIPT_DIR


PHOTO_PAGE_DIR = find_photo_page_dir()
PICTURES_DIR = PHOTO_PAGE_DIR / "pictures" / "portfolio"
OUTPUT_FILE = SCRIPT_DIR / "galleryData.json"

def slugify(text):
    """Creates an ID from accented folder names (e.g., 'Rendezvények' -> 'rendezvenyek')"""
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('utf-8')
    text = re.sub(r'[^\w\s-]', '', text).strip().lower()
    return re.sub(r'[-\s]+', '-', text)

def generate_gallery_json():
    gallery_data = []

    # Iterate through main categories (e.g., Portraits, Events)
    if not PICTURES_DIR.exists():
        print(f"ERROR: Folder not found: {PICTURES_DIR}")
        return

    for category in sorted(os.listdir(PICTURES_DIR)):
        cat_path = PICTURES_DIR / category
        if cat_path.is_dir():
            cat_data = {
                "title": category,
                "id": slugify(category),
                "subsections": []
            }

            # Iterate through subcategories (e.g., AMTS 25, My Portraits)
            for subcat in sorted(os.listdir(cat_path)):
                sub_path = cat_path / subcat
                if sub_path.is_dir():
                    images = []
                    # Collect images
                    for img in sorted(os.listdir(sub_path)):
                        if img.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                            img_full_path = sub_path / img
                            web_path = img_full_path.relative_to(PHOTO_PAGE_DIR).as_posix()

                            # Get image dimensions
                            width, height, aspect_ratio = 0, 0, 0
                            try:
                                with Image.open(img_full_path) as image:
                                    width, height = image.size
                                    if height > 0:
                                        aspect_ratio = width / height
                            except Exception as e:
                                print(f"Error reading image {img}: {e}")

                            images.append({
                                "src": web_path,
                                "width": width,
                                "height": height,
                                "aspect_ratio": aspect_ratio
                            })
                    
                    if images:
                        cat_data["subsections"].append({
                            "title": subcat,
                            "id": slugify(subcat),
                            "images": images
                        })
            
            if cat_data["subsections"]:
                gallery_data.append(cat_data)

    # Save JSON
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(gallery_data, f, ensure_ascii=False, indent=4)
    
    print(f"Success! List created: {OUTPUT_FILE}")

if __name__ == "__main__":
    generate_gallery_json()