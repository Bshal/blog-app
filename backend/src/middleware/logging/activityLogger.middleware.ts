import { Request, Response, NextFunction } from 'express';
import { logger } from '../../utils/logger';

interface ActivityLog {
  userId?: string;
  email?: string;
  action: string;
  method: string;
  url: string;
  ip?: string;
  userAgent?: string;
  timestamp: Date;
}

/**
 * Middleware to log user activities
 */
export const activityLogger = (
  action: string
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Log after response is sent
    res.on('finish', () => {
      const log: ActivityLog = {
        userId: req.user?.userId,
        email: req.user?.email,
        action,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip || req.socket.remoteAddress,
        userAgent: req.get('user-agent'),
        timestamp: new Date(),
      };

      logger.info(`Activity: ${JSON.stringify(log)}`);
    });

    next();
  };
};
