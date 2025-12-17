import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { User, Stethoscope, Trash2, Search, Filter, AlertCircle, Calendar, Clock, Pill } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import apiClient from "../../lib/api-client";
import { GET_ALL_PATIENTS_ROUTE, GET_PATIENT_HISTORY_ROUTE } from "../../utils/constants";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientHistory, setPatientHistory] = useState([]);
  const [filters, setFilters] = useState({
    name: "",
    gender: "all",
    ageRange: "all"
  });
  const { toast } = useToast();

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(GET_ALL_PATIENTS_ROUTE);
      
      // The server returns the patients array directly
      if (Array.isArray(response.data)) {
        setPatients(response.data);
        setError(null);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
      setError("Failed to fetch patients");
      toast({
        title: "Error",
        description: "Failed to fetch patients",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewHistory = async (patient) => {
    try {
      setSelectedPatient(patient);
      const response = await apiClient.get(GET_PATIENT_HISTORY_ROUTE(patient._id));
      console.log("Patient history response:", response.data);
      
      // The response contains both patient and prescriptions
      if (response.data.prescriptions) {
        setPatientHistory(response.data.prescriptions);
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

  const handleRemovePatient = async (patientId) => {
    try {
      // Since we don't have a direct delete route, we'll just remove from the local state
      setPatients(prev => prev.filter(patient => patient._id !== patientId));
      toast({
        title: "Success",
        description: "Patient removed from view",
      });
    } catch (error) {
      console.error("Error removing patient:", error);
      toast({
        title: "Error",
        description: "Failed to remove patient",
        variant: "destructive",
      });
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredPatients = patients.filter(patient => {
    const matchesName = patient.name.toLowerCase().includes(filters.name.toLowerCase());
    const matchesGender = filters.gender === "all" || patient.gender === filters.gender;
    const matchesAge = filters.ageRange === "all" || 
      (filters.ageRange === "0-18" && patient.age <= 18) ||
      (filters.ageRange === "19-30" && patient.age > 18 && patient.age <= 30) ||
      (filters.ageRange === "31-50" && patient.age > 30 && patient.age <= 50) ||
      (filters.ageRange === "50+" && patient.age > 50);
    
    return matchesName && matchesGender && matchesAge;
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Patients</h2>
        <Button onClick={fetchPatients} variant="outline" size="sm">
          <Search className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                placeholder="Search by name..."
                value={filters.name}
                onChange={(e) => handleFilterChange("name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Gender</label>
              <Select
                value={filters.gender}
                onValueChange={(value) => handleFilterChange("gender", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Age Range</label>
              <Select
                value={filters.ageRange}
                onValueChange={(value) => handleFilterChange("ageRange", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select age range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ages</SelectItem>
                  <SelectItem value="0-18">0-18 years</SelectItem>
                  <SelectItem value="19-30">19-30 years</SelectItem>
                  <SelectItem value="31-50">31-50 years</SelectItem>
                  <SelectItem value="50+">50+ years</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredPatients.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
            <span className="text-gray-500 text-lg">No patients found</span>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => (
            <Card key={patient._id} className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">{patient.name}</h3>
                    <span className="text-sm text-gray-500">
                      {patient.age} years, {patient.gender}
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-500">Recent Symptoms</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {patient.symptoms?.length > 0 ? (
                      patient.symptoms.map((symptom, index) => (
                        <Badge key={index} variant="secondary">
                          {symptom}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">No symptoms recorded</span>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleViewHistory(patient)}
                  >
                    <Stethoscope className="h-4 w-4 mr-2" />
                    View History
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleRemovePatient(patient._id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedPatient} onOpenChange={(open) => !open && setSelectedPatient(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          {selectedPatient && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {selectedPatient.name}'s Medical History
                </DialogTitle>
                <DialogDescription>
                  <div className="flex items-center gap-4 mt-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {selectedPatient.age} years
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {selectedPatient.gender}
                    </Badge>
                  </div>
                </DialogDescription>
              </DialogHeader>
              
              <ScrollArea className="h-[60vh] pr-4">
                {patientHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                    <Pill className="h-8 w-8 mb-2" />
                    <span>No prescription history found</span>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {patientHistory.map((prescription, index) => (
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
                            <Badge variant="secondary">
                              {prescription.status || 'Completed'}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-sm font-medium mb-2">Symptoms</h4>
                              <div className="flex flex-wrap gap-2">
                                {prescription.symptoms?.length > 0 ? (
                                  prescription.symptoms.map((symptom, idx) => (
                                    <Badge key={idx} variant="secondary">
                                      {symptom}
                                    </Badge>
                                  ))
                                ) : (
                                  <span className="text-sm text-gray-500">No symptoms recorded</span>
                                )}
                              </div>
                            </div>
                            <Separator />
                            <div>
                              <h4 className="text-sm font-medium mb-2">Medications</h4>
                              <div className="space-y-2">
                                {prescription.medicines?.length > 0 ? (
                                  prescription.medicines.map((medicine, medIndex) => (
                                    <div key={medIndex} className="flex items-center gap-2 text-sm">
                                      <Pill className="h-4 w-4 text-blue-500" />
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
                                  <h4 className="text-sm font-medium mb-2">Notes</h4>
                                  <span className="text-sm text-gray-600">{prescription.notes}</span>
                                </div>
                              </>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 