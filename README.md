# madovygabor.com — Multi-Domain Platform & Dev Environment

![Docker Compose](https://img.shields.io/badge/Docker_Compose-2496ED?logo=docker&logoColor=white)
![Nginx Alpine](https://img.shields.io/badge/Nginx-Alpine-009639?logo=nginx&logoColor=white)
![Cloudflare Pages](https://img.shields.io/badge/Cloudflare-Pages-F38020?logo=cloudflare&logoColor=white)
![Vanilla Web Standards](https://img.shields.io/badge/Vanilla-Web_Standards-F7DF1E?logo=javascript&logoColor=black)
![Python 3](https://img.shields.io/badge/Python-3-3776AB?logo=python&logoColor=white)

Monorepo for a multi-domain static platform: a photography client site, a central hub, and an engineering portfolio. It uses plain web standards, runs locally in a containerized Nginx, and deploys to Cloudflare Pages.

## Architecture & Topology

The repo manages three decoupled domains, each deployed independently:

| Domain | Purpose |
| --- | --- |
| `madovygabor.com` | Photography client portfolio (MG Captures) |
| `hub.madovygabor.com` | Central ecosystem entry portal |
| `dev.madovygabor.com` | Engineering portfolio & staging sandbox |

**Why the photography site is on the apex domain:** it is the client-facing, revenue-generating property. Hosting it on the root domain concentrates crawl authority and backlink equity in one place. It also matches local search intent (Galanta, Nové Zámky, Dunajská Streda) without the dilution a subdomain would cause.

```text
WebPage/
├── scripts/
│   └── indexnow_submit.py      # Automated IndexNow API search engine submission
│
└── WebPage/                    # Core web services & local runtime
    ├── dev/                    # dev.madovygabor.com
    ├── hub/                    # hub.madovygabor.com
    ├── photography/            # madovygabor.com (MG Captures)
    │   ├── hu/, sk/, en/       # Localized pages & services
    │   ├── pictures/           # WebP media assets
    │   ├── galleryData.json    # Compiled gallery manifest
    │   └── utils/
    │       └── generate_gallery.py  # Pillow-based gallery manifest generator
    ├── compose.yaml            # Local multi-tenant container orchestration
    └── nginx.conf              # Nginx virtual hosts & clean URL router
```

## Local Container Runtime (Docker & Nginx)

Purpose: test multi-domain routing and clean URLs locally, without third-party live servers.

- `compose.yaml` declares a single `nginx:alpine` service exposed on port 80.
- `nginx.conf` defines virtual hosts for `madovygabor.com`, `dev.localhost` and `hub.localhost`.
- Clean URLs use `try_files $uri $uri/ $uri.html =404;`, matching edge behavior.
- The `/` → `/hu/` 302 redirect is emulated locally.
- Sources are bind-mounted read-only (`:ro`), so saved changes show up immediately with no rebuild.
- Stateless compute: media assets are kept out of the image, so the container stays at ~23 MB.

```bash
docker compose up -d     # start
docker compose down      # stop
```

## Dynamic Gallery Engine & Flat-File Data Pipeline

### Database-Free Design

There is no PostgreSQL or SQL backend. A backend database would add latency, attack surface and maintenance. The gallery is instead driven by the filesystem and a generated JSON manifest. The result is fast, secure and needs no upkeep.

### Manifest Generation (`generate_gallery.py`)

A Python CLI tool that uses Pillow to:

- Scan the nested structure `pictures/portfolio/{Category}/{Album}/`.
- Extract each image's intrinsic dimensions and calculate its aspect ratio.
- Normalize filenames into clean alt text.
- Compile everything into `galleryData.json`.

### Client-Side Masonry (`galleryLoader.js`)

- Vanilla JavaScript fetches `galleryData.json` asynchronously.
- **Column balancing:** the loader tracks cumulative column heights and injects each next photo into the shortest column. This avoids unbalanced layouts and trailing gaps.
- **Native loading:** `loading="lazy"` and `decoding="async"` keep image work off the main thread and prevent jank.

## Frontend Performance & Standards

Pure HTML5, CSS3 (custom properties, Grid, Flexbox) and ES6+ JavaScript, with no runtime framework.

- **Images:** WebP assets. Hero images use `<link rel="preload">` with `fetchpriority="high"`.
- **Layout stability:** a measured CLS of 0.000. Aspect-ratio reservation and CSS skeleton shimmer placeholders reserve DOM space before assets load.
- **Semantic SEO:** a multilingual `hreflang` matrix (`hu`, `sk`, `en`) and JSON-LD schemas (`PhotographyBusiness`, `Service`, `FAQPage`).

## Python Tooling (`scripts/`)

| Script | Function |
| --- | --- |
| `generate_gallery.py` | Extracts gallery metadata and compiles the `galleryData.json` manifest. |
| `indexnow_submit.py` | Sends batch notifications to Bing, Seznam and Yandex via the IndexNow API. |

## Engineering Case Study: SEO Overhaul & Search Intent

### Problems

- The single-page structure stalled crawling.
- Broad service pages were penalized as thin content.
- Canonical conflicts (`/` vs `/hu/`) and legacy HTTP leaks appeared in Google Search Console.
- Unconstrained media delayed LCP.

### Solutions

- Modular, search-intent subpages for high-intent queries: yearbooks/proms, schools, events and portraits.
- Transparent upfront pricing (*"azonnali árakkal"* / *"s cenami"*), workflow schedules and localized FAQs.
- Cloudflare edge HTTPS enforcement, and disabling crawler-blocking options (Rocket Loader, Bot Fight Mode).

### Production Metrics

- Full indexation in under 24 hours.
- 14 core subpages indexed in Google Search Console.
- Page 1 ranking (average position 4.1) within 5 days for high-intent keywords.
- 11.1% organic CTR.
- Google Knowledge Graph entity binding (personal name, founder portrait and business).

## Production Deployment (Cloudflare Pages GitOps)

- Deployment is triggered automatically by `git push origin main`.
- **Multi-project setup:** Cloudflare Pages builds each directory (`photography`, `hub`, `dev`) independently and publishes it to its own subdomain.
- **Build-time pruning:** static files are published, while internal Python build utilities (`utils/generate_gallery.py`) are excluded from the edge deployment artifact.
- Edge rules and security headers are defined declaratively in `_redirects` and `_headers`.