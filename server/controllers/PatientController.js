import { ApiError } from "../utils/ApiError.js";
import Patient from "../models/PatientModel.js";

export const registerPatient = async (req, res, next) => {
  try {
    const patient = new Patient(req.body);
    await patient.save();
    res.status(201).json({ message: 'Patient registered successfully', patient });
  } catch (error) {
    next(new ApiError(400, 'Error registering patient', error.message));
  }
};

export const getAllPatients = async (req, res, next) => {
  try {
    const patients = await Patient.find();
    res.status(200).json(patients);
  } catch (error) {
    next(new ApiError(500, 'Error fetching patients', error.message));
  }
};

export const getPatientById = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return next(new ApiError(404, 'Patient not found'));
    }
    res.status(200).json(patient);
  } catch (error) {
    next(new ApiError(500, 'Error fetching patient', error.message));
  }
};

export const updatePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!patient) {
      return next(new ApiError(404, 'Patient not found'));
    }
    res.status(200).json({ message: 'Patient updated successfully', patient });
  } catch (error) {
    next(new ApiError(400, 'Error updating patient', error.message));
  }
};

export const deletePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) {
      return next(new ApiError(404, 'Patient not found'));
    }
    res.status(200).json({ message: 'Patient deleted successfully' });
  } catch (error) {
    next(new ApiError(500, 'Error deleting patient', error.message));
  }
}; 