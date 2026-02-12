import { ApiError } from "../utils/ApiError.js";
import Admin from "../models/AdminModel.js";
import jwt from "jsonwebtoken";
import { compare } from "bcrypt";

const maxAge = 3 * 24 * 60 * 60 * 1000;

const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const validatePhone = (phone) => {
  const regex = /^(\+91|91)?[6-9]\d{9}$/;
  return regex.test(phone);
};

const createToken = (email, adminId) => {
  return jwt.sign({ email, adminId }, process.env.JWT_KEY, { expiresIn: maxAge });
};

export const adminLogin = async (req, res, next) => {
  try {
    const { email, phone, password } = req.body;
    if (!password || (!email && !phone)) {
      throw new ApiError(400, "Password and either Email or Phone are required");
    }

    let admin;
    if (email) {
      if (!validateEmail(email)) {
        throw new ApiError(400, "Invalid email format");
      }
      admin = await Admin.findOne({email});
    } else if (phone) {
      if (!validatePhone(phone)) {
        throw new ApiError(400, "Invalid phone number format");
      }
      admin = await Admin.findOne({phone});
    }

    if (!admin) {
      throw new ApiError(404, "Admin not found with provided credentials");
    }

    const auth = await compare(password, admin.password);
    if (!auth) {
      throw new ApiError(401, "Incorrect password");
    }

    const token = createToken(admin.email, admin._id);
    res.cookie("jwt", token, {
      maxAge,
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    return res.status(200).json({
      admin: {
        id: admin._id,
        email: admin.email,
        phone: admin.phone,
        role: admin.role,
      },
    });
  } catch (error) {
    console.log({ error });
    throw new ApiError(500, "Internal Server Error");
  }
};

export const getAdminInfo = async (req, res, next) => {
  try {
    const adminData = await Admin.findById(req.adminId);
    if (!adminData) {
      throw new ApiError(404, "Admin not found");
    }

    return res.status(200).json({
      id: adminData._id,
      email: adminData.email,
      phone: adminData.phone,
      role: adminData.role,
    });
  } catch (error) {
    console.log({ error });
    throw new ApiError(500, "Internal Server Error");
  }
};

export const adminLogout = async (req, res, next) => {
  try {
    res.cookie("jwt", "", { maxAge: 1, secure: true, sameSite: "None" });
    return res.status(200).send("Admin logged out successfully");
  } catch (error) {
    console.log({ error });
    throw new ApiError(500, "Internal Server Error");
  }
};
