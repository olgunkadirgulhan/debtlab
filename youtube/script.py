"""Voiceover script: Gemini first, validated so it never invents numbers; template fallback."""
import json
import os
import re
import time

import requests

PROMPT = """You are a friendly personal-finance educator. Write a 45-second YouTube Shorts
voiceover (110-130 words) for the title: "{title}".
Use ONLY these computed facts, never invent numbers:
{facts_json}
Structure: hook in first sentence (under 12 words) -> the math -> one actionable tip
-> CTA: "{cta_text}".
No guarantees, no "you will", say "could". Plain spoken English. No emojis.
Write every number exactly as it appears in the facts (keep the $ and % signs).
Output only the script."""

NUM_RE = re.compile(r"\d[\d,]*(?:\.\d+)?")
SMALL_OK = {str(i) for i in range(0, 13)}  # "3 cards", "1 tip", "12 months" etc.


def _numbers(text):
    return {m.replace(",", "").rstrip(".") for m in NUM_RE.findall(text)}


def invented_numbers(script, facts):
    allowed = _numbers(json.dumps(facts)) | SMALL_OK
    return sorted(n for n in _numbers(script) if n not in allowed)


def validate(script, facts):
    words = len(script.split())
    problems = []
    if not 90 <= words <= 150:
        problems.append(f"word count {words}, must be 110-130")
    bad = invented_numbers(script, facts)
    if bad:
        problems.append(f"numbers not in facts: {', '.join(bad)}")
    if re.search(r"\byou will\b|\bguarantee", script, re.I):
        problems.append("contains 'you will' or a guarantee")
    return problems


def gemini(prompt):
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        raise RuntimeError("GEMINI_API_KEY not set")
    model = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    body = {"contents": [{"parts": [{"text": prompt}]}], "generationConfig": {"temperature": 0.9}}
    for attempt in range(3):
        r = requests.post(url, json=body, headers={"x-goog-api-key": key}, timeout=60)
        if r.status_code in (429, 500, 503):
            time.sleep(10 * (attempt + 1))
            continue
        r.raise_for_status()
        parts = r.json()["candidates"][0]["content"]["parts"]
        return "".join(p.get("text", "") for p in parts).strip()
    raise RuntimeError(f"Gemini unavailable: {r.status_code}")


def clean(text):
    text = re.sub(r"[*_#`\"]", "", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def write(topic, built, cta_text):
    facts = built["facts"]
    prompt = PROMPT.format(title=topic["title"], facts_json=json.dumps(facts, indent=2), cta_text=cta_text)
    last_err = None
    for _ in range(3):
        try:
            s = clean(gemini(prompt))
        except Exception as e:  # network / key / quota -> template
            last_err = e
            break
        problems = validate(s, facts)
        if not problems:
            return s, "gemini"
        last_err = "; ".join(problems)
        prompt += f"\n\nYour previous attempt had problems: {last_err}. Fix them."
    print(f"[script] falling back to template: {last_err}")
    return fallback(topic, facts, cta_text), "template"


def fallback(topic, f, cta):
    p = topic["pillar"]
    if p == "min_trap":
        body = (
            f"Paying only the minimum could keep you in debt for {f['time_to_pay_off']}. "
            f"Here's the math. You owe {f['balance']} at {f['apr']} APR. "
            f"Your minimum is {f['minimum_rule']}, so the first payment is about {f['first_minimum_payment']}. "
            f"But as the balance drops, the minimum drops too, so progress slows to a crawl. "
            f"It takes {f['time_to_pay_off']} and you'd pay {f['total_interest_paid']} in interest. "
            f"That's {f['total_paid']} total for a {f['balance']} balance. "
            f"The fix: pick a fixed payment and keep paying it even when the minimum shrinks. "
        )
    elif p == "extra_payment":
        body = (
            f"A small extra payment could save you {f['interest_saved']}. "
            f"You owe {f['balance']} at {f['apr']} APR and pay {f['monthly_payment']} a month. "
            f"At that pace it takes {f['time_with_payment_only']} and costs {f['interest_with_payment_only']} in interest. "
            f"Now add just {f['extra_per_month']} a month. "
            f"Payoff drops to {f['time_with_extra']}, and interest drops to {f['interest_with_extra']}. "
            f"That's {f['time_saved']} sooner and {f['interest_saved']} back in your pocket. "
            f"Tip: set the extra payment to autopay the day after payday, so you never see the money. "
        )
    elif p == "snowball_vs_avalanche":
        cheaper = f["cheaper_method"]
        verdict = (
            f"The avalanche saves {f['interest_difference']} in interest"
            if cheaper == "avalanche"
            else f"The snowball actually saves {f['interest_difference']}" if cheaper == "snowball"
            else "Both cost the same here"
        )
        body = (
            f"Snowball or avalanche? Let's test it on {f['total_debt']}. "
            f"The budget is {f['monthly_budget']} a month across every debt. "
            f"Snowball pays the smallest balance first, starting with {f['snowball_first_paid_off']}. "
            f"It finishes in {f['snowball_time']} with {f['snowball_interest']} in interest. "
            f"Avalanche attacks the highest rate first, starting with {f['avalanche_first_paid_off']}. "
            f"It finishes in {f['avalanche_time']} with {f['avalanche_interest']} in interest. "
            f"{verdict}. "
            f"Tip: if quick wins keep you motivated, snowball could still be the better fit for you. "
        )
    else:
        body = (
            f"Your credit utilization could be dragging your score down. "
            f"A {f['balance']} balance on a {f['credit_limit']} limit is {f['utilization']} utilization. "
            f"A common guideline is to stay under 30 percent, and under 10 percent is often better. "
            f"To get under 30 percent, you'd pay down {f['pay_to_get_under_30_percent']}. "
            f"To get under 10 percent, pay down {f['pay_to_get_under_10_percent']}. "
            f"Here's the trick: utilization is usually reported on your statement closing date, not your due date. "
            f"So pay before the statement closes, and a lower balance could show up on your report. "
        )
    return clean(body + cta)
