import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogTrigger,
} from "../../components/ui/dialog";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "../../components/ui/select";
import { Search, UserPlus } from "lucide-react";
import AdminSidebar from "../../components/admin-sidebar";
import { useToast } from "../../components/ui/use-toast";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "../../components/ui/card";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import apiClient from "../../lib/api-client";
import {
  REGISTER_DOCTOR_ROUTE,
  DEREGISTER_DOCTOR_ROUTE,
  VIEW_PATIENTS_ROUTE,
  DOCTORS_BY_SPECIALIZATION_ROUTE,
  ALL_DOCTORS_ROUTE,
} from "../../utils/constants";
import Appointments from "../Admin/Appointments";
import Patients from "../Admin/Patients";

const mockDoctors = [
  {
    id: "d1",
    name: "Dr. Jane Wilson",
    specialization: "Cardiology",
    email: "jane.wilson@hospital.com",
    patients: 24,
    appointments: 8,
    doctorId: "DOC001",
  },
  {
    id: "d2",
    name: "Dr. Robert Chen",
    specialization: "Neurology",
    email: "robert.chen@hospital.com",
    patients: 18,
    appointments: 5,
    doctorId: "DOC002",
  },
  {
    id: "d3",
    name: "Dr. Sarah Miller",
    specialization: "Orthopedics",
    email: "sarah.miller@hospital.com",
    patients: 31,
    appointments: 12,
    doctorId: "DOC003",
  },
  {
    id: "d4",
    name: "Dr. James Taylor",
    specialization: "General Medicine",
    email: "james.taylor@hospital.com",
    patients: 42,
    appointments: 15,
    doctorId: "DOC004",
  },
];

const mockPatients = [
  {
    id: "a1",
    name: "John Smith",
    phone: "9876543210",
    age: 45,
    gender: "male",
    symptoms: ["chest pain", "shortness of breath"],
    doctorId: "DOC002",
    history: [],
  },
  {
    id: "a2",
    name: "Sarah Johnson",
    phone: "7894561230",
    age: 32,
    gender: "female",
    symptoms: ["severe headache", "dizziness"],
    doctorId: "DOC001",
    history: [],
  },
  {
    id: "a3",
    name: "Michael Brown",
    phone: "9012345678",
    age: 58,
    gender: "male",
    symptoms: ["fatigue", "weight loss"],
    doctorId: "DOC003",
    history: [],
  },
  {
    id: "a4",
    name: "Emily Davis",
    phone: "8123456789",
    age: 27,
    gender: "female",
    symptoms: [],
    doctorId: "DOC004",
    history: [],
  },
];

export default function AdminDashboard() {
  const [doctors, setDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const { toast } = useToast();
  const [activeView, setActiveView] = useState("dashboard");
  const [patients, setPatients] = useState([]);

  const fetchDoctors = async () => {
    try {
      const res = await apiClient.get(ALL_DOCTORS_ROUTE);
      const dbDoctors = res.data.doctors || [];
      const uniqueDoctors = [
        ...mockDoctors,
        ...dbDoctors.filter(
          (dbDoc) => !mockDoctors.some((mock) => mock.doctorId === dbDoc.doctorId)
        ),
      ];
      setDoctors(
        uniqueDoctors.map((doc) => ({
          ...doc,
          patients: doc.patients || 0,
          appointments: doc.appointments || 0,
        }))
      );
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to fetch doctors.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const filteredDoctors = doctors.filter(
    (doctor) =>
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newDoctor = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      password: formData.get("password"),
      specialization: formData.get("specialization"),
      doctorId: formData.get("doctorId"),
    };

    try {
      await apiClient.post(REGISTER_DOCTOR_ROUTE, newDoctor);
      await fetchDoctors();
      toast({
        title: "Doctor Registered",
        description: `${newDoctor.name} has been registered.`,
      });
      setIsAddDoctorOpen(false);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to register doctor.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveDoctor = async (doctorId) => {
    try {
      await apiClient.delete(DEREGISTER_DOCTOR_ROUTE, {
        data: { doctorId },
      });
      await fetchDoctors();
      toast({ title: "Doctor Removed" });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to remove doctor.",
        variant: "destructive",
      });
    }
  };

  const fetchPatients = async () => {
    try {
      setPatients(mockPatients);
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not fetch patients.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (activeView === "patients") fetchPatients();
  }, [activeView]);

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <Card className="border-none shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Total Doctors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{doctors.length}</div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Total Patients
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{patients.length}</div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Active Appointments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">0</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Doctors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {doctors.slice(0, 5).map((doctor) => (
                      <div
                        key={doctor.id}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarFallback>
                              {doctor.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{doctor.name}</p>
                            <p className="text-sm text-gray-500">
                              {doctor.specialization}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {doctor.patients} Patients
                          </p>
                          <p className="text-sm text-gray-500">
                            {doctor.appointments} Appointments
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Patients</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {patients.slice(0, 5).map((patient) => (
                      <div
                        key={patient.id}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarFallback>
                              {patient.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{patient.name}</p>
                            <p className="text-sm text-gray-500">
                              {patient.age} years, {patient.gender}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {patient.symptoms?.length || 0} Symptoms
                          </p>
                          <p className="text-sm text-gray-500">
                            {patient.history?.length || 0} Visits
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        );

      case "doctors":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Doctors</h2>
              <Dialog open={isAddDoctorOpen} onOpenChange={setIsAddDoctorOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Doctor
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>

            <div className="flex justify-between items-center">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search doctors..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDoctors.map((doctor) => (
                <Card key={doctor.id}>
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback>
                          {doctor.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>{doctor.name}</CardTitle>
                        <p className="text-sm text-gray-500">
                          {doctor.specialization}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="font-medium">Email:</span>{" "}
                        {doctor.email}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Patients:</span>{" "}
                        {doctor.patients}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Appointments:</span>{" "}
                        {doctor.appointments}
                      </p>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => handleRemoveDoctor(doctor.doctorId)}
                      >
                        Remove Doctor
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case "patients":
        return <Patients />;

      case "appointments":
        return <Appointments />;

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar setActiveView={setActiveView} activeView={activeView} />
      <main className="flex-1 overflow-y-auto p-8">
        {renderContent()}
      </main>
    </div>
  );
}
