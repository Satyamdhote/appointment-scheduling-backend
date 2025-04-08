import { ApiError } from "../utils/apiError.js";

export function apiErrorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  res.status(500).json({
    status: "error",
    message: `Server Error: ${err.message}`,
  });
}
