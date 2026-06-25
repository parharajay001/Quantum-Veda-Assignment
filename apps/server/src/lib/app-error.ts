// Lightweight HTTP error carrying a status code. Services throw these to signal
// a specific response status without depending on Express req/res. The central
// errorHandler (src/middleware/error.ts) maps them to `{ error: message }`.
export class AppError extends Error {
  readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
  }
}

export const unauthorized = (message = "Unauthorized") =>
  new AppError(401, message);

export const conflict = (message = "Conflict") => new AppError(409, message);
