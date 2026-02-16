import { Router } from "express";
import {
  registerDoctor,
  deregisterDoctor,
  viewPatients,
  getDoctorsBySpecialization,
  getAllDoctors,
} from "../controllers/AdminDashboardController.js";

const adminDashboardRoutes = Router();


adminDashboardRoutes.post("/register-doctor", registerDoctor);
adminDashboardRoutes.delete("/deregister-doctor", deregisterDoctor);
adminDashboardRoutes.get("/view-patients", viewPatients);
adminDashboardRoutes.get("/doctors-by-specialization", getDoctorsBySpecialization);
adminDashboardRoutes.get("/all-doctors", getAllDoctors);


export default adminDashboardRoutes;
