import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../error-handling/errorHandler.middleware';

type Role = 'user' | 'admin';

/**
 * Middleware to authorize based on user roles
 * @param roles - Array of allowed roles
 */
export const authorize = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new CustomError('Authentication required', 401);
    }

    if (!roles.includes(req.user.role as Role)) {
      throw new CustomError(
        `Access denied. Required role: ${roles.join(' or ')}`,
        403
      );
    }

    next();
  };
};
