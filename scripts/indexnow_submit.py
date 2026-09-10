#!/usr/bin/env python3
"""
IndexNow Submission Script
======================================
Submits URLs to the IndexNow API.
Groups URLs by host, then fires one POST per distinct host — as required
by the IndexNow specification.

Supported hosts:
    madovygabor.com       → https://madovygabor.com/0e96b4d576c4464d91227476fa0aec65.txt
    hub.madovygabor.com   → https://hub.madovygabor.com/0e96b4d576c4464d91227476fa0aec65.txt
    dev.madovygabor.com   → https://dev.madovygabor.com/0e96b4d576c4464d91227476fa0aec65.txt

Usage:
    # Submit all default URLs across all 3 domains:
    python indexnow_submit.py

    # Submit specific URLs:
    python indexnow_submit.py "https://madovygabor.com/en/" "https://dev.madovygabor.com/en/"

Dependencies:
    None (Standard Library only)
"""

import sys
import json
import logging
from collections import defaultdict
from urllib.parse import urlparse
import urllib.request
import urllib.error

# Configure stdout to use UTF-8 to prevent print encoding errors on Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# ---------------------------------------------------------------------------
# Shared configuration
# ---------------------------------------------------------------------------
API_KEY  = "0e96b4d576c4464d91227476fa0aec65"
ENDPOINT = "https://api.indexnow.org/indexnow"

# Registry: host → keyLocation
# Add future subdomains here — no other code changes required.
HOST_REGISTRY: dict[str, str] = {
    "madovygabor.com":       f"https://madovygabor.com/{API_KEY}.txt",
    "hub.madovygabor.com":   f"https://hub.madovygabor.com/{API_KEY}.txt",
    "dev.madovygabor.com":   f"https://dev.madovygabor.com/{API_KEY}.txt",
}

# Default URL list — used when no CLI arguments are provided.
# Covers all 33 canonical URLs across the unified hosts.
FALLBACK_URLS: list[str] = [
    # ─── Hub Domain (hub.madovygabor.com) ───────────────────────────
    "https://hub.madovygabor.com/hu/",
    "https://hub.madovygabor.com/sk/",
    "https://hub.madovygabor.com/en/",

    # ─── Photography Domain (madovygabor.com) ───────────────────────
    # Core pages
    "https://madovygabor.com/hu/",
    "https://madovygabor.com/sk/",
    "https://madovygabor.com/en/",
    "https://madovygabor.com/hu/portfolio",
    "https://madovygabor.com/sk/portfolio",
    "https://madovygabor.com/en/portfolio",
    "https://madovygabor.com/hu/kontakt",
    "https://madovygabor.com/sk/kontakt",
    "https://madovygabor.com/en/contact",
    # Service: Event Photography
    "https://madovygabor.com/hu/szolgaltatasok/esemenyfotozas",
    "https://madovygabor.com/sk/sluzby/eventove-fotenie",
    "https://madovygabor.com/en/services/event-photography",
    # Service: Yearbook Photography
    "https://madovygabor.com/hu/szolgaltatasok/tablofotozas",
    "https://madovygabor.com/sk/sluzby/tablove-fotenie",
    "https://madovygabor.com/en/services/yearbook-photography",
    # Service: School Photography
    "https://madovygabor.com/hu/szolgaltatasok/iskolafotozas",
    "https://madovygabor.com/sk/sluzby/skolske-fotenie",
    "https://madovygabor.com/en/services/school-photography",
    # Service: Outdoor Portraits
    "https://madovygabor.com/hu/szolgaltatasok/portrefotozas",
    "https://madovygabor.com/sk/sluzby/portretove-fotenie",
    "https://madovygabor.com/en/services/outdoor-portraits",

    # ─── Dev Domain (dev.madovygabor.com) ───────────────────────────
    "https://dev.madovygabor.com/hu/",
    "https://dev.madovygabor.com/sk/",
    "https://dev.madovygabor.com/en/",
    "https://dev.madovygabor.com/hu/projektek",
    "https://dev.madovygabor.com/sk/projekty",
    "https://dev.madovygabor.com/en/projects",
    "https://dev.madovygabor.com/hu/kontakt",
    "https://dev.madovygabor.com/sk/kontakt",
    "https://dev.madovygabor.com/en/contact",
]

