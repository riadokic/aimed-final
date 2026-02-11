"""
Test the AIMED n8n webhook with a sample audio file.

Usage:
  python tools/test_webhook.py <audio_file> [webhook_url]

Examples:
  python tools/test_webhook.py test_audio.webm
  python tools/test_webhook.py test_audio.webm https://your-n8n.com/webhook/AIMED

If webhook_url is not provided, reads from .env file (AIMED_WEBHOOK_URL).
"""

import sys
import os
import json
import time
import requests
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()


def get_webhook_url(override: str | None = None) -> str:
    if override:
        return override
    url = os.getenv("AIMED_WEBHOOK_URL")
    if not url:
        print("ERROR: No webhook URL provided.")
        print("Either pass it as an argument or set AIMED_WEBHOOK_URL in .env")
        sys.exit(1)
    return url


def test_webhook(audio_path: str, webhook_url: str) -> dict:
    path = Path(audio_path)
    if not path.exists():
        print(f"ERROR: File not found: {audio_path}")
        sys.exit(1)

    file_size = path.stat().st_size
    print(f"File: {path.name} ({file_size / 1024:.1f} KB)")
    print(f"URL:  {webhook_url}")
    print(f"Sending...")

    start = time.time()

    with open(path, "rb") as f:
        files = {"audio": (path.name, f, "audio/webm")}
        response = requests.post(webhook_url, files=files, timeout=120)

    elapsed = time.time() - start

    print(f"Status: {response.status_code} ({elapsed:.1f}s)")
    print("-" * 60)

    if response.status_code == 200:
        data = response.json()
        if data.get("success"):
            print("SUCCESS")
            print()
            print(data.get("report_text", "(no report_text)"))
        else:
            print("FAILED: success=false")
            print(json.dumps(data, indent=2, ensure_ascii=False))
    else:
        print(f"HTTP ERROR: {response.status_code}")
        print(response.text[:500])

    print("-" * 60)
    return {
        "status": response.status_code,
        "elapsed": elapsed,
        "success": response.status_code == 200 and response.json().get("success", False),
    }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    audio_file = sys.argv[1]
    url_override = sys.argv[2] if len(sys.argv) > 2 else None

    webhook_url = get_webhook_url(url_override)
    test_webhook(audio_file, webhook_url)
