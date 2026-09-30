import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// Middleware
// ============================================

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

// ============================================
// Static files
// ============================================

// Uploaded profile images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// React production build
app.use(express.static(path.join(__dirname, "frontend-dist")));

// ============================================
// API Routes
// ============================================

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// ============================================
// React Frontend
// ============================================

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend-dist", "index.html"));
});

// ============================================
// Start Server
// ============================================

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;