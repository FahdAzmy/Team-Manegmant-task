import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { UserService } from '../services/user.service';
import { asyncHandler } from './async.middleware';
import { ApiError } from '../utils/ApiError';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export const authenticateJWT = asyncHandler(async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Authorization token missing or malformed');
  }

  const token = authHeader.split(' ')[1];

  try {
    const jwtSecret = process.env.JWT_SECRET || 'super-secret-jwt-key-replace-in-production';
    const decoded = jwt.verify(token, jwtSecret) as { id: string; email: string };

    const user = await UserService.getUserById(decoded.id);
    if (!user) {
      throw ApiError.unauthorized('User not found or authorization revoked');
    }

    req.user = user;
    next();
  } catch (error) {
    throw ApiError.forbidden('Invalid or expired token');
  }
});
