import bcrypt from "bcrypt";
import { ValidationError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import type { PasswordService } from "@/types/services";

function getSaltRounds(): number {
  const raw = process.env.SALT_ROUNDS;

  if (!raw) {
    throw new ValidationError(
      "SALT_ROUNDS environment variable is not defined",
    );
  }
  // this is converting the number to integer and telling it that the base is 10, the normal numbering system
  const saltRounds = parseInt(raw, 10);
  if (!Number.isInteger(saltRounds)) {
    throw new ValidationError("SALT_ROUNDS must be an integer");
  }
  if (saltRounds < 10 || saltRounds > 14) {
    throw new ValidationError("SALT_ROUNDS must be between 10 and 14");
  }

  return saltRounds;
}

/**
 * Lazy cache (better for tests and serverless)
 * Loads only when needed
 */
let cachedSaltRounds: number | null = null;

function getEnvSaltRounds(): number {
  if (cachedSaltRounds === null) {
    cachedSaltRounds = getSaltRounds();
  }
  return cachedSaltRounds;
}

function validatePassword(password: string): void {
  if (typeof password !== "string") {
    throw new ValidationError("Password must be a string");
  }
  const trimmed = password.trim();
  if (trimmed.length < 8) {
    throw new ValidationError("Password must be at least 8 characters");
  }
  if (!/[0-9]/.test(trimmed)) {
    throw new ValidationError("Password must include at least one number");
  }
  if (!/[A-Z]/.test(trimmed)) {
    throw new ValidationError(
      "Password must include at least one uppercase letter",
    );
  }
  if (!/[a-z]/.test(trimmed)) {
    throw new ValidationError(
      "Password must include at least one lowercase letter",
    );
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(trimmed)) {
    throw new ValidationError(
      "Password must include at least one special character",
    );
  }
}
function validateHash(hash: string): void {
  if (typeof hash !== "string" || hash.length === 0) {
    throw new ValidationError("Hash must be a valid string");
  }

  //  HERE we tell it that the hash must have the bcrypt format
  // /^\$2[aby] starts here and this format has something that can be 2a, 2b or 2y
  // \$\d{2} the next 2 characters are the salt rounds
  // \$.{31 -53} the next 53 characters are the hash
  const BCRYPT_REGEX = /^\u00242[aby]\$\d{2}\$[./A-Za-z0-9]{31,53}$/;

  if (!BCRYPT_REGEX.test(hash)) {
    throw new ValidationError("Invalid bcrypt hash format");
  }
}

async function hashPassword(password: string): Promise<string> {
  validatePassword(password);
  try {
    const rounds = getEnvSaltRounds();
    const hash = await bcrypt.hash(password, rounds);
    logger.debug(`Password hashed`, { rounds, hashLength: hash.length });
    return hash;
  } catch (error: unknown) {
    logger.error(`Password hashing failed`, {
      error: error instanceof Error ? error.message : String(error),
    });
    throw new ValidationError("Failed to hash password", {
      cause: error instanceof Error ? error.message : String(error),
    });
  }
}

async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  validatePassword(password);
  validateHash(hash);

  try {
    const result = await bcrypt.compare(password, hash);
    logger.debug(`Password comparison`, { result, hashLength: hash.length });
    return result;
  } catch (error) {
    logger.error(`Password comparison failed`, {
      error: error instanceof Error ? error.message : String(error),
    });
    throw new ValidationError("Failed to compare password", {
      cause: error instanceof Error ? error.message : String(error),
    });
  }
}

export const bcryptPasswordService: PasswordService = {
  hash: hashPassword,
  compare: comparePassword,
};
