import { NotFoundError, ValidationError } from "@/lib/errors";
import { logger } from "@/lib/logger";

export async function handleNotFoundError<T>(
  promise: Promise<T>,
  message: string,
): Promise<T> {
  try {
    return await promise;
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2025"
    ) {
      logger.warn(`User not found`, { entity: "User", identifier: message });
      throw new NotFoundError("Usuario", message);
    }
    throw error;
  }
}

export async function handleDuplicateError<T>(
  promise: Promise<T>,
  email: string,
): Promise<T> {
  try {
    return await promise;
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      logger.warn(`Duplicate user attempted`, { email });
      throw new ValidationError(`El email ${email} ya está registrado`);
    }
    throw error;
  }
}
