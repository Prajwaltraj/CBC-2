import sys; print("FLASK APP LOADED", file=sys.stderr, flush=True)
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import random
import time
import urllib.parse
import urllib.request
import json
from flask import Flask, request, jsonify

try:
    try:
        from ._sheets import get_team_members, set_attendance, set_meal
    except ImportError:
        from _sheets import get_team_members, set_attendance, set_meal
except Exception as e:
    print("Warning: _sheets could not be loaded:", e, file=sys.stderr)
    get_team_members = None
    set_attendance = None
    set_meal = None

app = Flask(__name__)

# Email Configuration
GMAIL_USER = os.environ.get("GMAIL_USER", "cbc2.o.tech@gmail.com")
GMAIL_PASS = os.environ.get("GMAIL_PASS", "spdztbcrixmulsms")
FIREBASE_DATABASE_URL = os.environ.get("FIREBASE_DATABASE_URL", "https://cbc20-3af58-default-rtdb.firebaseio.com")

def encode_email_key(email: str) -> str:
    key = email.lower().strip()
    for char in ['.', '#', '$', '[', ']', '/']:
        key = key.replace(char, '_')
    return urllib.parse.quote(key)

def send_otp_email(to_email: str, otp_code: str, team_name: str = "Participant"):
    subject = f"{otp_code} is your CBC 2.0 Verification Code"
    
    html_content = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #030712; color: #f3f4f6; margin: 0; padding: 0; }}
        .container {{ max-width: 520px; margin: 40px auto; background: #0b0f19; border: 1px solid #1f2937; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,243,255,0.1); }}
        .header {{ background: linear-gradient(135deg, rgba(0,243,255,0.15), rgba(188,19,254,0.15)); padding: 32px 24px; text-align: center; border-bottom: 1px solid #1f2937; }}
        .title {{ font-size: 24px; font-weight: 800; color: #00F3FF; letter-spacing: 2px; margin: 0; text-transform: uppercase; }}
        .subtitle {{ color: #9ca3af; font-size: 13px; margin-top: 6px; }}
        .body {{ padding: 32px 24px; text-align: center; }}
        .greeting {{ font-size: 16px; color: #e5e7eb; margin-bottom: 16px; }}
        .otp-box {{ background: #111827; border: 2px dashed #00F3FF; border-radius: 12px; padding: 16px 24px; display: inline-block; margin: 16px 0 24px; }}
        .otp-code {{ font-family: 'Courier New', monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #00F3FF; margin: 0; }}
        .expiry {{ font-size: 13px; color: #9ca3af; margin-bottom: 16px; }}
        .footer {{ background: #030712; padding: 20px; text-align: center; border-top: 1px solid #1f2937; font-size: 12px; color: #6b7280; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="title">CBC 2.0</h1>
            <div class="subtitle">Secure Team Verification</div>
        </div>
        <div class="body">
            <div class="greeting">Hello <strong>{team_name}</strong>,</div>
            <p style="color: #9ca3af; font-size: 14px; line-height: 1.6; margin: 0;">Use the 6-digit verification code below to access your official team dashboard.</p>
            <div class="otp-box">
                <div class="otp-code">{otp_code}</div>
            </div>
            <div class="expiry">⏱ This code is valid for <strong>10 minutes</strong>. Do not share it with anyone.</div>
        </div>
        <div class="footer">
            © 2026 CBC 2.0 Hackathon. If you did not request this code, please ignore this email.
        </div>
    </div>
</body>
</html>"""
    
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"CBC 2.0 Hackathon <{GMAIL_USER}>"
    msg["To"] = to_email
    
    text_part = MIMEText(f"Your CBC 2.0 Verification Code is: {otp_code}\nThis code is valid for 10 minutes.", "plain")
    html_part = MIMEText(html_content, "html")
    msg.attach(text_part)
    msg.attach(html_part)
    
    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(GMAIL_USER, GMAIL_PASS)
        server.send_message(msg)

@app.route("/api/send-otp", methods=["POST", "OPTIONS"])
def api_send_otp():
    if request.method == "OPTIONS":
        return "", 200
        
    body = request.get_json(silent=True) or {}
    email = (body.get("email") or "").strip().lower()
    
    if not email or "@" not in email:
        return jsonify({"error": "A valid email address is required."}), 400
        
    encoded_key = encode_email_key(email)
    
    try:
        # 1. Check if email exists in registeredTeams in Firebase RTDB
        team_url = f"{FIREBASE_DATABASE_URL}/registeredTeams/{encoded_key}.json"
        team_req = urllib.request.Request(team_url)
        with urllib.request.urlopen(team_req, timeout=8) as resp:
            team_data = json.loads(resp.read().decode())
            
        if not team_data:
            return jsonify({"error": f"No registered team found for \"{email}\". Please ensure you enter the email used during team registration."}), 404
            
        team_name = team_data.get("Team Name:") or team_data.get("Team Name") or team_data.get("Team Leader's Name:") or "Participant"
        
        # 2. Generate 6-digit OTP code
        otp_code = f"{random.randint(100000, 999999)}"
        expires_at = int(time.time()) + 600  # 10 minutes
        
        otp_payload = {
            "code": otp_code,
            "email": email,
            "expiresAt": expires_at,
            "teamName": team_name
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
        
        return jsonify({
            "success": True,
            "message": f"6-digit verification code sent to {email}. Please check your inbox and spam folder."
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
            return jsonify({"error": "Invalid verification code. Please check your email and try again."}), 400
            
        # 2. OTP is valid! Fetch full team data
        team_url = f"{FIREBASE_DATABASE_URL}/registeredTeams/{encoded_key}.json"
        team_req = urllib.request.Request(team_url)
        with urllib.request.urlopen(team_req, timeout=8) as resp:
            team_data = json.loads(resp.read().decode())
            
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

@app.route("/api/team", methods=["GET"])
def api_team():
    team_id = (request.args.get("team_id") or "").strip()
    if not team_id:
        return jsonify({"error": "team_id is required"}), 400
    try:
        team = get_team_members(team_id)
    except Exception as err:
        print(err)
        return jsonify({"error": str(err) or "Server error"}), 500
    if not team["members"]:
        return jsonify({"error": f"No team found with ID '{team_id}'"}), 404
    return jsonify(team), 200

@app.route("/api/mark", methods=["POST"])
def api_mark():
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
    except ImportError:
        from chatbot.engine import get_engine
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
