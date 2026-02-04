import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true
  },
  doctorName: {
    type: String,
    required: true
  },
  doctorSpecialization: {
    type: String,
    required: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true
  },
  symptoms: {
    type: [String],
    default: []
  },
  diagnosis: {
    type: String,
    default: ""
  },
  medicines: [{
    name: String,
    dosage: String,
    frequency: String,
    instructions: String // Optional additional detail
  }],
  holdMedicines: [{
    name: String,
    dosage: String,
    reason: String
  }],
  emergencyInstructions: {
    type: String
  },
  criticalWarnings: {
    type: [String]
  },
  sideEffectsNote: {
    type: String
  },
  followUp: {
    erVisit: String,
    pcpVisit: String,
    furtherEvaluation: String
  },
  rationale: {
    type: String
  },
  notes: {
    type: String
  }
}, { timestamps: true });

const Prescription = mongoose.model("Prescription", prescriptionSchema);
export default Prescription;
