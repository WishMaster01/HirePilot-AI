import { errorResponse } from "../shared/apiResponse.js";

export const notFoundHandler = (req, res) => {
  return errorResponse(res, "Route not found", `${req.method} ${req.originalUrl} does not exist`, 404);
};

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || err.status || 500;
  const isProduction = process.env.NODE_ENV === "production";
  const safeError = statusCode >= 500 && isProduction ? "Internal server error" : err.message;

  if (!isProduction) {
    console.error(err);
  }

  return errorResponse(res, "Something went wrong", safeError, statusCode);
};
