/**
 * Hashing service (abstraction)
 * of functions that we are going to use to encrypt passwords
 * to not directly expose the functions we use from bcrypt or another library
 */
export interface PasswordService {
  hash(password: string): Promise<string>;
  compare(password: string, hash: string): Promise<boolean>;
}

/**
 * Refresh tokens service
 * Implements token rotation for security
 */
export interface RefreshTokenService {
  generate(userId: string): Promise<string>;
  validate(token: string): Promise<{ userId: string; tokenId: string } | null>;
  rotate(oldToken: string, userId: string): Promise<string>;
  revoke(token: string): Promise<void>;
  revokeAllUserTokens(userId: string): Promise<void>;
}
