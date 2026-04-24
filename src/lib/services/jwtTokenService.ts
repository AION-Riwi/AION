import jwt, { SignOptions } from "jsonwebtoken"; // using technology that returns a string token to validate sessions and signoptions which is an object with expiration configuration, i.e., an interface
import { z } from "zod";
import { ENV } from "@/lib/config/envValidator"; // Centralized validation
import { logger } from "@/lib/logger";

// Zod schema for validation
export const JwtPayloadSchema = z.object({
  userId: z.string().uuid(), // your ID is String UUID
  email: z.string().email(),
  role: z.enum(["customer", "staff", "admin"]), // your enum Role from Prisma
});

// TypeScript type inferred from schema
export type JwtPayload = z.infer<typeof JwtPayloadSchema>;

// Extracted type for clarity
type JwtExpiresIn = NonNullable<SignOptions["expiresIn"]>; // type for token expiration

export function generateToken(payload: JwtPayload): string {
  const signOptions: SignOptions = {
    expiresIn: ENV.JWT_EXPIRES_IN as JwtExpiresIn,
  };
  // we generate the token with sign which receives 3 parameters and returns a string or generated token
  const token = jwt.sign(payload, ENV.JWT_SECRET, signOptions);
  logger.debug(`JWT generated`, {
    userId: payload.userId,
    expiresIn: ENV.JWT_EXPIRES_IN,
    tokenLength: token.length,
  });
  return token;
}

export function verifyToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    const payload = JwtPayloadSchema.parse(decoded); // Zod already validates and types
    logger.debug(`JWT verified`, {
      userId: payload.userId,
      tokenLength: token.length,
    });
    return payload;
  } catch (error: unknown) {
    if (error instanceof jwt.TokenExpiredError) {
      logger.warn(`JWT expired`, { tokenLength: token.length });
      throw new Error("Token expired");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn(`JWT invalid`, { tokenLength: token.length });
      throw new Error("Invalid token");
    }
    if (error instanceof z.ZodError) {
      logger.warn(`JWT payload invalid`, {
        errors: error.issues,
        tokenLength: token.length,
      });
      throw new Error("Invalid token payload");
    }
    logger.error(`JWT verification failed`, {
      error: error instanceof Error ? error.message : String(error),
      tokenLength: token.length,
    });
    throw error;
  }
}

export function decodeToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.decode(token);
    if (!decoded) {
      logger.debug(`JWT decode failed - no payload`, {
        tokenLength: token.length,
      });
      return null;
    }
    const payload = JwtPayloadSchema.parse(decoded); // Zod already validates and types
    logger.debug(`JWT decoded`, {
      userId: payload.userId,
      tokenLength: token.length,
    });
    return payload;
  } catch (error) {
    logger.warn(`JWT decode failed`, {
      error: error instanceof Error ? error.message : String(error),
      tokenLength: token.length,
    });
    return null;
  }
}
