import bcrypt from "bcryptjs";
import streamifier from "streamifier";
import cloudinary from "../config/cloudinary.js";
import { generateToken } from "../utils/generateToken.js";
import {
  createUser,
  findUserByEmail,
  findUserById,
  updateUserProfile,
  updateUserPassword,
  deleteUserById,
} from "../models/userModel.js";

// =====================================================
// HELPER — Upload image to Cloudinary
// =====================================================
const uploadToCloudinary = (buffer, userId) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "taskmanager/profiles",
        public_id: `profile_${userId}_${Date.now()}`,
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

// =====================================================
// REGISTER
// =====================================================
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
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    const existingUser = await findUserByEmail(cleanEmail);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await createUser(cleanName, cleanEmail, hashedPassword);

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

// =====================================================
// LOGIN
// =====================================================
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

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user.id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 15 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profile_image: user.profile_image || null,
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

// =====================================================
// GET ME
// =====================================================
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

// =====================================================
// LOGOUT
// =====================================================
export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  return res.status(200).json({
    success: true,
    message: "Logout successful",
  });
};

// =====================================================
// UPDATE PROFILE — Name, Email, Image (Cloudinary)
// PUT /api/auth/profile
// =====================================================
export const updateProfile = async (req, res) => {
  try {
    const { name, email, imageUrl } = req.body;

    // Validation
    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    if (!email?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    // Check if email taken by another user
    const existingUser = await findUserByEmail(cleanEmail);
    if (existingUser && existingUser.id !== req.userId) {
      return res.status(409).json({
        success: false,
        message: "Email already in use",
      });
    }

    // Get current user
    const currentUser = await findUserById(req.userId);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Determine profile image value
    let newProfileImage = undefined;

    if (req.file) {
      // ✅ File uploaded — Cloudinary par bhejein
      try {
        const cloudinaryResult = await uploadToCloudinary(
          req.file.buffer,
          req.userId
        );
        newProfileImage = cloudinaryResult.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Failed to upload image to Cloudinary",
        });
      }
    } else if (imageUrl && imageUrl.trim()) {
      // URL provided
      newProfileImage = imageUrl.trim();
    } else if (imageUrl === "") {
      // Explicit remove
      newProfileImage = null;
    }

    // Update user
    const updatedUser = await updateUserProfile(
      req.userId,
      cleanName,
      cleanEmail,
      newProfileImage
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// =====================================================
// UPDATE PASSWORD
// PUT /api/auth/password
// =====================================================
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current",
      });
    }

    const user = await findUserById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await updateUserPassword(req.userId, hashedPassword);

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Update password error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =====================================================
// DELETE ACCOUNT (CASCADE deletes tasks)
// DELETE /api/auth/account
// =====================================================
export const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    const user = await findUserById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Password is incorrect",
      });
    }

    // Optional: Delete profile image from Cloudinary
    if (user.profile_image && user.profile_image.includes("cloudinary")) {
      try {
        const urlParts = user.profile_image.split("/");
        const filename = urlParts[urlParts.length - 1];
        const publicId = `taskmanager/profiles/${filename.split(".")[0]}`;
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.error("Cloudinary delete error:", err);
        // Don't fail if image deletion fails
      }
    }

    await deleteUserById(req.userId);

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Delete account error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};