# Gabriel Madový — Digital Platform Monorepo (madovygabor.work)

> **"Memories fade, photographs remain. My passion is capturing moments that last forever."**  
> — Gabriel Madový (*MG Captures*)

A production-grade, trilingual (`EN` / `HU` / `SK`) monorepo hosting the personal ecosystem of **Gabriel Madový** (Madový Gábor): an Information Security student at **VUT FEEC Brno**, Kotlin Multiplatform & Android/iOS developer, certified networking technician (**Cisco CCNA 3**), and professional event, concert, and portrait photographer operating **MG Captures**.

---

## 🎯 Codebase Purpose & Goals

1. **Dual Identity Architecture (The Lens & The Logic)**:
   - **The Hub (`/hub/`)**: Central entry portal linking two distinct professional disciplines under a cohesive dark-aesthetic design.
   - **The Lens (`/photography/`)**: Full-featured photography business and portfolio platform (*MG Captures*), offering high-end concert, festival, event, and portrait photography across Western Slovakia (Galanta, Nové Zámky, Dunajská Streda, Šaľa, Bratislava).
   - **The Logic (`/dev/`)**: Technical engineering portfolio showcasing Kotlin Multiplatform (KMP), Clean Architecture, Android/iOS development, Cisco enterprise networking, and IoT/industrial automation.

2. **Core Strategic Goals**:
   - **Unified Performance & Zero Runtime Overhead**: Pure vanilla HTML5, CSS3 design tokens, and modular JavaScript without heavy front-end framework overhead.
   - **Zero Layout Shift (CLS = 0) & Instant Perceived Performance**: Integrated custom skeleton loaders (`#skeleton`) matching exact CSS grid layouts, accompanied by smooth reveal animations (`IntersectionObserver`).
   - **SEO Dominance & Semantic Data Integrity**: JSON-LD schemas (`ProfilePage`, `PhotographyBusiness`, `Service`, `CollectionPage`), complete `hreflang` alternates across 3 locales, clean URL routing without `.html` extensions via `_redirects`, and automated search indexing via IndexNow.
   - **Deterministic Gallery Generation**: Automated asset discovery and metadata extraction via Python/Pillow (`generate_gallery.py`), compiling structured photo albums into `galleryData.json`.

---

## 📁 Repository Structure & Critical Files

```text
madovygabor.work/
├── WebPage/
│   ├── _headers                            # Cloudflare/Netlify caching headers & security rules
│   ├── _redirects                          # Canonical 301/200 clean URL routing & language defaults
│   ├── robots.txt                          # Crawler directives & multi-sitemap declarations
│   ├── sitemap.xml                         # Root Hub sitemap with hreflang alternate links
│   ├── c598e83667e74d088a59bdd1c8bfbc10.txt # Public IndexNow verification key
│   │
│   ├── hub/                                # Portal Module (The Lens & The Logic)
│   │   ├── en/index.html                   # English Hub landing
│   │   ├── hu/index.html                   # Hungarian Hub landing
│   │   ├── sk/index.html                   # Slovak Hub landing
│   │   ├── styles.css                      # Hub styling, CSS grid cards & code preview
│   │   └── script.js                       # Skeleton loader, scroll reveal & UI handlers
│   │
│   ├── photography/                        # MG Captures Photography Platform (The Lens)
│   │   ├── styles.css                      # Global photography design system (~80KB, tokens & components)
│   │   ├── script.js                       # Mobile drawer, skeleton manager, smooth scrolling
│   │   ├── galleryData.json                # Generated image database (dimensions, aspect ratios, titles)
│   │   ├── photo-sitemap.xml               # Photography module XML sitemap
│   │   ├── hu/, en/, sk/                   # Localized pages:
│   │   │   ├── index.html                  # Landing page (Hero, Philosophy, Bento Services, FAQ, Gallery preview)
│   │   │   ├── portfolio.html              # Dynamic masonry gallery with filter tabs & sidebar
│   │   │   ├── kontakt.html / contact.html # Contact & booking page with FormSubmit & reCAPTCHA
│   │   │   └── szolgáltatások / sluzby / services/ # Dedicated service landing pages:
│   │   │       ├── esemenyfotozas.html     # Event photography (Concerts, festivals, proms)
│   │   │       ├── tablofotozas.html       # Senior & class yearbook photography
│   │   │       └── portrefotozas.html      # Outdoor & personal portraits
│   │   ├── javaScript/
│   │   │   └── galleryLoader.js            # Client-side dynamic gallery renderer & filter engine
│   │   ├── pictures/                       # Optimized webp photo sets, avatars & icons
│   │   └── utils/
│   │       ├── generate_gallery.py         # Automated Pillow script generating galleryData.json
│   │       └── instructions.md             # Folder hierarchy convention rules for photo indexing
│   │
│   └── dev/                                # Software Engineering Portfolio (The Logic)
│       ├── styles.css                      # Bento grid system, terminal styles, JetBrains Mono tokens
│       ├── script.js                       # Skeleton loader & terminal interactions
│       ├── dev-sitemap.xml                 # Engineering portfolio sitemap
│       └── en/, hu/, sk/                   # Localized engineering pages:
│           ├── index.html                  # Profile, Bento grid, Mindset logs, Tech stacks, Terminal
│           ├── projects.html / projektek.html / projekty.html # Deep-dive development logs
│           └── contact.html / kontakt.html # Tech inquiries & secure communication channels
│
└── scripts/
    └── indexnow_submit.py                  # CLI automation pushing updated routes to IndexNow API
```

---

## 🎨 Visual Identity & Design System Tokens

The entire platform adheres to a disciplined **Industrial Dark / Editorial Glassmorphism** visual hierarchy.

### 1. Color Palette

