import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

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
// COOKIE OPTIONS
// =====================================================

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === "true",
  sameSite:
    process.env.COOKIE_SECURE === "true"
      ? "none"
      : "lax",
  maxAge: 15 * 60 * 1000,
});

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

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user.id);

    res.cookie("token", token, getCookieOptions());

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
  const cookieOptions = getCookieOptions();

  // maxAge clear karte waqt required nahi
  delete cookieOptions.maxAge;

  res.clearCookie("token", cookieOptions);

  return res.status(200).json({
    success: true,
    message: "Logout successful",
  });
};

// =====================================================
// UPDATE PROFILE
// Name, Email, Image
// PUT /api/auth/profile
// =====================================================

export const updateProfile = async (req, res) => {
  try {
    const { name, email, imageUrl } = req.body;

    // =================================================
    // VALIDATION
    // =================================================

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

    // =================================================
    // CHECK EMAIL
    // =================================================

    const existingUser = await findUserByEmail(cleanEmail);

    if (existingUser && existingUser.id !== req.userId) {
      return res.status(409).json({
        success: false,
        message: "Email already in use",
      });
    }

    // =================================================
    // GET CURRENT USER
    // =================================================

    const currentUser = await findUserById(req.userId);

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // =================================================
    // PROFILE IMAGE
    // =================================================

    let newProfileImage = undefined;

    // -------------------------------------------------
    // New image uploaded through Multer
    // -------------------------------------------------

    if (req.file) {
      newProfileImage = `/uploads/profiles/${req.file.filename}`;

      // Delete old local image if exists
      if (
        currentUser.profile_image &&
        currentUser.profile_image.startsWith("/uploads/")
      ) {
        const oldImagePath = path.join(
          process.cwd(),
          currentUser.profile_image.replace(
            /^\/uploads\//,
            "uploads/"
          )
        );

        try {
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        } catch (error) {
          console.error(
            "Old profile image delete error:",
            error.message
          );
        }
      }
    }

    // -------------------------------------------------
    // URL provided
    // -------------------------------------------------

    else if (imageUrl && imageUrl.trim()) {
      newProfileImage = imageUrl.trim();
    }

    // -------------------------------------------------
    // Explicit remove image
    // -------------------------------------------------

    else if (imageUrl === "") {
      newProfileImage = null;

      // Delete old local image
      if (
        currentUser.profile_image &&
        currentUser.profile_image.startsWith("/uploads/")
      ) {
        const oldImagePath = path.join(
          process.cwd(),
          currentUser.profile_image.replace(
            /^\/uploads\//,
            "uploads/"
          )
        );

        try {
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        } catch (error) {
          console.error(
            "Profile image delete error:",
            error.message
          );
        }
      }
    }

    // =================================================
    // UPDATE USER
    // =================================================

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
    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = req.body;

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be at least 6 characters",
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
        message:
          "New password must be different from current",
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

    const hashedPassword = await bcrypt.hash(
      newPassword,
      12
    );

    await updateUserPassword(
      req.userId,
      hashedPassword
    );

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
// DELETE ACCOUNT
// CASCADE deletes tasks
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

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Password is incorrect",
      });
    }

    // =================================================
    // DELETE LOCAL PROFILE IMAGE
    // =================================================

    if (
      user.profile_image &&
      user.profile_image.startsWith("/uploads/")
    ) {
      const imagePath = path.join(
        process.cwd(),
        user.profile_image.replace(
          /^\/uploads\//,
          "uploads/"
        )
      );

      try {
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      } catch (error) {
        console.error(
          "Profile image delete error:",
          error.message
        );
      }
    }

    // =================================================
    // DELETE USER
    // Tasks automatically delete because of
    // ON DELETE CASCADE
    // =================================================

    await deleteUserById(req.userId);

    // =================================================
    // CLEAR COOKIE
    // =================================================

    const cookieOptions = getCookieOptions();

    delete cookieOptions.maxAge;

    res.clearCookie("token", cookieOptions);

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