import sys; print("FLASK APP LOADED", file=sys.stderr, flush=True)
from flask import Flask, request, jsonify

try:
    from ._sheets import get_team_members, set_attendance, set_meal
except ImportError:
    from _sheets import get_team_members, set_attendance, set_meal

app = Flask(__name__)

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
    from .chatbot.engine import get_engine
except ImportError:
    from chatbot.engine import get_engine

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
