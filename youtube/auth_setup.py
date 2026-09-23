"""One-time: get the refresh token for the DebtLab channel (run on your own PC).

1. Google Cloud Console -> Credentials -> OAuth client ID (Desktop app) -> download JSON
   as youtube/client_secret.json (git-ignored).
2. python youtube/auth_setup.py
3. In the browser, pick the Gmail, then pick the **DebtLab AI** channel
   (NOT the other channel on the same Gmail).
4. Copy the printed values into GitHub -> Settings -> Secrets and variables -> Actions.
"""
import sys
from pathlib import Path

from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

sys.path.insert(0, str(Path(__file__).resolve().parent))
from upload import SCOPES  # noqa: E402

SECRET = Path(__file__).resolve().parent / "client_secret.json"


def main():
    if not SECRET.exists():
        sys.exit(f"missing {SECRET} (download it from Google Cloud Console)")
    flow = InstalledAppFlow.from_client_secrets_file(str(SECRET), SCOPES)
    creds = flow.run_local_server(port=0, prompt="consent select_account", access_type="offline")
    yt = build("youtube", "v3", credentials=creds, cache_discovery=False)
    items = yt.channels().list(part="id,snippet", mine=True).execute().get("items", [])
    if not items:
        sys.exit("this login has no YouTube channel")
    cid, title = items[0]["id"], items[0]["snippet"]["title"]

    print("\n" + "=" * 60)
    print(f"Channel: {title}  ({cid})")
    print("If this is NOT the DebtLab channel, stop and run again, choosing the right channel.")
    print("=" * 60)
    print(f"YT_CLIENT_ID      = {creds.client_id}")
    print(f"YT_CLIENT_SECRET  = {creds.client_secret}")
    print(f"YT_REFRESH_TOKEN  = {creds.refresh_token}")
    print(f"YT_CHANNEL_ID     = {cid}")


if __name__ == "__main__":
    main()
