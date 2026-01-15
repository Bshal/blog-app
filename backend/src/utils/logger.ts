import morgan from 'morgan';
import { Request, Response } from 'express';

// Simple logger utility
class Logger {
  info(message: string): void {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
  }

  error(message: string | Error): void {
    const errorMessage = message instanceof Error ? message.stack : message;
    console.error(`[ERROR] ${new Date().toISOString()} - ${errorMessage}`);
  }

  warn(message: string): void {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`);
  }

  debug(message: string): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`);
    }
  }
}

export const logger = new Logger();

// Morgan HTTP request logger middleware
export const httpLogger = morgan(
  (tokens, req: Request, res: Response) => {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'),
      '-',
      tokens['response-time'](req, res),
      'ms',
    ].join(' ');
  },
  {
    stream: {
      write: (message: string) => {
        logger.info(message.trim());
      },
    },
  }
);
