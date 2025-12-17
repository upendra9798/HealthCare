import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { X, Download, Loader2, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { toast } from "sonner";
import apiClient from "../lib/api-client";
import axios from "axios";
import {
  GENERATE_PRESCRIPTION_API_ROUTE,
  GENERATE_PRESCRIPTION_PDF_ROUTE,
  SEND_PRESCRIPTION_SMS_ROUTE,
  PROCESS_CASE_API_ROUTE,
  FASTAPI_HOST,
} from "../utils/constants";

// FastAPI backend configuration
const FASTAPI_BASE_URL = FASTAPI_HOST;
const PROCESS_CASE_ENDPOINT = "/process_case/"; 

export default function PrescriptionGenerator({
  patient,
  onPrescriptionGenerated,
}) {
  const [symptoms, setSymptoms] = useState(patient?.symptoms || []);
  const [newSymptom, setNewSymptom] = useState("");
  const [medicalReport, setMedicalReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [prescription, setPrescription] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [savedPrescriptionId, setSavedPrescriptionId] = useState(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [sendingSms, setSendingSms] = useState(false);
  const [smsSent, setSmsSent] = useState(false);

  const handleAddSymptom = () => {
    if (newSymptom.trim()) {
      setSymptoms([...symptoms, newSymptom.trim()]);
      setNewSymptom("");
    }
  };

  const handleRemoveSymptom = (index) => {
    setSymptoms(symptoms.filter((_, i) => i !== index));
  };

  const handleGeneratePrescription = async () => {
    if (symptoms.length === 0) {
      toast.error("Please add at least one symptom");
      return;
    }

    if (!medicalReport.trim()) {
      toast.error("Please provide medical report text");
      return;
    }

    setLoading(true);
    setPrescription(null);

    try {
      // Prepare data for FastAPI backend
      const requestData = {
        medical_report_text: medicalReport,
        current_symptoms: symptoms,
      };

      console.log("Sending request to FastAPI:", requestData);

      const response = await axios.post(
        `${FASTAPI_BASE_URL}${PROCESS_CASE_ENDPOINT}`,
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 60000, // 60 seconds timeout for ML processing
        }
      );

      console.log("FastAPI Response:", response.data);

      if (response.data.status === "success" && response.data.result) {
        const aiPrescription = response.data.result;
        setPrescription(aiPrescription);

        // Call parent callback if provided
        if (onPrescriptionGenerated) {
          onPrescriptionGenerated({
            patient,
            symptoms,
            medicalReport,
            aiPrescription,
            timestamp: new Date().toISOString(),
          });
        }

        toast.success("AI prescription generated successfully!");
      } else {
        throw new Error(
          response.data.message || "Failed to generate prescription"
        );
      }
    } catch (error) {
      console.error("Error generating prescription:", error);

      if (error.code === "ECONNABORTED") {
        toast.error("Request timeout - AI processing took too long");
      } else if (error.response?.status === 500) {
        toast.error("Server error - please check your backend logs");
      } else if (error.response?.data?.message) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error(
          "Failed to generate prescription. Please ensure your FastAPI server is running."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrescription = async () => {
    if (!prescription) return;
    try {
      const prescriptionData = {
        patientId: patient._id,
        symptoms,
        diagnosis: prescription.assessment || "",
        medicines: prescription.medications?.map(med => ({
          name: med.medication,
          dosage: med.dosage,
          frequency: med.frequency || "",
          instructions: med.instructions || ""
        })) || [],
        holdMedicines: prescription.holdMedicines || [],
        emergencyInstructions: prescription.emergencyInstructions || "",
        criticalWarnings: prescription.considerations || [],
        sideEffectsNote: prescription.sideEffectsNote || "",
        followUp: prescription.follow_up || "",
        rationale: prescription.rationale || "",
        notes: medicalReport // or use a separate notes field if you have one
      };
      const response = await apiClient.post(GENERATE_PRESCRIPTION_API_ROUTE, prescriptionData);
      toast.success("Prescription saved to patient history!");
      setIsSaved(true);
      setSavedPrescriptionId(response.data.data.prescription._id);
    } catch (error) {
      toast.error("Failed to save prescription to backend.");
      console.error(error);
    }
  };

  const handleDownloadPdf = async () => {
    if (!savedPrescriptionId) return;
    setDownloadingPdf(true);
    try {
      const response = await apiClient.get(GENERATE_PRESCRIPTION_PDF_ROUTE(savedPrescriptionId), {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `prescription_${savedPrescriptionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      toast.error("Failed to download PDF");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const renderPrescriptionResult = () => {
    if (!prescription) return null;

    return (
      <Card className="mt-6 border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center gap-2">
            🏥 AI-Generated Prescription
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Assessment */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Assessment:</h4>
            <p className="text-gray-700 bg-white p-3 rounded border">
              {prescription.assessment}
            </p>
          </div>

          {/* Medications */}
          {prescription.medications && prescription.medications.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Medications:</h4>
              <div className="space-y-3">
                {prescription.medications.map((med, index) => (
                  <div key={index} className="bg-white p-3 rounded border">
                    <div className="font-medium text-blue-700">
                      {med.medication}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Dosage:</span> {med.dosage}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Instructions:</span>{" "}
                      {med.instructions}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lifestyle Recommendations */}
          {prescription.lifestyle && (
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">
                Lifestyle Recommendations:
              </h4>
              <p className="text-gray-700 bg-white p-3 rounded border">
                {prescription.lifestyle}
              </p>
            </div>
          )}

          {/* Considerations */}
          {prescription.considerations &&
            prescription.considerations.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">
                  Important Considerations:
                </h4>
                <ul className="bg-white p-3 rounded border space-y-2">
                  {prescription.considerations.map((consideration, index) => (
                    <li key={index} className="text-gray-700 flex items-start">
                      <span className="text-red-500 mr-2">⚠️</span>
                      {consideration}
                    </li>
                  ))}
                </ul>
              </div>
            )}

          {/* Follow-up */}
          {prescription.follow_up && (
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Follow-up:</h4>
              <p className="text-gray-700 bg-white p-3 rounded border">
                {prescription.follow_up}
              </p>
            </div>
          )}

          {/* Disclaimer */}
          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
            <p className="text-yellow-800 text-sm font-medium">
              ⚠️ This is an AI-generated prescription for informational purposes
              only. Always consult with a qualified healthcare professional
              before making any medical decisions.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    return phone.startsWith('+') ? phone : `+${phone}`;
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="space-y-2">
          <CardTitle className="text-3xl font-bold text-gray-800 text-center flex items-center justify-center gap-2 pb-5 ">
            AI Medical Prescription Generator
          </CardTitle>

          <p className="text-sm text-gray-500 leading-relaxed">
            Input the patient's medical history and current symptoms to receive
            an AI-generated prescription tailored to their condition.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Patient Info */}
          {patient && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium">{patient.name}</h3>
              <p className="text-sm text-gray-500">
                {patient.age} years, {patient.gender}
              </p>
            </div>
          )}

          {/* Medical Report Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Medical Report Text *
            </label>
            <Textarea
              placeholder="Enter the patient's medical report including patient name, date of birth, diagnosis, current medications, allergies, previous symptoms, lab results, etc."
              value={medicalReport}
              onChange={(e) => setMedicalReport(e.target.value)}
              className="min-h-[120px]"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Example: "Patient Name: John Doe, DOB: 1985-05-15, Diagnosis: Type
              2 Diabetes, Medications: Metformin 500mg BID..."
            </p>
          </div>

          {/* Current Symptoms Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Symptoms *
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {symptoms.map((symptom, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {symptom}
                  <button
                    onClick={() => handleRemoveSymptom(index)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add current symptom (e.g., severe headache, nausea)"
                value={newSymptom}
                onChange={(e) => setNewSymptom(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddSymptom()}
                className="flex-1"
              />
              <Button type="button" onClick={handleAddSymptom}>
                Add
              </Button>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGeneratePrescription}
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing with AI... (This may take 30-60 seconds)
              </>
            ) : (
              "Generate AI Prescription"
            )}
          </Button>

          {/* Status Message */}
          {loading && (
            <div className="text-center text-sm text-gray-600 bg-blue-50 p-3 rounded">
              🧠 AI is analyzing medical data, searching for relevant
              information, and generating prescription recommendations...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prescription Results */}
      {renderPrescriptionResult()}

      {prescription && !isSaved && (
        <Button className="mt-4 w-full bg-green-600 hover:bg-green-700" onClick={handleSavePrescription}>
          Save Prescription to Patient History
        </Button>
      )}
      {prescription && isSaved && (
        <>
          <div className="mt-4 w-full flex items-center justify-center gap-2 text-green-700 font-semibold bg-green-50 border border-green-200 rounded p-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Saved!
          </div>
          <Button
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700"
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
          >
            {downloadingPdf ? (
              <span className="flex items-center"><Loader2 className="h-4 w-4 animate-spin mr-1" />Downloading PDF...</span>
            ) : (
              <span className="flex items-center"><Download className="h-4 w-4 mr-1" />Download PDF</span>
            )}
          </Button>
          <div className="mt-4 flex flex-col gap-2">
            <Button
              className="w-full bg-purple-600 hover:bg-purple-700"
              onClick={async () => {
                if (!patient?.phone) {
                  toast.error("No phone number found for this patient.");
                  return;
                }
                setSendingSms(true);
                try {
                  const formattedPhone = formatPhoneNumber(patient.phone);
                  await apiClient.post(SEND_PRESCRIPTION_SMS_ROUTE, {
                    phone: formattedPhone,
                    prescriptionId: savedPrescriptionId
                  });
                  setSmsSent(true);
                  toast.success("Prescription sent via SMS!");
                } catch (err) {
                  toast.error("Failed to send SMS");
                } finally {
                  setSendingSms(false);
                }
              }}
              style={{ backgroundColor: smsSent ? '#22c55e' : undefined }}
              disabled={sendingSms || !patient?.phone || smsSent}
            >
              {smsSent ? "SMS Sent!" : (sendingSms ? "Sending..." : `Send via SMS${patient?.phone ? ` (${patient.phone})` : ''}`)}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}