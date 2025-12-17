import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Mic, ChevronRight, CheckCircle } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Alert, AlertDescription } from "../../components/ui/alert";
import VoiceRegistration from "../../components/voice-registration";
import PatientForm from "../../components/patient-form";
import DepartmentSelection from "../../components/department-selection";
import Navbar from "../../components/navbar";

// Mock departments data - replace with your actual data
const departments = [
  {
    name: "Cardiology",
    doctors: [
      { id: 1, name: "Dr. Smith" },
      { id: 2, name: "Dr. Johnson" },
    ],
  },
  {
    name: "Neurology",
    doctors: [
      { id: 3, name: "Dr. Brown" },
      { id: 4, name: "Dr. Davis" },
    ],
  },
  {
    name: "Orthopedics",
    doctors: [
      { id: 5, name: "Dr. Wilson" },
      { id: 6, name: "Dr. Miller" },
    ],
  },
  {
    name: "Ophthalmology",
    doctors: [
      { id: 7, name: "Dr. Garcia" },
      { id: 8, name: "Dr. Martinez" },
    ],
  },
  {
    name: "General Medicine",
    doctors: [
      { id: 9, name: "Dr. Anderson" },
      { id: 10, name: "Dr. Taylor" },
    ],
  },
  {
    name: "Pediatrics",
    doctors: [
      { id: 11, name: "Dr. Thomas" },
      { id: 12, name: "Dr. Jackson" },
    ],
  },
];

export default function FrontdeskPage() {
  const [step, setStep] = useState("department");
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [initialTab, setInitialTab] = useState("voice");
  const [searchParams] = useSearchParams();
  const transcript = searchParams.get("transcript");
  const suggestedDepartment = searchParams.get("suggestedDepartment");
  const autoSuggest = searchParams.get("autoSuggest");

  useEffect(() => {
    // Handle different scenarios based on URL parameters
    if (transcript) {
      if (autoSuggest === "true" && suggestedDepartment) {
        // User accepted AI suggestion - auto-select department and first doctor
        setSelectedDepartment(suggestedDepartment);
        const departmentData = departments.find(
          (d) => d.name === suggestedDepartment
        );
        if (departmentData && departmentData.doctors.length > 0) {
          setSelectedDoctor(departmentData.doctors[0].id);
        }
        setStep("registration");
        setInitialTab("voice");
      } else {
        // User chose to select manually - stay on department selection but highlight suggestion
        setStep("department");
      }
    }
  }, [transcript, suggestedDepartment, autoSuggest]);

  const handleDepartmentSelected = (department, doctorId) => {
    setSelectedDepartment(department);
    setSelectedDoctor(doctorId);
    setStep("registration");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />
      <div className="pt-28 pb-16 px-4 md:px-8">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold text-center text-blue-900 mb-8">
            Patient Registration
          </h1>

          {/* Show transcript info if available */}
          {transcript && step === "department" && (
            <Alert className="mb-6 bg-blue-50 border-blue-200">
              <AlertDescription className="text-blue-800">
                <div className="flex items-start gap-2">
                  <Mic className="h-4 w-4 mt-0.5 text-blue-600" />
                  <div>
                    <p className="font-medium">Voice Input Received:</p>
                    <p className="italic mt-1">"{transcript}"</p>
                    {suggestedDepartment && (
                      <p className="mt-2 text-sm">
                        <strong>AI Suggestion:</strong> {suggestedDepartment}{" "}
                        department
                      </p>
                    )}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {step === "department" && (
            <Card className="shadow-lg border-none">
              <CardHeader>
                <CardTitle>Select Department & Doctor</CardTitle>
                <CardDescription>
                  {transcript
                    ? "Please confirm or select a different department and doctor"
                    : "Please select the department and doctor you wish to visit"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DepartmentSelection
                  onSelect={handleDepartmentSelected}
                  suggestedDepartment={suggestedDepartment}
                />
              </CardContent>
            </Card>
          )}

          {step === "registration" && selectedDepartment && selectedDoctor && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep("department")}
                  className="text-blue-600"
                >
                  Departments
                </Button>
                <ChevronRight className="h-4 w-4" />
                <span className="flex items-center gap-1">
                  {selectedDepartment}
                  {autoSuggest === "true" && (
                    <CheckCircle
                      className="h-4 w-4 text-green-600"
                      title="AI Recommended"
                    />
                  )}
                </span>
              </div>

              {/* Show AI recommendation confirmation */}
              {autoSuggest === "true" && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Great! You've been directed to the{" "}
                    <strong>{selectedDepartment}</strong> department based on
                    our AI analysis of your symptoms.
                  </AlertDescription>
                </Alert>
              )}

              <Card className="shadow-lg border-none">
                <CardHeader>
                  <CardTitle>Patient Registration</CardTitle>
                  <CardDescription>
                    Please provide your details to complete the registration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue={initialTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger
                        value="voice"
                        className="flex items-center gap-2"
                      >
                        <Mic className="h-4 w-4" />
                        Voice Registration
                      </TabsTrigger>
                      <TabsTrigger
                        value="form"
                        className="flex items-center gap-2"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Form Registration
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="voice">
                      <VoiceRegistration
                        doctorId={selectedDoctor}
                        initialTranscript={transcript || undefined}
                      />
                    </TabsContent>
                    <TabsContent value="form">
                      <PatientForm doctorId={selectedDoctor} />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