| Token / Role | Hex Value | Intent & Usage |
| :--- | :--- | :--- |
| `--color-background` | `#121414` / `#000000` | Deep obsidian canvas; reduces eye fatigue |
| `--color-surface` | `#121414` / `#0a0a0a` | Baseline container surface |
| `--color-surface-container` | `#1e2020` / `#111111` | Bento cards, service modules, interactive components |
| `--color-primary` | `#92ccff` / `#38bdf8` | Photography brand cyan & accent links |
| `--color-primary-container`| `#3498db` | Selection highlight and primary CTAs |
| `--color-accent-purple` | `#8E44AD` / `#a855f7` | Engineering brand color (*The Logic* badge & glow) |
| `--color-on-background` | `#e3e2e2` / `#e2e2e2` | Primary typography high-contrast text |
| `--color-on-surface-variant`| `#bfc7d2` / `#a1a1aa` | Muted supporting copy & descriptions |
| `--color-neutral-800` | `#262626` | Subtle 1px structural hairline borders |
| `--color-neutral-950` | `#0a0a0a` | Deepest surface, navigation bar & footer |

### 2. Typography Hierarchy

- **Editorial Display (`--font-display` / `--font-editorial`)**: `'Instrument Serif', serif`  
  *Usage*: Hero headlines (`--text-display-xl: 80px`), philosophical quotes, section headers.
- **Modern Sans Interface (`--font-body` / `--font-sans`)**: `'Inter', sans-serif`  
  *Usage*: Body copy (`--text-body-md: 16px`, line-height `1.6`), navigation, interactive labels.
- **Technical Monospace (`--font-mono` / `--font-data-mono`)**: `'JetBrains Mono', monospace`  
  *Usage*: Log tags (`[LOG_01:EXEC]`), metadata specs, status badges, code previews, terminal emulation.

### 3. Layout & Component Standards

- **Standardized Container**: `max-width: 1400px; margin: 0 auto; padding: 0 clamp(20px, 4vw, 48px);`
- **Bento Grid System**: CSS Grid 12-column layouts (`col-span-8` + `col-span-4`) with `24px` gutter gaps.
- **Skeleton Synchronization**: Every interactive view implements an exact 1:1 skeleton mirror loaded before hydration, preventing layout shift.
- **Tactile Micro-interactions**: Hover scale transitions (`--transition-normal: 0.3s ease`), corner badge notches (`.btn-corner-tr`, `.btn-corner-bl`), and live availability pulse indicators (`.pulse-dot`).

---

## 🏷️ Real Content, Verified Entities & Terminology

*Nothing placeholder — all pulled directly from active schemas, templates, and data files:*

- **Identity**: Gabriel Madový (Madový Gábor)
- **Roles**:
  - Professional Concert, Festival, Event, & Portrait Photographer (*MG Captures*)
  - Information Security Student at *Vysoké učení technické v Brně* (VUT FEEC Brno)
  - Kotlin Multiplatform Engineer & Low-Voltage Electrotechnician
- **Verified Industry Credentials**:
  - `Cisco Certified CCNA 3` (Enterprise Networking, Switching & Security)
  - `§21 Certified Electrotechnician` (Security & Engineering Compliance)
  - `Bosch EPS Certified Fire Alarm Engineer`
  - `Infoprog National Data Processing Competition` — 1st Place Winner
  - `Nové Zámky City Award Recipient` (2x)
- **Primary Service Offerings & Locations**:
  - **Locations**: Galanta, Nové Zámky, Dunajská Streda, Šaľa, Bratislava, Dolné Saliby, Alsószeli.
  - **Services**:
    - *Event Photography* (Concerts, festivals, proms, night events in challenging low-light)
    - *Senior & Class Photography* (Tabló, graduation ceremonies, class albums)
    - *Outdoor & Personal Portraits* (Natural light, mobile studio flash)
    - *Real Estate & Interior* (Vacation cabins, commercial spaces, apartments)
- **Featured Client Work & Collaborations**:
  - *Hajómalom Fesztivál* (Delegation, Follow The Flow, Pogány Induló)
  - *AVA Thermalpark & AVA Night*
  - *Azahriah Puskás Aréna*
  - *AMTS (Automobil & Tuning Show)*
  - *AVA Chatka Motýlik Diakovce*
- **Software Projects**:
  - **MaturiMate Ecosystem**: KMP app for graduation preparation using SQLDelight, KaTeX, and MVI architecture.
  - **Employee & Security Auditor System**: Java Clean Architecture system with decoupled access control validation.
  - **Secure Communication Tool**: Python end-to-end encrypted messaging with custom handshake protocol.

---

## ⚙️ Core Data Structures & Operational Workflows

### 1. Photo Catalog Data Structure (`galleryData.json`)

The gallery is organized as a nested hierarchy generated from filesystem leaf nodes:

```json
[
  {
    "title": "Koncertek",
    "id": "koncertek",
    "subsections": [
      {
        "title": "Hajómalom fesztivál 25",
        "id": "hajomalom-fesztival-25",
        "images": [
          {
            "src": "pictures/portfolio/Koncertek/Hajómalom fesztivál 25/Delegation/img1.webp",
            "width": 6000,
            "height": 4000,
            "aspect_ratio": 1.5,
            "alt": "Hajómalom festival stage delegation"
          }
        ]
      }
    ]
  }
]
```

### 2. Gallery Automation Workflow

```bash
# Whenever new portfolio pictures are placed in pictures/portfolio/:
cd WebPage/photography/utils
python generate_gallery.py
# Scans dimensions & aspect ratios with Pillow, compiles galleryData.json
```

### 3. SEO Instant Indexing Workflow

```bash
# Submit all canonical multilingual URLs to IndexNow (Bing, Yandex, Seznam):
cd scripts
python indexnow_submit.py
```
