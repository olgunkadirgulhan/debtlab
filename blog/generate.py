"""Writes one blog article into web/content/blog/<slug>.md.

    keyword -> scenario (same math as the videos) -> Gemini article (JSON) -> number check -> markdown

Articles publish immediately. Set BLOG_REVIEW_FIRST=N to save the first N
with `draft: true` (hidden on the site) for human review; delete that line to
publish one.

    python blog/generate.py            # next unused keyword
    python blog/generate.py --dry-run  # print, don't write
"""
import argparse
import csv
import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "youtube"))
import facts as factlib  # noqa: E402
import script as scriptlib  # noqa: E402

POSTS = ROOT / "web" / "content" / "blog"
KEYWORDS = Path(__file__).resolve().parent / "keywords.csv"
PUBLISHED = ROOT / "youtube" / "published.csv"
REVIEW_FIRST = int(os.environ.get("BLOG_REVIEW_FIRST") or 0)

CALC = {
    "min_trap": "/calculators/credit-card-payoff/",
    "extra_payment": "/calculators/credit-card-payoff/",
    "snowball_vs_avalanche": "/calculators/debt-avalanche/",
    "utilization": "/calculators/credit-score-simulator/",
}

# Widely published reference numbers the article may use besides the scenario facts.
GENERAL = {
    "fico_weights": "payment history 35%, amounts owed 30%, length of history 15%, new credit 10%, credit mix 10%",
    "score_range": "300 to 850",
    "score_tiers": "Poor 300-579, Fair 580-669, Good 670-739, Very good 740-799, Exceptional 800-850",
    "late_payment_reporting": "late payments can stay on credit reports up to 7 years",
    "hard_inquiries": "hard inquiries can stay on reports for 2 years and usually matter most in the first 12 months",
    "utilization_guideline": "under 30%, and under 10% is often better",
    "months_per_year": 12,
}

PROMPT = """You are a careful personal-finance writer for DebtLab, a site with free debt calculators.
Write an SEO article for the search query: "{keyword}".

Use ONLY the numbers in SCENARIO and GENERAL below. Never invent other figures, rates or statistics.
Copy numbers exactly as written (keep $ and %). Round nothing yourself.

SCENARIO (computed by our calculator):
{facts}

GENERAL reference facts:
{general}

Requirements:
- 1200 to 1600 words of markdown in "body". Use ## and ### headings. Start with a short intro paragraph (no heading).
- Put the exact line [[TABLE]] on its own line where a table of the scenario numbers should appear (once, early).
- Explain the math step by step, give practical steps, and mention trying our free calculator at {calc_url} (as a markdown link, text "{calc_name}").
- Tone: plain, friendly, honest. Use "could" and "may". No guarantees, no "you will", no hype, no emojis.
- Do not claim to be a financial advisor. Do not name specific banks or products.
- Use GENERAL facts only where they genuinely help answer the query. Never pad with loosely related sections.
- Never write the fact labels as code-style words (no underscores); weave the numbers into normal sentences.
- "faq": exactly 4 questions a reader might ask, each answer 2-3 sentences, following the same number rules.

Return JSON: {{"title": "...", "description": "140-160 character meta description", "body": "...", "faq": [{{"q": "...", "a": "..."}}]}}
The title must be under 65 characters and contain the main idea of the search query."""

CALC_NAMES = {
    "/calculators/credit-card-payoff/": "Credit Card Payoff Calculator",
    "/calculators/debt-avalanche/": "Debt Avalanche Calculator",
    "/calculators/debt-snowball/": "Debt Snowball Calculator",
    "/calculators/credit-score-simulator/": "Credit Score Simulator",
}


def slugify(s):
    s = s.lower().replace("$", "").replace("%", " percent")
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")[:70]


def existing_posts():
    POSTS.mkdir(parents=True, exist_ok=True)
    return sorted(POSTS.glob("*.md"))


def next_keyword():
    done = {p.stem for p in existing_posts()}
    with KEYWORDS.open(newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            if slugify(row["keyword"]) not in done:
                return row
    return None


def facts_table(f):
    rows = []
    for k, v in f.items():
        label = k.replace("_", " ").capitalize().replace("Apr", "APR")
        if isinstance(v, list):
            v = "; ".join(v)
        rows.append(f"| {label} | {v} |")
    return "| Item | Value |\n|---|---|\n" + "\n".join(rows)


def matching_video(pillar):
    if not PUBLISHED.exists():
        return None
    with PUBLISHED.open(newline="", encoding="utf-8") as f:
        rows = [r for r in csv.DictReader(f) if r["pillar"] == pillar and r["privacy"] == "public"]
    return rows[-1]["video_id"] if rows else None


def gemini_json(prompt):
    # script.gemini returns text; ask for JSON and strip code fences if any.
    text = scriptlib.gemini(prompt + "\n\nReturn only the JSON object.", timeout=240)
    text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text.strip())
    return json.loads(text)


