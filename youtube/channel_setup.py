"""One-time (re-runnable) channel setup: description, keywords, trailer, playlists, home sections.

    python youtube/channel_setup.py

Playlist ids are saved to youtube/playlists.json; run.py adds each new upload
to its pillar's playlist.
"""
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import upload  # noqa: E402

PLAYLISTS_FILE = HERE / "playlists.json"

DESCRIPTION = """Real debt math in under a minute.

DebtLab AI runs the actual numbers on credit card debt, minimum payments, debt snowball vs avalanche and credit utilization, so you can see how long payoff really takes and how much interest you could save.

New Shorts every day:
- Minimum payment trap: how long "just the minimum" really takes
- Extra payment math: what a little extra each month could save
- Snowball vs Avalanche: side-by-side on real debt mixes
- Credit utilization: how much to pay before your statement closes

Every number in every video comes from a real payoff calculation. No hype, no guarantees.

Free debt calculators (snowball, avalanche, credit card payoff): https://debtlabai.com

Educational only. Not financial advice. Not affiliated with any bank, lender or credit bureau."""

KEYWORDS = (
    '"debt payoff" "credit card debt" "debt snowball" "debt avalanche" "credit score" '
    '"credit utilization" "minimum payment" "personal finance" "debt free" "pay off debt" '
    '"credit card interest" "money tips"'
)

PLAYLISTS = {
    "min_trap": ("The Minimum Payment Trap", "How long paying only the minimum really takes, with the real math on every balance."),
    "extra_payment": ("Pay Off Debt Faster", "What adding a little extra each month could save in time and interest."),
    "snowball_vs_avalanche": ("Snowball vs Avalanche", "Debt snowball and debt avalanche compared on real debt mixes."),
    "utilization": ("Credit Utilization Math", "How much to pay, and when, to bring your credit utilization down."),
}

TRAILER = "D5uyEHgAfUQ"


def main():
    yt = upload._client()
    cid, title = upload.current_channel()
    print(f"channel: {title} ({cid})")

    yt.channels().update(part="brandingSettings", body={
        "id": cid,
        "brandingSettings": {
            "channel": {
                "title": title,
                "description": DESCRIPTION,
                "keywords": KEYWORDS,
                "country": "US",
                "defaultLanguage": "en",
                "unsubscribedTrailer": TRAILER,
            }
        },
    }).execute()
    print("branding: description, keywords, country, language, trailer set")

    existing = {p["snippet"]["title"]: p["id"] for p in
                yt.playlists().list(part="snippet", mine=True, maxResults=50).execute().get("items", [])}
    ids = json.loads(PLAYLISTS_FILE.read_text()) if PLAYLISTS_FILE.exists() else {}
    for pillar, (ptitle, pdesc) in PLAYLISTS.items():
        if pillar in ids:
            continue
        if ptitle in existing:
            ids[pillar] = existing[ptitle]
            continue
        p = yt.playlists().insert(part="snippet,status", body={
            "snippet": {"title": ptitle, "description": pdesc + "\n\nEducational only. Not financial advice.", "defaultLanguage": "en"},
            "status": {"privacyStatus": "public"},
        }).execute()
        ids[pillar] = p["id"]
        print(f"playlist created: {ptitle}")
    PLAYLISTS_FILE.write_text(json.dumps(ids, indent=2) + "\n")

    sections = yt.channelSections().list(part="snippet,contentDetails", mine=True).execute().get("items", [])
    have = {(s["snippet"]["type"], tuple(s.get("contentDetails", {}).get("playlists", []))) for s in sections}
    wanted = [("popularUploads", ())] + [("singlePlaylist", (ids[p],)) for p in PLAYLISTS]
    for pos, (stype, pls) in enumerate(wanted):
        if (stype, pls) in have:
            continue
        body = {"snippet": {"type": stype, "position": pos}}
        if pls:
            body["contentDetails"] = {"playlists": list(pls)}
        try:
            yt.channelSections().insert(part="snippet,contentDetails", body=body).execute()
            print(f"home section added: {stype} {pls}")
        except Exception as e:
            print(f"home section skipped ({stype}): {str(e)[:160]}")


if __name__ == "__main__":
    main()
