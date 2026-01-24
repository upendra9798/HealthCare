import json
import os
import asyncio
import httpx # Import httpx
from prompt import text, text2, text3, extract_from_json # Import your prompt text from a separate file
# dot env
from dotenv import load_dotenv
load_dotenv()

# Assuming 'prompt.py' contains a 'text' variable with your initial prompt
# from prompt import text # Uncomment if you have this file, otherwise define 'text' directly

class GeminiLLM:
    def __init__(self, api_key: str = "", model_name: str = "gemini-2.0-flash"):
        self.api_key = api_key
        self.model_name = model_name
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models"

    async def predict(self, prompt: str) -> str:
        payload = {
            "contents": [
                {"role": "user", "parts": [{"text": prompt}]}
            ],
            "generationConfig": {
                "responseMimeType": "text/plain" # Explicitly request plain text
            }
        }

        api_url = f"{self.base_url}/{self.model_name}:generateContent?key={self.api_key}"

        try:
            # Use httpx.AsyncClient for making asynchronous requests
            async with httpx.AsyncClient() as client:
                response = await client.post(api_url, json=payload, timeout=30.0) # Add a timeout for safety
                response.raise_for_status() # Raise an exception for bad status codes (4xx or 5xx)
                result = response.json()

            if result and result.get("candidates") and len(result["candidates"]) > 0 and \
               result["candidates"][0].get("content") and result["candidates"][0]["content"].get("parts") and \
               len(result["candidates"][0]["content"]["parts"]) > 0:
                # Extract the text from the response
                return result["candidates"][0]["content"]["parts"][0].get("text", "No text part found in response.")
            else:
                return f"Error: Unexpected response structure from Gemini API: {json.dumps(result)}"

        except httpx.HTTPStatusError as e:
            return f"HTTP error occurred: {e.response.status_code} - {e.response.text}"
        except httpx.RequestError as e:
            return f"An error occurred while requesting {e.request.url!r}: {e}"
        except Exception as e:
            return f"An unexpected error occurred: {e}"

async def main():
    api = os.getenv("GEMINI_API_KEY")
    if not api:
        raise ValueError("GEMINI_API_KEY environment variable is not set. Please set it to your Gemini API key.")
    llm = GeminiLLM(api_key=api)

    
    p ='''
**1. Assessment:** Likely Hypertensive Crisis superimposed on Essential Hypertension with possible end-organ damage (based on BP 150/95, severe headache, nausea, shortness of breath). Urgent evaluation is required.

**2. Prescribed Treatment:**

*   **Hold** Amlodipine 5mg QD and Hydrochlorothiazide 25mg QD *temporarily*, pending evaluation and further instructions.  *Do not discontinue these medications permanently without consulting a physician.*
*   **Immediate:** Go to the nearest Emergency Department (ER) or call 911 for evaluation and management of hypertensive crisis.

**3. Important Considerations:**

*   **Critical Warning:** Blood pressure of 150/95 mmHg with the current symptoms (severe headache, nausea, shortness of breath) necessitates *immediate* evaluation to rule out end-organ damage (e.g., stroke, heart attack, kidney damage). *Do not delay seeking care.*
*   **Headache:** The severe headache could be related to dangerously elevated blood pressure or another underlying cause requiring immediate investigation.
*   **Nausea & Shortness of Breath:** These symptoms, in the context of elevated blood pressure, raise concern for cardiac involvement or other complications.
*   **Medication Interactions:** Many OTC medications (cold remedies, pain relievers) can worsen hypertension. Avoid taking any new medications before assessment by a physician.
*   **Possible Side Effects:** The patient should be monitored for possible side effects of previously prescribed meds when labs are drawn at emergency room.

**4. Follow-up:**

*   **ER Visit:** Follow all instructions given by the ER physician.
*   **Primary Care Physician (PCP):** Schedule a follow-up appointment with your primary care physician within 1-2 days *after* the ER visit to review ER findings and adjust long-term management of hypertension.
*   **Further Evaluation:** Be prepared for potential further evaluation (e.g., EKG, blood tests, imaging) as determined by the ER physician and your PCP. Discuss the possibility of ambulatory blood pressure monitoring (ABPM) with your PCP.

**Rationale:** Given the patient's elevated blood pressure reading in conjunction with severe headache, nausea, and shortness of breath, a hypertensive emergency must be ruled out. Temporarily holding the current medications is advised until the patient has been appropriately assessed in the ER setting. This prescription prioritizes patient safety and prompt intervention to mitigate potential complications.

**Note:** This is an AI-generated simulation for informational purposes only. So you dont need to write every time to consider physician or doctor as this will be done and text generation should not be filled with this stuff only .
'''
    response = await llm.predict(text3(p))
    print(response)
    dict_resp = await extract_from_json(response)

    return dict_resp  # Assuming this function processes the response as needed


if __name__ == "__main__":
    asyncio.run(main())