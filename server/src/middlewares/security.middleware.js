import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const parseOrigins = () => {
  const configured = process.env.ALLOWED_ORIGINS || process.env.FRONTEND_URL || "http://localhost:5173";
  return configured.split(",").map((origin) => origin.trim()).filter(Boolean);
};

export const helmetMiddleware = helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
});

export const corsMiddleware = cors({
  origin(origin, callback) {
    const allowlist = parseOrigins();
    if (!origin || allowlist.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error("CORS origin denied"));
  },
  credentials: true,
});

export const apiLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 900000),
  limit: Number(process.env.RATE_LIMIT_MAX || 100),
  standardHeaders: true,
  legacyHeaders: false,
});

export const aiLimiter = rateLimit({
  windowMs: Number(process.env.AI_RATE_LIMIT_WINDOW_MS || 900000),
  limit: Number(process.env.AI_RATE_LIMIT_MAX || 20),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many AI requests",
    error: "Please wait before using another AI feature.",
  },
});

export const authLimiter = rateLimit({
  windowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS || 900000),
  limit: Number(process.env.AUTH_RATE_LIMIT_MAX || 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts",
    error: "Please wait before trying again.",
  },
});
