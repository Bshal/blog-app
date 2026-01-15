import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../../utils/jwt';
import { CustomError } from '../error-handling/errorHandler.middleware';
import User from '../../models/User.model';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * Middleware to authenticate JWT token
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new CustomError('No token provided', 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyAccessToken(token);

    // Optionally verify user still exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new CustomError('User not found', 401);
    }

    // Attach user info to request
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof CustomError) {
      next(error);
    } else {
      next(new CustomError('Invalid or expired token', 401));
    }
  }
};
