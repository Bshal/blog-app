import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../error-handling/errorHandler.middleware';

type ValidationFunction = (data: unknown) => {
  error?: {
    details: Array<{ message: string; path: (string | number)[] }>;
  };
  value?: unknown;
};

export const validate = (validator: ValidationFunction) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = validator(req.body);

    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      throw new CustomError(errorMessages.join(', '), 400);
    }

    // Replace req.body with validated and sanitized value
    req.body = value;
    next();
  };
};
