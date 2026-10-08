"""
sync_ppt.py — Maps PPT Drive upload links from the Google Form responses sheet
to the corresponding CBC ID row in Column E ('PPT') of the main Submissions sheet.

Source Sheet (PPT Form Responses): 
  https://docs.google.com/spreadsheets/d/1eLuaO7Ve2wA0qyrJnjI6wE6DBRgSYznaK_SnXNPreRA
Target Sheet (CBC 2.0 Submissions): 
  https://docs.google.com/spreadsheets/d/1BeBH4_azgkQo0HJyJ6eUhzqGGO5czA7xHN_wJuoUqVw
"""

import os
import re
import sys
import json
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from dotenv import load_dotenv

base_dir = os.path.dirname(os.path.abspath(__file__))
for env_path in (
    os.path.join(base_dir, ".env"),
    os.path.join(base_dir, "..", ".env"),
    os.path.join(base_dir, "..", "2nd-verse-of-CBC2.0", ".env")
):
    if os.path.isfile(env_path):
        load_dotenv(env_path)

SOURCE_PPT_SHEET_ID = os.environ.get("PPT_FORM_SHEET_ID", "1eLuaO7Ve2wA0qyrJnjI6wE6DBRgSYznaK_SnXNPreRA")
TARGET_SUBMISSIONS_SHEET_ID = os.environ.get("GOOGLE_SHEET_ID", "1BeBH4_azgkQo0HJyJ6eUhzqGGO5czA7xHN_wJuoUqVw")
SA_EMAIL = os.environ.get("GOOGLE_SERVICE_ACCOUNT_EMAIL", "hackathon-checkin@cbc2o-505307.iam.gserviceaccount.com")
SA_KEY = os.environ.get("GOOGLE_PRIVATE_KEY", "").replace("\\n", "\n")

def normalize_cbc_id(raw_id: str) -> str:
    if not raw_id:
        return ""
    clean = re.sub(r'[\s\-_]', '', str(raw_id)).upper()
    m = re.search(r'(\d+)', clean)
    if m:
        num = int(m.group(1))
        return f"CBC{num:03d}"
    return clean

def col_idx_to_letter(idx: int) -> str:
    res = ""
    idx += 1
    while idx > 0:
        idx, rem = divmod(idx - 1, 26)
        res = chr(65 + rem) + res
    return res

def get_sheets_service():
    if not SA_EMAIL or not SA_KEY:
        raise ValueError("Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY in environment.")
    creds_info = {
        'type': 'service_account',
        'client_email': SA_EMAIL,
        'private_key': SA_KEY,
        'token_uri': 'https://oauth2.googleapis.com/token'
    }
    creds = Credentials.from_service_account_info(creds_info, scopes=['https://www.googleapis.com/auth/spreadsheets'])
    return build('sheets', 'v4', credentials=creds)

