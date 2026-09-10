import os
import sys
import json
import re
from html.parser import HTMLParser
from urllib.parse import urlparse

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
PHOTO_DIR = os.path.join(WORKSPACE_ROOT, 'WebPage', 'photography')
GALLERY_DATA_PATH = os.path.join(PHOTO_DIR, 'galleryData.json')
ROBOTS_TXT_PATH = os.path.join(PHOTO_DIR, 'robots.txt')

class PageAudit(HTMLParser):
    def __init__(self, filepath, content):
        super().__init__()
        self.filepath = filepath
        self.rel_path = os.path.relpath(filepath, PHOTO_DIR).replace('\\', '/')
        self.content = content
        self.lines = content.splitlines()

        self.title = None
        self.title_line = None
        self._in_title = False
        self._title_chunks = []

        self.meta_desc = None
        self.meta_desc_line = None

        self.meta_keywords = [] # (line, content)
        self.robots = None
        self.robots_line = None

        self.canonical = None
        self.canonical_line = None

        self.hreflangs = {} # hreflang -> (href, line)

        self.og_tags = {} # property -> (content, line)

        self.jsonld_blocks = [] # (line, parsed_obj_or_err, raw_text)
        self._in_jsonld = False
        self._jsonld_line = None
        self._jsonld_chunks = []

        self.images = [] # (src, has_alt, alt_val, line)

        self.headings = [] # (level, text, line)
        self._curr_heading = None
        self._curr_heading_line = None
        self._curr_heading_chunks = []

        self.feed(content)

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        line, col = self.getpos()

        if tag == 'title':
            self._in_title = True
            self.title_line = line
            self._title_chunks = []
        elif tag == 'meta':
            name = (attrs_dict.get('name') or '').strip().lower()
            prop = (attrs_dict.get('property') or '').strip().lower()
            content = attrs_dict.get('content', '')

            if name == 'description':
                self.meta_desc = content
                self.meta_desc_line = line
            elif name == 'keywords':
                self.meta_keywords.append((line, content))
            elif name == 'robots':
                self.robots = content
                self.robots_line = line

            if prop.startswith('og:'):
                self.og_tags[prop] = (content, line)
        elif tag == 'link':
            rel = (attrs_dict.get('rel') or '').strip().lower()
            href = (attrs_dict.get('href') or '').strip()
            if 'canonical' in rel:
                self.canonical = href
                self.canonical_line = line
            if 'alternate' in rel and 'hreflang' in attrs_dict:
                self.hreflangs[attrs_dict['hreflang'].strip()] = (href, line)
        elif tag == 'script':
            script_type = (attrs_dict.get('type') or '').strip().lower()
            if script_type == 'application/ld+json':
                self._in_jsonld = True
                self._jsonld_line = line
                self._jsonld_chunks = []
        elif tag == 'img':
            src = attrs_dict.get('src', '')
            has_alt = 'alt' in attrs_dict
            alt_val = attrs_dict.get('alt', '')
            self.images.append((src, has_alt, alt_val, line))
        elif re.match(r'^h[1-6]$', tag):
            self._curr_heading = int(tag[1])
            self._curr_heading_line = line
            self._curr_heading_chunks = []

    def handle_endtag(self, tag):
        if tag == 'title':
            self._in_title = False
            self.title = "".join(self._title_chunks).strip()
        elif tag == 'script' and self._in_jsonld:
            self._in_jsonld = False
            raw = "".join(self._jsonld_chunks)
            try:
                parsed = json.loads(raw)
                self.jsonld_blocks.append((self._jsonld_line, parsed, raw))
            except Exception as e:
                self.jsonld_blocks.append((self._jsonld_line, f"JSON_ERROR: {e}", raw))
        elif re.match(r'^h[1-6]$', tag) and self._curr_heading:
            text = "".join(self._curr_heading_chunks).strip()
            self.headings.append((self._curr_heading, text, self._curr_heading_line))
            self._curr_heading = None

    def handle_data(self, data):
        if self._in_title:
            self._title_chunks.append(data)
        elif self._in_jsonld:
            self._jsonld_chunks.append(data)
        elif self._curr_heading:
            self._curr_heading_chunks.append(data)

