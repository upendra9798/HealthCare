import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Navbar from "../../components/navbar";

// Constants
import { ADMIN_LOGIN_ROUTE, DOCTOR_LOGIN_ROUTE } from "../../utils/constants";

// API Client
import apiClient from "@/lib/api-client";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") || "doctor";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");
    const doctorId = formData.get("doctorId");

    const loginRoute =
      role === "admin" ? ADMIN_LOGIN_ROUTE : DOCTOR_LOGIN_ROUTE;

    const body =
      role === "admin" ? { email, password } : { email, password, doctorId };

    try {
      const response = await apiClient.post(loginRoute, body, {
        withCredentials: true,
      });

      toast.success(
        `Login successful! Welcome ${role === "admin" ? "Admin" : "Doctor"}`
      );

      // You can store user info to global state here if needed
      navigate(role === "admin" ? "/admin/dashboard" : "/doctor/dashboard");
    } catch (error) {
      console.error("Login Error:", error);
      toast.error(
        error.response?.data?.message || "An error occurred during login"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />
      <div className="pt-28 pb-16 px-4 flex items-center justify-center">
        <Card className="w-full max-w-md border-none shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {role === "admin" ? "Admin Login" : "Doctor Login"}
            </CardTitle>
            <CardDescription>
              Enter your credentials to access the {role} dashboard
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>

              {role === "doctor" && (
                <div className="space-y-2">
                  <Label htmlFor="doctorId">Doctor ID</Label>
                  <Input id="doctorId" name="doctorId" type="text" required />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
              </div>

              <div className="text-right">
                <Link to="#" className="text-sm text-blue-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
              <div className="text-center text-sm text-gray-500">
                Not a staff member?{" "}
                <Link to="/" className="text-blue-600 hover:underline">
                  Return to patient portal
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