def sync_ppt_to_submissions(dry_run=False):
    service = get_sheets_service()
    
    # 1. Fetch PPT Responses from Form Response Sheet
    print(f"Reading PPT Responses from Sheet ID: {SOURCE_PPT_SHEET_ID}...")
    source_resp = service.spreadsheets().values().get(
        spreadsheetId=SOURCE_PPT_SHEET_ID,
        range="'Form Responses 1'!A1:Z"
    ).execute()
    source_rows = source_resp.get('values', [])
    
    if not source_rows or len(source_rows) <= 1:
        print("No responses found in PPT form responses sheet.")
        return {"status": "success", "synced": 0, "message": "No responses found in PPT form sheet yet."}
        
    source_headers = source_rows[0]
    
    # Identify Source columns
    src_cbc_idx = None
    src_ppt_idx = None
    src_email_idx = None
    
    for idx, h in enumerate(source_headers):
        h_clean = str(h).strip().lower()
        if 'cbc' in h_clean or 'team id' in h_clean:
            if src_cbc_idx is None: src_cbc_idx = idx
        elif 'ppt' in h_clean or 'pdf' in h_clean or 'drive' in h_clean:
            if src_ppt_idx is None: src_ppt_idx = idx
        elif 'email' in h_clean or 'mail' in h_clean:
            if src_email_idx is None: src_email_idx = idx

    if src_cbc_idx is None: src_cbc_idx = 2
    if src_ppt_idx is None: src_ppt_idx = 3
    if src_email_idx is None: src_email_idx = 1
    
    # Map normalized CBC ID -> PPT Link
    ppt_by_cbc = {}
    for r_idx, row in enumerate(source_rows[1:], start=2):
        raw_cbc = row[src_cbc_idx].strip() if len(row) > src_cbc_idx and row[src_cbc_idx] else ""
        norm_cbc = normalize_cbc_id(raw_cbc)
        ppt_url = row[src_ppt_idx].strip() if len(row) > src_ppt_idx and row[src_ppt_idx] else ""
        email = row[src_email_idx].strip().lower() if len(row) > src_email_idx and row[src_email_idx] else ""
        
        if norm_cbc and ppt_url:
            ppt_by_cbc[norm_cbc] = {
                "raw_cbc": raw_cbc,
                "norm_cbc": norm_cbc,
                "email": email,
                "ppt_url": ppt_url
            }
        elif email and ppt_url:
            ppt_by_cbc[email] = {
                "raw_cbc": raw_cbc,
                "norm_cbc": "",
                "email": email,
                "ppt_url": ppt_url
            }

    print(f"Extracted {len(ppt_by_cbc)} PPT submissions from Form Responses.")
    if not ppt_by_cbc:
        return {"status": "success", "synced": 0, "message": "No valid PPT links found."}

    # 2. Fetch Target Sheet (CBC 2.0 Submissions)
    print(f"Reading Target Submissions Sheet ID: {TARGET_SUBMISSIONS_SHEET_ID}...")
    target_resp = service.spreadsheets().values().get(
        spreadsheetId=TARGET_SUBMISSIONS_SHEET_ID,
        range="Sheet1!A1:Z"
    ).execute()
    target_rows = target_resp.get('values', [])
    
    if not target_rows:
        raise ValueError("Target Submissions sheet is empty.")
        
    target_headers = target_rows[0]
    
    # Identify Target columns
    tgt_cbc_idx = None
    tgt_email_idx = None
    tgt_ppt_idx = None
    
    for idx, h in enumerate(target_headers):
        h_clean = str(h).strip().lower()
        if 'cbc' in h_clean or 'team id' in h_clean:
            if tgt_cbc_idx is None: tgt_cbc_idx = idx
        elif 'email' in h_clean or 'mail' in h_clean:
            if tgt_email_idx is None: tgt_email_idx = idx
        elif 'ppt' in h_clean or 'presentation' in h_clean:
            if tgt_ppt_idx is None: tgt_ppt_idx = idx

    if tgt_cbc_idx is None: tgt_cbc_idx = 0
    if tgt_ppt_idx is None: tgt_ppt_idx = 4
    if tgt_email_idx is None: tgt_email_idx = 3
    
    ppt_col_letter = col_idx_to_letter(tgt_ppt_idx)
    
    updates = []
    matched_count = 0
    
    for t_idx, row in enumerate(target_rows[1:], start=2):
        r_cbc = row[tgt_cbc_idx].strip() if len(row) > tgt_cbc_idx and row[tgt_cbc_idx] else ""
        norm_r_cbc = normalize_cbc_id(r_cbc)
        r_email = row[tgt_email_idx].strip().lower() if len(row) > tgt_email_idx and row[tgt_email_idx] else ""
        existing_ppt = row[tgt_ppt_idx].strip() if len(row) > tgt_ppt_idx and row[tgt_ppt_idx] else ""
        
        # Match by CBC ID first, or leader email
        matched = None
        if norm_r_cbc and norm_r_cbc in ppt_by_cbc:
            matched = ppt_by_cbc[norm_r_cbc]
        elif r_email and r_email in ppt_by_cbc:
            matched = ppt_by_cbc[r_email]
            
        if matched:
            new_ppt = matched["ppt_url"]
            if new_ppt != existing_ppt:
                updates.append({
                    "range": f"Sheet1!{ppt_col_letter}{t_idx}",
                    "values": [[new_ppt]],
                    "team_id": norm_r_cbc or r_cbc,
                    "team_name": row[1] if len(row) > 1 else "",
                    "ppt_url": new_ppt
                })
            matched_count += 1

    print(f"Matched {matched_count} teams in target sheet. Pending updates: {len(updates)}")
    
    if not updates:
        print("All PPT links in target sheet are already up to date.")
        return {
            "status": "success",
            "synced": 0,
            "matched": matched_count,
            "message": "All PPT links in target sheet are up to date."
        }

    if dry_run:
        print("\n[DRY RUN] Updates that will be performed:")
        for u in updates:
            print(f" - Team {u['team_id']} ({u['team_name']}) -> {u['range']}: {u['ppt_url']}")
        return {"status": "dry_run", "synced": len(updates), "updates": updates}

    # Execute Batch Update to Target Sheet
    batch_data = [{"range": u["range"], "values": u["values"]} for u in updates]
    service.spreadsheets().values().batchUpdate(
        spreadsheetId=TARGET_SUBMISSIONS_SHEET_ID,
        body={
            "valueInputOption": "USER_ENTERED",
            "data": batch_data
        }
    ).execute()
    
    print(f"Successfully wrote {len(updates)} PPT links to Column {ppt_col_letter} in the Submissions sheet!")
    return {
        "status": "success",
        "synced": len(updates),
        "matched": matched_count,
        "updated_teams": [u["team_id"] for u in updates]
    }

if __name__ == "__main__":
    try:
        res = sync_ppt_to_submissions(dry_run=False)
        print("Done:", json.dumps(res, indent=2))
    except HttpError as he:
        if he.resp.status == 403:
            print(f"Permission Error: Please ensure {SA_EMAIL} has Editor access to both sheets.")
        else:
            print(f"Google Sheets API Error ({he.resp.status}): {he}")
    except Exception as e:
        print(f"Error: {e}")
