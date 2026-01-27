import requests

# Define the URL where your FastAPI app is running
URL = "http://127.0.0.1:8000/process_case/"

# Sample patient data and symptoms
payload = {
    "medical_report_text": """
    Patient Name: Jane Smith
    Date of Birth: 1972-08-22
    Last Visit: 2025-01-10
    Diagnosis: Essential Hypertension
    Medications: Amlodipine 5mg QD, Hydrochlorothiazide 25mg QD
    Allergies: None known
    Previous Symptoms: Occasional headaches, mild dizziness.
    Lab Results (Recent): Blood Pressure 150/95 mmHg, Cholesterol (LDL) 135 mg/dL.
    """,
    "current_symptoms": [
        "severe headache",
        "nausea",
        "shortness of breath upon exertion"
    ]
}

def main():
    try:
        response = requests.post(URL, json=payload)
        response.raise_for_status()  # Raise HTTPError for bad responses (4xx, 5xx)

        # Print the parsed JSON response
        print("Response:")
        print(response.json())

    except requests.exceptions.RequestException as e:
        print("Request failed:", e)

if __name__ == "__main__":
    main()
