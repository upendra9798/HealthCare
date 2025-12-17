import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

import {
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  Settings,
  LogOut,
  Menu,
  Home,
  ClipboardList,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { cn } from "../lib/utils";
import { HOST, DOCTOR_LOGOUT_ROUTE } from "../utils/constants";

const navigation = [
  { name: "Dashboard", href: "/doctor/dashboard", icon: Home, key: "dashboard" },
  { name: "Appointments", href: "/doctor/appointments", icon: Calendar, key: "appointments" },
  { name: "Patients", href: "/doctor/patients", icon: Users, key: "patients" },
  { name: "Prescriptions", href: "/doctor/prescriptions", icon: ClipboardList, key: "prescriptions" },
  { name: "Settings", href: "/doctor/settings", icon: Settings, key: "settings" },
];

export default function DoctorSidebar({ setActiveView, activeView, doctor }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Update active view based on current path
  useEffect(() => {
    const currentPath = location.pathname;
    const currentNav = navigation.find(nav => nav.href === currentPath);
    if (currentNav) {
      setActiveView(currentNav.key);
    }
  }, [location.pathname, setActiveView]);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${HOST}/${DOCTOR_LOGOUT_ROUTE}`,
        {},
        { withCredentials: true }
      );
      navigate("/doctor/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Doctor Info */}
      <div className="px-4 py-6 border-b">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage
              src="/placeholder.svg?height=40&width=40"
              alt="Doctor"
            />
            <AvatarFallback>DR</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">Dr. {doctor?.name || "Loading..."}</p>
            <p className="text-sm text-gray-500">
              {doctor?.specialization || "Specialization..."}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = activeView === item.key;
          return (
            <Button
              key={item.name}
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-blue-100 text-blue-900"
                  : "text-gray-700 hover:bg-gray-100"
              )}
              onClick={() => {
                setActiveView(item.key);
                setOpen(false);
              }}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Button>
          );
        })}
      </div>

      {/* Logout */}
      <div className="px-2 py-4 border-t">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <LogOut className="mr-2 h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden fixed top-4 left-4 z-50"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 flex-col border-r bg-white">
        <SidebarContent />
      </div>
    </>
  );
}
