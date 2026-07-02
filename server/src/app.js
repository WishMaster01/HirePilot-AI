import express from "express";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./routes.js";
import { apiLimiter, corsMiddleware, helmetMiddleware } from "./middlewares/security.middleware.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";
import { validateEnv } from "./config/env.js";

validateEnv();

const app = express();

app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser());
app.use(apiLimiter);

registerRoutes(app);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
