from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
from main import MedicalAIOrchestrator
from config import Config

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://medicareplusss.vercel.app",
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

orchestrator = MedicalAIOrchestrator(Config())

class PatientCaseRequest(BaseModel):
    medical_report_text: str
    current_symptoms: list[str]

@app.post("/process_case/")
async def process_case(req: PatientCaseRequest):
    try:
        result = await orchestrator.process_patient_case(
            req.medical_report_text,
            req.current_symptoms
        )
        return {"status": "success", "result": result}
    except Exception as e:
        return {"status": "error", "message": str(e)}

#run uvicorn app:app --reload
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)