import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { User } from "lucide-react";
import { HOST, ALL_DOCTORS_ROUTE } from "../../utils/constants";

const AllDoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDoctors = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${HOST}/${ALL_DOCTORS_ROUTE}`);
      setDoctors(res.data.doctors || []);
    } catch (err) {
      setError("Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
    // Optionally, you can use a websocket or polling to update in real-time
  }, []);

  if (loading) {
    return <div className="container mx-auto px-4 py-20 text-center">Loading doctors...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-20 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-20">
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-12">
        Our Expert Doctors
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {doctors.length === 0 ? (
          <div className="col-span-full text-center text-gray-500">No doctors found.</div>
        ) : (
          doctors.map((doctor, index) => (
            <Card
              key={doctor.id || doctor._id || index}
              className="doctor-card border-none shadow-lg transition-all duration-300"
            >
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="mb-4 rounded-full overflow-hidden w-24 h-24 bg-gray-100 flex items-center justify-center">
                  {doctor.img ? (
                    <img
                      src={doctor.img}
                      alt={doctor.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-16 w-16 text-gray-400" />
                  )}
                </div>
                <h3 className="text-xl font-bold mb-1">{doctor.name}</h3>
                <p className="text-blue-600 text-sm mb-4">{doctor.specialization}</p>
                <Button variant="outline" asChild>
                  <Link
                    to={`/frontdesk?doctorName=${encodeURIComponent(
                      doctor.name
                    )}&specialty=${encodeURIComponent(doctor.specialization)}`}
                  >
                    Book Appointment
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AllDoctorsPage;
