import jwt from 'jsonwebtoken';
import crypto from 'crypto';

/**
 * Generates a short-lived JWT access token containing user id, email, and role.
 */
export const generateAccessToken = (id: string, email: string, role: string): string => {
  const jwtSecret = process.env.JWT_SECRET || 'super-secret-jwt-key-replace-in-production';
  const expiresIn = process.env.JWT_EXPIRES_IN || '15m';
  return jwt.sign({ id, email, role }, jwtSecret, { expiresIn: expiresIn as any });
};

/**
 * Generates a long-lived JWT refresh token with a unique tokenId for rotation.
 */
export const generateRefreshToken = (id: string, email: string): string => {
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-key-replace-in-production';
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  return jwt.sign({ id, email, tokenId: crypto.randomUUID() }, jwtRefreshSecret, { expiresIn: expiresIn as any });
};

/**
 * HTTP-only cookie options for the refresh token cookie.
 */
export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};
