import express from "express";
import {
  addTask,
  getTasks,
  getSingleTask,
  editTask,
  removeTask,
} from "../controllers/taskController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();
router.post("/", protect, addTask);
router.get("/", protect, getTasks);
router.get("/:id", protect, getSingleTask);
router.put("/:id", protect, editTask);
router.delete("/:id", protect, removeTask);
export default router;
