import express from "express";
import {
  register,
  login,
  getMe,
  logout,
  updateProfile,
  updatePassword,
  deleteAccount,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js";
const router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/logout", logout);

router.put("/profile", protect, upload.single("profileImage"), updateProfile);
router.put("/password", protect, updatePassword);
router.delete("/account", protect, deleteAccount);

export default router;