def run_audit():
    html_files = []
    for root, _, files in os.walk(PHOTO_DIR):
        for f in files:
            if f.endswith('.html'):
                html_files.append(os.path.join(root, f))
    html_files.sort()

    pages = {}
    for p in html_files:
        with open(p, 'r', encoding='utf-8') as f:
            content = f.read()
        page = PageAudit(p, content)
        pages[page.rel_path] = page

    issues = []
    stats = {
        'total_pages': len(pages),
        'html_images': 0,
        'gallery_images': 0,
        'jsonld_blocks': 0,
        'criteria_status': {
            '1_meta_head': {'checked': 0, 'passed': 0, 'failed': 0},
            '2_open_graph': {'checked': 0, 'passed': 0, 'failed': 0},
            '3_schema_jsonld': {'checked': 0, 'passed': 0, 'failed': 0},
            '4_images_alts': {'checked': 0, 'passed': 0, 'failed': 0},
            '5_heading_hierarchy': {'checked': 0, 'passed': 0, 'failed': 0},
            '6_crawlability_robots': {'checked': 0, 'passed': 0, 'failed': 0}
        }
    }

    # 1. Meta Tags and <head> Consistency
    for rel, page in pages.items():
        crit = '1_meta_head'
        stats['criteria_status'][crit]['checked'] += 1
        page_ok = True

        # Title presence & branding
        if not page.title:
            issues.append((rel, page.title_line or 1, 'Criterion 1', 'Missing <title> tag'))
            page_ok = False
        else:
            has_proper_branding = ('MG Captures | Madový Gábor' in page.title) or ('MG Captures | Gabriel Madový' in page.title)
            if not has_proper_branding:
                issues.append((rel, page.title_line, 'Criterion 1', f'Title lacks proper branding: "{page.title}"'))
                page_ok = False

        # Description
        if not page.meta_desc:
            issues.append((rel, page.meta_desc_line or 1, 'Criterion 1', 'Missing <meta name="description"> tag'))
            page_ok = False

        # Canonical
        if not page.canonical:
            issues.append((rel, page.canonical_line or 1, 'Criterion 1', 'Missing canonical <link>'))
            page_ok = False
        else:
            if not page.canonical.startswith('https://madovygabor.com/'):
                issues.append((rel, page.canonical_line, 'Criterion 1', f'Canonical URL does not point to https://madovygabor.com/: "{page.canonical}"'))
                page_ok = False

        # Hreflang
        required_hls = {'hu', 'sk', 'en', 'x-default'}
        present_hls = set(page.hreflangs.keys())
        if not required_hls.issubset(present_hls):
            missing = required_hls - present_hls
            issues.append((rel, 1, 'Criterion 1', f'Missing required hreflang tags: {missing}'))
            page_ok = False
        for hl, (href, line) in page.hreflangs.items():
            parsed_href = urlparse(href).path
            target_rel = parsed_href.strip('/')
            candidates = [
                target_rel + '.html',
                os.path.join(target_rel, 'index.html').replace('\\', '/'),
                target_rel
            ]
            found = any(os.path.exists(os.path.join(PHOTO_DIR, c)) for c in candidates)
            if not found:
                issues.append((rel, line, 'Criterion 1', f'Hreflang "{hl}" href "{href}" leads to dead link (not found on disk)'))
                page_ok = False

        # Keywords
        if page.meta_keywords:
            for line, kw in page.meta_keywords:
                issues.append((rel, line, 'Criterion 1', f'Obsolete <meta name="keywords"> tag found: "{kw}"'))
                page_ok = False

        if page_ok:
            stats['criteria_status'][crit]['passed'] += 1
        else:
            stats['criteria_status'][crit]['failed'] += 1

    # 2. Open Graph & Social Sharing Data
    for rel, page in pages.items():
        crit = '2_open_graph'
        stats['criteria_status'][crit]['checked'] += 1
        page_ok = True

        required_og = ['og:title', 'og:description', 'og:url', 'og:image', 'og:locale']
        for og_prop in required_og:
            if og_prop not in page.og_tags:
                issues.append((rel, 1, 'Criterion 2', f'Missing Open Graph property: {og_prop}'))
                page_ok = False
            else:
                content, line = page.og_tags[og_prop]
                if og_prop == 'og:locale':
                    expected_locale = 'hu_HU' if rel.startswith('hu/') else ('sk_SK' if rel.startswith('sk/') else 'en_US')
                    if content != expected_locale:
                        issues.append((rel, line, 'Criterion 2', f'og:locale is "{content}", expected "{expected_locale}"'))
                        page_ok = False
                elif og_prop == 'og:image':
                    parsed = urlparse(content)
                    image_path = parsed.path.lstrip('/')
                    local_img_path = os.path.join(PHOTO_DIR, image_path)
                    if not os.path.exists(local_img_path):
                        local_img_rel = os.path.normpath(os.path.join(os.path.dirname(page.filepath), content))
                        if not os.path.exists(local_img_rel):
                            issues.append((rel, line, 'Criterion 2', f'og:image asset not found on disk: "{content}"'))
                            page_ok = False

        if page_ok:
            stats['criteria_status'][crit]['passed'] += 1
        else:
            stats['criteria_status'][crit]['failed'] += 1

    # 3. Structured Data (Schema.org JSON-LD)
    for rel, page in pages.items():
        crit = '3_schema_jsonld'
        stats['criteria_status'][crit]['checked'] += 1
        stats['jsonld_blocks'] += len(page.jsonld_blocks)
        page_ok = True

        is_thankyou = rel.endswith('thankYou.html')
        if is_thankyou:
            # Utility conversion page, no rich snippet schema required
            stats['criteria_status'][crit]['passed'] += 1
            continue

        all_types = []
        for line, parsed, raw in page.jsonld_blocks:
            if isinstance(parsed, str) and parsed.startswith('JSON_ERROR'):
                issues.append((rel, line, 'Criterion 3', f'JSON-LD syntax error: {parsed}'))
                page_ok = False
                continue
            def extract_types(obj):
                t_list = []
                if isinstance(obj, dict):
                    if '@type' in obj:
                        t = obj['@type']
                        if isinstance(t, list):
                            t_list.extend(t)
                        else:
                            t_list.append(t)
                    for v in obj.values():
                        t_list.extend(extract_types(v))
                elif isinstance(obj, list):
                    for item in obj:
                        t_list.extend(extract_types(item))
                return t_list
            all_types.extend(extract_types(parsed))

        if rel in ['hu/index.html', 'sk/index.html', 'en/index.html']:
            if 'PhotographyBusiness' not in all_types:
                issues.append((rel, 1, 'Criterion 3', 'Homepage missing "PhotographyBusiness" schema'))
                page_ok = False
        elif '/szolgaltatasok/' in rel or '/sluzby/' in rel or '/services/' in rel:
            if 'Service' not in all_types:
                issues.append((rel, 1, 'Criterion 3', 'Service page missing "Service" schema'))
                page_ok = False
            if 'FAQPage' not in all_types:
                issues.append((rel, 1, 'Criterion 3', 'Service page missing "FAQPage" schema'))
                page_ok = False
        elif 'portfolio.html' in rel:
            if 'CollectionPage' not in all_types:
                issues.append((rel, 1, 'Criterion 3', 'Portfolio page missing "CollectionPage" schema'))
                page_ok = False
            if 'BreadcrumbList' not in all_types:
                issues.append((rel, 1, 'Criterion 3', 'Portfolio page missing "BreadcrumbList" schema'))
                page_ok = False
        elif 'kontakt.html' in rel or 'contact.html' in rel:
            if 'ContactPage' not in all_types:
                issues.append((rel, 1, 'Criterion 3', 'Contact page missing "ContactPage" schema'))
                page_ok = False
            if 'BreadcrumbList' not in all_types:
                issues.append((rel, 1, 'Criterion 3', 'Contact page missing "BreadcrumbList" schema'))
                page_ok = False

        if page_ok:
            stats['criteria_status'][crit]['passed'] += 1
        else:
            stats['criteria_status'][crit]['failed'] += 1

    # 4. Images and Alt Attributes
    crit = '4_images_alts'
    stats['criteria_status'][crit]['checked'] = 1
    crit4_ok = True

    for rel, page in pages.items():
        stats['html_images'] += len(page.images)
        for src, has_alt, alt_val, line in page.images:
            if not has_alt or not alt_val or alt_val.strip() == '':
                issues.append((rel, line, 'Criterion 4', f'<img> tag missing or empty alt attribute (src="{src}")'))
                crit4_ok = False
            if not src.startswith('http') and not src.startswith('data:'):
                disk_path = os.path.normpath(os.path.join(os.path.dirname(page.filepath), src.split('?')[0].split('#')[0]))
                if not os.path.exists(disk_path):
                    issues.append((rel, line, 'Criterion 4', f'<img> tag references non-existent file on disk: src="{src}"'))
                    crit4_ok = False

    # Check galleryData.json
    with open(GALLERY_DATA_PATH, 'r', encoding='utf-8') as f:
        gallery_data = json.load(f)

    gallery_count = 0
    def check_gallery(items, path_history=""):
        nonlocal gallery_count, crit4_ok
        if isinstance(items, list):
            for idx, it in enumerate(items):
                check_gallery(it, f"{path_history}[{idx}]")
        elif isinstance(items, dict):
            if 'src' in items:
                gallery_count += 1
                src = items['src']
                alt = items.get('alt')
                disk_path = os.path.join(PHOTO_DIR, src)
                if not os.path.exists(disk_path):
                    issues.append(('galleryData.json', 1, 'Criterion 4', f'galleryData.json image not found on disk: {src} at {path_history}'))
                    crit4_ok = False
                if not alt:
                    issues.append(('galleryData.json', 1, 'Criterion 4', f'galleryData.json image missing alt attribute: {src} at {path_history}'))
                    crit4_ok = False
                elif isinstance(alt, dict):
                    for lang in ['hu', 'sk', 'en']:
                        if not alt.get(lang):
                            issues.append(('galleryData.json', 1, 'Criterion 4', f'galleryData.json image missing "{lang}" alt translation: {src} at {path_history}'))
                            crit4_ok = False
                elif isinstance(alt, str):
                    if not alt.strip():
                        issues.append(('galleryData.json', 1, 'Criterion 4', f'galleryData.json image has empty alt string: {src} at {path_history}'))
                        crit4_ok = False
            for k, v in items.items():
                if isinstance(v, (list, dict)):
                    check_gallery(v, f"{path_history}.{k}")

    check_gallery(gallery_data)
    stats['gallery_images'] = gallery_count

    if crit4_ok:
        stats['criteria_status'][crit]['passed'] = 1
    else:
        stats['criteria_status'][crit]['failed'] = 1

    # 5. Heading Hierarchy
    for rel, page in pages.items():
        crit = '5_heading_hierarchy'
        stats['criteria_status'][crit]['checked'] += 1
        page_ok = True

        h1s = [h for h in page.headings if h[0] == 1]
        if len(h1s) == 0:
            issues.append((rel, 1, 'Criterion 5', 'Page has no <h1> tag'))
            page_ok = False
        elif len(h1s) > 1:
            h1_lines = [str(h[2]) for h in h1s]
            issues.append((rel, h1s[1][2], 'Criterion 5', f'Page has multiple <h1> tags (found {len(h1s)} at lines {", ".join(h1_lines)})'))
            page_ok = False
        
        prev_level = 0
        for lvl, text, line in page.headings:
            if prev_level > 0 and lvl > prev_level + 1:
                issues.append((rel, line, 'Criterion 5', f'Skipped heading level from h{prev_level} directly to h{lvl}: "{text}"'))
                page_ok = False
            prev_level = lvl

        if page_ok:
            stats['criteria_status'][crit]['passed'] += 1
        else:
            stats['criteria_status'][crit]['failed'] += 1

    # 6. Crawlability & robots.txt Check
    crit = '6_crawlability_robots'
    stats['criteria_status'][crit]['checked'] = 1
    if not os.path.exists(ROBOTS_TXT_PATH):
        issues.append(('robots.txt', 1, 'Criterion 6', 'robots.txt file is missing'))
        stats['criteria_status'][crit]['failed'] = 1
    else:
        with open(ROBOTS_TXT_PATH, 'r', encoding='utf-8') as f:
            robots_content = f.read()
        if re.search(r'^\s*Disallow:\s*/\s*$', robots_content, re.MULTILINE):
            issues.append(('robots.txt', 1, 'Criterion 6', 'robots.txt blocks all crawlers with "Disallow: /"'))
            stats['criteria_status'][crit]['failed'] = 1
        else:
            stats['criteria_status'][crit]['passed'] = 1

    return pages, issues, stats

