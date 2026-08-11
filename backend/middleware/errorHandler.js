export class ApiError extends Error {
  constructor(status, error, message) {
    super(message);
    this.status = status;
    this.error = error;
  }
}

// 404 handler for unmatched routes
export function notFoundHandler(req, res, next) {
  next(new ApiError(404, "Not Found", `The requested resource ${req.originalUrl} does not exist.`));
}

// Centralized error formatter - matches the design doc's uniform error body
// { status, error, message }
export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const error = err.error || "Internal Error";
  const message = err.message || "An unexpected error occurred.";

  if (status >= 500) {
    console.error("[errorHandler]", err);
  }

  res.status(status).json({ status, error, message });
}
