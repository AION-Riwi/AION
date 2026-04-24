// Base error types and class
export { AppError, type ErrorCode, type ErrorDetails } from "./AppError";

// Specific error classes
export { ValidationError } from "./ValidationError";
export { NotFoundError } from "./NotFoundError";
export { DatabaseError } from "./DatabaseError";
export { AIServiceError } from "./AIServiceError";
export { UnauthorizedError } from "./UnauthorizedError";
export { ForbiddenError } from "./ForbiddenError";
