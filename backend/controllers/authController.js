import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import {
  createUser,
  findUserByEmail,
  findUserById,
} from "../models/userModel.js";
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const existingUser = await findUserByEmail(cleanEmail);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }
const hashedPassword = await bcrypt.hash(password, 12);
    const user = await createUser(
      cleanName,
      cleanEmail,
      hashedPassword
    );
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }
const cleanEmail = email.trim().toLowerCase();
    const user = await findUserByEmail(cleanEmail);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }const token = generateToken(user.id);
 res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production"
          ? "none"
          : "lax",
      maxAge: 15 * 60  * 1000,
    });
    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
export const getMe = async (req, res) => {
  try {
    const user = await findUserById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get user error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite:
      process.env.NODE_ENV === "production"
        ? "none"
        : "lax",
  });

  return res.status(200).json({
    success: true,
    message: "Logout successful",
  });
};