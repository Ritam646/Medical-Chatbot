from datetime import datetime, timedelta

user_data = {
    "profile": {"age": None},
    "symptoms": [],
    "diagnoses": [],
    "reminders": []
}

def set_profile(age):
    user_data["profile"]["age"] = age

def save_symptoms(symptoms):
    user_data["symptoms"].append({"symptoms": symptoms, "time": datetime.now().strftime("%Y-%m-%d %H:%M")})

def save_diagnosis(disease):
    user_data["diagnoses"].append({"disease": disease, "time": datetime.now().strftime("%Y-%m-%d %H:%M")})

def save_reminder(med, time):
    user_data["reminders"].append({"med": med, "time": time})