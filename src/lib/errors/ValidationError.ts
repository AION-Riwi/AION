import { AppError } from "./AppError";

export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super({
      code: "VALIDATION_ERROR",
      message,
      statusCode: 400,
      context,
    });
    this.name = "ValidationError";
  }
}
