#!/usr/bin/env python3
"""
IndexNow Multi-Host Submission Script
======================================
Submits URLs across multiple hosts/subdomains to the IndexNow API.
Groups URLs by host, then fires one POST per distinct host — as required
by the IndexNow specification.

Supported hosts:
    madovygabor.work          → https://madovygabor.work/c598e83667e74d088a59bdd1c8bfbc10.txt
    photo.madovygabor.work    → https://photo.madovygabor.work/c598e83667e74d088a59bdd1c8bfbc10.txt
    dev.madovygabor.work      → https://dev.madovygabor.work/c598e83667e74d088a59bdd1c8bfbc10.txt

Usage:
    # Submit all default URLs (main + photo domains):
    python indexnow_submit.py

    # Submit specific URLs (mixed hosts accepted, batching is automatic):
    python indexnow_submit.py "https://madovygabor.work/en/" "https://photo.madovygabor.work/en/"

    # Submit only photo-domain URLs:
    python indexnow_submit.py "https://photo.madovygabor.work/hu/" "https://photo.madovygabor.work/sk/"

Dependencies:
    pip install requests
"""

import sys
import json
import logging
from collections import defaultdict
from urllib.parse import urlparse

import requests

# ---------------------------------------------------------------------------
# Shared configuration
# ---------------------------------------------------------------------------
API_KEY  = "c598e83667e74d088a59bdd1c8bfbc10"
ENDPOINT = "https://api.indexnow.org/indexnow"

# Registry: host → keyLocation
# Add future subdomains here — no other code changes required.
HOST_REGISTRY: dict[str, str] = {
    "madovygabor.work":       f"https://madovygabor.work/{API_KEY}.txt",
    "photo.madovygabor.work": f"https://photo.madovygabor.work/{API_KEY}.txt",
    "dev.madovygabor.work":   f"https://dev.madovygabor.work/{API_KEY}.txt",
}

# Default URL list — used when no CLI arguments are provided.
# Covers all canonical URLs across both hosts.
FALLBACK_URLS: list[str] = [
    # Main domain
    "https://madovygabor.work/en/",
    "https://madovygabor.work/hu/",
    "https://madovygabor.work/sk/",
    # Photo subdomain
    "https://photo.madovygabor.work/en/",
    "https://photo.madovygabor.work/hu/",
    "https://photo.madovygabor.work/sk/",
    "https://photo.madovygabor.work/en/portfolio",
    "https://photo.madovygabor.work/hu/portfolio",
    "https://photo.madovygabor.work/sk/portfolio",
    "https://photo.madovygabor.work/en/contact",
    "https://photo.madovygabor.work/hu/kontakt",
    "https://photo.madovygabor.work/sk/kontakt",
    # Dev subdomain
    "https://dev.madovygabor.work/en/",
    "https://dev.madovygabor.work/hu/",
    "https://dev.madovygabor.work/sk/",
    "https://dev.madovygabor.work/en/projects",
    "https://dev.madovygabor.work/hu/projektek",
    "https://dev.madovygabor.work/sk/projekty",
    "https://dev.madovygabor.work/en/contact",
    "https://dev.madovygabor.work/hu/kontakt",
    "https://dev.madovygabor.work/sk/kontakt",
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
        response = requests.post(
            ENDPOINT,
            headers={"Content-Type": "application/json; charset=utf-8"},
            data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
            timeout=15,
        )
    except requests.exceptions.ConnectionError as exc:
        log.error("Network error reaching %s: %s", ENDPOINT, exc)
        return 0
    except requests.exceptions.Timeout:
        log.error("Request timed out after 15 s.")
        return 0
    except requests.exceptions.RequestException as exc:
        log.error("Unexpected request error: %s", exc)
        return 0

    status = response.status_code
    message = STATUS_MESSAGES.get(status, f"⚠️  Unexpected HTTP {status} — {response.text[:200]}")
    log.info("HTTP %d  →  %s", status, message)

    if status not in (200, 202) and response.text.strip():
        log.debug("Response body: %s", response.text.strip())

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
