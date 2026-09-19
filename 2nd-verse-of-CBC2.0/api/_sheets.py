"""
_sheets.py — Google Sheets connector shared by both apps.
Uses a Google Service Account (no user login/OAuth flow needed).

Required environment variables (set these in Vercel project settings):
  GOOGLE_SERVICE_ACCOUNT_EMAIL  - the service account's email address
  GOOGLE_PRIVATE_KEY            - the service account's private key (keep the \n escapes)
  GOOGLE_SHEET_ID               - the spreadsheet ID (from its URL)

Sheet layout (tab name: "CheckIn & meals_Tracking"), one row per member:
  A: team_id | B: team_name | C: member_name | D: present (Yes/No)
  E: lunch (Yes/No) | F: tiffin (Yes/No) | G: checked_in_at
  H: project_title | I: table_number | J: leader_email
"""

import os
import datetime
import gspread
from google.oauth2.service_account import Credentials

SHEET_NAME = "CheckIn & meals_Tracking"
SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]

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
    return gspread.authorize(creds)


def get_sheet_id():
    sheet_id = os.environ.get("GOOGLE_SHEET_ID")
    if not sheet_id:
        raise RuntimeError("Missing GOOGLE_SHEET_ID environment variable.")
    return sheet_id


def get_team_members(team_id):
    client = get_sheets_client()
    spreadsheet_id = get_sheet_id()
    sheet = client.open_by_key(spreadsheet_id).worksheet(SHEET_NAME)
    
    rows = sheet.get("A2:J")

    members = []
    team_name = project_title = table_number = ""

    for idx, row in enumerate(rows):
        padded = row + [""] * (10 - len(row))  # pad short rows
        (r_team_id, r_team_name, member_name, present, lunch, tiffin,
         checked_in_at, r_project_title, r_table_number, leader_email) = padded[:10]

        if (r_team_id or "").strip() == team_id:
            team_name = r_team_name or ""
            project_title = r_project_title or ""
            table_number = r_table_number or ""
            members.append({
                "row": idx + 2,  # +2: 1-indexed sheet rows, plus header row offset
                "name": member_name or "",
                "present": present == "Yes",
                "lunch": lunch == "Yes",
                "tiffin": tiffin == "Yes",
                "checked_in_at": checked_in_at or None,
                "leader_email": leader_email or "",
            })

    return {
        "team_id": team_id,
        "team_name": team_name,
        "project_title": project_title,
        "table_number": table_number,
        "members": members,
    }


def set_attendance(row, present):
    """Updates a single member's Present status + timestamp (columns D, G)."""
    client = get_sheets_client()
    spreadsheet_id = get_sheet_id()
    sheet = client.open_by_key(spreadsheet_id).worksheet(SHEET_NAME)
    
    now = (datetime.datetime.utcnow().isoformat() + "Z") if present else ""
    
    # Use batch_update for performance
    sheet.batch_update([
        {
            'range': f'D{row}',
            'values': [["Yes" if present else "No"]]
        },
        {
            'range': f'G{row}',
            'values': [[now]]
        }
    ])


def set_meal(row, meal, taken):
    """Updates a single member's meal status (column E for lunch, F for tiffin)."""
    col = "E" if meal == "lunch" else "F"
    client = get_sheets_client()
    spreadsheet_id = get_sheet_id()
    sheet = client.open_by_key(spreadsheet_id).worksheet(SHEET_NAME)
    
    sheet.update_acell(f'{col}{row}', "Yes" if taken else "No")
