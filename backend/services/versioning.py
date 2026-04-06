import json
import os
import re
from datetime import datetime

VERSION_LOG_PATH = "data/version_log.json"

def load_version_log() -> dict:
    if not os.path.exists(VERSION_LOG_PATH):
        return {}
    with open(VERSION_LOG_PATH) as f:
        return json.load(f)

def detect_document_version(doc_name: str) -> str:
    """Extract version number from filename or content"""
    patterns = [
        r'v(\d+(?:\.\d+)*)',
        r'version[\s_-]?(\d+(?:\.\d+)*)',
        r'_v(\d+)',
        r'(\d{4})(?:_|-)',
    ]
    for pattern in patterns:
        match = re.search(pattern, doc_name.lower())
        if match:
            return match.group(1)
    return "1.0"

def log_document_upload(doc_name: str, chunks: list, year: int = None):
    log = load_version_log()

    base_name = re.sub(r'_?v\d+.*$', '', doc_name.lower().replace('.pdf', ''))
    base_name = re.sub(r'_?\d{4}', '', base_name).strip('_- ')

    version = detect_document_version(doc_name)

    entry = {
        "doc_name": doc_name,
        "version": version,
        "year": year,
        "chunk_count": len(chunks),
        "uploaded_at": datetime.now().isoformat(),
        "key_numbers": extract_key_numbers(chunks)
    }

    if base_name not in log:
        log[base_name] = []

    log[base_name].append(entry)
    log[base_name] = sorted(log[base_name], key=lambda x: x.get("year") or 0)

    os.makedirs("data", exist_ok=True)
    with open(VERSION_LOG_PATH, "w") as f:
        json.dump(log, f, indent=2)

    # Return delta if multiple versions exist
    if len(log[base_name]) >= 2:
        return compute_delta(log[base_name][-2], log[base_name][-1])
    return None

def extract_key_numbers(chunks: list) -> dict:
    numbers = {}
    pattern = re.compile(
        r'([A-Za-z\s]{3,25})\s+(?:is|are|shall be|will be)?\s*(\d+(?:\.\d+)?)\s*(days?|months?|%|percent)?',
        re.IGNORECASE
    )
    for chunk in chunks[:20]:
        for subject, value, unit in pattern.findall(chunk["text"]):
            subject = subject.strip().lower()
            if 3 < len(subject) < 25:
                numbers[subject] = f"{value} {unit}".strip()
    return numbers

def compute_delta(old_entry: dict, new_entry: dict) -> dict:
    old_nums = old_entry.get("key_numbers", {})
    new_nums = new_entry.get("key_numbers", {})

    changed = {}
    added = {}
    removed = {}

    for key in new_nums:
        if key in old_nums and old_nums[key] != new_nums[key]:
            changed[key] = {"before": old_nums[key], "after": new_nums[key]}
        elif key not in old_nums:
            added[key] = new_nums[key]

    for key in old_nums:
        if key not in new_nums:
            removed[key] = old_nums[key]

    return {
        "old_version": old_entry["version"],
        "new_version": new_entry["version"],
        "old_year": old_entry.get("year"),
        "new_year": new_entry.get("year"),
        "changed_values": changed,
        "added_topics": added,
        "removed_topics": removed,
        "has_changes": bool(changed or added or removed)
    }
