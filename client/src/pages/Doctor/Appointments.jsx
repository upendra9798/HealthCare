import { useState, useEffect } from "react";
import {
  HOST,
  GET_DOCTOR_APPOINTMENTS_ROUTE,
  DELETE_APPOINTMENT_ROUTE,
} from "../../utils/constants";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { Calendar, Clock, User, AlertCircle, RefreshCw, FileText } from "lucide-react";
import { toast } from "react-hot-toast";
import apiClient from "../../lib/api-client";

export default function Appointments({ onCreatePrescription }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    patient: "",
    status: "all",
  });

  const handleCreatePrescription = (appointment) => {
    if (onCreatePrescription && appointment.patient && appointment.patient._id) {
      onCreatePrescription(appointment.patient);
    } else {
      toast.error("Patient information is missing or invalid.");
    }
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(GET_DOCTOR_APPOINTMENTS_ROUTE);
      setAppointments(response.data.appointments);
      setError(null);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setError("Failed to fetch appointments");
      toast.error("Failed to fetch appointments");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (appointmentId) => {
    try {
      await apiClient.delete(
        DELETE_APPOINTMENT_ROUTE.replace(":id", appointmentId)
      );
      toast.success("Appointment deleted successfully");
      fetchAppointments();
    } catch (error) {
      console.error("Error deleting appointment:", error);
      toast.error("Failed to delete appointment");
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const filteredAppointments = appointments.filter((appointment) => {
    if (!appointment?.patient) return false;
    const patientName = (appointment.patient.name || "").toLowerCase().trim();
    const matchesPatient = patientName.includes(filters.patient.toLowerCase());
    const matchesStatus =
      filters.status === "all" || appointment.status === filters.status;
    return matchesPatient && matchesStatus;
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-500";
      case "completed":
        return "bg-green-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

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
        <h2 className="text-3xl font-bold tracking-tight">Appointments</h2>
        <Button onClick={fetchAppointments} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Patient Name</label>
              <Input
                placeholder="Search by patient name..."
                value={filters.patient}
                onChange={(e) => handleFilterChange("patient", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Appointments</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredAppointments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">No appointments found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <Card key={appointment._id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center min-w-[200px]">
                      <User className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="font-medium">
                        {appointment?.patient
                          ? appointment.patient.name || "Unknown Patient"
                          : "Unknown Patient"}
                      </span>
                    </div>
                    <Separator orientation="vertical" className="h-6" />
                    <div className="flex items-center min-w-[180px]">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <span>
                        {new Date(
                          appointment.appointmentTime
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <Separator orientation="vertical" className="h-6" />
                    <div className="flex items-center min-w-[150px]">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      <span>
                        {new Date(
                          appointment.appointmentTime
                        ).toLocaleTimeString()}
                      </span>
                    </div>
                    <Separator orientation="vertical" className="h-6" />
                    <Badge className={getStatusColor(appointment.status)}>
                      {appointment.status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCreatePrescription(appointment)}
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      Create Prescription
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(appointment._id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
