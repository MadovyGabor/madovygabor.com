#!/usr/bin/env python3
"""
Domain replacement script for MG Captures Photography Platform.
Replaces 'madovygabor.work' with 'madovygabor.com' across all targeted files (.html, .xml, .txt, .json, .js).
"""

import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

OLD_DOMAIN = "madovygabor.work"
NEW_DOMAIN = "madovygabor.com"

TARGET_EXTENSIONS = ('.html', '.xml', '.txt', '.json', '.js')

WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
PHOTO_DIR = os.path.join(WORKSPACE_ROOT, 'WebPage', 'photography')

def scan_files(directory, extensions):
    matched_files = []
    for root, _, files in os.walk(directory):
        for file in files:
            if file.lower().endswith(extensions):
                matched_files.append(os.path.join(root, file))
    return sorted(matched_files)

def perform_replacement(dry_run=False):
    files = scan_files(PHOTO_DIR, TARGET_EXTENSIONS)
    modified_files = []
    total_replacements = 0

    print(f"=== Domain Replacement {'(DRY RUN)' if dry_run else ''} ===")
    print(f"Target Directory: {PHOTO_DIR}")
    print(f"Old Domain:       {OLD_DOMAIN}")
    print(f"New Domain:       {NEW_DOMAIN}")
    print(f"Scanning {len(files)} files with extensions {TARGET_EXTENSIONS}...\n")

    for filepath in files:
        rel_path = os.path.relpath(filepath, PHOTO_DIR).replace('\\', '/')
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            count = content.count(OLD_DOMAIN)
            if count > 0:
                total_replacements += count
                modified_files.append((rel_path, count))
                if not dry_run:
                    new_content = content.replace(OLD_DOMAIN, NEW_DOMAIN)
                    with open(filepath, 'w', encoding='utf-8', newline='') as f:
                        f.write(new_content)
                print(f"  [{'WOULD UPDATE' if dry_run else 'UPDATED'}] {rel_path}: {count} occurrences")
        except Exception as e:
            print(f"  [ERROR] {rel_path}: {e}")

    print("\n" + "="*50)
    action_verb = "Would update" if dry_run else "Successfully updated"
    print(f"{action_verb} {len(modified_files)} files ({total_replacements} total occurrences).")
    return modified_files, total_replacements

def verify_photography():
    files = scan_files(PHOTO_DIR, TARGET_EXTENSIONS)
    remaining_in_photo = []
    for filepath in files:
        rel_path = os.path.relpath(filepath, PHOTO_DIR).replace('\\', '/')
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            count = content.count(OLD_DOMAIN)
            if count > 0:
                remaining_in_photo.append((rel_path, count))
        except Exception as e:
            print(f"  [VERIFY ERROR] {rel_path}: {e}")
    return remaining_in_photo

def check_workspace_occurrences():
    occurrences = []
    for root, dirs, files in os.walk(WORKSPACE_ROOT):
        # Skip .git
        if '.git' in root:
            continue
        for file in files:
            filepath = os.path.join(root, file)
            try:
                with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                count = content.count(OLD_DOMAIN)
                if count > 0:
                    rel_path = os.path.relpath(filepath, WORKSPACE_ROOT).replace('\\', '/')
                    occurrences.append((rel_path, count))
            except Exception:
                pass
    return sorted(occurrences)

if __name__ == '__main__':
    dry_run = '--dry-run' in sys.argv
    modified, count = perform_replacement(dry_run=dry_run)

    if not dry_run:
        print("\n=== Post-Replacement Verification (WebPage/photography) ===")
        remaining = verify_photography()
        if not remaining:
            print("✅ ZERO occurrences of 'madovygabor.work' remain in WebPage/photography!")
        else:
            print(f"⚠️ Warning: Found {len(remaining)} files with remaining occurrences in photography:")
            for r, c in remaining:
                print(f"  {r}: {c}")

        print("\n=== Full Workspace Scan for remaining 'madovygabor.work' ===")
        all_remaining = check_workspace_occurrences()
        if not all_remaining:
            print("✅ ZERO occurrences remain in the entire workspace.")
        else:
            print(f"ℹ️ Found {sum(c for _, c in all_remaining)} occurrences in {len(all_remaining)} files outside/across workspace:")
            for r, c in all_remaining:
                print(f"  {r}: {c}")
