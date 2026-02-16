import { Router } from "express";
import {
  doctorLogin,
  getDoctorInfo,
  doctorLogout
} from "../controllers/DoctorAuthController.js";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
const doctorAuthRoutes = Router();

doctorAuthRoutes.post("/login", doctorLogin);
doctorAuthRoutes.get("/doctor-info", verifyToken, getDoctorInfo);
doctorAuthRoutes.post("/logout", doctorLogout);

export default doctorAuthRoutes;