def check(article, allowed_facts):
    text = " ".join([article["title"], article["description"], article["body"]] + [q["q"] + " " + q["a"] for q in article["faq"]])
    bad = scriptlib.invented_numbers(text, allowed_facts)
    bad = [n for n in bad if not re.fullmatch(r"20\d\d", n)]  # years are fine
    words = len(article["body"].split())
    problems = []
    if bad:
        problems.append(f"numbers not in the facts: {', '.join(bad[:12])}")
    if not 1100 <= words <= 1900:
        problems.append(f"body is {words} words, needs 1200-1600")
    if "[[TABLE]]" not in article["body"]:
        problems.append("missing the [[TABLE]] line")
    if len(article.get("faq", [])) != 4:
        problems.append("faq must have exactly 4 items")
    if re.search(r"\byou will\b|\bguarantee", text, re.I):
        problems.append("contains 'you will' or a guarantee")
    leaked = sorted(set(re.findall(r"\b[a-z]+_[a-z_]+\b", text)))
    if leaked:
        problems.append(f"raw field names in the text: {', '.join(leaked[:6])}")
    return problems


def readable(d):
    """{"snowball_interest": "$3,916"} -> {"Snowball interest": "$3,916"} so labels read as plain English."""
    return {k.replace("_", " ").capitalize().replace("Apr", "APR"): v for k, v in d.items()}


def yaml_str(s):
    return json.dumps(s, ensure_ascii=False)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    kw = next_keyword()
    if not kw:
        print("::warning::blog/keywords.csv is used up")
        return
    topic = {"id": "0", "pillar": kw["pillar"], "title": kw["keyword"], "params": kw["params"]}
    built = factlib.build(topic)
    f = built["facts"]
    calc = CALC[kw["pillar"]]
    allowed = {"scenario": f, "general": GENERAL}

    prompt = PROMPT.format(
        keyword=kw["keyword"],
        facts=json.dumps(readable(f), indent=2),
        general=json.dumps(readable(GENERAL), indent=2),
        calc_url=calc,
        calc_name=CALC_NAMES[calc],
    )
    article, problems = None, ["not generated"]
    for attempt in range(4):
        try:
            article = gemini_json(prompt)
        except Exception as e:
            problems = [f"gemini/json error: {e}"]
            continue
        problems = check(article, allowed)
        if not problems:
            break
        prompt += f"\n\nYour previous attempt had problems: {'; '.join(problems)}. Fix them and return the full JSON again."
        print(f"[blog] attempt {attempt + 1}: {problems}")
    if problems:
        print(f"::error::blog article rejected for '{kw['keyword']}': {problems}")
        sys.exit(1)

    body = article["body"].replace("[[TABLE]]", facts_table(f))
    slug = slugify(kw["keyword"])
    draft = len(existing_posts()) < REVIEW_FIRST
    video = matching_video(kw["pillar"])
    fm = [
        "---",
        f"title: {yaml_str(article['title'])}",
        f"description: {yaml_str(article['description'])}",
        f"date: {datetime.now(timezone.utc).strftime('%Y-%m-%d')}",
        f"keyword: {yaml_str(kw['keyword'])}",
        f"calculator: {calc}",
    ]
    if video:
        fm.append(f"video: {video}")
    if draft:
        fm.append("draft: true")
    fm.append("faq:")
    for q in article["faq"]:
        fm += [f"  - q: {yaml_str(q['q'])}", f"    a: {yaml_str(q['a'])}"]
    fm.append("---")
    out = "\n".join(fm) + "\n\n" + body.strip() + "\n"

    if args.dry_run:
        print(out)
        return
    path = POSTS / f"{slug}.md"
    path.write_text(out, encoding="utf-8")
    print(f"[blog] wrote {path.relative_to(ROOT)} ({len(body.split())} words){' as DRAFT' if draft else ''}")


if __name__ == "__main__":
    main()
