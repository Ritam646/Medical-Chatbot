disease_db = {
    "influenza": {
        "symptoms": {
            "fever": {"weight": 0.9, "severe_threshold": 100.4, "duration_concern": 3},
            "cough": {"weight": 0.8, "severe_threshold": None, "duration_concern": 7},
            "fatigue": {"weight": 0.7, "severe_threshold": None, "duration_concern": 5},
            "body aches": {"weight": 0.6, "severe_threshold": None, "duration_concern": None},
            "sore throat": {"weight": 0.5, "severe_threshold": None, "duration_concern": None}
        },
        "medications": {
            "default": ["Ibuprofen (fever/pain)", "Hydration"],
            "severe": ["Oseltamivir (antiviral, if prescribed)"],
            "age < 12": ["Acetaminophen instead of Ibuprofen"]
        },
        "preventions": ["Annual flu vaccine", "Frequent handwashing", "Avoid sick contacts"]
    },
    "migraine": {
        "symptoms": {
            "headache": {"weight": 0.9, "severe_threshold": 7, "duration_concern": 2},
            "nausea": {"weight": 0.7, "severe_threshold": None, "duration_concern": None},
            "sensitivity to light": {"weight": 0.8, "severe_threshold": None, "duration_concern": None},
            "dizziness": {"weight": 0.6, "severe_threshold": None, "duration_concern": None}
        },
        "medications": {
            "default": ["Ibuprofen", "Hydration", "Rest in dark room"],
            "severe": ["Sumatriptan (if prescribed)"],
            "age < 18": ["Avoid Sumatriptan"]
        },
        "preventions": ["Avoid triggers (stress, noise)", "Maintain sleep schedule", "Limit caffeine"]
    },
    "gastroenteritis": {
        "symptoms": {
            "nausea": {"weight": 0.8, "severe_threshold": None, "duration_concern": 2},
            "vomiting": {"weight": 0.9, "severe_threshold": 5, "duration_concern": 1},
            "diarrhea": {"weight": 0.9, "severe_threshold": 5, "duration_concern": 1},
            "abdominal pain": {"weight": 0.7, "severe_threshold": 7, "duration_concern": None}
        },
        "medications": {
            "default": ["Oral rehydration salts", "Avoid solid food temporarily"],
            "severe": ["Loperamide (diarrhea, if prescribed)"],
            "age < 6": ["Consult pediatrician"]
        },
        "preventions": ["Wash hands before eating", "Cook food thoroughly", "Avoid contaminated water"]
    },
    "pneumonia": {
        "symptoms": {
            "fever": {"weight": 0.8, "severe_threshold": 102, "duration_concern": 3},
            "cough": {"weight": 0.9, "severe_threshold": None, "duration_concern": 7},
            "shortness of breath": {"weight": 0.9, "severe_threshold": None, "duration_concern": 1},
            "chest pain": {"weight": 0.7, "severe_threshold": 7, "duration_concern": None}
        },
        "medications": {
            "default": ["Ibuprofen (fever)", "Hydration"],
            "severe": ["Antibiotics (if bacterial, prescribed)", "Oxygen (if needed)"],
            "age > 65": ["Monitor closely"]
        },
        "preventions": ["Pneumococcal vaccine", "Quit smoking", "Good hygiene"]
    }
    # Add more diseases as needed
}