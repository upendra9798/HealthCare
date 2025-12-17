import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Search, Trash2, History, User, Filter, AlertCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import apiClient from "../../lib/api-client";
import {
  VIEW_PATIENTS_ROUTE,
  DELETE_PATIENT_ROUTE,
  GET_PATIENT_HISTORY_ROUTE,
} from "../../utils/constants";
import { useToast } from "../../components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { Badge } from "../../components/ui/badge";
import { ScrollArea } from "../../components/ui/scroll-area";

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientHistory, setPatientHistory] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);
  const [filterDoctor, setFilterDoctor] = useState("all");
  const [filterGender, setFilterGender] = useState("all");
  const { toast } = useToast();

  const fetchPatients = async () => {
    try {
      const response = await apiClient.get(VIEW_PATIENTS_ROUTE);
      setPatients(response.data.patients || []);
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast({
        title: "Error",
        description: "Failed to fetch patients data",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleDeletePatient = async () => {
    try {
      await apiClient.delete(DELETE_PATIENT_ROUTE.replace(':id', patientToDelete._id));
      toast({
        title: "Success",
        description: "Patient deleted successfully",
      });
      fetchPatients();
      setIsDeleteDialogOpen(false);
      setPatientToDelete(null);
    } catch (error) {
      console.error("Error deleting patient:", error);
      toast({
        title: "Error",
        description: "Failed to delete patient",
        variant: "destructive",
      });
    }
  };

  const handleViewPatientHistory = async (patient) => {
    try {
      setSelectedPatient(patient);
      const response = await apiClient.get(GET_PATIENT_HISTORY_ROUTE(patient._id));
      console.log("Patient history response:", response.data);
      
      if (response.data.prescriptions) {
        setPatientHistory(response.data.prescriptions);
        setIsHistoryOpen(true);
        toast({
          title: "Success",
          description: "Patient history loaded successfully",
        });
      } else {
        console.error("No prescriptions found in response:", response.data);
        setPatientHistory([]);
        toast({
          title: "Info",
          description: "No prescription history found for this patient",
        });
      }
    } catch (error) {
      console.error("Error fetching patient history:", error);
      setPatientHistory([]);
      toast({
        title: "Error",
        description: "Failed to fetch patient history",
        variant: "destructive",
      });
    }
  };

  const renderPatientHistory = (history) => {
    if (!history || history.length === 0) {
      return <div className="text-gray-500">No visit history available</div>;
    }

    return (
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-6">
          {history.map((prescription, index) => (
            <div key={index} className="border-b pb-6 last:border-b-0">
              <div className="flex items-center justify-between mb-4">
                <div className="font-medium text-lg">
                  Visit Date: {new Date(prescription.createdAt).toLocaleDateString()}
                </div>
                <Badge variant="outline">
                  {prescription.status || "Completed"}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Doctor</p>
                  <p>{prescription.doctorId?.name || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Specialization</p>
                  <p>{prescription.doctorId?.specialization || "Unknown"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500">Diagnosis</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {prescription.symptoms?.map((symptom, idx) => (
                      <Badge key={idx} variant="secondary">
                        {symptom}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500">Prescription</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {prescription.medicines?.map((medicine, idx) => (
                      <Badge key={idx} variant="outline">
                        {medicine.name} ({medicine.dosage})
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500">Notes</p>
                  <p className="mt-1">{prescription.notes || "No additional notes"}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    );
  };

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.doctorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.doctorSpecialization?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDoctor = filterDoctor === "all" || patient.doctorName === filterDoctor;
    const matchesGender = filterGender === "all" || patient.gender === filterGender;

    return matchesSearch && matchesDoctor && matchesGender;
  });

  const uniqueDoctors = [...new Set(patients.map((p) => p.doctorName))].filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Patients</h2>
        <div className="flex gap-4">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search patients..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={filterDoctor} onValueChange={setFilterDoctor}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Doctor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Doctors</SelectItem>
              {uniqueDoctors.map((doctor) => (
                <SelectItem key={doctor} value={doctor}>
                  {doctor}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterGender} onValueChange={setFilterGender}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genders</SelectItem>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {patients.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No patients found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map((patient) => (
            <Card key={patient._id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {patient.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{patient.name}</CardTitle>
                      <div className="text-sm text-gray-500">
                        {patient.age} years, {patient.gender}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      setPatientToDelete(patient);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <User className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="font-medium">Phone:</span>
                    <span className="ml-2">{patient.phone}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <User className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="font-medium">Doctor:</span>
                    <span className="ml-2">{patient.doctorName || "Not Assigned"}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <User className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="font-medium">Specialization:</span>
                    <span className="ml-2">{patient.doctorSpecialization || "Not Assigned"}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <User className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="font-medium">Symptoms:</span>
                    <span className="ml-2">
                      {patient.symptoms?.length > 0
                        ? patient.symptoms.join(", ")
                        : "None"}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleViewPatientHistory(patient)}
                >
                  <History className="h-4 w-4 mr-2" />
                  View History
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the patient
              record and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePatient}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={isHistoryOpen}
        onOpenChange={(open) => {
          setIsHistoryOpen(open);
          if (!open) {
            setSelectedPatient(null);
            setPatientHistory([]);
          }
        }}
      >
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Patient History - {selectedPatient?.name}</DialogTitle>
            <DialogDescription>
              View complete medical history and visit records
            </DialogDescription>
          </DialogHeader>
          {selectedPatient && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-500">Patient Name</p>
                  <p className="font-medium">{selectedPatient.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Age</p>
                  <p>{selectedPatient.age} years</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Gender</p>
                  <p>{selectedPatient.gender}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p>{selectedPatient.phone}</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Visit History</h3>
                {renderPatientHistory(patientHistory)}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 