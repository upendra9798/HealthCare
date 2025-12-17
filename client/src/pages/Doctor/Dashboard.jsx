import { useState, useEffect } from "react";
import apiClient from "../../lib/api-client";
import { useNavigate, useLocation } from "react-router-dom";

import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Calendar, Clock, Stethoscope, User, Download, Loader2 } from "lucide-react";
import DoctorSidebar from "../../components/doctor-sidebar";
import { Badge } from "../../components/ui/badge";
import {
  HOST,
  DOCTOR_INFO_ROUTE,
  GET_APPOINTMENTS_ROUTE,
  GET_PATIENT_HISTORY_ROUTE,
  GENERATE_PRESCRIPTION_ROUTE,
  GET_PATIENT_PRESCRIPTIONS_ROUTE,
  GENERATE_PRESCRIPTION_PDF_ROUTE
} from "../../utils/constants";
import PrescriptionGenerator from "../../components/PrescriptionGenerator";
import Appointments from "./Appointments";
import Patients from "./Patients";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Separator } from "../../components/ui/separator";

export default function DoctorDashboard() {
  const [doctor, setDoctor] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeView, setActiveView] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newSymptom, setNewSymptom] = useState("");
  const [newMedicine, setNewMedicine] = useState({
    name: "",
    dosage: "",
    frequency: "",
  });
  const [prescriptionNotes, setPrescriptionNotes] = useState("");
  const [prescriptionHistory, setPrescriptionHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [downloadingPdfId, setDownloadingPdfId] = useState(null);

  // Mock data for testing
  const mockAppointments = [
    {
      id: "a1",
      patientName: "John Smith",
      time: "09:00 AM",
      date: "2023-06-15",
      status: "Upcoming",
      reason: "Routine Checkup",
      age: 45,
      gender: "male",
      symptoms: ["chest pain", "shortness of breath"],
      medicalHistory: "No previous medical history available.",
      diagnosis: "Potential angina, requires further investigation",
      medications: ["Aspirin", "Nitroglycerin"],
      notes: "Schedule ECG and stress test. Follow up in 1 week.",
    },
    {
      id: "a2",
      patientName: "Sarah Johnson",
      time: "10:30 AM",
      date: "2023-06-15",
      status: "Upcoming",
      reason: "Headache Consultation",
      age: 32,
      gender: "female",
      symptoms: ["severe headache", "dizziness"],
      medicalHistory: "Migraines since childhood.",
      diagnosis: "Migraine with aura",
      medications: ["Sumatriptan"],
      notes: "Advised rest and hydration.",
    },
    {
      id: "a3",
      patientName: "Michael Brown",
      time: "02:00 PM",
      date: "2023-06-15",
      status: "Upcoming",
      reason: "Follow-up Visit",
      age: 58,
      gender: "male",
      symptoms: ["fatigue", "weight loss"],
      medicalHistory: "Type 2 Diabetes, Hypertension.",
      diagnosis: "Diabetes management follow-up",
      medications: ["Metformin", "Lisinopril"],
      notes: "Adjusted Metformin dosage.",
    },
    {
      id: "a4",
      patientName: "Emily Davis",
      time: "11:00 AM",
      date: "2023-06-16",
      status: "Upcoming",
      reason: "Annual Physical",
      age: 27,
      gender: "female",
      symptoms: [],
      medicalHistory: "No significant history.",
      diagnosis: "Healthy, routine checkup",
      medications: [],
      notes: "Advised healthy lifestyle.",
    },
  ];

  const [appointments, setAppointments] = useState(mockAppointments);

  const navigate = useNavigate();
  const location = useLocation();

  const handleSelectPatient = async (patient) => {
    try {
      // For mock data
      if (patient.id) {
        setSelectedPatient(patient);
        return;
      }

      // For real data
      const res = await apiClient.get(`${GET_PATIENT_HISTORY_ROUTE(patient._id)}`);
      setSelectedPatient({
        ...patient,
        prescriptions: res.data.prescriptions,
      });
    } catch (err) {
      console.error("Error fetching patient history:", err);
      setError("Failed to load patient history");
    }
  };

  const handleAddSymptom = () => {
    if (newSymptom.trim()) {
      setSelectedPatient((prev) => ({
        ...prev,
        symptoms: [...(prev.symptoms || []), newSymptom.trim()],
      }));
      setNewSymptom("");
    }
  };

  const handleAddMedicine = () => {
    if (newMedicine.name.trim()) {
      setSelectedPatient((prev) => ({
        ...prev,
        medications: [...(prev.medications || []), newMedicine],
      }));
      setNewMedicine({ name: "", dosage: "", frequency: "" });
    }
  };

  const handleGeneratePrescription = async () => {
    try {
      // For mock data
      if (selectedPatient.id) {
        const newPrescription = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          symptoms: selectedPatient.symptoms,
          medicines: selectedPatient.medications,
          notes: prescriptionNotes,
        };
        setSelectedPatient((prev) => ({
          ...prev,
          prescriptions: [newPrescription, ...(prev.prescriptions || [])],
        }));
        setPrescriptionNotes("");
        return;
      }

      // For real data
      const prescriptionData = {
        patientId: selectedPatient._id,
        symptoms: selectedPatient.symptoms || [],
        medicines: (selectedPatient.medications || []).map((med) => ({
          name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
        })),
        notes: prescriptionNotes,
      };

      const res = await apiClient.post(
        `${GENERATE_PRESCRIPTION_ROUTE}`,
        prescriptionData,
        { withCredentials: true }
      );

      if (res.data.prescription) {
        setSelectedPatient((prev) => ({
          ...prev,
          prescriptions: [res.data.prescription, ...(prev.prescriptions || [])],
        }));
        setPrescriptionNotes("");
        setError(null);
      }
    } catch (err) {
      console.error("Error generating prescription:", err);
      setError("Failed to generate prescription");
    }
  };

  const handleCreatePrescription = (patient) => {
    setSelectedPatient(patient);
    setActiveView("prescriptions");
  };

  const handleDownloadPdf = async (prescriptionId) => {
    setDownloadingPdfId(prescriptionId);
    try {
      const response = await apiClient.get(
        `${GENERATE_PRESCRIPTION_PDF_ROUTE(prescriptionId)}`,
        {
          responseType: "blob",
          withCredentials: true,
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `prescription_${prescriptionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      alert("Failed to download PDF");
    } finally {
      setDownloadingPdfId(null);
    }
  };

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await apiClient.get(`${DOCTOR_INFO_ROUTE}`);
        setDoctor(res.data);
      } catch (err) {
        console.error("Error fetching doctor info:", err);
        setError("Failed to load doctor information");
      }
    };

    const fetchAppointments = async () => {
      try {
        const res = await apiClient.get(`${GET_APPOINTMENTS_ROUTE}`);
        // Combine mock data with real data
        setAppointments([...mockAppointments, ...res.data.appointments]);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching appointments:", err);
        setError("Failed to load appointments");
        setLoading(false);
      }
    };

    fetchDoctor();
    fetchAppointments();
  }, []);

  useEffect(() => {
    const patient = selectedPatient;
    if (!patient || !patient._id) return;
    setHistoryLoading(true);
    apiClient.get(`${GET_PATIENT_HISTORY_ROUTE(patient._id)}`)
      .then(res => {
        setPrescriptionHistory(res.data.prescriptions || []);
      })
      .catch(() => setPrescriptionHistory([]))
      .finally(() => setHistoryLoading(false));
  }, [selectedPatient]);

  const renderDashboardView = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="border-none shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Today's Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {appointments.filter((a) => a.date === "2023-06-15").length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Patients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{appointments.length}</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Next Appointment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {appointments[0]?.time || "N/A"}
            </div>
            <div className="text-sm text-gray-500">
              {appointments[0]?.patientName
                ? `with ${appointments[0].patientName}`
                : "No upcoming appointments"}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <h2 className="text-xl font-bold p-4 border-b">
            Today's Appointments
          </h2>
          <div className="divide-y">
            {appointments
              .filter((appt) => appt.date === "2023-06-15")
              .map((appointment) => (
                <div
                  key={appointment.id}
                  className="p-4 hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-100 p-3 rounded-full">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">
                          {appointment.patientName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {appointment.age} years, {appointment.gender}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="mr-1 h-4 w-4" />
                        <span>{appointment.time}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCreatePrescription(appointment)}
                      >
                        Create Prescription
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div>
          {selectedPatient ? (
            <Card className="shadow-lg border-none">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl">
                    {selectedPatient.patientName}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedPatient(null)}
                  >
                    Back to List
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  {selectedPatient.age} years, {selectedPatient.gender}
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <Tabs defaultValue="patient-details" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="patient-details">
                      Patient Details
                    </TabsTrigger>
                    <TabsTrigger value="prescription">Prescription</TabsTrigger>
                  </TabsList>
                  <TabsContent value="patient-details">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium mb-1">Symptoms</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedPatient.symptoms?.length > 0 ? (
                            selectedPatient.symptoms.map((symptom, index) => (
                              <Badge key={index} variant="secondary">
                                {symptom}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-gray-500 text-sm">
                              No symptoms recorded.
                            </p>
                          )}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Medical History</h3>
                        <p className="text-gray-700 text-sm">
                          {selectedPatient.medicalHistory}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Diagnosis</h3>
                        <p className="text-gray-700 text-sm">
                          {selectedPatient.diagnosis}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Medications</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedPatient.medications?.length > 0 ? (
                            selectedPatient.medications.map(
                              (medication, index) => (
                                <Badge key={index} variant="outline">
                                  {medication}
                                </Badge>
                              )
                            )
                          ) : (
                            <p className="text-gray-500 text-sm">
                              No medications prescribed.
                            </p>
                          )}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Notes</h3>
                        <p className="text-gray-700 text-sm">
                          {selectedPatient.notes}
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="prescription">
                    <div className="space-y-6">
                      <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-4">
                          Generate New Prescription
                        </h3>
                        <form
                          className="space-y-4"
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleGeneratePrescription();
                          }}
                        >
                          {/* Symptoms Section */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Symptoms
                            </label>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {selectedPatient.symptoms?.map(
                                (symptom, index) => (
                                  <Badge key={index} variant="secondary">
                                    {symptom}
                                  </Badge>
                                )
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Input
                                placeholder="Add new symptom"
                                value={newSymptom}
                                onChange={(e) => setNewSymptom(e.target.value)}
                                className="flex-1"
                              />
                              <Button type="button" onClick={handleAddSymptom}>
                                Add
                              </Button>
                            </div>
                          </div>

                          {/* Medicines Section */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Medicines
                            </label>
                            <div className="space-y-3">
                              {selectedPatient.medications?.map(
                                (medication, index) => (
                                  <div
                                    key={index}
                                    className="grid grid-cols-3 gap-3 p-3 bg-gray-50 rounded-lg"
                                  >
                                    <Input
                                      placeholder="Medicine name"
                                      value={
                                        typeof medication === "string"
                                          ? medication
                                          : medication.name || medication
                                      }
                                      onChange={(e) => {
                                        const newMeds = [
                                          ...selectedPatient.medications,
                                        ];
                                        if (typeof medication === "string") {
                                          newMeds[index] = {
                                            name: e.target.value,
                                            dosage: "",
                                            frequency: "",
                                          };
                                        } else {
                                          newMeds[index].name = e.target.value;
                                        }
                                        setSelectedPatient((prev) => ({
                                          ...prev,
                                          medications: newMeds,
                                        }));
                                      }}
                                      className="col-span-1"
                                    />
                                    <Input
                                      placeholder="Dosage"
                                      value={
                                        typeof medication === "string"
                                          ? ""
                                          : medication.dosage
                                      }
                                      onChange={(e) => {
                                        const newMeds = [
                                          ...selectedPatient.medications,
                                        ];
                                        if (typeof medication === "string") {
                                          newMeds[index] = {
                                            name: medication,
                                            dosage: e.target.value,
                                            frequency: "",
                                          };
                                        } else {
                                          newMeds[index].dosage =
                                            e.target.value;
                                        }
                                        setSelectedPatient((prev) => ({
                                          ...prev,
                                          medications: newMeds,
                                        }));
                                      }}
                                      className="col-span-1"
                                    />
                                    <Input
                                      placeholder="Frequency"
                                      value={
                                        typeof medication === "string"
                                          ? ""
                                          : medication.frequency
                                      }
                                      onChange={(e) => {
                                        const newMeds = [
                                          ...selectedPatient.medications,
                                        ];
                                        if (typeof medication === "string") {
                                          newMeds[index] = {
                                            name: medication,
                                            dosage: "",
                                            frequency: e.target.value,
                                          };
                                        } else {
                                          newMeds[index].frequency =
                                            e.target.value;
                                        }
                                        setSelectedPatient((prev) => ({
                                          ...prev,
                                          medications: newMeds,
                                        }));
                                      }}
                                      className="col-span-1"
                                    />
                                  </div>
                                )
                              )}
                              <div className="grid grid-cols-3 gap-3 p-3 bg-gray-50 rounded-lg">
                                <Input
                                  placeholder="Medicine name"
                                  value={newMedicine.name}
                                  onChange={(e) =>
                                    setNewMedicine((prev) => ({
                                      ...prev,
                                      name: e.target.value,
                                    }))
                                  }
                                  className="col-span-1"
                                />
                                <Input
                                  placeholder="Dosage"
                                  value={newMedicine.dosage}
                                  onChange={(e) =>
                                    setNewMedicine((prev) => ({
                                      ...prev,
                                      dosage: e.target.value,
                                    }))
                                  }
                                  className="col-span-1"
                                />
                                <Input
                                  placeholder="Frequency"
                                  value={newMedicine.frequency}
                                  onChange={(e) =>
                                    setNewMedicine((prev) => ({
                                      ...prev,
                                      frequency: e.target.value,
                                    }))
                                  }
                                  className="col-span-1"
                                />
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={handleAddMedicine}
                              >
                                + Add Medicine
                              </Button>
                            </div>
                          </div>

                          {/* Notes Section */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Additional Notes
                            </label>
                            <Textarea
                              placeholder="Enter any additional notes or instructions"
                              value={prescriptionNotes}
                              onChange={(e) =>
                                setPrescriptionNotes(e.target.value)
                              }
                              className="min-h-[100px]"
                            />
                          </div>

                          {/* Generate Button */}
                          <Button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700"
                          >
                            Generate Prescription
                          </Button>
                        </form>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Select a patient to view details
            </div>
          )}
        </div>
      </div>
    </>
  );

  const renderAppointmentsView = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Appointments</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Upcoming Appointments</h3>
        </div>
        <div className="divide-y">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">{appointment.patientName}</h3>
                    <p className="text-sm text-gray-500">
                      {appointment.age} years, {appointment.gender}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="mr-1 h-4 w-4" />
                    <span>{appointment.date}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="mr-1 h-4 w-4" />
                    <span>{appointment.time}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPatientsView = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Patients</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {appointments.map((appointment) => (
          <Card key={appointment.id} className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">{appointment.patientName}</h3>
                  <p className="text-sm text-gray-500">
                    {appointment.age} years, {appointment.gender}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-500">
                  Recent Symptoms
                </h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  {appointment.symptoms?.map((symptom, index) => (
                    <Badge key={index} variant="secondary">
                      {symptom}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderSettingsView = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Name</h3>
              <p className="mt-1">{doctor?.name || "Loading..."}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Specialization
              </h3>
              <p className="mt-1">{doctor?.specialization || "Loading..."}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Email</h3>
              <p className="mt-1">{doctor?.email || "Loading..."}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPrescriptionsView = () => {
    // Prefer patient from navigation state, fallback to selectedPatient
    const patientFromNav = location.state?.patient;
    const patient = patientFromNav || selectedPatient;
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Prescriptions</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            {patient ? (
              <PrescriptionGenerator patient={patient} />
            ) : (
              <div className="text-center text-gray-500 py-8">
                Select a patient to generate a prescription
              </div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Patient History</h3>
            {patient ? (
              historyLoading ? (
                <div className="text-center text-gray-500 py-8">Loading history...</div>
              ) : (
                <ScrollArea className="h-[60vh] pr-4">
                  <div className="space-y-6">
                    {prescriptionHistory.length > 0 ? (
                      prescriptionHistory.map((prescription, index) => (
                        <Card key={prescription._id || index} className="border-l-4 border-l-blue-500">
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-lg">Prescription #{index + 1}</CardTitle>
                                <span className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                  <Clock className="h-3 w-3" />
                                  {new Date(prescription.createdAt || prescription.date).toLocaleDateString()}
                                </span>
                              </div>
                              <Badge variant="secondary">{prescription.status || 'Completed'}</Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div>
                                <h4 className="text-sm font-medium mb-1">Doctor</h4>
                                <span>{prescription.doctorId?.name || "Unknown"}</span>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium mb-1">Specialization</h4>
                                <span>{prescription.doctorId?.specialization || "Unknown"}</span>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium mb-1">Diagnosis</h4>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {prescription.symptoms?.map((symptom, idx) => (
                                    <Badge key={idx} variant="secondary">{symptom}</Badge>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium mb-1">Medications</h4>
                                <div className="space-y-1">
                                  {prescription.medicines?.length > 0 ? (
                                    prescription.medicines.map((medicine, medIndex) => (
                                      <div key={medIndex} className="flex items-center gap-2 text-sm">
                                        <span>{medicine.name}</span>
                                        <span className="text-gray-500">-</span>
                                        <span className="text-gray-600">{medicine.dosage}</span>
                                        {medicine.frequency && (
                                          <>
                                            <span className="text-gray-500">-</span>
                                            <span className="text-gray-600">{medicine.frequency}</span>
                                          </>
                                        )}
                                      </div>
                                    ))
                                  ) : (
                                    <span className="text-sm text-gray-500">No medications prescribed</span>
                                  )}
                                </div>
                              </div>
                              {prescription.notes && (
                                <>
                                  <Separator />
                                  <div>
                                    <h4 className="text-sm font-medium mb-1">Notes</h4>
                                    <span className="text-sm text-gray-600">{prescription.notes}</span>
                                  </div>
                                </>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                className="ml-2"
                                onClick={() => handleDownloadPdf(prescription._id)}
                                disabled={downloadingPdfId === prescription._id}
                              >
                                {downloadingPdfId === prescription._id ? (
                                  <span className="flex items-center"><Loader2 className="h-4 w-4 animate-spin mr-1" />Downloading...</span>
                                ) : (
                                  <span className="flex items-center"><Download className="h-4 w-4 mr-1" />Download PDF</span>
                                )}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center h-32 text-gray-500">No prescription history found</div>
                    )}
                  </div>
                </ScrollArea>
              )
            ) : (
              <div className="text-center text-gray-500 py-8">
                Select a patient to view their history
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return <div>Loading...</div>;
    }

    if (error) {
      return <div className="text-red-500">{error}</div>;
    }

    switch (activeView) {
      case "dashboard":
        return renderDashboardView();
      case "appointments":
        return <Appointments onCreatePrescription={handleCreatePrescription} />;
      case "patients":
        return <Patients />;
      case "prescriptions":
        return renderPrescriptionsView();
      case "settings":
        return renderSettingsView();
      default:
        return renderDashboardView();
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <DoctorSidebar
        setActiveView={setActiveView}
        activeView={activeView}
        doctor={doctor}
      />
      <main className="flex-1 overflow-y-auto p-8">{renderContent()}</main>
    </div>
  );
}
