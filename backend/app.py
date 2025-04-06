from flask import Flask, request, jsonify, send_from_directory
from disease_db import disease_db
from user_data import set_profile, save_symptoms, save_diagnosis, save_reminder, user_data
from datetime import datetime, timedelta

app = Flask(__name__, static_folder="../static", static_url_path="")

def diagnose(symptoms_data):
    user_symptoms = {}
    for s in symptoms_data:
        user_symptoms[s["name"]] = {"severity": s.get("severity", 0), "duration": s.get("duration", 0)}
    save_symptoms(user_symptoms)
    
    best_match, max_score = None, 0
    for disease, data in disease_db.items():
        score = 0
        matches = 0
        for symptom, details in data["symptoms"].items():
            if symptom in user_symptoms:
                matches += 1
                base_score = details["weight"]
                if details["severe_threshold"] and user_symptoms[symptom]["severity"] >= details["severe_threshold"]:
                    score += base_score * 1.5  # Boost for severe symptoms
                elif details["duration_concern"] and user_symptoms[symptom]["duration"] >= details["duration_concern"]:
                    score += base_score * 1.2  # Boost for prolonged duration
                else:
                    score += base_score
        if matches >= 2 and score > max_score:
            max_score = score
            best_match = disease
    
    if best_match:
        save_diagnosis(best_match)
        age = user_data["profile"]["age"]
        meds = data["medications"]["default"].copy()
        if max_score > 3 or any(user_symptoms[s]["severity"] >= data["symptoms"][s]["severe_threshold"] for s in user_symptoms if s in data["symptoms"]):
            meds.extend(data["medications"]["severe"])
        if age:
            age_key = f"age < {12 if age < 12 else 18 if age < 18 else 65 if age > 65 else ''}"
            if age_key in data["medications"]:
                meds.extend(data["medications"][age_key])
        return {
            "disease": best_match,
            "matched_symptoms": list(user_symptoms.keys() & data["symptoms"].keys()),
            "medications": meds,
            "preventions": data["preventions"],
            "score": max_score
        }
    return {"disease": None, "message": "No clear diagnosis."}

@app.route("/")
def serve_frontend():
    return send_from_directory(app.static_folder, "index.html")

@app.route("/<path:path>")
def serve_static(path):
    return send_from_directory(app.static_folder, path)

@app.route("/diagnose", methods=["POST"])
def diagnose_endpoint():
    data = request.json
    symptoms = data.get("symptoms", [])
    result = diagnose(symptoms)
    return jsonify(result)

@app.route("/reminder", methods=["POST"])
def reminder_endpoint():
    data = request.json
    med = data.get("med")
    time_str = data.get("time")
    reminder_time = datetime.strptime(time_str, "%H:%M").replace(
        year=datetime.now().year, month=datetime.now().month, day=datetime.now().day
    )
    if reminder_time < datetime.now():
        reminder_time += timedelta(days=1)
    save_reminder(med, reminder_time)
    return jsonify({"message": f"Reminder set for {med} at {time_str}"})

@app.route("/history", methods=["GET"])
def history_endpoint():
    return jsonify(user_data)

@app.route("/check_reminders", methods=["GET"])
def check_reminders_endpoint():
    now = datetime.now()
    reminders = []
    for reminder in user_data["reminders"][:]:
        time_diff = (reminder["time"] - now).total_seconds()
        if 0 <= time_diff <= 60:
            reminders.append(f"Time to take {reminder['med']}!")
            user_data["reminders"].remove(reminder)
    return jsonify({"reminders": reminders})

@app.route("/set_profile", methods=["POST"])
def set_profile_endpoint():
    data = request.json
    age = data.get("age")
    set_profile(age)
    return jsonify({"message": f"Profile updated: Age set to {age}"})

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)