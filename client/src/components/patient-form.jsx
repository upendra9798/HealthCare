import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Download, Loader2 } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import apiClient from "../lib/api-client";
import { REGISTER_PATIENT_ROUTE, CREATE_APPOINTMENT_ROUTE } from "../utils/constants";

export default function PatientForm({ doctorId }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prescriptionData, setPrescriptionData] = useState(null);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const patientData = {
      name: formData.get("name"),
      age: Number.parseInt(formData.get("age")),
      gender: formData.get("gender"),
      phone: formData.get("phone"),
      symptoms: formData
        .get("symptoms")
        .split(",")
        .map((s) => s.trim()),
      doctorId,
    };

    try {
      // Register patient
      const patientResponse = await apiClient.post(REGISTER_PATIENT_ROUTE, patientData);
      const patientId = patientResponse.data.patient._id;

      // Create appointment
      const appointmentData = {
        patientId,
        doctorId,
        date: new Date().toISOString(),
        status: "scheduled",
      };
      console.log(appointmentData);
      await apiClient.post(CREATE_APPOINTMENT_ROUTE, appointmentData);

      // Mock prescription generation
      const mockPrescription = {
        doctorId,
        patientName: patientData.name,
        diagnosis: "Based on symptoms, potential seasonal allergies",
        medicines: [
          { name: "Cetirizine", dosage: "10mg", frequency: "once daily" },
          { name: "Nasal Spray", dosage: "2 sprays", frequency: "twice daily" },
        ],
        notes: "Avoid allergens. Return if symptoms persist beyond 2 weeks.",
      };

      setPrescriptionData(mockPrescription);
      setIsSubmitting(false);

      toast({
        title: "Registration Complete",
        description: "Your information has been submitted successfully.",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      setIsSubmitting(false);
      toast({
        title: "Submission Error",
        description:
          "There was an error submitting your information. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {!prescriptionData ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                name="age"
                type="number"
                min="0"
                max="120"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Gender</Label>
            <RadioGroup
              name="gender"
              defaultValue="male"
              required
              className="flex space-x-4"
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
            <Input id="phone" name="phone" type="tel" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="symptoms">Symptoms</Label>
            <Textarea
              id="symptoms"
              name="symptoms"
              placeholder="Please describe your symptoms (separate multiple symptoms with commas)"
              required
              className="min-h-[100px]"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Submit Registration"
            )}
          </Button>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-md p-4 text-center">
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
              className="h-6 w-6 text-green-600 mx-auto mb-2"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <h3 className="text-lg font-medium text-green-800">
              Registration Successful
            </h3>
            <p className="text-green-700">
              Your information has been submitted and a prescription has been
              generated.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-center">
            <h3 className="text-lg font-medium text-blue-800">
              Prescription Details
            </h3>
            <p className="text-blue-700">
              The prescription will be sent to the given phone number via SMS.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => setPrescriptionData(null)}
            className="w-full"
          >
            Register Another Patient
          </Button>
        </div>
      )}
    </div>
  );
}
