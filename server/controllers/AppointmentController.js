import { ApiError } from "../utils/ApiError.js";
import Appointment from "../models/AppointmentModel.js";
import Patient from "../models/PatientModel.js";
import Doctor from "../models/DoctorModel.js";
import Admin from "../models/AdminModel.js";

// Create a new appointment
export const createAppointment = async (req, res, next) => {
  try {
    const { patientId, doctorId, date, status, reason = "" } = req.body;

    // Validate doctor existence
    const doctorExists = await Doctor.findById(doctorId);
    if (!doctorExists) {
      throw new ApiError(404, "Doctor not found");
    }

    // Validate patient existence
    const patientExists = await Patient.findById(patientId);
    if (!patientExists) {
      throw new ApiError(404, "Patient not found");
    }

    const newAppointment = new Appointment({
      patient: patientId,
      doctor: doctorId,
      appointmentTime: date,
      status,
      reason,
    });

    await newAppointment.save();

    // Populate the appointment with patient and doctor details
    const populatedAppointment = await Appointment.findById(newAppointment._id)
      .populate("patient", "name phone age gender")
      .populate("doctor", "name specialization email");

    return res.status(201).json({
      message: "Appointment created successfully",
      appointment: populatedAppointment,
    });
  } catch (error) {
    console.log(error);
    next(new ApiError(500, "Failed to create appointment"));
  }
};

// Get all appointments for admin
export const getAdminAppointments = async (req, res, next) => {
  try {
    const { doctor, patient, status } = req.query;
    const filter = {};
    
    // Check if user is admin by looking up in Admin collection
    const admin = await Admin.findById(req.user._id);
    if (!admin) {
      throw new ApiError(403, "Not authorized to view all appointments");
    }

    // Apply filters if provided
    if (status && status !== 'all') {
      filter.status = status;
    }

    const appointments = await Appointment.find(filter)
      .populate("patient", "name phone age gender")
      .populate("doctor", "name specialization email")
      .sort({ appointmentTime: -1 });

    // Apply name-based filtering after population
    let filteredAppointments = appointments;
    if (doctor) {
      filteredAppointments = filteredAppointments.filter(appointment => 
        appointment.doctor.name.toLowerCase().includes(doctor.toLowerCase())
      );
    }
    if (patient) {
      filteredAppointments = filteredAppointments.filter(appointment => 
        appointment.patient.name.toLowerCase().includes(patient.toLowerCase())
      );
    }

    return res.status(200).json({ appointments: filteredAppointments });
  } catch (error) {
    console.log(error);
    next(new ApiError(500, "Failed to fetch appointments"));
  }
};

// Get appointments for a specific doctor
export const getDoctorAppointments = async (req, res, next) => {
  try {
    // Check if user is doctor by looking up in Doctor collection
    const doctor = await Doctor.findById(req.user._id);
    if (!doctor) {
      throw new ApiError(403, "Not authorized to view doctor appointments");
    }

    const appointments = await Appointment.find({ doctor: req.user._id })
      .populate("patient", "name phone age gender")
      .populate("doctor", "name specialization email")
      .sort({ appointmentTime: -1 });

    return res.status(200).json({ appointments });
  } catch (error) {
    console.log(error);
    next(new ApiError(500, "Failed to fetch appointments"));
  }
};

// Get a single appointment by ID
export const getAppointmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id)
      .populate("patient", "name phone age gender")
      .populate("doctor", "name specialization email");

    if (!appointment) {
      throw new ApiError(404, "Appointment not found");
    }

    // Check if user has permission to view this appointment
    const doctor = await Doctor.findById(req.user._id);
    const admin = await Admin.findById(req.user._id);
    
    if (doctor && appointment.doctor._id.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "Not authorized to view this appointment");
    }
    if (!admin && !doctor) {
      throw new ApiError(403, "Not authorized to view appointments");
    }

    return res.status(200).json({ appointment });
  } catch (error) {
    console.log(error);
    next(new ApiError(500, "Failed to fetch appointment"));
  }
};

// Update appointment status or time
export const updateAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const update = req.body;

    // Check if appointment exists
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      throw new ApiError(404, "Appointment not found");
    }

    // Check if user has permission to update this appointment
    const doctor = await Doctor.findById(req.user._id);
    const admin = await Admin.findById(req.user._id);
    
    if (doctor && appointment.doctor.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "Not authorized to update this appointment");
    }
    if (!admin && !doctor) {
      throw new ApiError(403, "Not authorized to update appointments");
    }

    // Update the appointment
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      update,
      { new: true }
    )
      .populate("patient", "name phone age gender")
      .populate("doctor", "name specialization email");

    return res.status(200).json({ 
      message: "Appointment updated", 
      appointment: updatedAppointment 
    });
  } catch (error) {
    console.log(error);
    next(new ApiError(500, "Failed to update appointment"));
  }
};

// Delete/cancel an appointment
export const deleteAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if appointment exists
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      throw new ApiError(404, "Appointment not found");
    }

    // Check if user has permission to delete this appointment
    const doctor = await Doctor.findById(req.user._id);
    const admin = await Admin.findById(req.user._id);
    
    if (doctor && appointment.doctor.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "Not authorized to delete this appointment");
    }
    if (!admin && !doctor) {
      throw new ApiError(403, "Not authorized to delete appointments");
    }

    await Appointment.findByIdAndDelete(id);

    return res.status(200).json({ message: "Appointment deleted" });
  } catch (error) {
    console.log(error);
    next(new ApiError(500, "Failed to delete appointment"));
  }
};