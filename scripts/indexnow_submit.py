#!/usr/bin/env python3
"""
IndexNow Submission Script — madovygabor.work
----------------------------------------------
Submits URLs to the IndexNow API (https://api.indexnow.org/indexnow)
for instant indexing by Bing, Yandex, and other IndexNow-compatible engines.

Usage:
    # Submit the default fallback URL list:
    python indexnow_submit.py

    # Submit a custom list of URLs at runtime:
    python indexnow_submit.py "https://madovygabor.work/en/" "https://madovygabor.work/hu/"

Dependencies:
    pip install requests
"""

import sys
import json
import logging
import requests

# ---------------------------------------------------------------------------
# Configuration — do NOT modify the key or keyLocation
# ---------------------------------------------------------------------------
HOST         = "madovygabor.work"
API_KEY      = "c598e83667e74d088a59bdd1c8bfbc10"
KEY_LOCATION = f"https://{HOST}/{API_KEY}.txt"
ENDPOINT     = "https://api.indexnow.org/indexnow"

# Fallback URL list — used when no CLI arguments are provided.
# Extend this list with every canonical URL on your site.
FALLBACK_URLS: list[str] = [
    "https://madovygabor.work/en/",
    "https://madovygabor.work/hu/",
    "https://madovygabor.work/sk/",
]

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
# Status-code handler map
# ---------------------------------------------------------------------------
STATUS_MESSAGES: dict[int, str] = {
    200: "✅  URLs already known — no further action needed.",
    202: "🚀  URLs accepted and queued for crawling.",
    400: "❌  Bad request — malformed payload or invalid URL(s). Check the urlList.",
    403: "🔒  Forbidden — key mismatch or keyLocation unreachable. Verify the verification file is live.",
    422: "⚠️   Unprocessable — URL(s) do not belong to the declared host.",
    429: "⏳  Rate limited — too many requests. Wait before retrying.",
}


def build_payload(url_list: list[str]) -> dict:
    """Construct the IndexNow JSON payload."""
    return {
        "host":        HOST,
        "key":         API_KEY,
        "keyLocation": KEY_LOCATION,
        "urlList":     url_list,
    }


def submit(url_list: list[str]) -> None:
    """Send the IndexNow POST request and log the outcome."""
    if not url_list:
        log.error("urlList is empty — nothing to submit.")
        sys.exit(1)

    # Validate all URLs belong to the declared host
    invalid = [u for u in url_list if not u.startswith(f"https://{HOST}")]
    if invalid:
        log.error("The following URL(s) do not belong to '%s' and will be rejected:\n  %s",
                  HOST, "\n  ".join(invalid))
        sys.exit(1)

    payload = build_payload(url_list)

    log.info("Submitting %d URL(s) to IndexNow…", len(url_list))
    log.info("Endpoint   : %s", ENDPOINT)
    log.info("Host       : %s", HOST)
    log.info("KeyLocation: %s", KEY_LOCATION)
    log.info("URLs       :\n  %s", "\n  ".join(url_list))

    try:
        response = requests.post(
            ENDPOINT,
            headers={"Content-Type": "application/json; charset=utf-8"},
            data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
            timeout=15,
        )
    except requests.exceptions.ConnectionError as exc:
        log.error("Network error — could not reach %s: %s", ENDPOINT, exc)
        sys.exit(2)
    except requests.exceptions.Timeout:
        log.error("Request timed out after 15 s. Try again later.")
        sys.exit(2)
    except requests.exceptions.RequestException as exc:
        log.error("Unexpected request error: %s", exc)
        sys.exit(2)

    status = response.status_code
    message = STATUS_MESSAGES.get(status, f"⚠️   Unexpected HTTP {status} — {response.text[:200]}")

    log.info("HTTP %d  →  %s", status, message)

    # Surface the raw response body for non-success codes
    if status not in (200, 202):
        body = response.text.strip()
        if body:
            log.debug("Response body: %s", body)
        sys.exit(1 if status >= 400 else 0)


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    # Accept URLs as CLI arguments; fall back to the hardcoded list.
    url_list = sys.argv[1:] if len(sys.argv) > 1 else FALLBACK_URLS
    submit(url_list)
