import { Router } from "express";
import {
  createAppointment,
  getAdminAppointments,
  getDoctorAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment
} from "../controllers/AppointmentController.js";
import { verifyToken } from "../middlewares/AuthMiddleware.js";

const appointmentRoutes = Router();

appointmentRoutes.get("/admin/appointments", verifyToken, getAdminAppointments);
appointmentRoutes.get("/doctor/appointments", verifyToken, getDoctorAppointments);
appointmentRoutes.post("/create-appointment", createAppointment);
appointmentRoutes.get("/get-appointment/:id", verifyToken, getAppointmentById);
appointmentRoutes.put("/update-appointment/:id", verifyToken, updateAppointment);
appointmentRoutes.delete("/delete-appointment/:id", verifyToken, deleteAppointment);

export default appointmentRoutes;