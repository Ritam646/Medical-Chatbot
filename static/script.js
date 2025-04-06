let symptoms = [];
const symptomSuggestions = [
    "fever", "cough", "fatigue", "headache", "nausea", "vomiting", "diarrhea",
    "shortness of breath", "chest pain", "body aches", "sore throat", "dizziness",
    "sensitivity to light", "increased thirst", "frequent urination", "blurred vision"
];
const API_URL = "http://localhost:5000"; 

function addMessage(text, from, isError = false, isLoading = false) {
    const chatBox = document.getElementById("chatBox");
    const message = document.createElement("div");
    message.className = `message ${from} ${isError ? "error" : ""} ${isLoading ? "loading" : ""}`;
    message.textContent = text;
    chatBox.appendChild(message);
    chatBox.scrollTop = chatBox.scrollHeight;
    if (from === "bot" && !isError && !isLoading) {
        new Audio("https://www.soundjay.com/buttons/beep-01a.mp3").play().catch(() => {});
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("active");
}

async function updateHistory() {
    try {
        addMessage("Loading history...", "bot", false, true);
        const res = await fetch(`${API_URL}/history`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        const historyContent = document.getElementById("historyContent");
        historyContent.textContent = `Age: ${data.profile.age || "Not set"}\n` +
                                    `Symptoms: ${data.symptoms.map(s => Object.keys(s.symptoms).join(", ")).join("; ") || "None"}\n` +
                                    `Diagnoses: ${data.diagnoses.map(d => d.disease).join(", ") || "None"}\n` +
                                    `Reminders: ${data.reminders.map(r => `${r.med} at ${r.time}`).join(", ") || "None"}`;
        chatBox.querySelector(".loading").textContent = "History loaded.";
    } catch (error) {
        addMessage(`Error fetching history: ${error.message}`, "bot", true);
    }
}

async function sendMessage() {
    const input = document.getElementById("userInput");
    const text = input.value.trim();
    if (!text) return;

    addMessage(text, "user");
    input.value = "";

    try {
        if (text.toLowerCase() === "symptoms") {
            document.getElementById("symptomForm").style.display = "block";
            addMessage("Add symptoms below with severity and duration, then click 'Done'.", "bot");
        } else if (text.toLowerCase().startsWith("reminder")) {
            const parts = text.split(" ");
            if (parts.length < 3) {
                addMessage("Use: reminder <medication> <HH:MM> (e.g., reminder Ibuprofen 12:00)", "bot");
                return;
            }
            const med = parts[1];
            const time = parts[2];
            if (!/^\d{2}:\d{2}$/.test(time)) {
                addMessage("Invalid time format. Use HH:MM (e.g., 12:00)", "bot");
                return;
            }
            addMessage("Setting reminder...", "bot", false, true);
            const res = await fetch(`${API_URL}/reminder`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ med, time })
            });
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();
            addMessage(data.message, "bot");
            updateHistory();
        } else if (text.toLowerCase().startsWith("age")) {
            const age = parseInt(text.split(" ")[1]);
            if (isNaN(age) || age < 0 || age > 150) {
                addMessage("Please provide a valid age (e.g., 'age 30')", "bot");
                return;
            }
            addMessage("Setting profile...", "bot", false, true);
            const res = await fetch(`${API_URL}/set_profile`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ age })
            });
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();
            addMessage(data.message, "bot");
            updateHistory();
        } else {
            addMessage("Try 'symptoms' to diagnose, 'reminder <med> <time>', or 'age <number>' to set profile.", "bot");
        }
    } catch (error) {
        addMessage(`Error: ${error.message}. Ensure the backend is running at ${API_URL}.`, "bot", true);
        if (error.message.includes("Failed to fetch") || error.message.includes("HTTP error")) {
            addMessage("Tip: Restart the backend with 'python backend/app.py' and check your network.", "bot", true);
        }
    }
}

function addSymptom() {
    const nameInput = document.getElementById("symptomName");
    const name = nameInput.value.trim().toLowerCase();
    const severity = parseFloat(document.getElementById("severity").value) || 0;
    const duration = parseInt(document.getElementById("duration").value) || 0;

    if (!name) {
        addMessage("Please enter a symptom name.", "bot");
        return;
    }
    if (!symptomSuggestions.includes(name)) {
        addMessage(`Warning: '${name}' is not a recognized symptom. Proceeding anyway.`, "bot");
    }
    if (severity < 0 || (severity > 10 && name !== "fever")) {
        addMessage("Severity must be between 0-10 (or °F for fever, e.g., 101).", "bot");
        return;
    }
    if (duration < 0) {
        addMessage("Duration cannot be negative.", "bot");
        return;
    }

    symptoms.push({ name, severity, duration });
    addMessage(`${name} (Severity: ${severity}${name === "fever" ? "°F" : ""}, Duration: ${duration} days)`, "user");
    nameInput.value = "";
    document.getElementById("severity").value = "";
    document.getElementById("duration").value = "";

    if (symptoms.length > 1) {
        fetchPreliminaryDiagnosis();
    }
}

async function fetchPreliminaryDiagnosis() {
    try {
        addMessage("Calculating preliminary diagnosis...", "bot", false, true);
        const res = await fetch(`${API_URL}/diagnose`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ symptoms })
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        if (data.disease) {
            addMessage(`Preliminary: Possible ${data.disease} (Score: ${data.score.toFixed(2)}). Add more or click 'Done'.`, "bot");
        }
    } catch (error) {
        addMessage(`Error in preliminary diagnosis: ${error.message}`, "bot", true);
    }
}

async function submitSymptoms() {
    if (symptoms.length === 0) {
        addMessage("Please add at least one symptom before submitting.", "bot");
        return;
    }

    try {
        addMessage("Diagnosing...", "bot", false, true);
        const res = await fetch(`${API_URL}/diagnose`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ symptoms })
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        if (data.disease) {
            const response = `Possible Diagnosis: ${data.disease.charAt(0).toUpperCase() + data.disease.slice(1)}\n` +
                            `Matched Symptoms: ${data.matched_symptoms.join(", ")}\n` +
                            `Medications: ${data.medications.join(", ")}\n` +
                            `Preventions: ${data.preventions.join(", ")}\n` +
                            `Confidence Score: ${data.score.toFixed(2)}`;
            addMessage(response, "bot");
        } else {
            addMessage(data.message, "bot");
        }
        addMessage("Disclaimer: Consult a doctor for professional advice!", "bot");
    } catch (error) {
        addMessage(`Error: ${error.message}. Ensure backend is running at ${API_URL}.`, "bot", true);
    }

    symptoms = [];
    document.getElementById("symptomForm").style.display = "none";
    updateHistory();
}

setInterval(async () => {
    try {
        addMessage("Checking reminders...", "bot", false, true);
        const res = await fetch(`${API_URL}/check_reminders`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        data.reminders.forEach(reminder => {
            addMessage(reminder, "bot");
            new Audio("https://www.soundjay.com/buttons/beep-07.mp3").play().catch(() => {});
        });
    } catch (error) {
        addMessage(`Error checking reminders: ${error.message}`, "bot", true);
    }
}, 5000);

document.getElementById("userInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
});
document.getElementById("toggleSidebar").addEventListener("click", toggleSidebar);

const symptomInput = document.getElementById("symptomName");
symptomInput.addEventListener("input", () => {
    const value = symptomInput.value.toLowerCase();
    const datalist = document.getElementById("symptomList");
    datalist.innerHTML = symptomSuggestions
        .filter(s => s.startsWith(value))
        .map(s => `<option value="${s}">`)
        .join("");
});