import { ApiError } from "../utils/ApiError.js";
import Appointment from "../models/AppointmentModel.js";
import Patient from "../models/PatientModel.js";
import Prescription from "../models/PrescriptionModel.js";

export const getDoctorAppointments = async (req, res, next) => {
  try {
    const doctorId = req.doctorId;
    const appointments = await Appointment.find({ doctor: doctorId })
      .populate("patient", "firstName lastName email age gender")
      .sort({ date: -1 });

    return res.status(200).json({ appointments });
  } catch (error) {
    console.log(error);
    next(new ApiError(500, "Failed to fetch appointments"));
  }
};

export const getPatientHistory = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      throw new ApiError(404, "Patient not found");
    }

    const prescriptions = await Prescription.find({ patient: patientId })
      .populate("doctorId", "name specialization")
      .sort({ createdAt: -1 });

    return res.status(200).json({ patient, prescriptions });
  } catch (error) {
    console.log(error);
    next(new ApiError(500, "Failed to fetch patient history"));
  }
};

export const generatePrescription = async (req, res, next) => {
  try {
    const { patientId, symptoms, medicines, notes } = req.body;
    const doctorId = req.doctorId;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      throw new ApiError(404, "Patient not found");
    }

    const newPrescription = new Prescription({
      doctorId,
      patient: patientId,
      symptoms,
      medicines,
      notes,
    });

    await newPrescription.save();

    return res.status(201).json({ message: "Prescription created successfully", prescription: newPrescription });
  } catch (error) {
    console.log(error);
    next(new ApiError(500, "Failed to create prescription"));
  }
};
