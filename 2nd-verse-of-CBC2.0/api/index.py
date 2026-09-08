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
