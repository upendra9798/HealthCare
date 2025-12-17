import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PrescriptionGenerator from "../../components/PrescriptionGenerator";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Separator } from "../../components/ui/separator";
import { Badge } from "../../components/ui/badge";
import { Clock } from "lucide-react";
import axios from "axios";
import { HOST, GET_PATIENT_HISTORY_ROUTE } from "../../utils/constants";

export default function Prescriptions() {
  const location = useLocation();
  const navigate = useNavigate();
  const patient = location.state?.patient;
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!patient || !patient._id) return;
      setLoading(true);
      try {
        const res = await axios.get(`${HOST}/${GET_PATIENT_HISTORY_ROUTE(patient._id)}`, { withCredentials: true });
        setHistory(res.data.prescriptions || []);
      } catch (err) {
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [patient]);

  const renderPatientHistory = (history) => {
    if (loading) return <div className="text-center text-gray-500 py-8">Loading history...</div>;
    if (!history || history.length === 0) {
      return <div className="flex flex-col items-center justify-center h-32 text-gray-500">No prescription history found</div>;
    }
    return (
      <ScrollArea className="h-[60vh] pr-4">
        <div className="space-y-6">
          {history.map((prescription, index) => (
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    );
  };

  if (!patient) {
    return (
      <Card className="mt-10 max-w-xl mx-auto">
        <CardHeader>
          <CardTitle>No Patient Selected</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Please select a patient from the Appointments page to create a prescription.</p>
          <Button onClick={() => navigate("/doctor/appointments")}>Go to Appointments</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <PrescriptionGenerator patient={patient} />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Patient History</h3>
        {renderPatientHistory(history)}
      </div>
    </div>
  );
} 