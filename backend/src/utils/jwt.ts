import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config';
import { IUser } from '../models';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Generate JWT access token
 */
export const generateAccessToken = (user: IUser): string => {
  const payload: TokenPayload & { iat?: number; jti?: string } = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
    jti: `${Date.now()}-${Math.random()}`, // Add unique identifier
  };

  const options: SignOptions = {
    expiresIn: config.jwt.accessExpiresIn,
  } as SignOptions;

  return jwt.sign(payload, config.jwt.accessSecret as string, options);
};

/**
 * Generate JWT refresh token
 */
export const generateRefreshToken = (user: IUser): string => {
  const payload: TokenPayload & { iat?: number; jti?: string } = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
    jti: `${Date.now()}-${Math.random()}`, // Add unique identifier
  };

  const options: SignOptions = {
    expiresIn: config.jwt.refreshExpiresIn,
  } as SignOptions;

  return jwt.sign(payload, config.jwt.refreshSecret as string, options);
};

/**
 * Generate both access and refresh tokens
 */
export const generateTokenPair = (user: IUser): TokenPair => {
  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user),
  };
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, config.jwt.accessSecret) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};
