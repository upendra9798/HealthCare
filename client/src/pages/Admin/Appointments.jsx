import { useState, useEffect } from "react";
import { useToast } from "../../../hooks/use-toast";
import apiClient from "../../lib/api-client";
import { GET_ADMIN_APPOINTMENTS_ROUTE, DELETE_APPOINTMENT_ROUTE } from "../../utils/constants";
import { Trash2, Calendar, Clock, User, Stethoscope, AlertCircle } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    doctor: "",
    patient: "",
    status: "all"
  });
  const { toast } = useToast();

  const fetchAppointments = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.doctor) queryParams.append('doctor', filters.doctor);
      if (filters.patient) queryParams.append('patient', filters.patient);
      if (filters.status && filters.status !== 'all') queryParams.append('status', filters.status);
      
      const response = await apiClient.get(`${GET_ADMIN_APPOINTMENTS_ROUTE}?${queryParams}`);
      setAppointments(response.data.appointments);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch appointments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    try {
      await apiClient.delete(DELETE_APPOINTMENT_ROUTE.replace(":id", appointmentId));
      toast({
        title: "Success",
        description: "Appointment deleted successfully",
      });
      fetchAppointments();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete appointment",
        variant: "destructive",
      });
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [filters]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Appointments</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchAppointments()}>
            Refresh
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Filter by Doctor</Label>
              <Input
                placeholder="Search by doctor name"
                value={filters.doctor}
                onChange={(e) => handleFilterChange('doctor', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Filter by Patient</Label>
              <Input
                placeholder="Search by patient name"
                value={filters.patient}
                onChange={(e) => handleFilterChange('patient', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Filter by Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
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

      {/* Appointments List */}
      <div className="grid gap-4">
        {appointments.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center text-center space-y-2">
                <AlertCircle className="h-8 w-8 text-gray-400" />
                <h3 className="text-lg font-medium">No appointments found</h3>
                <p className="text-sm text-gray-500">Try adjusting your filters or check back later.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          appointments.map((appointment) => (
            <Card key={appointment._id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-6 flex-1">
                    <div className="flex items-center gap-2 min-w-[200px]">
                      <User className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Patient</p>
                        <p className="font-medium">{appointment.patient.name}</p>
                      </div>
                    </div>

                    <Separator orientation="vertical" className="h-8" />

                    <div className="flex items-center gap-2 min-w-[200px]">
                      <Stethoscope className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Doctor</p>
                        <p className="font-medium">{appointment.doctor.name}</p>
                      </div>
                    </div>

                    <Separator orientation="vertical" className="h-8" />

                    <div className="flex items-center gap-2 min-w-[180px]">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Date</p>
                        <p className="font-medium">
                          {new Date(appointment.appointmentTime).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <Separator orientation="vertical" className="h-8" />

                    <div className="flex items-center gap-2 min-w-[150px]">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Time</p>
                        <p className="font-medium">
                          {new Date(appointment.appointmentTime).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Badge className={`${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </Badge>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteAppointment(appointment._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 