import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(6000),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required for PostgreSQL/Neon"),
  FIREBASE_WEB_API_KEY: z.string().optional(),
  ALLOWED_ORIGINS: z.string().default("http://localhost:5173"),
  FRONTEND_URL: z.string().default("http://localhost:5173"),
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  AI_PROVIDER: z.enum(["gemini", "openrouter"]).default("gemini"),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default("gemini-1.5-flash"),
  OPENROUTER_API_KEY: z.string().optional(),
  OPENROUTER_MODEL: z.string().default("deepseek/deepseek-r1:free"),
  OPENROUTER_SITE_URL: z.string().optional(),
  OPENROUTER_APP_NAME: z.string().optional(),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  AI_RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  AI_RATE_LIMIT_MAX: z.coerce.number().default(20),
  AUTH_RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().default(10),
  MAX_FILE_SIZE_MB: z.coerce.number().default(10),
  MAX_VIDEO_SIZE_MB: z.coerce.number().default(100),
});

export const validateEnv = () => {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const message = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
    throw new Error(`Invalid environment configuration: ${message}`);
  }

  if (!process.env.FIREBASE_WEB_API_KEY) {
    console.warn("FIREBASE_WEB_API_KEY is not configured. Google login/signup will fail until Firebase is configured.");
  }

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.warn("RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not configured. Razorpay checkout will fail until Razorpay is configured.");
  }

  if ((process.env.AI_PROVIDER || "gemini") === "gemini" && !process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY is not configured. Gemini AI features will use fallbacks or fail safely.");
  }

  if (process.env.AI_PROVIDER === "openrouter" && !process.env.OPENROUTER_API_KEY) {
    console.warn("OPENROUTER_API_KEY is not configured. OpenRouter AI features will use fallbacks or fail safely.");
  }

  return parsed.data;
};
