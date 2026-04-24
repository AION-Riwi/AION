import { AppError } from "./AppError";

export class AIServiceError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super({
      code: "AI_SERVICE_ERROR",
      message,
      statusCode: 502,
      context,
    });
    this.name = "AIServiceError";
  }
}
