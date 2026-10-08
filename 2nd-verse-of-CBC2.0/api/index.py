import sys; print("FLASK APP LOADED", file=sys.stderr, flush=True)
import os
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

import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import random
import time
import datetime
import urllib.parse
import urllib.request
import json
from flask import Flask, request, jsonify
from flask_cors import CORS

try:
    try:
        from ._sheets import get_team_members, set_attendance, set_meal, MEALS
    except (ImportError, ValueError):
        try:
            from _sheets import get_team_members, set_attendance, set_meal, MEALS
        except ImportError:
            from api._sheets import get_team_members, set_attendance, set_meal, MEALS
except Exception as e:
    print("Warning: _sheets could not be loaded:", e, file=sys.stderr)
    get_team_members = None
    set_attendance = None
    set_meal = None
    MEALS = ("lunch", "dinner", "tiffin")

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

# Email Configuration
GMAIL_USER = os.environ.get("GMAIL_USER", "cbc2.o.tech@gmail.com")
GMAIL_PASS = os.environ.get("GMAIL_PASS", "spdztbcrixmulsms")
FIREBASE_DATABASE_URL = os.environ.get("FIREBASE_DATABASE_URL", "https://cbc20-3af58-default-rtdb.firebaseio.com")

def encode_email_key(email: str) -> str:
    key = email.lower().strip()
    for char in ['.', '#', '$', '[', ']', '/']:
        key = key.replace(char, '_')
    return urllib.parse.quote(key)

from email.utils import formatdate, make_msgid, formataddr

def send_otp_email(to_email: str, otp_code: str, team_name: str = "Participant"):
    subject = f"{otp_code} is your CBC 2.0 verification code"
    
    html_content = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
</head>
<body style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 20px; color: #111827;">
    <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px;">
        <h2 style="color: #0284c7; margin-top: 0; font-size: 20px;">CBC 2.0 Verification</h2>
        <p style="font-size: 14px; color: #374151;">Hello <strong>{team_name}</strong>,</p>
        <p style="font-size: 14px; color: #374151;">Your 6-digit verification code to access your team dashboard is:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #0284c7; background: #f0f9ff; padding: 12px; text-align: center; border-radius: 6px; margin: 18px 0; border: 1px solid #bae6fd;">
            {otp_code}
        </div>
        <p style="font-size: 13px; color: #6b7280; margin-bottom: 0;">This code is valid for 10 minutes. If you did not request this, please ignore this email.</p>
    </div>
