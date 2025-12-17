import { useState, useRef, useEffect } from "react";
import {
  Mic,
  MicOff,
  Loader2,
  Download,
  Edit,
  CheckCircle,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { useToast } from "../../hooks/use-toast";
import apiClient from "../lib/api-client";
import {
  REGISTER_PATIENT_ROUTE,
  CREATE_APPOINTMENT_ROUTE,
} from "../utils/constants";
import { AssemblyAI } from "assemblyai";

// Initialize AssemblyAI client
const assemblyClient = new AssemblyAI({
  apiKey: import.meta.env.VITE_ASSEMBLY_API_KEY || "",
});

export default function VoiceRegistration({ doctorId, initialTranscript }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transcript, setTranscript] = useState(initialTranscript || "");
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "male",
    phone: "",
    symptoms: "",
  });
  const [isEditable, setIsEditable] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const { toast } = useToast();

  useEffect(() => {
    if (initialTranscript) {
      processTranscript(initialTranscript);
    }
  }, [initialTranscript]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        setIsProcessing(true);
        await processAudio(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Microphone error:", error);
      toast({
        title: "Microphone Error",
        description:
          "Could not access your microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (audioBlob) => {
    try {
      // Transcribe audio using AssemblyAI
      const response = await assemblyClient.transcripts.transcribe({
        audio: audioBlob,
      });

      if (response?.text) {
        setTranscript(response.text);
        await processTranscript(response.text);
      } else {
        throw new Error("Failed to transcribe audio");
      }
    } catch (error) {
      console.error("Error processing audio:", error);
      setIsProcessing(false);
      toast({
        title: "Processing Error",
        description: "There was an error processing your recording.",
        variant: "destructive",
      });
    }
  };

  const processTranscript = async (text) => {
    setIsProcessing(true);
    try {
      const extracted = extractInformationFromTranscript(text);
      setFormData({
        name: extracted.name || "",
        age: extracted.age || "",
        gender: extracted.gender?.toLowerCase() || "male",
        phone: extracted.phone || "",
        symptoms: extracted.symptoms?.join(", ") || "",
      });
      setIsEditable(true); // Allow editing after processing
    } catch (error) {
      console.error("Transcript processing error:", error);
      toast({
        title: "Processing Error",
        description: "Could not extract information from the transcript.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const patientData = {
      ...formData,
      age: Number.parseInt(formData.age),
      symptoms: formData.symptoms.split(",").map((s) => s.trim()),
      doctorId,
    };

    try {
      // Register patient
      const patientResponse = await apiClient.post(
        REGISTER_PATIENT_ROUTE,
        patientData
      );
      const patientId = patientResponse.data.patient._id;

      // Create appointment
      const appointmentData = {
        patientId,
        doctorId,
        date: new Date().toISOString(),
        status: "scheduled",
      };
      await apiClient.post(CREATE_APPOINTMENT_ROUTE, appointmentData);

      setRegistrationComplete(true);
      toast({
        title: "Registration Complete",
        description: "Patient information submitted successfully.",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Submission Error",
        description:
          "There was an error submitting the information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to extract information from transcript
  const extractInformationFromTranscript = (text) => {
    const lowerText = text.toLowerCase();

    // Simple keyword-based extraction (you can enhance this with NLP)
    const symptoms = [];
    const commonSymptoms = [
      "headache",
      "fever",
      "cough",
      "pain",
      "nausea",
      "dizziness",
      "fatigue",
      "chest pain",
      "shortness of breath",
      "sore throat",
      "runny nose",
      "stomach ache",
      "back pain",
      "joint pain",
    ];

    commonSymptoms.forEach((symptom) => {
      if (lowerText.includes(symptom)) {
        symptoms.push(symptom);
      }
    });

    // Extract age (simple regex)
    const ageMatch = text.match(/(\d{1,3})\s*years?\s*old|age\s*(\d{1,3})/i);
    const age = ageMatch ? ageMatch[1] || ageMatch[2] : "";

    // Extract gender
    let gender = "male";
    if (lowerText.includes("female")) {
      gender = "female";
    }

    // Extract name (simple approach - look for "my name is" or "I am")
    const nameMatch = text.match(
      /(?:my name is|i am|i'm)\s+([a-zA-Z\s]+?)(?:\s+and\s+i'm|\s+and\s+i\s+am\s+|\s+and\s+my\s+age\s+is|$)/i
    );
    const name = nameMatch ? nameMatch[1].trim() : "";

    // Extract phone number
    const phoneMatch = text.match(
      /(\d{3}[-\s]?\d{3}[-\s]?\d{4}|\(\d{3}\)\s*\d{3}[-\s]?\d{4})/
    );
    const phone = phoneMatch ? phoneMatch[0] : "";

    return {
      name,
      age,
      gender,
      symptoms: symptoms.length > 0 ? symptoms : [],
      phone,
    };
  };

  const resetForm = () => {
    setIsRecording(false);
    setIsProcessing(false);
    setIsSubmitting(false);
    setTranscript("");
    setFormData({
      name: "",
      age: "",
      gender: "male",
      phone: "",
      symptoms: "",
    });
    setIsEditable(false);
    setRegistrationComplete(false);
    audioChunksRef.current = [];
  };

  if (registrationComplete) {
    return (
      <div className="text-center space-y-4 p-8">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
        <h2 className="text-2xl font-bold">Registration Successful!</h2>
        <p className="text-gray-600">
          The patient's information has been submitted.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-center mt-4">
          <h3 className="text-lg font-medium text-blue-800">
            Prescription Details
          </h3>
          <p className="text-blue-700">
            The prescription will be sent to the given phone number via SMS.
          </p>
        </div>
        <Button onClick={resetForm} className="mt-4">
          Register Another Patient
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4">
            <p className="text-center text-gray-600">
              {isRecording
                ? "Recording your voice..."
                : "Press the button to start voice registration"}
            </p>
            <Button
              size="icon"
              className={`rounded-full h-20 w-20 transition-all duration-300 ${
                isRecording
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing || isSubmitting}
            >
              {isRecording ? (
                <MicOff className="h-8 w-8" />
              ) : (
                <Mic className="h-8 w-8" />
              )}
            </Button>
            {isProcessing && (
              <div className="flex items-center text-blue-600">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Processing your voice...</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {transcript && (
        <Alert>
          <Mic className="h-4 w-4" />
          <AlertDescription>
            <span className="font-semibold">Transcript:</span> {transcript}
          </AlertDescription>
        </Alert>
      )}

      {(isEditable || initialTranscript) && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditable(!isEditable)}
            >
              <Edit className="mr-2 h-4 w-4" />
              {isEditable ? "Lock Form" : "Edit Information"}
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                required
                disabled={!isEditable || isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                name="age"
                type="number"
                min="0"
                max="120"
                value={formData.age}
                onChange={handleFormChange}
                required
                disabled={!isEditable || isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Gender</Label>
            <RadioGroup
              name="gender"
              value={formData.gender}
              onValueChange={(value) =>
                handleFormChange({ target: { name: "gender", value } })
              }
              required
              className="flex space-x-4"
              disabled={!isEditable || isSubmitting}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" />
                <Label htmlFor="male">Male</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" />
                <Label htmlFor="female">Female</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other">Other</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleFormChange}
              disabled={!isEditable || isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="symptoms">Symptoms</Label>
            <Textarea
              id="symptoms"
              name="symptoms"
              placeholder="Symptoms identified from voice will appear here"
              value={formData.symptoms}
              onChange={handleFormChange}
              required
              className="min-h-[100px]"
              disabled={!isEditable || isSubmitting}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!isEditable || isSubmitting || isProcessing}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Registration"
            )}
          </Button>
        </form>
      )}
    </div>
  );
}
