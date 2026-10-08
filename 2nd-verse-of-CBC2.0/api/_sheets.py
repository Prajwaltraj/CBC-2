"""
_sheets.py — Google Sheets connector shared by both apps.
Uses a Google Service Account (no user login/OAuth flow needed).

Required environment variables (set these in Vercel project settings):
  GOOGLE_SERVICE_ACCOUNT_EMAIL  - the service account's email address
  GOOGLE_PRIVATE_KEY            - the service account's private key (keep the \\n escapes)
  GOOGLE_SHEET_ID               - the spreadsheet ID (from its URL)

Sheet layout (tab name: "CheckIn & meals_Tracking"):
  A: team_id | B: team_name | C: member_name | D: present (Yes/No)
  E: lunch (Yes/No) | F: dinner (Yes/No) | G: tiffin (Yes/No)
  H: checked_in_at | I: project_title | J: leader_email | K: qr_sent
"""

import os
import re
import json
import datetime
from urllib.parse import urlparse, parse_qs

try:
    from dotenv import load_dotenv
    base = os.path.dirname(os.path.abspath(__file__))
    for p in (
        os.path.join(base, ".env"),
        os.path.join(base, "..", ".env"),
        os.path.join(base, "..", "..", ".env"),
        os.path.join(os.getcwd(), ".env"),
        os.path.join(os.getcwd(), "2nd-verse-of-CBC2.0", ".env"),
    ):
        if os.path.isfile(p):
            load_dotenv(p)
except ImportError:
    pass

from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build

SHEET_NAME = "CheckIn & meals_Tracking"
DATA_RANGE = f"{SHEET_NAME}!A2:K"
SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]

# Single source of truth for column letters.
COL = {
    "present": "D",
    "lunch": "E",
    "dinner": "F",
    "tiffin": "G",
    "checked_in_at": "H",
}
MEALS = ("lunch", "dinner", "tiffin")


def normalize_id(raw_id: str) -> str:
    """Extracts and normalizes a team ID from raw text, JSON, or URL."""
    if not raw_id:
        return ""
    text = str(raw_id).strip()

    # 1. Try JSON
    try:
        data = json.loads(text)
        if isinstance(data, dict):
            for key in ("team_id", "teamId", "id", "team"):
                if data.get(key):
                    text = str(data[key]).strip()
                    break
    except Exception:
        pass

    # 2. Try URL
    if text.startswith("http://") or text.startswith("https://") or "://" in text:
        try:
            parsed = urlparse(text)
            qs = parse_qs(parsed.query)
            for key in ("team_id", "teamId", "id", "t"):
                if key in qs and qs[key]:
                    text = qs[key][0].strip()
                    break
            else:
                # Check path segments
                parts = [p for p in parsed.path.split("/") if p]
                if parts:
                    last_part = parts[-1]
                    if last_part.lower() not in ("meals", "attendance", "admin", "index.html", ""):
                        text = last_part
        except Exception:
            pass

    # Normalize alphanumeric uppercase
    return re.sub(r"[\s\-_]", "", text).upper()


def get_sheets_client():
    email = os.environ.get("GOOGLE_SERVICE_ACCOUNT_EMAIL")
    raw_key = os.environ.get("GOOGLE_PRIVATE_KEY", "")
    private_key = raw_key.replace("\\n", "\n")  # Vercel env vars store literal \n — convert back
    if not email or not private_key:
        raise RuntimeError(
            "Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY environment variables."
        )
    info = {
        "type": "service_account",
        "client_email": email,
        "private_key": private_key,
        "token_uri": "https://oauth2.googleapis.com/token",
    }
    creds = Credentials.from_service_account_info(info, scopes=SCOPES)
    return build("sheets", "v4", credentials=creds, cache_discovery=False)


def get_sheet_id():
    sheet_id = os.environ.get("GOOGLE_SHEET_ID")
    if not sheet_id:
        raise RuntimeError("Missing GOOGLE_SHEET_ID environment variable.")
    return sheet_id


def get_team_members(team_id):
    """Reads every member row for a given team_id.
    Matches case-insensitively and normalizes formats (e.g. CBC001, cbc-001, etc.).
    Returns { team_id, team_name, project_title, table_number, members: [...] }
    """
    target_norm = normalize_id(team_id)
    if not target_norm:
        return {"team_id": team_id, "team_name": "", "project_title": "", "table_number": "", "members": []}

    service = get_sheets_client()
    spreadsheet_id = get_sheet_id()
    result = service.spreadsheets().values().get(
        spreadsheetId=spreadsheet_id, range=DATA_RANGE
    ).execute()
    rows = result.get("values", [])

    members = []
    canonical_team_id = team_id
    team_name = project_title = table_number = ""

    for idx, row in enumerate(rows):
        # Pad row to at least 11 columns
        padded = row + [""] * (11 - len(row))
        (
            r_team_id,
            r_team_name,
            member_name,
            present,
            lunch,
            dinner,
            tiffin,
            checked_in_at,
            r_project_title,
            leader_email,
            qr_sent,
        ) = padded[:11]

        r_norm = normalize_id(r_team_id)
        if r_norm == target_norm:
            canonical_team_id = r_team_id or canonical_team_id
            team_name = r_team_name or team_name
            project_title = r_project_title or project_title
            
            members.append({
                "row": idx + 2,  # 1-indexed plus header offset
                "name": member_name or "",
                "present": (present or "").strip().lower() in ("yes", "true", "1"),
                "lunch": (lunch or "").strip().lower() in ("yes", "true", "1"),
                "dinner": (dinner or "").strip().lower() in ("yes", "true", "1"),
                "tiffin": (tiffin or "").strip().lower() in ("yes", "true", "1"),
                "checked_in_at": checked_in_at or None,
                "leader_email": leader_email or "",
            })

    return {
        "team_id": canonical_team_id,
        "team_name": team_name,
        "project_title": project_title,
        "table_number": table_number,
        "members": members,
    }


def set_attendance(row, present):
    """Updates a single member's Present status + timestamp (columns D, H)."""
    service = get_sheets_client()
    spreadsheet_id = get_sheet_id()
    now = (datetime.datetime.utcnow().isoformat() + "Z") if present else ""
    service.spreadsheets().values().batchUpdate(
        spreadsheetId=spreadsheet_id,
        body={
            "valueInputOption": "RAW",
            "data": [
                {
                    "range": f"{SHEET_NAME}!{COL['present']}{row}",
                    "values": [["Yes" if present else "No"]],
                },
                {
                    "range": f"{SHEET_NAME}!{COL['checked_in_at']}{row}",
                    "values": [[now]],
                },
            ],
        },
    ).execute()


def set_meal(row, meal, taken):
    """Updates a single member's meal status (lunch / dinner / tiffin)."""
    if meal not in MEALS:
        raise ValueError(f"Unknown meal '{meal}'")
    service = get_sheets_client()
    spreadsheet_id = get_sheet_id()
    service.spreadsheets().values().update(
        spreadsheetId=spreadsheet_id,
        range=f"{SHEET_NAME}!{COL[meal]}{row}",
        valueInputOption="RAW",
        body={"values": [["Yes" if taken else "No"]]},
    ).execute()