# HTTP status messages
STATUS_MESSAGES: dict[int, str] = {
    200: "✅  Already known — no further action needed.",
    202: "🚀  Accepted and queued for crawling.",
    400: "❌  Bad request — malformed payload or invalid URL(s).",
    403: "🔒  Forbidden — key mismatch or keyLocation unreachable.",
    422: "⚠️   Unprocessable — URL(s) do not belong to the declared host.",
    429: "⏳  Rate limited — too many requests. Wait before retrying.",
}

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  [%(levelname)s]  %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Core logic
# ---------------------------------------------------------------------------

def group_by_host(url_list: list[str]) -> dict[str, list[str]]:
    """
    Parse each URL, resolve its host, validate it against the registry,
    and bucket it into a dict keyed by host.

    Raises SystemExit for unknown or malformed URLs.
    """
    buckets: dict[str, list[str]] = defaultdict(list)
    errors: list[str] = []

    for url in url_list:
        parsed = urlparse(url)
        host = parsed.netloc.lower()

        if not host:
            errors.append(f"  Unparseable URL (no host): {url!r}")
            continue

        if host not in HOST_REGISTRY:
            errors.append(
                f"  Unregistered host '{host}' in URL: {url!r}\n"
                f"  Registered hosts: {', '.join(HOST_REGISTRY)}"
            )
            continue

        buckets[host].append(url)

    if errors:
        log.error("Validation failed for %d URL(s):\n%s", len(errors), "\n".join(errors))
        sys.exit(1)

    return dict(buckets)


def submit_batch(host: str, url_list: list[str]) -> int:
    """
    Send one IndexNow POST request for a single host batch.
    Returns the HTTP status code (or 0 on network failure).
    """
    key_location = HOST_REGISTRY[host]
    payload = {
        "host":        host,
        "key":         API_KEY,
        "keyLocation": key_location,
        "urlList":     url_list,
    }

    log.info("─" * 60)
    log.info("Host       : %s", host)
    log.info("KeyLocation: %s", key_location)
    log.info("Submitting %d URL(s):\n  %s", len(url_list), "\n  ".join(url_list))

    try:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        req = urllib.request.Request(
            ENDPOINT,
            data=body,
            headers={"Content-Type": "application/json; charset=utf-8"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=15) as resp:
            status = resp.status
            resp_body = resp.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as exc:
        status = exc.code
        resp_body = exc.read().decode("utf-8", errors="replace")
    except urllib.error.URLError as exc:
        log.error("Network error reaching %s: %s", ENDPOINT, exc.reason)
        return 0
    except TimeoutError:
        log.error("Request timed out after 15 s.")
        return 0
    except Exception as exc:
        log.error("Unexpected request error: %s", exc)
        return 0

    message = STATUS_MESSAGES.get(status, f"⚠️  Unexpected HTTP {status} — {resp_body[:200]}")
    log.info("HTTP %d  →  %s", status, message)

    if status not in (200, 202) and resp_body.strip():
        log.debug("Response body: %s", resp_body.strip())

    return status


def run(url_list: list[str]) -> None:
    """Validate, group, and submit all URLs — one batch per host."""
    if not url_list:
        log.error("urlList is empty — nothing to submit.")
        sys.exit(1)

    buckets = group_by_host(url_list)

    log.info("Hosts to submit: %s", ", ".join(buckets))
    log.info("Total URLs     : %d across %d batch(es)", len(url_list), len(buckets))

    failed_hosts: list[str] = []

    for host, urls in buckets.items():
        status = submit_batch(host, urls)
        if status not in (200, 202):
            failed_hosts.append(host)

    log.info("─" * 60)
    if failed_hosts:
        log.error("Submission failed for host(s): %s", ", ".join(failed_hosts))
        sys.exit(1)
    else:
        log.info("All batches submitted successfully. ✅")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    url_list = sys.argv[1:] if len(sys.argv) > 1 else FALLBACK_URLS
    run(url_list)
