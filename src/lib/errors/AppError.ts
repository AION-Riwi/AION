export type ErrorCode =
  | "DATABASE_ERROR"
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "AI_SERVICE_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "UNKNOWN_ERROR";

export interface ErrorDetails {
  code: ErrorCode;
  message: string;
  statusCode: number;
  context?: Record<string, unknown>;
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly context?: Record<string, unknown>;

  constructor(details: ErrorDetails) {
    super(details.message);
    this.name = "AppError";
    this.code = details.code;
    this.statusCode = details.statusCode;
    this.context = details.context;
  }

  toJSON() {
    return {
      error: this.code,
      message: this.message,
    };
  }
}
