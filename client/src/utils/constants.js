export const HOST = import.meta.env.VITE_API_URL;

export const ADMIN_AUTH_ROUTES = "api/adminAuth";
export const ADMIN_LOGIN_ROUTE = `${ADMIN_AUTH_ROUTES}/login`;
export const ADMIN_INFO_ROUTE = `${ADMIN_AUTH_ROUTES}/admin-info`;
export const ADMIN_LOGOUT_ROUTE = `${ADMIN_AUTH_ROUTES}/logout`;

export const DOCTOR_AUTH_ROUTES = "api/doctorAuth";
export const DOCTOR_LOGIN_ROUTE = `${DOCTOR_AUTH_ROUTES}/login`;
export const DOCTOR_INFO_ROUTE = `${DOCTOR_AUTH_ROUTES}/doctor-info`;
export const DOCTOR_LOGOUT_ROUTE = `${DOCTOR_AUTH_ROUTES}/logout`;

export const ADMIN_DASHBOARD_ROUTES = "api/adminDashboard";
export const REGISTER_DOCTOR_ROUTE = `${ADMIN_DASHBOARD_ROUTES}/register-doctor`;
export const DEREGISTER_DOCTOR_ROUTE = `${ADMIN_DASHBOARD_ROUTES}/deregister-doctor`;
export const VIEW_PATIENTS_ROUTE = `${ADMIN_DASHBOARD_ROUTES}/view-patients`;
export const DOCTORS_BY_SPECIALIZATION_ROUTE = `${ADMIN_DASHBOARD_ROUTES}/doctors-by-specialization`;
export const ALL_DOCTORS_ROUTE = `${ADMIN_DASHBOARD_ROUTES}/all-doctors`;

export const DOCTOR_DASHBOARD_ROUTES = "api/doctorDashboard";
export const GET_APPOINTMENTS_ROUTE = `${DOCTOR_DASHBOARD_ROUTES}/appointments`;
export const GET_PATIENT_HISTORY_ROUTE = (patientId) =>
  `${DOCTOR_DASHBOARD_ROUTES}/patient-history/${patientId}`;
export const GENERATE_PRESCRIPTION_ROUTE = `${DOCTOR_DASHBOARD_ROUTES}/generate-prescription`;

// Prescription Routes
export const PRESCRIPTION_ROUTES = "api/prescription";
export const GENERATE_PRESCRIPTION_API_ROUTE = `${PRESCRIPTION_ROUTES}/generate`;
export const GET_PATIENT_PRESCRIPTIONS_ROUTE = (patientId) =>
  `${PRESCRIPTION_ROUTES}/patient/${patientId}`;
export const GENERATE_PRESCRIPTION_PDF_ROUTE = (prescriptionId) =>
  `${PRESCRIPTION_ROUTES}/pdf/${prescriptionId}`;
export const SEND_PRESCRIPTION_SMS_ROUTE = `${PRESCRIPTION_ROUTES}/send-sms`;

export const APPOINTMENT_ROUTES = "api/appointments";
export const CREATE_APPOINTMENT_ROUTE = `${APPOINTMENT_ROUTES}/create-appointment`;
export const GET_ADMIN_APPOINTMENTS_ROUTE = `${APPOINTMENT_ROUTES}/admin/appointments`;
export const GET_DOCTOR_APPOINTMENTS_ROUTE = `${APPOINTMENT_ROUTES}/doctor/appointments`;
export const GET_APPOINTMENT_BY_ID_ROUTE = `${APPOINTMENT_ROUTES}/get-appointment/:id`;
export const UPDATE_APPOINTMENT_ROUTE = `${APPOINTMENT_ROUTES}/update-appointment/:id`;
export const DELETE_APPOINTMENT_ROUTE = `${APPOINTMENT_ROUTES}/delete-appointment/:id`;

export const PATIENT_ROUTES = "api/patients";
export const REGISTER_PATIENT_ROUTE = `${PATIENT_ROUTES}/register`;
export const GET_ALL_PATIENTS_ROUTE = `${PATIENT_ROUTES}/get-all`;
export const GET_PATIENT_BY_ID_ROUTE = `${PATIENT_ROUTES}/get-patient/:id`;
export const UPDATE_PATIENT_ROUTE = `${PATIENT_ROUTES}/update-patient/:id`;
export const DELETE_PATIENT_ROUTE = `${PATIENT_ROUTES}/delete-patient/:id`;

// FastAPI Backend Configuration
export const FASTAPI_HOST = "https://healthcare-tvfz.onrender.com";

// API Routes
export const PROCESS_CASE_API_ROUTE = "/process_case/";

// Full endpoint URLs
export const PROCESS_CASE_URL = `${FASTAPI_HOST}${PROCESS_CASE_API_ROUTE}`;

// Request timeout (in milliseconds)
export const API_TIMEOUT = 60000; // 60 seconds for ML processing
