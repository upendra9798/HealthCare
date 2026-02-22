import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import adminAuthRoutes from "./routes/AdminAuthRoute.js";
import doctorAuthRoutes from "./routes/DoctorAuthRoute.js";
import doctorDashboardRoutes from "./routes/DoctorDashboardRoute.js";
import adminDashboardRoutes from "./routes/AdminDashboardRoute.js";
import transcriptionRoutes from "./routes/transcription.js";
import patientRoutes from "./routes/PatientRoute.js";
import prescriptionRoutes from "./routes/prescription.routes.js";
import appointmentRoutes from "./routes/AppointmentRoute.js";
import { createServer } from "http";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const port = process.env.PORT || 3001;
const databaseUrl = process.env.DATABASE_URL;

// Middleware
app.use(express.json());
app.use(cookieParser());
const allowedOrigins = [
  "http://localhost:5173",
  "https://medicareplusss.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS: " + origin));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));


// Routes
app.use("/api/adminAuth", adminAuthRoutes);
app.use("/api/doctorAuth", doctorAuthRoutes);
app.use("/api/doctorDashboard", doctorDashboardRoutes);
app.use("/api/adminDashboard", adminDashboardRoutes);
app.use("/api/transcription", transcriptionRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/prescription", prescriptionRoutes);
app.use("/api/appointments", appointmentRoutes);

// WebSocket upgrade handler
httpServer.on("upgrade", (request, socket, head) => {
  const pathname = new URL(request.url, `http://${request.headers.host}`)
    .pathname;

  if (pathname === "/api/transcription/stream") {
    transcriptionRoutes.handleUpgrade(request, socket, head);
  } else {
    socket.destroy();
  }
});

// Start server
httpServer.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Connect to MongoDB
mongoose
  .connect(databaseUrl)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });
