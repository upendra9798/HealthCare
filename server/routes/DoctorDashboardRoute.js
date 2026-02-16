import { Router } from "express";
import {
  getDoctorAppointments,
  getPatientHistory,
  generatePrescription
} from "../controllers/DoctorDashboardController.js";
import { verifyToken } from "../middlewares/AuthMiddleware.js";

const doctorDashboardRoutes = Router();

doctorDashboardRoutes.get("/appointments", verifyToken, getDoctorAppointments);
doctorDashboardRoutes.get("/patient-history/:patientId", verifyToken, getPatientHistory);
doctorDashboardRoutes.post("/generate-prescription", verifyToken, generatePrescription);

export default doctorDashboardRoutes;
