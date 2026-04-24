import { AppError } from "./AppError";

export class UnauthorizedError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super({
      code: "UNAUTHORIZED",
      message,
      statusCode: 401,
      context,
    });
    this.name = "UnauthorizedError";
  }
}
