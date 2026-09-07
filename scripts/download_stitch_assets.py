import urllib.request
import os
import re

output_dirs = [
    r"c:\Users\madov\Documents\Weboldal\WebPage\WebPage\photography\assets\stitch-temp",
    r"c:\Users\madov\Documents\Weboldal\WebPage\assets\stitch-temp"
]

for d in output_dirs:
    os.makedirs(d, exist_ok=True)

screenshot_url = "https://lh3.googleusercontent.com/aida/AEtjO1VCcViwO6CqedKNoiQSQA4vo2acMoTku9BwmAQB-nkpQ659BMA9zcivuS9ONOm2YNXXZK6Et0aOSD5sSAPZiM1hWjBn9g0pvI9MZyBKt8TuS0_8J_CR3LQTIbXFwq_zSheGsUj6vZ16otVto2dEBDdgmZbAHw3ioLWvDSANtlRW28CzLLurWNmormVw8AYZbwIYpz1KA_A5ucn5XGJ2B6tIe5urCNUDg3kCpu1R5snrln4q_EouJX-POek"
html_path = r"c:\Users\madov\Documents\Weboldal\WebPage\WebPage\photography\_staging_esemenyfotozas.html"

with open(html_path, "r", encoding="utf-8") as f:
    html_content = f.read()

img_matches = re.findall(r'src=["\']([^"\']+)["\']', html_content)
urls = [u for u in img_matches if "googleusercontent.com" in u or "contribution" in u]
unique_urls = list(dict.fromkeys(urls))

headers = {"User-Agent": "Mozilla/5.0"}

print("Downloading full Stitch screen preview screenshot...")
req = urllib.request.Request(screenshot_url, headers=headers)
with urllib.request.urlopen(req) as resp:
    data = resp.read()
    for d in output_dirs:
        with open(os.path.join(d, "screen_preview_full.png"), "wb") as f:
            f.write(data)
print(f"Saved screen_preview_full.png ({len(data)} bytes)")

for idx, url in enumerate(unique_urls, 1):
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as resp:
        data = resp.read()
        content_type = resp.headers.get("content-type", "")
        ext = ".jpg"
        if "png" in content_type:
            ext = ".png"
        elif "webp" in content_type:
            ext = ".webp"
        filename = f"mockup_asset_{idx}{ext}"
        for d in output_dirs:
            with open(os.path.join(d, filename), "wb") as f:
                f.write(data)
        print(f"Downloaded {filename} ({len(data)} bytes) from {url[:60]}...")

# Also copy _staging_esemenyfotozas.html to root and photography/hu/szolgaltatasok/ if needed
shutil_targets = [
    r"c:\Users\madov\Documents\Weboldal\WebPage\_staging_esemenyfotozas.html",
    r"c:\Users\madov\Documents\Weboldal\WebPage\WebPage\photography\hu\szolgaltatasok\_staging_esemenyfotozas.html"
]

import shutil
for target in shutil_targets:
    shutil.copyfile(html_path, target)
    print(f"Copied staging file to {target}")

print("Done!")
