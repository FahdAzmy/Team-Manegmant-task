import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { ApiError } from '../utils/ApiError';

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw ApiError.unauthorized('Not authenticated');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw ApiError.forbidden('Forbidden: Access denied');
    }

    next();
  };
};
