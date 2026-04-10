import multer from "multer";
import path from "node:path";
import fs from "node:fs";

const uploadDir = "uploads/track-versions";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    const safeBaseName = baseName.replace(/[^a-zA-Z0-9-_]/g, "_");

    cb(null, `${Date.now()}-${safeBaseName}${ext}`);
  },
});

const allowedMimeTypes = [
  "audio/mpeg",
  "audio/wav",
  "audio/x-wav",
  "audio/flac",
  "audio/mp4",
  "audio/aac",
  "audio/ogg",
];

export const uploadTrackVersionFile = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      cb(new Error("Only audio files are allowed"));
      return;
    }

    cb(null, true);
  },
});