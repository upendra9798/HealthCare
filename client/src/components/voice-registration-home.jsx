import { useState, useRef } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { useToast } from "../../hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { AssemblyAI } from "assemblyai";

// Initialize AssemblyAI client
const assemblyClient = new AssemblyAI({
  apiKey: import.meta.env.VITE_ASSEMBLY_API_KEY || "",
});

// Department matching configuration
const departmentKeywords = {
  Cardiology: [
    "heart",
    "chest",
    "cardiac",
    "cardiovascular",
    "blood pressure",
    "hypertension",
    "chest pain",
    "palpitation",
  ],
  Neurology: [
    "head",
    "brain",
    "nervous",
    "headache",
    "migraine",
    "dizziness",
    "seizure",
    "memory",
    "stroke",
  ],
  Orthopedics: [
    "bone",
    "joint",
    "muscle",
    "spine",
    "back",
    "knee",
    "shoulder",
    "fracture",
    "arthritis",
  ],
  Ophthalmology: [
    "eye",
    "vision",
    "sight",
    "glasses",
    "contact",
    "blind",
    "retina",
    "cornea",
  ],
  "General Medicine": [
    "fever",
    "cold",
    "flu",
    "infection",
    "general",
    "checkup",
    "routine",
  ],
  Pediatrics: [
    "child",
    "baby",
    "infant",
    "pediatric",
    "growth",
    "development",
    "vaccination",
  ],
};

const findMatchingDepartment = (transcript) => {
  const lowerTranscript = transcript.toLowerCase();
  let maxMatches = 0;
  let matchedDepartment = "General Medicine"; // Default department

  for (const [department, keywords] of Object.entries(departmentKeywords)) {
    const matches = keywords.filter((keyword) =>
      lowerTranscript.includes(keyword.toLowerCase())
    ).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      matchedDepartment = department;
    }
  }

  return matchedDepartment;
};

export default function VoiceRegistrationHome() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [suggestedDepartment, setSuggestedDepartment] = useState("");
  const [showSuggestion, setShowSuggestion] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const { toast } = useToast();
  const navigate = useNavigate();

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
        await processAudio(audioBlob);

        // Stop all tracks to release the microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
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
      setIsProcessing(true);
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

        // Find matching department based on transcript
        const matchedDepartment = findMatchingDepartment(response.text);
        setSuggestedDepartment(matchedDepartment);
        setShowSuggestion(true);
        setIsProcessing(false);

        toast({
          title: "Voice Analyzed",
          description: `AI suggests ${matchedDepartment} department based on your symptoms.`,
        });
      } else {
        throw new Error("Failed to transcribe audio");
      }
    } catch (error) {
      console.error("Error processing audio:", error);
      setIsProcessing(false);
      toast({
        title: "Processing Error",
        description:
          "There was an error processing your recording. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAcceptSuggestion = () => {
    navigate(
      `/frontdesk?transcript=${encodeURIComponent(
        transcript
      )}&suggestedDepartment=${encodeURIComponent(
        suggestedDepartment
      )}&autoSuggest=true`
    );
  };

  const handleChooseManually = () => {
    navigate(`/frontdesk?transcript=${encodeURIComponent(transcript)}`);
  };

  return (
    <div className="space-y-6">
      <Alert className="bg-blue-50 border-blue-200">
        <AlertDescription className="flex items-center gap-2 text-blue-800">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          Describe your symptoms, preferred department, or doctor
        </AlertDescription>
      </Alert>

      <div className="flex justify-center">
        <Button
          size="lg"
          variant={isRecording ? "destructive" : "default"}
          className={`rounded-full h-24 w-24 ${
            isRecording ? "animate-pulse" : "voice-pulse"
          }`}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <Loader2 className="h-10 w-10 text-primary-foreground animate-spin" />
          ) : isRecording ? (
            <MicOff className="h-10 w-10 text-primary-foreground" />
          ) : (
            <Mic className="h-10 w-10 text-primary-foreground" />
          )}
        </Button>
      </div>

      <p className="text-center text-sm text-gray-500">
        {isRecording
          ? "Recording... Click to stop"
          : isProcessing
          ? "AI is analyzing your voice..."
          : "Click the microphone to start recording"}
      </p>

      {transcript && !showSuggestion && (
        <Card className="mt-4 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-medium mb-2">We heard:</h3>
            <p className="text-gray-700 italic">"{transcript}"</p>
          </CardContent>
        </Card>
      )}

      {showSuggestion && (
        <Card className="mt-4 bg-green-50 border-green-200">
          <CardContent className="p-4 space-y-4">
            <div>
              <h3 className="font-medium mb-2">We heard:</h3>
              <p className="text-gray-700 italic mb-4">"{transcript}"</p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-green-300">
              <h3 className="font-medium mb-2 text-green-800">
                AI Recommendation:
              </h3>
              <p className="text-green-700 mb-4">
                Based on your symptoms, we suggest the{" "}
                <strong>{suggestedDepartment}</strong> department.
              </p>

              <div className="flex gap-3 flex-col sm:flex-row">
                <Button
                  onClick={handleAcceptSuggestion}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Accept Recommendation
                </Button>
                <Button
                  variant="outline"
                  onClick={handleChooseManually}
                  className="border-green-600 text-green-600 hover:bg-green-50"
                >
                  Choose Department Manually
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
