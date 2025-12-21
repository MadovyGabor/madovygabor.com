import os
import json
import unicodedata
import re
from PIL import Image

# Settings
PICTURES_DIR = "pictures/portfolio"
OUTPUT_FILE = "Photography/galleryData.json"

def slugify(text):
    """Creates an ID from accented folder names (e.g., 'Rendezvények' -> 'rendezvenyek')"""
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('utf-8')
    text = re.sub(r'[^\w\s-]', '', text).strip().lower()
    return re.sub(r'[-\s]+', '-', text)

def generate_gallery_json():
    gallery_data = []

    # Iterate through main categories (e.g., Portraits, Events)
    if not os.path.exists(PICTURES_DIR):
        print(f"ERROR: Folder not found: {PICTURES_DIR}")
        return

    for category in sorted(os.listdir(PICTURES_DIR)):
        cat_path = os.path.join(PICTURES_DIR, category)
        if os.path.isdir(cat_path):
            cat_data = {
                "title": category,
                "id": slugify(category),
                "subsections": []
            }

            # Iterate through subcategories (e.g., AMTS 25, My Portraits)
            for subcat in sorted(os.listdir(cat_path)):
                sub_path = os.path.join(cat_path, subcat)
                if os.path.isdir(sub_path):
                    images = []
                    # Collect images
                    for img in sorted(os.listdir(sub_path)):
                        if img.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                            # Relative path needed for the website (from root)
                            web_path = f"/pictures/portfolio/{category}/{subcat}/{img}"
                            
                            # Get image dimensions
                            img_full_path = os.path.join(sub_path, img)
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
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(gallery_data, f, ensure_ascii=False, indent=4)
    
    print(f"Success! List created: {OUTPUT_FILE}")

if __name__ == "__main__":
    generate_gallery_json()