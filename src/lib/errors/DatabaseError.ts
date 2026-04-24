import { AppError } from "./AppError";

export class DatabaseError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super({
      code: "DATABASE_ERROR",
      message,
      statusCode: 503,
      context,
    });
    this.name = "DatabaseError";
  }
}
