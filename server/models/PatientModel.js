import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String },
  age: { type: Number, required: true },
  gender: { type: String, enum: ["male", "female", "other"], required: true },
  symptoms: { type: [String], default: [] },

  doctorId: { type: String, required: true }, 

  history: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Prescription"
  }]
}, { timestamps: true });

const Patient = mongoose.model("Patient", patientSchema);
export default Patient;
