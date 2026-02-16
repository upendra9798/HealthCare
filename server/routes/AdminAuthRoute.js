import { Router } from "express";
import {
  adminLogin,
  getAdminInfo,
  adminLogout
} from "../controllers/AdminAuthControllers.js";
import { verifyToken } from "../middlewares/AuthMiddleware.js";

const adminAuthRoutes = Router();

adminAuthRoutes.post("/login", adminLogin);
adminAuthRoutes.get("/admin-info", verifyToken, getAdminInfo);
adminAuthRoutes.post("/logout", adminLogout);

export default adminAuthRoutes;
