import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserService } from '../services/user.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/async.middleware';
import { ApiError } from '../utils/ApiError';
import { generateAccessToken, generateRefreshToken, COOKIE_OPTIONS } from '../utils/tokenHelpers';

// @desc Register user
// @route post /api/auth/register
// @acces public
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

// @desc Login user
// @route post /api/auth/login
// @acces public
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

// @desc Refresh access token
// @route post /api/auth/refresh
// @acces public
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

// @desc Logout user
// @route post /api/auth/logout
// @acces private
export const logout = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw ApiError.unauthorized('Not authenticated');
  }

  await UserService.updateRefreshToken(req.user.id, null);

  // Clear the refresh token cookie
  res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict' });

  res.status(200).json({ message: 'Logout successful' });
});

// @desc Get current user profile
// @route get /api/auth/me
// @acces private
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
