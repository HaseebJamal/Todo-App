import multer from "multer";
import path from "path";
import fs from "fs";
const uploadDirectory = path.join(
  process.cwd(),
  "uploads",
  "profiles"
);

// Directory automatically create ho jayegi
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

// =====================================================
// DISK STORAGE
// =====================================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(
      file.originalname
    ).toLowerCase();

    // authMiddleware.js req.userId set karta hai
    const userId = req.userId || "user";

    const filename = `profile_${userId}_${Date.now()}${extension}`;

    cb(null, filename);
  },
});

// =====================================================
// FILE FILTER
// =====================================================

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;

  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  const mimetype = allowedTypes.test(
    file.mimetype
  );

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only image files are allowed (jpeg, jpg, png, webp, gif)"
      )
    );
  }
};

// =====================================================
// MULTER INSTANCE
// =====================================================

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});

