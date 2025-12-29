import asyncio
def text(text):
    new_text = f'''
**Role:** You are a medical researcher.
**Task:** Summarize the key medical findings, drug interactions, and treatment protocols from the following text chunk. Focus on information relevant to patient care.

**Text Chunk:**
{text}

**Summary of Chunk 1:**
'''
    return new_text


def text2(text,patient_history,current_symptoms):
    new_text = f'''
**Role:** Medical Doctor.
**Task:** Generate a concise, professional summary prescription based on provided patient details and medical literature. Focus on clear instructions, essential warnings, and follow-up.

---

**Patient Profile:**
{patient_history}
---

**Current symptoms:**
{current_symptoms}
---

**Medical Research Summary:**
{text}
---

**Summary Prescription:**

**1. Assessment:** [Brief likely diagnosis/clinical impression]
**2. Prescribed Treatment:**
    * [Medication Name/Type], [Dosage/Frequency/Duration], [Key Instructions/Warnings]
    * [Lifestyle/Supportive Care Recommendations]
**3. Important Considerations:**
    * [Potential interactions/side effects, specific warnings]
    * [When to seek immediate medical attention]
**4. Follow-up:** [Next steps/monitoring]

---

**Disclaimer:** This is an AI-generated simulation for informational purposes only. It is NOT real medical advice or a valid prescription. Consult a qualified healthcare professional for any medical concern
'''
    return new_text

if __name__ == "__main__":
    # Example usage

    with open("summaries.txt", "r") as file:
        summaries = file.read()
    #chunks the summaries into smaller parts
    patient_history = """
    Patient Name: John Doe
    Date of Birth: 1985-05-15
    Last Visit: 2024-11-20
    Diagnosis: Type 2 Diabetes Mellitus
    Medications: Metformin 500mg BID, Lisinopril 10mg QD
    Allergies: Penicillin
    Previous Symptoms: Occasional fatigue, polyuria.
    Lab Results (Recent): A1C 7.5%, Fasting Glucose 140 mg/dL.
    """
    current_symptoms_example = ["frequent urination", "increased thirst", "blurred vision"]

    current_symptoms = ", ".join(current_symptoms_example)

    print(text2(summaries, patient_history, current_symptoms))


def text3(summary_prescription_text):
    prompt = f"""
You are a medical assistant. Convert the following AI-generated prescription summary into a clean JSON object.

### Prescription Summary:
{summary_prescription_text}

### Desired JSON Format:
{{
  "assessment": "Brief likely diagnosis/clinical impression",
  "treatment": [
    {{
      "medication": "Medication Name/Type",
      "dosage": "Dosage/Frequency/Duration",
      "instructions": "Key instructions and warnings"
    }},
    {{
      "lifestyle": "Lifestyle or supportive care recommendations"
    }}
  ],
  "considerations": [
    "Potential interactions or side effects",
    "When to seek immediate medical attention"
  ],
  "follow_up": "Next steps or monitoring plan"
}}

Only return a **valid JSON object** with no extra commentary or explanation.
"""
    return prompt

import json


async def extract_from_json(json_response):
    cleaned = json_response.strip().removeprefix("```json").removesuffix("```").strip()

    print(cleaned)  # Debugging line to see the raw JSON response
    try:
        data = json.loads(cleaned)
        assessment = data.get("assessment", "")
        treatment = data.get("treatment", [])
        considerations = data.get("considerations", [])
        follow_up = data.get("follow_up", "")

        medications = []
        lifestyle_recommendation = None

        for item in treatment:
            if "medication" in item:
                medications.append({
                    "medication": item.get("medication", ""),
                    "dosage": item.get("dosage", ""),
                    "instructions": item.get("instructions", "")
                })
            elif "lifestyle" in item:
                lifestyle_recommendation = item["lifestyle"]

        return {
            "assessment": assessment,
            "medications": medications,
            "lifestyle": lifestyle_recommendation,
            "considerations": considerations,
            "follow_up": follow_up
        }

    except json.JSONDecodeError as e:
        print("JSON Decode Error:", e)
        return {}
    

if __name__ == "__main__":
    json_text = ''' 
```json
{
  "assessment": "Likely Hypertensive Crisis superimposed on Essential Hypertension with possible end-organ damage.",
  "treatment": [
    {
      "medication": "Amlodipine",
      "dosage": "5mg QD",
      "instructions": "Hold temporarily, pending evaluation. Do not discontinue permanently without consulting a physician."
    },
    {
      "medication": "Hydrochlorothiazide",
      "dosage": "25mg QD",
      "instructions": "Hold temporarily, pending evaluation. Do not discontinue permanently without consulting a physician."
    },
    {
      "lifestyle": "Go to the nearest Emergency Department (ER) or call 911 for evaluation and management of hypertensive crisis."
    }
  ],
  "considerations": [
    "Blood pressure of 150/95 mmHg with severe headache, nausea, shortness of breath necessitates immediate evaluation to rule out end-organ damage.",
    "Severe headache could be related to dangerously elevated blood pressure.",
    "Nausea & Shortness of Breath raise concern for cardiac involvement or other complications.",
    "Avoid taking any new OTC medications before assessment by a physician.",
    "Monitor for possible side effects of previously prescribed meds when labs are drawn at emergency room."        
  ],
  "follow_up": "Follow all instructions given by the ER physician. Schedule a follow-up appointment with your PCP within 1-2 days after the ER visit. Be prepared for potential further evaluation. Discuss ABPM with your PCP."        
}
```

'''

    extracted = extract_from_json(json_text)

    # Access components
    print("Assessment:", extracted["assessment"])
    print("\nMedications:")
    for med in extracted["medications"]:
        print(f" - {med['medication']} | {med['dosage']} | {med['instructions']}")
    print("\nLifestyle Advice:", extracted["lifestyle"])
    print("\nConsiderations:")
    for c in extracted["considerations"]:
        print(f" - {c}")
    print("\nFollow-up:", extracted["follow_up"])