if __name__ == '__main__':
    pages, issues, stats = run_audit()
    print("=" * 70)
    print("      MG CAPTURES — AUTOMATED SEO & TECHNICAL INTEGRITY AUDIT")
    print("=" * 70)
    print(f"Directory Scanned    : {PHOTO_DIR}")
    print(f"Total HTML Pages     : {stats['total_pages']}")
    print(f"Total HTML <img> Tags: {stats['html_images']}")
    print(f"Total Gallery Images : {stats['gallery_images']}")
    print(f"Total JSON-LD Blocks : {stats['jsonld_blocks']}")
    print("-" * 70)
    print("CRITERIA STATUS BREAKDOWN:")
    for crit_key, crit_res in stats['criteria_status'].items():
        status_str = "PASS [OK]" if crit_res['failed'] == 0 else f"FAIL ({crit_res['failed']} errors)"
        print(f"  * {crit_key:<25}: {status_str} (Checked: {crit_res['checked']})")
    print("-" * 70)
    print(f"TOTAL DISCREPANCIES / ISSUES: {len(issues)}")
    print("=" * 70)

    if not issues:
        print("\nSUCCESS: All SEO and technical integrity checks passed cleanly!")
        print("CONFIRMATION: The site is fully compliant and READY FOR DEPLOYMENT.\n")
    else:
        print(f"\nDISCREPANCY LIST ({len(issues)} items):")
        for file, line, crit, desc in issues:
            print(f"  [{crit}] {file}:{line} -> {desc}")
        print("\nPlease resolve the above issues before deployment.\n")
