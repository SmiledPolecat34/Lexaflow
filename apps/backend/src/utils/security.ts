import bcrypt from 'bcrypt';
import { authenticator } from 'otplib';
import { randomBytes, createHash } from 'crypto';
import { env } from '../config/env.js';

const SALT_ROUNDS = 12;

/**
 * Hash a password with bcrypt + pepper
 */
export async function hashPassword(password: string): Promise<string> {
  const pepperedPassword = password + env.PASSWORD_PEPPER;
  return bcrypt.hash(pepperedPassword, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  const pepperedPassword = password + env.PASSWORD_PEPPER;
  return bcrypt.compare(pepperedPassword, hash);
}

/**
 * Generate a secure random token
 */
export function generateToken(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

/**
 * Generate a TOTP secret for 2FA
 */
export function generateTOTPSecret(): string {
  return authenticator.generateSecret();
}

/**
 * Verify a TOTP code
 */
export function verifyTOTPCode(secret: string, code: string): boolean {
  return authenticator.verify({
    token: code,
    secret,
  });
}

/**
 * Generate a TOTP URI for QR code
 */
export function generateTOTPUri(email: string, secret: string): string {
  return authenticator.keyuri(email, env.TOTP_ISSUER, secret);
}

/**
 * Generate recovery codes for 2FA backup
 */
export function generateRecoveryCodes(count: number = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = randomBytes(4).toString('hex').toUpperCase();
    codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
  }
  return codes;
}

/**
 * Hash a recovery code for storage
 */
export function hashRecoveryCode(code: string): string {
  return createHash('sha256')
    .update(code.replace('-', '').toUpperCase())
    .digest('hex');
}

/**
 * Verify a recovery code
 */
export function verifyRecoveryCode(code: string, hash: string): boolean {
  const codeHash = hashRecoveryCode(code);
  return codeHash === hash;
}

/**
 * Generate a hash for AI prompt caching
 */
export function generatePromptHash(prompt: string): string {
  return createHash('sha256').update(prompt).digest('hex');
}

/**
 * Sign a request with HMAC for AI API security
 */
export function signRequest(payload: string): string {
  return createHash('sha256')
    .update(payload + env.JWT_SECRET)
    .digest('hex');
}

/**
 * Parse duration string to milliseconds
 */
export function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) return 0;
  
  const value = parseInt(match[1]!, 10);
  const unit = match[2];
  
  switch (unit) {
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    default:
      return 0;
  }
}

/**
 * Generate a secure session ID
 */
export function generateSessionId(): string {
  return randomBytes(32).toString('base64url');
}
