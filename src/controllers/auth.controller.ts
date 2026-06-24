import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { UserService } from '../services/user.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/async.middleware';
import { ApiError } from '../utils/ApiError';

// ─── Token Generators ─────────────────────────────────────────────────────────

const generateAccessToken = (id: string, email: string, role: string): string => {
  const jwtSecret = process.env.JWT_SECRET || 'super-secret-jwt-key-replace-in-production';
  const expiresIn = process.env.JWT_EXPIRES_IN || '15m';
  return jwt.sign({ id, email, role }, jwtSecret, { expiresIn: expiresIn as any });
};

const generateRefreshToken = (id: string, email: string): string => {
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-key-replace-in-production';
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  return jwt.sign({ id, email, tokenId: crypto.randomUUID() }, jwtRefreshSecret, { expiresIn: expiresIn as any });
};

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

// ─── Controllers ─────────────────────────────────────────────────────────────

export const register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    throw ApiError.badRequest('Name, email, and password are required');
  }

  const existingUser = await UserService.getUserByEmail(email);
  if (existingUser) {
    throw ApiError.badRequest('Email is already registered');
  }

  const newUser = await UserService.createUser({
    name,
    email,
    password,
    role: role || 'member',
  });

  const accessToken = generateAccessToken(newUser.id, newUser.email, newUser.role);
  const refreshToken = generateRefreshToken(newUser.id, newUser.email);

  await UserService.updateRefreshToken(newUser.id, refreshToken);

  // Set refresh token in HTTP-only cookie
  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

  res.status(201).json({
    message: 'User registered successfully',
    accessToken,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    },
  });
});

export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw ApiError.badRequest('Email and password are required');
  }

  const user = await UserService.getUserByEmail(email);
  if (!user) {
    throw ApiError.unauthorized('Invalid credentials');
  }

  const isPasswordValid = await user.validatePassword(password);
  if (!isPasswordValid) {
    throw ApiError.unauthorized('Invalid credentials');
  }

  const accessToken = generateAccessToken(user.id, user.email, user.role);
  const refreshToken = generateRefreshToken(user.id, user.email);

  await UserService.updateRefreshToken(user.id, refreshToken);

  // Set refresh token in HTTP-only cookie
  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

  res.status(200).json({
    message: 'Login successful',
    accessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

export const refresh = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  // Read refresh token from HTTP-only cookie (not request body)
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    throw ApiError.unauthorized('Refresh token not found');
  }

  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-key-replace-in-production';

  let decoded: any;
  try {
    decoded = jwt.verify(refreshToken, jwtRefreshSecret);
  } catch (err) {
    throw ApiError.forbidden('Invalid or expired refresh token');
  }

  const user = await UserService.getUserById(decoded.id);
  if (!user || user.refreshToken !== refreshToken) {
    throw ApiError.forbidden('Invalid or expired refresh token');
  }

  // Token Rotation: generate a brand new pair
  const newAccessToken = generateAccessToken(user.id, user.email, user.role);
  const newRefreshToken = generateRefreshToken(user.id, user.email);

  await UserService.updateRefreshToken(user.id, newRefreshToken);

  // Rotate the cookie as well
  res.cookie('refreshToken', newRefreshToken, COOKIE_OPTIONS);

  res.status(200).json({ accessToken: newAccessToken });
});

export const logout = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw ApiError.unauthorized('Not authenticated');
  }

  await UserService.updateRefreshToken(req.user.id, null);

  // Clear the refresh token cookie
  res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict' });

  res.status(200).json({ message: 'Logout successful' });
});

export const getMe = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw ApiError.unauthorized('Not authenticated');
  }

  res.status(200).json({
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      createdAt: req.user.createdAt,
      updatedAt: req.user.updatedAt,
    },
  });
});
