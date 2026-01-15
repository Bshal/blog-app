import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../middleware/error-handling/errorHandler.middleware';
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getCurrentUser,
} from '../services/auth/auth.service';
import { handleOAuthCallback } from '../services/auth/oauth.service';
import { IUser } from '../models/User.model';

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
export const register = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { user, accessToken, refreshToken } = await registerUser(req.body);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        accessToken,
        refreshToken,
      },
    });
  }
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
export const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { user, accessToken, refreshToken } = await loginUser(req.body);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        accessToken,
        refreshToken,
      },
    });
  }
);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token with token rotation
 * @access  Public
 */
export const refresh = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken } = req.body;
    const { accessToken, refreshToken: newRefreshToken } = await refreshAccessToken(refreshToken);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    });
  }
);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current authenticated user
 * @access  Private
 */
export const getMe = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const user = await getCurrentUser(userId);

    res.status(200).json({
      success: true,
      data: { user },
    });
  }
);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user
 * @access  Private
 */
export const logout = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user?.userId;
    
    if (userId) {
      await logoutUser(userId);
    }

    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  }
);

/**
 * @route   GET /api/v1/auth/google/callback
 * @desc    Google OAuth callback
 * @access  Public
 */
export const googleCallback = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as IUser;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Google authentication failed',
      });
    }

    const { accessToken, refreshToken } = await handleOAuthCallback(user);

    // Redirect to frontend with tokens
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(
      `${frontendUrl}/auth/callback?token=${accessToken}&refreshToken=${refreshToken}`
    );
  }
);

/**
 * @route   GET /api/v1/auth/facebook/callback
 * @desc    Facebook OAuth callback
 * @access  Public
 */
export const facebookCallback = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as IUser;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Facebook authentication failed',
      });
    }

    const { accessToken, refreshToken } = await handleOAuthCallback(user);

    // Redirect to frontend with tokens
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(
      `${frontendUrl}/auth/callback?token=${accessToken}&refreshToken=${refreshToken}`
    );
  }
);
