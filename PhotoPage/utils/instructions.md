# MG Captures — Portfolio Gallery Generator Guide

This directory contains the Python script (`generate_gallery.py`) designed to scan your portfolio pictures, extract metadata (dimensions & aspect ratio), and generate the database file (`galleryData.json`) utilized by the web page.

---

## 📂 Folder Structure Conventions

To ensure the portfolio page displays categories, sections, and images correctly, the image folders inside `pictures/portfolio/` must follow a structured hierarchy. The script supports both **2-level** and **3-level** nesting structures.

### Option A: 2-Level Nesting (Default)
Use this structure when a category is directly divided into single events, sets, or themes.
```text
pictures/
└── portfolio/
    ├── Portrék/                         <-- Level 1: Category Name
    │   └── Portréim/                    <-- Level 2: Subsection Name
    │       ├── Picture 1.webp           <-- Image Files
    │       └── Picture 2.webp
    └── Travel/
        ├── Brno/
        │   └── image1.jpg
        └── Tatranská Lomnica/
            └── image2.jpg
```

### Option B: 3-Level Nesting (Nested Subsections)
Use this structure when a subsection needs to be further divided (for example, groups or bands performing at a festival).
```text
pictures/
└── portfolio/
    └── Koncertek/                       <-- Level 1: Category Name
        └── Hajómalom fesztivál 25/      <-- Level 2: Subsection Name
            ├── Delegation/              <-- Level 3: Sub-subsection Name
            │   ├── img1.webp            <-- Image Files
            │   └── img2.webp
            └── Follow The Flow/
                ├── img1.webp
                └── img2.webp
```

### ⚠️ Crucial Rules for Folder Organization
1. **Accented Folder Names**: You can name folders using normal accented characters (e.g. `Rendezvények`, `Portrék`). The generator automatically normalizes them into clean HTML anchors and slugs (e.g. `rendezvenyek`, `portrek`).
2. **File Placement**: Images must **only** reside in the leaf folders (the deepest folder in the chain). Do not put images in a Level 2 folder if it contains Level 3 folders, as they will be ignored.
3. **Supported Formats**: The script indexes images with `.jpg`, `.jpeg`, `.png`, and `.webp` extensions.
4. **Ordering**: Folders and images are sorted alphabetically. To customize the ordering, prefix your folder or image names with numbers (e.g. `01_Delegation`, `02_Follow The Flow` or `01_intro.webp`, `02_main.webp`).

---

## ⚙️ Prerequisites & Setup

The script runs on Python 3 and requires the **Pillow** library to read image metadata.

1. Ensure Python 3 is installed on your computer.
2. Install the Pillow package via your terminal/command prompt:
   ```bash
   pip install Pillow
   ```

---

## 🚀 Running the Generator

Whenever you add, delete, rename, or reorganize images/folders on disk, you must regenerate the JSON file for the website to display the changes:

1. Open your terminal or Command Prompt.
2. Navigate to the `PhotoPage/utils/` folder.
3. Run the generator script:
   ```bash
   python generate_gallery.py
   ```

Upon completion, a success message will display, and the `galleryData.json` database file will be updated in the `PhotoPage/utils/` folder.

---

## 🌐 Integration with the Web Page

- The portfolio page (`temp_portfolio.html` / `portfolio.html`) loads the script `javaScript/temp_galleryLoader.js`.
- The JavaScript fetches the database file from `utils/galleryData.json` at runtime.
- The sidebar navigation, filter tabs, masonry grid, image headers, and photo aspect ratios are all dynamically built based on this JSON structure.