</body>
</html>"""
    
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = formataddr(("CBC 2.0 Team", GMAIL_USER))
    msg["To"] = to_email
    msg["Reply-To"] = GMAIL_USER
    msg["Date"] = formatdate(localtime=True)
    msg["Message-ID"] = make_msgid(domain="gmail.com")
    
    text_part = MIMEText(f"Hello {team_name},\n\nYour CBC 2.0 verification code is: {otp_code}\nThis code is valid for 10 minutes.\n\nBest regards,\nCBC 2.0 Team", "plain", "utf-8")
    html_part = MIMEText(html_content, "html", "utf-8")
    msg.attach(text_part)
    msg.attach(html_part)
    
    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(GMAIL_USER, GMAIL_PASS)
        server.sendmail(GMAIL_USER, [to_email], msg.as_string())

import csv
import io
import re

GOOGLE_SHEET_ID_DEFAULT = "1BeBH4_azgkQo0HJyJ6eUhzqGGO5czA7xHN_wJuoUqVw"

def get_sheet_id():
    return os.environ.get("GOOGLE_SHEET_ID") or GOOGLE_SHEET_ID_DEFAULT

def get_sheet_csv_url():
    sid = get_sheet_id()
    return f"https://docs.google.com/spreadsheets/d/{sid}/export?format=csv"

def sanitize_sheet_keys(d):
    sanitized = {}
    for k, v in d.items():
        if not k:
            continue
        safe_key = re.sub(r'[.#$\[\]/\n\r]', ' ', k).strip()
        sanitized[safe_key] = v.strip() if isinstance(v, str) else v
    return sanitized

def fetch_team_from_sheet_live(target_email: str):
    clean_target = target_email.lower().strip()
    try:
        req = urllib.request.Request(
            get_sheet_csv_url(),
            headers={'User-Agent': 'Mozilla/5.0'}
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            csv_data = resp.read().decode('utf-8', errors='ignore')
            
        csv_file = io.StringIO(csv_data)
        reader = csv.DictReader(csv_file)
        for row in reader:
            sanitized = sanitize_sheet_keys(row)
            # Check if clean_target matches any email in row
            emails = set()
            for key, val in row.items():
                if key and ('email' in key.lower() or 'mail' in key.lower()) and val:
                    val_clean = val.strip().lower()
                    if '@' in val_clean:
                        emails.add(val_clean)
            if clean_target in emails:
                # Sync on-the-fly to Firebase RTDB for future fast lookups
                try:
                    for e in emails:
                        e_hash = encode_email_key(e)
                        sync_url = f"{FIREBASE_DATABASE_URL}/registeredTeams/{e_hash}.json"
                        sync_req = urllib.request.Request(
                            sync_url,
                            data=json.dumps(sanitized).encode("utf-8"),
                            headers={"Content-Type": "application/json"},
                            method="PUT"
                        )
                        with urllib.request.urlopen(sync_req, timeout=5):
                            pass
                except Exception as sync_e:
                    print(f"Warning syncing live sheet match to Firebase: {sync_e}", file=sys.stderr)
                return sanitized
    except Exception as e:
        print(f"Error fetching live Google Sheet: {e}", file=sys.stderr)
    return None

def normalize_cbc_id(raw_id: str) -> str:
    if not raw_id:
        return ""
    clean = re.sub(r'[\s\-_]', '', str(raw_id)).upper()
    m = re.search(r'(\d+)', clean)
    if m:
        num = int(m.group(1))
        return f"CBC{num:03d}"
    return clean

def sync_submission_to_google_sheet(team_id: str = "", email: str = "", github_url: str = "", ppt_url: str = ""):
    """
    Directly writes GITHUB and optionally PPT to the Google Sheet using Service Account.
    Dynamically resolves column positions and matches by Team Leader Email ID or CBC TEAM ID.
    Returns: (success: bool, error_message: str)
    """
    sheet_id = get_sheet_id()
    sa_email = os.environ.get("GOOGLE_SERVICE_ACCOUNT_EMAIL")
    sa_key = os.environ.get("GOOGLE_PRIVATE_KEY", "").replace("\\n", "\n")
    if not sa_email or not sa_key:
        print("[GOOGLE SHEET SYNC] Service Account credentials not found in env.", file=sys.stderr)
        return False, "Google Service Account credentials not found in environment."
    try:
        from google.oauth2.service_account import Credentials
        from googleapiclient.discovery import build
        from googleapiclient.errors import HttpError
        creds_info = {
            'type': 'service_account',
            'client_email': sa_email,
            'private_key': sa_key,
            'token_uri': 'https://oauth2.googleapis.com/token'
        }
        creds = Credentials.from_service_account_info(creds_info, scopes=['https://www.googleapis.com/auth/spreadsheets'])
        service = build('sheets', 'v4', credentials=creds)
        
        # Read Sheet1!A1:Z to inspect headers and rows
        resp = service.spreadsheets().values().get(spreadsheetId=sheet_id, range='Sheet1!A1:Z').execute()
        rows = resp.get('values', [])
        if not rows:
            print("[GOOGLE SHEET SYNC] No data found in sheet.", file=sys.stderr)
            return False, "No data rows found in Google Sheet."
            
        headers = rows[0]
        
        def col_idx_to_letter(idx):
            res = ''
            idx += 1
            while idx > 0:
                idx, rem = divmod(idx - 1, 26)
                res = chr(65 + rem) + res
            return res

        cbc_col_idx = None
        email_col_idx = None
        github_col_idx = None
        ppt_col_idx = None

        for idx, h in enumerate(headers):
            h_clean = str(h).strip().lower()
            if 'cbc' in h_clean or 'team id' in h_clean:
                if cbc_col_idx is None:
                    cbc_col_idx = idx
            if 'email' in h_clean or 'mail' in h_clean:
                if email_col_idx is None:
                    email_col_idx = idx
            if 'github' in h_clean or 'repo' in h_clean:
                if github_col_idx is None:
                    github_col_idx = idx
            if 'ppt' in h_clean or 'presentation' in h_clean:
                if ppt_col_idx is None:
                    ppt_col_idx = idx

        # Default fallbacks
        if cbc_col_idx is None:
            cbc_col_idx = 0
        if email_col_idx is None:
            email_col_idx = 3
        if github_col_idx is None:
            github_col_idx = 5
            
        target_row_idx = None
        clean_email = email.lower().strip() if email else ""
        norm_tid = normalize_cbc_id(team_id) if team_id else ""
        clean_raw_tid = re.sub(r'[\s\-_]', '', team_id).upper() if team_id else ""
        
        # Priority 1: Match strictly by Leader Email
        if clean_email:
            for idx, row in enumerate(rows):
                if idx == 0:
                    continue
                r_email = row[email_col_idx].lower().strip() if email_col_idx is not None and len(row) > email_col_idx and row[email_col_idx] else ""
                if r_email and clean_email == r_email:
                    target_row_idx = idx + 1
                    break
                for cell in row:
                    if str(cell).lower().strip() == clean_email:
                        target_row_idx = idx + 1
                        break
                if target_row_idx:
                    break

        # Priority 2: Fallback to Team ID ONLY if email is not provided / matched
        if not target_row_idx and norm_tid:
            for idx, row in enumerate(rows):
                if idx == 0:
                    continue
                r_raw_tid = row[cbc_col_idx].strip() if len(row) > cbc_col_idx and row[cbc_col_idx] else ""
                r_norm_tid = normalize_cbc_id(r_raw_tid)
                if norm_tid and (norm_tid == r_norm_tid or clean_raw_tid == r_raw_tid.upper()):
                    target_row_idx = idx + 1
                    break
                
        if target_row_idx:
            # 1. Update GITHUB link in the resolved GitHub column
            if github_url and github_col_idx is not None:
                github_col_letter = col_idx_to_letter(github_col_idx)
                service.spreadsheets().values().update(
                    spreadsheetId=sheet_id,
                    range=f"Sheet1!{github_col_letter}{target_row_idx}",
                    valueInputOption="USER_ENTERED",
                    body={"values": [[github_url.strip()]]}
                ).execute()
                col_name = headers[github_col_idx] if github_col_idx < len(headers) else "GITHUB"
                print(f"[GOOGLE SHEET SYNC] Row {target_row_idx} Col {github_col_letter} ({col_name}) updated to: {github_url}", file=sys.stderr)
                
            # 2. Update PPT link in the resolved PPT column if provided
            if ppt_url and ppt_col_idx is not None:
                ppt_col_letter = col_idx_to_letter(ppt_col_idx)
                service.spreadsheets().values().update(
                    spreadsheetId=sheet_id,
                    range=f"Sheet1!{ppt_col_letter}{target_row_idx}",
                    valueInputOption="USER_ENTERED",
                    body={"values": [[ppt_url.strip()]]}
                ).execute()
                print(f"[GOOGLE SHEET SYNC] Row {target_row_idx} Col {ppt_col_letter} PPT updated to: {ppt_url}", file=sys.stderr)
                
            return True, ""
        else:
            match_target = email or team_id
            err = f"Team '{match_target}' could not be matched with any team in the Google Sheet."
            print(f"[GOOGLE SHEET SYNC] {err}", file=sys.stderr)
            return False, err
    except HttpError as he:
        if he.resp.status == 403:
            err = f"Google Sheet Permission Required: Please share the Google Sheet with Editor permission to {sa_email}"
            print(f"[GOOGLE SHEET SYNC PERMISSION ERROR]: {err}", file=sys.stderr)
            return False, err
        return False, f"Google Sheet API error ({he.resp.status}): {str(he)}"
    except Exception as e:
        print(f"[GOOGLE SHEET SYNC ERROR]: {e}", file=sys.stderr)
        return False, f"Google Sheet update error: {str(e)}"

MAX_OTP_REQUESTS = 3
OTP_WINDOW_SECONDS = 900  # 15 minutes cooldown window
MIN_RESEND_INTERVAL = 60  # 1 minute consecutive buffer

_LOCAL_OTP_RATE_LIMITS = {}

def check_and_update_otp_rate_limit(encoded_key: str, email: str = ""):
    """
    Rate-limits OTP generation:
    1. Minimum 1-minute (60 seconds) cooldown between consecutive requests.
    2. Maximum 3 requests per 15-minute window.
    Returns (allowed: bool, attempts_used: int, wait_seconds: int, error_msg: str)
    """
    clean_email = email.lower().strip() if email else ""
    if clean_email in ("cbc2.o.tech@gmail.com", "codebreaker.aiml@gmail.com"):
        return True, 1, 0, ""

    now = int(time.time())
    
    # Check in-memory tracking first
    local_data = _LOCAL_OTP_RATE_LIMITS.get(encoded_key) or _LOCAL_OTP_RATE_LIMITS.get(clean_email)
    
    limit_url = f"{FIREBASE_DATABASE_URL}/otpRateLimits/{encoded_key}.json"
    rate_data = None
    try:
        req = urllib.request.Request(limit_url)
        with urllib.request.urlopen(req, timeout=5) as resp:
            rate_data = json.loads(resp.read().decode())
    except Exception:
        pass
        
    # Use whichever has the active tracking data
    active_data = rate_data if (rate_data and isinstance(rate_data, dict)) else local_data
    
    if active_data and isinstance(active_data, dict):
        first_attempt = active_data.get("firstAttempt", now)
        last_attempt = active_data.get("lastAttempt", 0)
        count = active_data.get("count", 0)
        
        # 1. Check consecutive 1-minute interval
        if last_attempt and (now - last_attempt) < MIN_RESEND_INTERVAL:
            wait_time = MIN_RESEND_INTERVAL - (now - last_attempt)
            return False, count, wait_time, f"Please wait {wait_time} second{'s' if wait_time != 1 else ''} before requesting another code."
        
        # 2. Check 15-minute window limit (max 3)
        if (now - first_attempt) < OTP_WINDOW_SECONDS:
            if count >= MAX_OTP_REQUESTS:
                wait_time = OTP_WINDOW_SECONDS - (now - first_attempt)
                wait_mins = int(wait_time / 60) + 1
                return False, count, wait_time, f"OTP limit reached (max 3 requests per 15 minutes). Please wait {wait_mins} minute{'s' if wait_mins != 1 else ''} before requesting another code."
            else:
                new_count = count + 1
                new_data = {"firstAttempt": first_attempt, "count": new_count, "lastAttempt": now}
        else:
            # Window expired (15 mins passed), reset counter
            new_count = 1
            new_data = {"firstAttempt": now, "count": 1, "lastAttempt": now}
    else:
        new_count = 1
        new_data = {"firstAttempt": now, "count": 1, "lastAttempt": now}
        
    # Update local in-memory store
    _LOCAL_OTP_RATE_LIMITS[encoded_key] = new_data
    if clean_email:
        _LOCAL_OTP_RATE_LIMITS[clean_email] = new_data
        
    # Save to Firebase RTDB
    try:
        put_req = urllib.request.Request(
            limit_url,
            data=json.dumps(new_data).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="PUT"
        )
        with urllib.request.urlopen(put_req, timeout=5):
            pass
    except Exception:
        pass
        
    return True, new_count, 0, ""

_LOCAL_OTPS = {}

@app.route("/api/send-otp", methods=["POST", "OPTIONS"])
def api_send_otp():
    if request.method == "OPTIONS":
        return "", 200
        
    body = request.get_json(silent=True) or {}
    email = (body.get("email") or "").strip().lower()
    
    if not email or "@" not in email:
        return jsonify({"error": "A valid email address is required."}), 400

    encoded_key = encode_email_key(email)
    
    # 0. Enforce Rate Limiting (1-min consecutive buffer + max 3 per 15 mins)
    allowed, attempts_used, wait_seconds, rate_err = check_and_update_otp_rate_limit(encoded_key, email)
    if not allowed:
        return jsonify({
            "error": rate_err or f"OTP request limit reached. Please wait {wait_seconds}s.",
            "retryAfter": wait_seconds
        }), 429
    
    try:
        # 1. Check if email exists in registeredTeams in Firebase RTDB
        team_data = None
        try:
            team_url = f"{FIREBASE_DATABASE_URL}/registeredTeams/{encoded_key}.json"
            team_req = urllib.request.Request(team_url)
            with urllib.request.urlopen(team_req, timeout=5) as resp:
                team_data = json.loads(resp.read().decode())
        except Exception:
            pass
            
        if not team_data:
            # Fallback: Query live Google Sheet directly
            team_data = fetch_team_from_sheet_live(email)

        if not team_data:
            return jsonify({"error": f"No registered team found for \"{email}\". Please ensure you enter the email used during team registration in the Google Form."}), 404
            
        team_name = team_data.get("Team Name:") or team_data.get("Team Name") or team_data.get("Team Leader's Name:") or "Participant"
        
        # 2. Generate 6-digit OTP code
        otp_code = f"{random.randint(100000, 999999)}"
        expires_at = int(time.time()) + 600  # 10 minutes
        
        otp_payload = {
            "code": otp_code,
            "email": email,
            "expiresAt": expires_at,
            "teamName": team_name,
            "failedAttempts": 0
        }
        
        # 3. Store OTP in memory fallback and Firebase RTDB
        _LOCAL_OTPS[encoded_key] = otp_payload
        _LOCAL_OTPS[email] = otp_payload
        
        try:
            otp_url = f"{FIREBASE_DATABASE_URL}/otpCodes/{encoded_key}.json"
            put_req = urllib.request.Request(
                otp_url, 
                data=json.dumps(otp_payload).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="PUT"
            )
            with urllib.request.urlopen(put_req, timeout=5) as resp:
                pass
        except Exception:
            pass
            
        # 4. Dispatch Email via Gmail SMTP
        send_otp_email(email, otp_code, team_name)
        
        attempts_left = MAX_OTP_REQUESTS - attempts_used
        attempt_note = f" (Attempt {attempts_used}/3)" if attempts_used > 1 else ""
        
        return jsonify({
            "success": True,
            "message": f"6-digit verification code sent to {email}.{attempt_note} Please check your inbox and spam folder.",
            "attemptsUsed": attempts_used,
            "attemptsRemaining": attempts_left
        }), 200
        
    except Exception as e:
        print("[ERROR in /api/send-otp]:", e, file=sys.stderr)
        return jsonify({"error": f"Failed to dispatch verification email: {str(e)}"}), 500

@app.route("/api/verify-otp", methods=["POST", "OPTIONS"])
def api_verify_otp():
    if request.method == "OPTIONS":
        return "", 200
        
    body = request.get_json(silent=True) or {}
    email = (body.get("email") or "").strip().lower()
    code = (body.get("code") or "").strip()
    
    if not email or not code:
        return jsonify({"error": "Email and 6-digit code are required."}), 400

    encoded_key = encode_email_key(email)
    
    try:
        # 1. Fetch OTP record from Firebase RTDB or in-memory fallback
        otp_data = _LOCAL_OTPS.get(encoded_key) or _LOCAL_OTPS.get(email)
        try:
            otp_url = f"{FIREBASE_DATABASE_URL}/otpCodes/{encoded_key}.json"
            otp_req = urllib.request.Request(otp_url)
            with urllib.request.urlopen(otp_req, timeout=5) as resp:
                fb_otp_data = json.loads(resp.read().decode())
                if fb_otp_data and isinstance(fb_otp_data, dict):
                    otp_data = fb_otp_data
        except Exception:
            pass
            
        if not otp_data:
            return jsonify({"error": "No active verification code found for this email. Please request a new code."}), 400
            
        now = int(time.time())
        if now > otp_data.get("expiresAt", 0):
            return jsonify({"error": "Verification code has expired. Please request a new code."}), 400
            
        if str(otp_data.get("code")).strip() != code:
            failed_count = otp_data.get("failedAttempts", 0) + 1
            if failed_count >= 3:
                # Invalidate OTP on 3 consecutive wrong attempts
                _LOCAL_OTPS.pop(encoded_key, None)
                _LOCAL_OTPS.pop(email, None)
                try:
                    del_req = urllib.request.Request(f"{FIREBASE_DATABASE_URL}/otpCodes/{encoded_key}.json", method="DELETE")
                    with urllib.request.urlopen(del_req, timeout=5):
                        pass
                except Exception:
                    pass
                return jsonify({"error": "Too many invalid code attempts (max 3). This verification code has expired. Please request a new code."}), 400
            else:
                otp_data["failedAttempts"] = failed_count
                _LOCAL_OTPS[encoded_key] = otp_data
                _LOCAL_OTPS[email] = otp_data
                remaining = 3 - failed_count
                return jsonify({"error": f"Invalid verification code. {remaining} attempt{'s' if remaining != 1 else ''} remaining."}), 400
            
        # 2. OTP is valid! Fetch full team data
        team_data = fetch_team_from_sheet_live(email)
            
        # 3. Clean up the used OTP
        _LOCAL_OTPS.pop(encoded_key, None)
        _LOCAL_OTPS.pop(email, None)
        try:
            del_req = urllib.request.Request(f"{FIREBASE_DATABASE_URL}/otpCodes/{encoded_key}.json", method="DELETE")
            with urllib.request.urlopen(del_req, timeout=5):
                pass
        except Exception:
            pass
            
        return jsonify({
            "success": True,
            "message": "Verification successful!",
            "team": team_data
        }), 200
        
    except Exception as e:
        print("[ERROR in /api/verify-otp]:", e, file=sys.stderr)
        return jsonify({"error": f"Verification error: {str(e)}"}), 500

@app.route("/api/submission", methods=["GET", "OPTIONS"])
def api_get_submission():
    if request.method == "OPTIONS":
        return "", 200
        
    team_id = (request.args.get("team_id") or request.args.get("teamId") or "").strip().upper()
    email = (request.args.get("email") or "").strip().lower()
    
    if not team_id and not email:
        return jsonify({"error": "team_id or email is required"}), 400

    submission_data = None
    
    # Check Google Sheet as the authoritative single source of truth
    try:
        sheet_id = get_sheet_id()
        sa_email = os.environ.get("GOOGLE_SERVICE_ACCOUNT_EMAIL")
        sa_key = os.environ.get("GOOGLE_PRIVATE_KEY", "").replace("\\n", "\n")
        if sa_email and sa_key:
            from google.oauth2.service_account import Credentials
            from googleapiclient.discovery import build
            creds = Credentials.from_service_account_info({
                'type': 'service_account',
                'client_email': sa_email,
                'private_key': sa_key,
                'token_uri': 'https://oauth2.googleapis.com/token'
            }, scopes=['https://www.googleapis.com/auth/spreadsheets'])
            service = build('sheets', 'v4', credentials=creds)
            resp = service.spreadsheets().values().get(spreadsheetId=sheet_id, range='Sheet1!A1:Z').execute()
            rows = resp.get('values', [])
            if rows and len(rows) > 1:
                headers = rows[0]
                cbc_idx = 0
                email_idx = 3
                github_idx = 5
                ppt_idx = 4
                for idx, h in enumerate(headers):
                    h_clean = str(h).strip().lower()
                    if 'cbc' in h_clean or 'team id' in h_clean:
                        cbc_idx = idx
                    elif 'email' in h_clean or 'mail' in h_clean:
                        email_idx = idx
                    elif 'github' in h_clean or 'repo' in h_clean:
                        github_idx = idx
                    elif 'ppt' in h_clean or 'presentation' in h_clean:
                        ppt_idx = idx

                norm_tid = normalize_cbc_id(team_id) if team_id else ""
                clean_email = email.lower().strip() if email else ""

                target_row = None
                if clean_email:
                    for row in rows[1:]:
                        r_email = row[email_idx].lower().strip() if len(row) > email_idx else ""
                        if r_email and clean_email == r_email:
                            target_row = row
                            break
                        for cell in row:
                            if str(cell).lower().strip() == clean_email:
                                target_row = row
                                break
                        if target_row:
                            break
                elif norm_tid:
                    for row in rows[1:]:
                        r_tid = row[cbc_idx].strip() if len(row) > cbc_idx else ""
                        if normalize_cbc_id(r_tid) == norm_tid:
                            target_row = row
                            break

                if target_row:
                    r_tid = target_row[cbc_idx].strip() if len(target_row) > cbc_idx else ""
                    r_github = target_row[github_idx].strip() if len(target_row) > github_idx else ""
                    r_ppt = target_row[ppt_idx].strip() if len(target_row) > ppt_idx else ""
                    if r_github:
                        submission_data = {
                            "teamId": r_tid or norm_tid,
                            "cbcId": r_tid or norm_tid,
                            "githubUrl": r_github,
                            "pptUrl": r_ppt,
                            "submitted": True
                        }
    except Exception as e:
        print(f"Warning checking sheet for submission: {e}", file=sys.stderr)
        
    return jsonify({
        "submitted": bool(submission_data and submission_data.get("githubUrl")),
        "submission": submission_data
    }), 200

@app.route("/api/submit-repo", methods=["POST", "OPTIONS"])
def api_submit_repo():
    if request.method == "OPTIONS":
        return "", 200
        
    body = request.get_json(silent=True) or {}
    email = (body.get("email") or body.get("leaderEmail") or body.get("leader_email") or "").strip().lower()
    github_url = (body.get("githubUrl") or body.get("github_url") or "").strip()
    team_id = (body.get("cbcId") or body.get("cbc_id") or body.get("teamId") or body.get("team_id") or "").strip().upper()
    ppt_url = (body.get("pptUrl") or body.get("ppt_url") or body.get("ppt") or body.get("presentationUrl") or "").strip()
    branch = (body.get("branch") or "main").strip()
    live_demo_url = (body.get("liveDemoUrl") or body.get("live_demo_url") or "").strip()
    project_title = (body.get("projectTitle") or body.get("project_title") or "").strip()
    description = (body.get("description") or body.get("notes") or "").strip()
    tech_stack = body.get("techStack") or body.get("tech_stack") or []
    team_name = (body.get("teamName") or body.get("team_name") or "").strip()

    if not email and not team_id:
        return jsonify({"error": "Team leader email is required."}), 400
    if not github_url:
        return jsonify({"error": "GitHub repository URL is required."}), 400

    # Validate GitHub URL format
    github_pattern = r"^https?:\/\/(www\.)?github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(\/)?$"
    if not re.match(github_pattern, github_url):
        return jsonify({"error": "Invalid GitHub repository URL. Must be in the format: https://github.com/owner/repository"}), 400

    now_iso = datetime.datetime.utcnow().isoformat() + "Z"
    norm_tid = normalize_cbc_id(team_id) if team_id else ""
    clean_email = email.lower().strip() if email else ""

    # 1. Fetch Google Sheet to check existing submission in Column F (Strict One-Time Submission Rule)
    sheet_id = get_sheet_id()
    sa_email = os.environ.get("GOOGLE_SERVICE_ACCOUNT_EMAIL")
    sa_key = os.environ.get("GOOGLE_PRIVATE_KEY", "").replace("\\n", "\n")
    if sa_email and sa_key:
        try:
            from google.oauth2.service_account import Credentials
            from googleapiclient.discovery import build
            creds = Credentials.from_service_account_info({
                'type': 'service_account',
                'client_email': sa_email,
                'private_key': sa_key,
                'token_uri': 'https://oauth2.googleapis.com/token'
            }, scopes=['https://www.googleapis.com/auth/spreadsheets'])
            service = build('sheets', 'v4', credentials=creds)
            resp = service.spreadsheets().values().get(spreadsheetId=sheet_id, range='Sheet1!A1:Z').execute()
            rows = resp.get('values', [])
            if rows and len(rows) > 1:
                headers = rows[0]
                cbc_col = 0
                email_col = 3
                github_col = 5
                for idx, h in enumerate(headers):
                    hc = str(h).strip().lower()
                    if 'cbc' in hc or 'team id' in hc: cbc_col = idx
                    elif 'email' in hc or 'mail' in hc: email_col = idx
                    elif 'github' in hc or 'repo' in hc: github_col = idx

                target_row = None
                if clean_email:
                    for row in rows[1:]:
                        r_email = row[email_col].lower().strip() if len(row) > email_col else ""
                        if r_email and clean_email == r_email:
                            target_row = row
                            break
                        for cell in row:
                            if str(cell).lower().strip() == clean_email:
                                target_row = row
                                break
                        if target_row:
                            break
                elif norm_tid:
                    for row in rows[1:]:
                        r_tid = row[cbc_col].strip() if len(row) > cbc_col else ""
                        if normalize_cbc_id(r_tid) == norm_tid:
                            target_row = row
                            break

                if target_row:
                    r_tid = target_row[cbc_col].strip() if len(target_row) > cbc_col else ""
                    if not team_id:
                        team_id = r_tid
                        norm_tid = normalize_cbc_id(r_tid)
                    existing_repo = target_row[github_col].strip() if len(target_row) > github_col else ""
                    if existing_repo:
                        return jsonify({
                            "error": "Submission is locked. A final project repository submission has already been recorded for your team. Only one-time submissions are permitted.",
                            "locked": True,
                            "submission": {
                                "teamId": r_tid or norm_tid,
                                "cbcId": r_tid or norm_tid,
                                "githubUrl": existing_repo,
                                "submitted": True
                            }
                        }), 403
        except Exception as check_e:
            print(f"Notice checking existing sheet entry: {check_e}", file=sys.stderr)

    safe_tid = re.sub(r'[\s\-_]', '', norm_tid or team_id or email).upper()
    submitted_at = now_iso

    payload = {
        "teamId": team_id or norm_tid,
        "teamName": team_name,
        "leaderEmail": email,
        "githubUrl": github_url,
        "pptUrl": ppt_url,
        "branch": branch or "main",
        "liveDemoUrl": live_demo_url,
        "projectTitle": project_title,
        "description": description,
        "techStack": tech_stack if isinstance(tech_stack, list) else [str(tech_stack)],
        "submittedAt": submitted_at,
        "lastUpdatedAt": now_iso
    }

    # 1. Sync directly to Google Sheet (Primary target)
    sheet_synced, sheet_err = sync_submission_to_google_sheet(team_id, email, github_url, payload.get("pptUrl", ""))
    if not sheet_synced and sheet_err:
        return jsonify({"error": sheet_err}), 400

    # 2. Non-blocking backup to Firebase RTDB
    try:
        put_url = f"{FIREBASE_DATABASE_URL}/submissions/{safe_tid}.json"
        put_req = urllib.request.Request(
            put_url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="PUT"
        )
        with urllib.request.urlopen(put_req, timeout=5):
            pass
    except Exception as fb_err:
        print(f"Notice: Firebase RTDB save skipped ({fb_err})", file=sys.stderr)

    try:
        if email:
            encoded_key = encode_email_key(email)
            email_put_url = f"{FIREBASE_DATABASE_URL}/submissionsByEmail/{encoded_key}.json"
            email_put_req = urllib.request.Request(
                email_put_url,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="PUT"
            )
            with urllib.request.urlopen(email_put_req, timeout=5):
                pass
    except Exception as fb_err:
        print(f"Notice: Firebase RTDB email save skipped ({fb_err})", file=sys.stderr)

    return jsonify({
        "success": True,
        "message": "Project repository details submitted and synced successfully!",
        "submission": payload
    }), 200

@app.route("/api/update-github", methods=["POST", "OPTIONS"])
def api_update_github():
    """
    Direct endpoint to add or update the GitHub repository URL in Column E of the Google Sheet for a given CBC ID.
    Payload: { "cbcId": "CBC049", "githubUrl": "https://github.com/...", "pptUrl": "https://..." }
    """
    if request.method == "OPTIONS":
        return "", 200

    body = request.get_json(silent=True) or {}
    cbc_id = (body.get("cbcId") or body.get("cbc_id") or body.get("teamId") or body.get("team_id") or "").strip()
    github_url = (body.get("githubUrl") or body.get("github_url") or body.get("repoLink") or body.get("repo_link") or "").strip()
    ppt_url = (body.get("pptUrl") or body.get("ppt_url") or body.get("ppt") or "").strip()
    email = (body.get("email") or "").strip().lower()

    if not cbc_id:
        return jsonify({"error": "CBC ID is required (e.g. CBC049)."}), 400
    if not github_url:
        return jsonify({"error": "GitHub repository URL is required."}), 400

    github_pattern = r"^https?:\/\/(www\.)?github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(\/)?$"
    if not re.match(github_pattern, github_url):
        return jsonify({"error": "Invalid GitHub repository URL format. Example: https://github.com/owner/repository"}), 400

    norm_id = normalize_cbc_id(cbc_id)
    safe_tid = re.sub(r'[\s\-_]', '', norm_id).upper()
    now_iso = datetime.datetime.utcnow().isoformat() + "Z"

    # 1. Update Google Sheet
    sheet_synced, sheet_err = sync_submission_to_google_sheet(
        team_id=norm_id,
        email=email,
        github_url=github_url,
        ppt_url=ppt_url
    )

    if not sheet_synced and sheet_err:
        return jsonify({"error": sheet_err}), 400

    payload = {
        "teamId": norm_id,
        "githubUrl": github_url,
        "pptUrl": ppt_url,
        "lastUpdatedAt": now_iso
    }

    try:
        put_url = f"{FIREBASE_DATABASE_URL}/submissions/{safe_tid}.json"
        put_req = urllib.request.Request(
            put_url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="PUT"
        )
        with urllib.request.urlopen(put_req, timeout=5):
            pass
    except Exception:
        pass

    return jsonify({
        "success": True,
        "message": f"GitHub repo link added to Google Sheet for {norm_id}!",
        "cbcId": norm_id,
        "githubUrl": github_url,
        "sheetUpdated": sheet_synced
    }), 200

@app.route("/api/team", methods=["GET", "OPTIONS"])
def api_team():
    if request.method == "OPTIONS":
        return "", 200
    team_id = (request.args.get("team_id") or "").strip()
    if not team_id:
        return jsonify({"error": "team_id is required"}), 400
    try:
        team = get_team_members(team_id)
    except Exception as err:
        print(err)
        return jsonify({"error": str(err) or "Server error"}), 500
    if not team or not team.get("members"):
        return jsonify({"error": f"No team found with ID '{team_id}'"}), 404
    return jsonify(team), 200

@app.route("/api/mark", methods=["POST", "OPTIONS"])
def api_mark():
    if request.method == "OPTIONS":
        return "", 200
    body = request.get_json(silent=True) or {}
    row = body.get("row")
    if not row:
        return jsonify({"error": "row is required"}), 400

    try:
        if "present" in body:
            present = bool(body.get("present"))
            set_attendance(row, present)
            return jsonify({"ok": True, "row": row, "present": present}), 200
        elif "meal" in body:
            meal = body.get("meal")
            valid_meals = MEALS if MEALS else ("lunch", "dinner", "tiffin")
            if meal not in valid_meals:
                return jsonify({"error": f"meal must be one of: {', '.join(valid_meals)}"}), 400
            taken = bool(body.get("taken"))
            set_meal(row, meal, taken)
            return jsonify({"ok": True, "row": row, "meal": meal, "taken": taken}), 200
        else:
            return jsonify({"error": "Provide either 'present' or 'meal'+'taken'"}), 400
    except Exception as err:
        print(err)
        return jsonify({"error": str(err) or "Server error"}), 500

# Chatbot imports and routes
try:
    try:
        from .chatbot.engine import get_engine
    except (ImportError, ValueError):
        try:
            from chatbot.engine import get_engine
        except ImportError:
            from api.chatbot.engine import get_engine
except Exception as e:
    print("Warning: chatbot engine could not be loaded:", e, file=sys.stderr)
    get_engine = None

@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json(silent=True) or {}
    message = (data.get("message") or "").strip()
    if not message:
        return jsonify({"error": "Empty message"}), 400

    try:
        engine = get_engine()
        result = engine.answer(message)
        return jsonify(result)
    except Exception as e:
        print("Chatbot error:", str(e))
        return jsonify({"error": "Internal chatbot error"}), 500

@app.route("/api/suggestions")
def suggestions():
    return jsonify([
        "When is the event?",
        "What is the registration fee?",
        "What is the team size?",
        "Who is the convenor?",
        "How do I register?",
        "What is the prize money?",
    ])

@app.route("/api/sync-ppt", methods=["GET", "POST", "OPTIONS"])
def api_sync_ppt():
    """
    Syncs PPT Google Drive upload links from Google Form response sheet (1eLuaO7Ve2wA0qyrJnjI6wE6DBRgSYznaK_SnXNPreRA)
    to Column E ('PPT') of the main Submissions sheet (1BeBH4_azgkQo0HJyJ6eUhzqGGO5czA7xHN_wJuoUqVw) mapped by CBC ID.
    """
    if request.method == "OPTIONS":
        return "", 200
    try:
        try:
            from api.sync_ppt import sync_ppt_to_submissions
        except (ImportError, ValueError):
            from sync_ppt import sync_ppt_to_submissions
        res = sync_ppt_to_submissions(dry_run=False)
        return jsonify(res), 200
    except Exception as e:
        print("[ERROR in /api/sync-ppt]:", e, file=sys.stderr)
        return jsonify({"error": str(e)}), 500

@app.route("/", defaults={"path": ""}, methods=["GET", "POST"])
@app.route("/<path:path>", methods=["GET", "POST"])
def catch_all(path):
    return jsonify({"caught": True, "path": request.path}), 404

if __name__ == "__main__":
    app.run(debug=True, port=5000)
