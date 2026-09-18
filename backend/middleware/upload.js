import multer from "multer";

// =====================================================
// MEMORY STORAGE — Cloudinary ke liye zaroori
// File disk par save nahi hogi, sirf memory mein rahegi
// Vercel serverless par disk read-only hoti hai
// =====================================================
const storage = multer.memoryStorage();

// =====================================================
// FILE FILTER — Sirf images allow
// =====================================================
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const extname = allowedTypes.test(file.originalname.toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpeg, jpg, png, webp, gif)"));
  }
};

// =====================================================
// MULTER INSTANCE
// =====================================================
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
});