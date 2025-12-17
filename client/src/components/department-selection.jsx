import { useState, useEffect } from "react";
import apiClient from "../lib/api-client";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import {
  Heart,
  Brain,
  Bone,
  Eye,
  Stethoscope,
  Baby,
  ChevronRight,
  Hospital,
  Syringe,
  Dna,
  Microscope,
  PlusCircle,
} from "lucide-react";
import { ALL_DOCTORS_ROUTE } from "../utils/constants";

const specializationIcons = {
  Cardiology: Heart,
  Neurology: Brain,
  Orthopedics: Bone,
  Ophthalmology: Eye,
  "General Medicine": Stethoscope,
  Pediatrics: Baby,
  Dermatology: Syringe,
  Oncology: PlusCircle,
  Pathology: Microscope,
  Genetics: Dna,
  // Add more specializations and their respective icons here
};

export default function DepartmentSelection({ onSelect }) {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDoctors = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(ALL_DOCTORS_ROUTE);
      const fetchedDoctors = res.data.doctors || [];
      setDoctors(fetchedDoctors);

      // Dynamically create departments based on doctor specializations
      const uniqueSpecializations = [...new Set(fetchedDoctors.map(doc => doc.specialization))];
      const dynamicDepartments = uniqueSpecializations.map(specialization => ({
        id: specialization.toLowerCase().replace(/\s+/g, ''),
        name: specialization,
        icon: specializationIcons[specialization] || Hospital, // Default icon if not found
        description: `Doctors specializing in ${specialization}`, // Generic description
        image: "/placeholder.svg?height=200&width=300", // Placeholder image
      }));
      setDepartments(dynamicDepartments);

    } catch (err) {
      setError("Failed to load doctors");
      console.error("Error fetching doctors:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const filteredDoctors = selectedDepartment
    ? doctors.filter(doctor => doctor.specialization === selectedDepartment)
    : [];

  if (loading) {
    return <div className="text-center">Loading departments and doctors...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {!selectedDepartment ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => {
            const Icon = dept.icon;
            return (
              <Card
                key={dept.id}
                className="cursor-pointer hover:shadow-xl transition-all duration-300 border-none shadow-lg overflow-hidden department-card"
                onClick={() => setSelectedDepartment(dept.name)}
              >
                <div className="h-36 relative">
                  <img
                    src={dept.image || "/placeholder.svg"}
                    alt={dept.name}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                    <div className="p-4 text-white">
                      <h3 className="font-bold text-lg">{dept.name}</h3>
                    </div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <p className="text-sm text-gray-600">{dept.description}</p>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full justify-between mt-2"
                  >
                    Select Department <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-medium">Select Doctor</h3>
            <Button
              variant="outline"
              onClick={() => setSelectedDepartment(null)}
            >
              Back to Departments
            </Button>
          </div>

          <div className="grid gap-4">
            {filteredDoctors.length === 0 ? (
              <div className="text-center text-gray-500">No doctors found in this department.</div>
            ) : (
              filteredDoctors.map((doctor) => (
                <Card
                  key={doctor.id || doctor._id}
                  className="cursor-pointer hover:shadow-xl transition-all duration-300 border-none shadow-md"
                  onClick={() => onSelect(selectedDepartment, doctor.id || doctor._id)}
                >
                  <CardContent className="p-4 flex items-center">
                    <div className="relative h-16 w-16 rounded-full overflow-hidden mr-4">
                      <img
                        src={doctor.img || "/placeholder.svg"}
                        alt={doctor.name}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-lg">{doctor.name}</h4>
                      <p className="text-sm text-blue-600">
                        {doctor.specialization}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
