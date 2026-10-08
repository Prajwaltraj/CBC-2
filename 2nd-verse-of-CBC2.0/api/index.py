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

GOOGLE_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/1YXQ83HwEVuY395BtJqlCkhjxcqGfXGC6ORbuIVWbroU/export?format=csv"

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
            GOOGLE_SHEET_CSV_URL,
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

MAX_OTP_REQUESTS = 3
OTP_WINDOW_SECONDS = 900  # 15 minutes cooldown window

def check_and_update_otp_rate_limit(encoded_key: str, email: str = ""):
    """
    Rate-limits OTP generation to a maximum of 3 requests per 15 minutes per email.
    Returns (allowed: bool, attempts_used: int, wait_seconds: int)
    """
    now = int(time.time())
    limit_url = f"{FIREBASE_DATABASE_URL}/otpRateLimits/{encoded_key}.json"
    
    rate_data = None
    try:
        req = urllib.request.Request(limit_url)
        with urllib.request.urlopen(req, timeout=5) as resp:
            rate_data = json.loads(resp.read().decode())
    except Exception as e:
        print(f"Warning fetching rate limit data: {e}", file=sys.stderr)
        
    if rate_data and isinstance(rate_data, dict):
        first_attempt = rate_data.get("firstAttempt", now)
        count = rate_data.get("count", 0)
        
        # If still within the 15-minute window
        if (now - first_attempt) < OTP_WINDOW_SECONDS:
            if count >= MAX_OTP_REQUESTS:
                wait_time = OTP_WINDOW_SECONDS - (now - first_attempt)
                return False, count, wait_time
            else:
                new_count = count + 1
                new_data = {"firstAttempt": first_attempt, "count": new_count, "lastAttempt": now}
        else:
            # Window expired, reset counter for new window
            new_count = 1
            new_data = {"firstAttempt": now, "count": 1, "lastAttempt": now}
    else:
        new_count = 1
        new_data = {"firstAttempt": now, "count": 1, "lastAttempt": now}
        
    # Save updated rate limit record to Firebase RTDB
    try:
        put_req = urllib.request.Request(
            limit_url,
            data=json.dumps(new_data).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="PUT"
        )
        with urllib.request.urlopen(put_req, timeout=5):
            pass
    except Exception as e:
        print(f"Warning saving rate limit data: {e}", file=sys.stderr)
        
    return True, new_count, 0

@app.route("/api/send-otp", methods=["POST", "OPTIONS"])
def api_send_otp():
    if request.method == "OPTIONS":
        return "", 200
        
    body = request.get_json(silent=True) or {}
    email = (body.get("email") or "").strip().lower()
    
    if not email or "@" not in email:
        return jsonify({"error": "A valid email address is required."}), 400

    encoded_key = encode_email_key(email)
    
    # 0. Enforce Rate Limiting (Max 3 OTP requests per 15 minutes)
    allowed, attempts_used, wait_seconds = check_and_update_otp_rate_limit(encoded_key, email)
    if not allowed:
        wait_mins = int(wait_seconds / 60) + 1
        return jsonify({
            "error": f"OTP request limit reached (max 3 requests per 15 minutes). Please wait {wait_mins} minute{'s' if wait_mins != 1 else ''} before requesting another code."
        }), 429
    
    try:
        # 1. Check if email exists in registeredTeams in Firebase RTDB
        team_url = f"{FIREBASE_DATABASE_URL}/registeredTeams/{encoded_key}.json"
        team_req = urllib.request.Request(team_url)
        with urllib.request.urlopen(team_req, timeout=8) as resp:
            team_data = json.loads(resp.read().decode())
            
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
        
        # 3. Store OTP in Firebase RTDB
        otp_url = f"{FIREBASE_DATABASE_URL}/otpCodes/{encoded_key}.json"
        put_req = urllib.request.Request(
            otp_url, 
            data=json.dumps(otp_payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="PUT"
        )
        with urllib.request.urlopen(put_req, timeout=8) as resp:
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
        # 1. Fetch OTP record from Firebase RTDB
        otp_url = f"{FIREBASE_DATABASE_URL}/otpCodes/{encoded_key}.json"
        otp_req = urllib.request.Request(otp_url)
        with urllib.request.urlopen(otp_req, timeout=8) as resp:
            otp_data = json.loads(resp.read().decode())
            
        if not otp_data:
            return jsonify({"error": "No active verification code found for this email. Please request a new code."}), 400
            
        now = int(time.time())
        if now > otp_data.get("expiresAt", 0):
            return jsonify({"error": "Verification code has expired. Please request a new code."}), 400
            
        if str(otp_data.get("code")).strip() != code:
            failed_count = otp_data.get("failedAttempts", 0) + 1
            if failed_count >= 3:
                # Invalidate OTP on 3 consecutive wrong attempts
                del_req = urllib.request.Request(otp_url, method="DELETE")
                try:
                    with urllib.request.urlopen(del_req, timeout=5):
                        pass
                except Exception:
                    pass
                return jsonify({"error": "Too many invalid code attempts (max 3). This verification code has expired. Please request a new code."}), 400
            else:
                otp_data["failedAttempts"] = failed_count
                put_req = urllib.request.Request(
                    otp_url,
                    data=json.dumps(otp_data).encode("utf-8"),
                    headers={"Content-Type": "application/json"},
                    method="PUT"
                )
                try:
                    with urllib.request.urlopen(put_req, timeout=5):
                        pass
                except Exception:
                    pass
                remaining = 3 - failed_count
                return jsonify({"error": f"Invalid verification code. {remaining} attempt{'s' if remaining != 1 else ''} remaining."}), 400
            
        # 2. OTP is valid! Fetch full team data
        team_url = f"{FIREBASE_DATABASE_URL}/registeredTeams/{encoded_key}.json"
        team_req = urllib.request.Request(team_url)
        with urllib.request.urlopen(team_req, timeout=8) as resp:
            team_data = json.loads(resp.read().decode())
            
        if not team_data:
            team_data = fetch_team_from_sheet_live(email)
            
        # 3. Clean up the used OTP
        del_req = urllib.request.Request(otp_url, method="DELETE")
        try:
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

@app.route("/", defaults={"path": ""}, methods=["GET", "POST"])
@app.route("/<path:path>", methods=["GET", "POST"])
def catch_all(path):
    return jsonify({"caught": True, "path": request.path}), 404

if __name__ == "__main__":
    app.run(debug=True, port=5000)
