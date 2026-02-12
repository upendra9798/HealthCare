import { ApiError } from "../utils/ApiError.js";
import Doctor from "../models/DoctorModel.js";
import jwt from "jsonwebtoken";
import { compare } from "bcrypt";

// JWT expiration time: 3 days in milliseconds
const maxAge = 3 * 24 * 60 * 60 * 1000;

// Utilities
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePhone = (phone) => /^(\+91|91)?[6-9]\d{9}$/.test(phone);

const createToken = (email, doctorId) => {
  return jwt.sign({ email, doctorId }, process.env.JWT_KEY, {
    expiresIn: maxAge,
  });
};

// Doctor Login Controller
export const doctorLogin = async (req, res, next) => {
  try {
    const { email, phone, password, doctorId } = req.body;

    if (!password || !doctorId || (!email && !phone)) {
      return next(
        new ApiError(
          400,
          "Password, Doctor ID, and either Email or Phone are required"
        )
      );
    }

    let doctor;

    if (email) {
      if (!validateEmail(email)) {
        return next(new ApiError(400, "Invalid email format"));
      }
      doctor = await Doctor.findOne({ email, doctorId });
    } else if (phone) {
      if (!validatePhone(phone)) {
        return next(new ApiError(400, "Invalid phone number format"));
      }
      doctor = await Doctor.findOne({ phone, doctorId });
    }

    if (!doctor) {
      return next(
        new ApiError(404, "Doctor not found with provided credentials")
      );
    }

    const isPasswordValid = await compare(password, doctor.password);
    if (!isPasswordValid) {
      return next(new ApiError(401, "Incorrect password"));
    }

    const token = createToken(doctor.email, doctor._id.toString());

    res.cookie("jwt", token, {
      maxAge,
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    return res.status(200).json({
      doctor: {
        id: doctor._id,
        doctorId: doctor.doctorId,
        email: doctor.email,
        phone: doctor.phone,
        name: doctor.name,
        specialization: doctor.specialization,
      },
    });
  } catch (error) {
    console.error("Login Error:", error.stack || error.message);
    return next(new ApiError(500, "Internal Server Error during login"));
  }
};

// Get Doctor Info (Protected Route)
export const getDoctorInfo = async (req, res, next) => {
  try {
    const doctorData = await Doctor.findById(req.doctorId);

    if (!doctorData) {
      return next(new ApiError(404, "Doctor not found"));
    }

    return res.status(200).json({
      id: doctorData._id,
      doctorId: doctorData.doctorId,
      name: doctorData.name,
      phone: doctorData.phone,
      email: doctorData.email,
      specialization: doctorData.specialization,
    });
  } catch (error) {
    console.error("Get Doctor Info Error:", error.stack || error.message);
    return next(
      new ApiError(500, "Internal Server Error while fetching doctor info")
    );
  }
};

// Logout Controller
export const doctorLogout = async (req, res, next) => {
  try {
    res.cookie("jwt", "", { maxAge: 1, secure: true, sameSite: "None" });
    return res.status(200).send("Doctor logged out successfully");
  } catch (error) {
    console.error("Logout Error:", error.stack || error.message);
    return next(new ApiError(500, "Internal Server Error during logout"));
  }
};
