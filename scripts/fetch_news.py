#!/usr/bin/env python3
"""Build the student news feed from public publisher RSS/Atom feeds."""
from __future__ import annotations

import datetime as dt
import email.utils
import html
import hashlib
import json
import re
import urllib.request
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "data" / "news.json"
NOW = dt.datetime.now(dt.timezone.utc)

SOURCES = [
    {"name": "Hugging Face", "url": "https://huggingface.co/blog/feed.xml", "category": "AI & ML", "accent": "violet"},
    {"name": "Google AI", "url": "https://blog.google/technology/ai/rss/", "category": "AI & ML", "accent": "blue"},
    {"name": "Microsoft Research", "url": "https://www.microsoft.com/en-us/research/feed/", "category": "Research", "accent": "cyan"},
    {"name": "MIT Sloan", "url": "https://mitsloan.mit.edu/feed", "category": "Business", "accent": "orange"},
    {"name": "Harvard Business Review", "url": "https://hbr.org/feed", "category": "Business", "accent": "red"},
    {"name": "TechCrunch AI", "url": "https://techcrunch.com/category/artificial-intelligence/feed/", "category": "Industry", "accent": "green"},
    {"name": "arXiv AI", "url": "https://export.arxiv.org/rss/cs.AI", "category": "Research", "accent": "navy"},
    {"name": "HBR IdeaCast", "url": "https://feeds.megaphone.fm/harvard-business-review-ideacast", "category": "Podcast", "accent": "gold"},
]

TAGS = {
    "LLM": ("large language model", "llm", "language model", "gpt", "transformer"),
    "Generative AI": ("generative ai", "genai", "image generation", "text-to-image"),
    "Machine Learning": ("machine learning", "deep learning", "neural", "model training"),
    "Business": ("business", "management", "strategy", "leadership", "workplace", "customer"),
    "Information Systems": ("information system", "digital transformation", "enterprise", "cloud", "cyber"),
    "Responsible AI": ("responsible ai", "ethics", "bias", "fairness", "safety", "governance"),
    "Research": ("research", "study", "paper", "benchmark", "dataset"),
}


def text_of(node, names):
    for child in node.iter():
        tag = child.tag.rsplit("}", 1)[-1].lower()
        if tag in names and child.text:
            return child.text.strip()
    return ""


def clean(value, limit=360):
    value = html.unescape(re.sub(r"<[^>]+>", " ", value or ""))
    value = re.sub(r"\s+", " ", value).strip()
    if len(value) <= limit:
        return value
    return value[:limit].rsplit(" ", 1)[0] + "…"


def parse_date(value):
    if not value:
        return NOW
    try:
        parsed = email.utils.parsedate_to_datetime(value)
        return parsed if parsed.tzinfo else parsed.replace(tzinfo=dt.timezone.utc)
    except (TypeError, ValueError, OverflowError):
        pass
    try:
        return dt.datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return NOW


def item_link(node):
    for child in node.iter():
        if child.tag.rsplit("}", 1)[-1].lower() != "link":
            continue
        href = child.attrib.get("href", "").strip()
        rel = child.attrib.get("rel", "alternate")
        if href and rel in ("alternate", ""):
            return href
        if child.text and child.text.strip().startswith("http"):
            return child.text.strip()
    return ""


def item_image(node):
    """Prefer publisher-supplied RSS media, then an image embedded in the summary."""
    for child in node.iter():
        tag = child.tag.rsplit("}", 1)[-1].lower()
        url = child.attrib.get("url", "").strip()
        media_type = child.attrib.get("type", "").lower()
        medium = child.attrib.get("medium", "").lower()
        if url and (tag == "thumbnail" or tag == "image" or (tag in ("content", "enclosure") and (media_type.startswith("image") or medium == "image"))):
            if urlparse(url).scheme in ("http", "https"):
                return url
    raw = " ".join(child.text or "" for child in node.iter() if child.tag.rsplit("}", 1)[-1].lower() in {"description", "summary", "content", "encoded"})
    match = re.search(r'<img[^>]+src=["\'](https?://[^"\']+)', raw or "", re.I)
    return html.unescape(match.group(1)) if match else ""


def classify(title, summary, fallback):
    haystack = f"{title} {summary}".lower()
    tags = [label for label, needles in TAGS.items() if any(n in haystack for n in needles)]
    if not tags:
        tags = [fallback]
    return tags[:3]


def fetch(source):
    request = urllib.request.Request(
        source["url"],
        headers={"User-Agent": "BasyalStudentBrief/1.0", "Accept": "application/rss+xml, application/atom+xml, text/xml"},
    )
    with urllib.request.urlopen(request, timeout=12) as response:
        root = ET.fromstring(response.read())
    entries = [n for n in root.iter() if n.tag.rsplit("}", 1)[-1].lower() in ("item", "entry")]
    result = []
    for node in entries[:6]:
        title = clean(text_of(node, {"title"}), 180)
        link = item_link(node)
        summary = clean(text_of(node, {"description", "summary", "content", "encoded"}))
        date = parse_date(text_of(node, {"pubdate", "published", "updated", "date"}))
        if not title or not link:
            continue
        result.append({
            "id": f"{urlparse(link).netloc}-{hashlib.sha1(link.encode()).hexdigest()[:14]}",
            "title": title,
            "summary": summary or "Open the original source for the complete update.",
            "url": link,
            "source": source["name"],
            "sourceUrl": source["url"],
            "category": source["category"],
            "tags": classify(title, summary, source["category"]),
            "published": date.astimezone(dt.timezone.utc).isoformat(),
            "accent": source["accent"],
            "readMinutes": max(2, min(12, round(len(summary.split()) / 180) + 1)),
            "image": item_image(node),
        })
    return result


def main():
    items, health = [], []
    with ThreadPoolExecutor(max_workers=len(SOURCES)) as pool:
        futures = {pool.submit(fetch, source): source for source in SOURCES}
        for future in as_completed(futures):
            source = futures[future]
            try:
                found = future.result()
                items.extend(found)
                health.append({"source": source["name"], "status": "ok", "items": len(found)})
            except Exception as exc:  # a single publisher must never break the full briefing
                health.append({"source": source["name"], "status": "unavailable", "items": 0, "detail": type(exc).__name__})
    health.sort(key=lambda row: next(i for i, source in enumerate(SOURCES) if source["name"] == row["source"]))

    deduped = {}
    for item in items:
        key = re.sub(r"\W+", " ", item["title"].lower()).strip()
        deduped.setdefault(key, item)
    items = sorted(deduped.values(), key=lambda x: x["published"], reverse=True)[:36]

    previous = {}
    if OUTPUT.exists():
        try:
            previous = json.loads(OUTPUT.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            pass
    faculty_items = [item for item in previous.get("items", []) if item.get("source") == "Professor Basyal"]
    if len(items) < 8 and previous.get("items"):
        items = [item for item in previous["items"] if item.get("source") != "Professor Basyal"]
    items = sorted(faculty_items + items, key=lambda x: x["published"], reverse=True)[:40]

    payload = {
        "generatedAt": NOW.isoformat(),
        "cadence": "Every 48 hours",
        "method": "Publisher RSS/Atom metadata; summaries link to original sources.",
        "sources": health,
        "items": items,
    }
    OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(items)} stories from {sum(h['status'] == 'ok' for h in health)} sources")


if __name__ == "__main__":
    main()
