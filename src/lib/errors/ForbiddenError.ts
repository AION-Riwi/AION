import { AppError } from "./AppError";

export class ForbiddenError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super({
      code: "FORBIDDEN",
      message,
      statusCode: 403,
      context,
    });
    this.name = "ForbiddenError";
  }
}
