import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Home from "./pages/Home/Index";
import Login from "./pages/Auth/Login";
import AdminDashboard from "./pages/AdminDash/Dashboard";
import DoctorDashboard from "./pages/Doctor/Dashboard";
import FrontdeskPage from "./pages/frontdesk/index";
import AllDoctorsPage from "./pages/Doctors/Index";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "doctor/login",
        element: <Login />, // Use DoctorLogin if it's different
      },
      {
        path: "admin/dashboard",
        element: <AdminDashboard />,
      },
      {
        path: "doctor/dashboard",
        element: <DoctorDashboard />,
      },
      {
        path: "doctor/appointments",
        element: <DoctorDashboard />,
      },
      {
        path: "doctor/patients",
        element: <DoctorDashboard />,
      },
      {
        path: "doctor/prescriptions",
        element: <DoctorDashboard />,
      },
      {
        path: "doctor/settings",
        element: <DoctorDashboard />,
      },
      {
        path: "frontdesk",
        element: <FrontdeskPage />,
      },
      {
        path: "doctors",
        element: <AllDoctorsPage />,
      },
    ],
  },
]);
