import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { ENV } from "@/lib/config/envValidator";
import { ValidationError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import type { RefreshTokenService } from "@/types/services";
import type { refresh_tokens } from "@prisma/client";

function generateSecureToken(length: number): string {
  const bytesNeeded = Math.ceil(length * 0.75);
  return crypto.randomBytes(bytesNeeded).toString("base64url").slice(0, length);
}

function parseExpiryToMs(expiry: string): number {
  const match = expiry.match(/^(\d+)([dhm])$/);
  if (!match) throw new ValidationError("Invalid expiry format");
  const [, value, unit] = match;
  const num = parseInt(value, 10);
  const multipliers: Record<string, number> = {
    d: 24 * 60 * 60 * 1000,
    h: 60 * 60 * 1000,
    m: 60 * 1000,
  };
  if (!multipliers[unit]) throw new ValidationError("Invalid expiry unit");
  return num * multipliers[unit];
}

function calculateExpiryDate(expiry: string): Date {
  return new Date(Date.now() + parseExpiryToMs(expiry));
}

function validateTokenFormat(token: string): void {
  if (typeof token !== "string" || token.length < 32) {
    throw new ValidationError("Invalid token format");
  }
}

function logTokenGenerated(
  userId: string,
  tokenLength: number,
  expiresAt: Date,
): void {
  logger.debug(`Refresh token generated`, { userId, tokenLength, expiresAt });
}

function logTokenError(
  operation: string,
  error: unknown,
  context: Record<string, unknown>,
): void {
  logger.error(`Failed to ${operation}`, {
    error: error instanceof Error ? error.message : String(error),
    ...context,
  });
}

async function createTokenRecord(
  userId: string,
  token: string,
  expiresAt: Date,
): Promise<void> {
  await prisma.refresh_tokens.create({
    data: {
      token,
      user_id: userId,
      expires_at: expiresAt,
      revoked: false,
    },
  });
}

async function findTokenByValue(token: string): Promise<refresh_tokens | null> {
  return prisma.refresh_tokens.findUnique({ where: { token } });
}

async function generateRefreshToken(userId: string): Promise<string> {
  const token = generateSecureToken(ENV.REFRESH_TOKEN_LENGTH);
  const expiresAt = calculateExpiryDate(ENV.REFRESH_TOKEN_EXPIRY);

  try {
    await createTokenRecord(userId, token, expiresAt);
    logTokenGenerated(userId, token.length, expiresAt);
    return token;
  } catch (error) {
    logTokenError("generate refresh token", error, { userId });
    throw new ValidationError("Failed to generate refresh token");
  }
}

function isTokenRevoked(record: refresh_tokens): boolean {
  return record.revoked;
}

function isTokenExpired(record: refresh_tokens): boolean {
  return record.expires_at < new Date();
}

function logTokenRevoked(userId: string, tokenId: string): void {
  logger.warn(`Refresh token revoked`, { userId, tokenId });
}

function logTokenExpired(
  userId: string,
  tokenId: string,
  expiredAt: Date,
): void {
  logger.warn(`Refresh token expired`, { userId, tokenId, expiredAt });
}

function logTokenValidated(userId: string, tokenId: string): void {
  logger.debug(`Refresh token validated`, { userId, tokenId });
}

function createValidationResult(record: refresh_tokens): {
  userId: string;
  tokenId: string;
} {
  return { userId: record.user_id, tokenId: record.id };
}

async function validateRefreshToken(
  token: string,
): Promise<{ userId: string; tokenId: string } | null> {
  validateTokenFormat(token);

  try {
    const record = await findTokenByValue(token);
    if (!record) {
      logger.warn(`Refresh token not found`, { tokenLength: token.length });
      return null;
    }
    if (isTokenRevoked(record)) {
      logTokenRevoked(record.user_id, record.id);
      return null;
    }
    if (isTokenExpired(record)) {
      logTokenExpired(record.user_id, record.id, record.expires_at);
      return null;
    }
    logTokenValidated(record.user_id, record.id);
    return createValidationResult(record);
  } catch (error) {
    logTokenError("validate token", error, { tokenLength: token.length });
    return null;
  }
}

function assertTokenOwnership(
  validation: { userId: string } | null,
  expectedUserId: string,
  token: string,
): void {
  if (!validation || validation.userId !== expectedUserId) {
    logger.warn(`Token rotation failed - invalid token`, {
      userId: expectedUserId,
      tokenLength: token.length,
    });
    throw new ValidationError("Invalid refresh token for rotation");
  }
}

async function deleteTokenRecord(
  tokenId: string,
  userId: string,
): Promise<void> {
  await prisma.refresh_tokens.delete({ where: { id: tokenId } });
  logger.debug(`Old refresh token deleted`, { userId, oldTokenId: tokenId });
}

function logTokenRotated(userId: string, oldTokenId: string): void {
  logger.info(`Token rotated successfully`, { userId, oldTokenId });
}

async function rotateRefreshToken(
  oldToken: string,
  userId: string,
): Promise<string> {
  const validation = await validateRefreshToken(oldToken);
  assertTokenOwnership(validation, userId, oldToken);
  const tokenId = (validation as { userId: string; tokenId: string }).tokenId;

  try {
    await deleteTokenRecord(tokenId, userId);
    const newToken = await generateRefreshToken(userId);
    logTokenRotated(userId, tokenId);
    return newToken;
  } catch (error) {
    logTokenError("rotate token", error, { userId, oldTokenId: tokenId });
    throw new ValidationError("Failed to rotate refresh token");
  }
}

async function markTokenRevoked(tokenId: string): Promise<void> {
  await prisma.refresh_tokens.update({
    where: { id: tokenId },
    data: { revoked: true },
  });
}

function logTokenRevokedSuccess(userId: string, tokenId: string): void {
  logger.info(`Refresh token revoked`, { userId, tokenId });
}

async function revokeRefreshToken(token: string): Promise<void> {
  validateTokenFormat(token);

  try {
    const record = await findTokenByValue(token);
    if (!record) {
      logger.debug(`Token to revoke not found`, { tokenLength: token.length });
      return;
    }
    await markTokenRevoked(record.id);
    logTokenRevokedSuccess(record.user_id, record.id);
  } catch (error) {
    logTokenError("revoke token", error, { tokenLength: token.length });
    throw new ValidationError("Failed to revoke refresh token");
  }
}

async function revokeAllUserTokens(userId: string): Promise<number> {
  const result = await prisma.refresh_tokens.updateMany({
    where: { user_id: userId, revoked: false },
    data: { revoked: true },
  });
  return result.count;
}

function logAllTokensRevoked(userId: string, count: number): void {
  logger.info(`All user refresh tokens revoked`, { userId, count });
}

async function revokeAllUserRefreshTokens(userId: string): Promise<void> {
  try {
    const count = await revokeAllUserTokens(userId);
    logAllTokensRevoked(userId, count);
  } catch (error) {
    logTokenError("revoke all user tokens", error, { userId });
    throw new ValidationError("Failed to revoke user tokens");
  }
}

export const refreshTokenService: RefreshTokenService = {
  generate: generateRefreshToken,
  validate: validateRefreshToken,
  rotate: rotateRefreshToken,
  revoke: revokeRefreshToken,
  revokeAllUserTokens: revokeAllUserRefreshTokens,
};
