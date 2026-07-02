import path from "path";
import multer from "multer";

const allowedResumeTypes = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "text/plain",
]);

const allowedMediaTypes = new Set([
  "video/mp4",
  "video/webm",
  "audio/mpeg",
  "audio/wav",
  "audio/webm",
]);

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads");
  },
  filename(req, file, cb) {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const fileFilter = (allowed) => (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const looksSafe = ![".exe", ".bat", ".cmd", ".sh", ".js"].includes(ext);
  if (allowed.has(file.mimetype) && looksSafe) {
    cb(null, true);
    return;
  }
  cb(new Error("Unsupported file type"));
};

export const resumeUpload = multer({
  storage,
  limits: { fileSize: Number(process.env.MAX_FILE_SIZE_MB || 10) * 1024 * 1024 },
  fileFilter: fileFilter(allowedResumeTypes),
});

export const mediaUpload = multer({
  storage,
  limits: { fileSize: Number(process.env.MAX_VIDEO_SIZE_MB || 100) * 1024 * 1024 },
  fileFilter: fileFilter(allowedMediaTypes),
});
