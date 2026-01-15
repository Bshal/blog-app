import User, { IUser } from '../../models/User.model';
import { CustomError } from '../../middleware/error-handling/errorHandler.middleware';
import { generateTokenPair, verifyRefreshToken } from '../../utils/jwt';
import { logger } from '../../utils/logger';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: IUser;
  accessToken: string;
  refreshToken: string;
}

/**
 * Register a new user
 */
export const registerUser = async (data: RegisterData): Promise<AuthResponse> => {
  const { name, email, password } = data;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new CustomError('User with this email already exists', 409);
  }

  // Create new user
  const user = await User.create({
    name,
    email,
    password,
    role: 'user',
  });

  // Generate tokens
  const { accessToken, refreshToken } = generateTokenPair(user);

  // Save refresh token to user
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // Exclude password from returned user
  const userResponse = user.toObject();
  delete userResponse.password;

  return {
    user: userResponse as IUser,
    accessToken,
    refreshToken,
  };
};

/**
 * Login user
 */
export const loginUser = async (data: LoginData): Promise<AuthResponse> => {
  const { email, password } = data;

  // Normalize email to lowercase (User model has lowercase: true, but ensure consistency)
  const normalizedEmail = email.toLowerCase().trim();

  // Find user and include password field
  const user = await User.findOne({ email: normalizedEmail }).select('+password');
  if (!user) {
    throw new CustomError('Invalid email or password', 401);
  }

  // Check if user has a password (OAuth users might not have one)
  if (!user.password) {
    throw new CustomError('Please login using your social account', 401);
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    // Log for debugging
    logger.error(`Password validation failed for user: ${user.email}`);
    throw new CustomError('Invalid email or password', 401);
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokenPair(user);

  // Save refresh token to user - use updateOne to avoid triggering pre-save hooks
  await User.updateOne(
    { _id: user._id },
    { $set: { refreshToken } }
  );

  // Exclude password from returned user
  const userResponse = user.toObject();
  delete userResponse.password;

  return {
    user: userResponse as IUser,
    accessToken,
    refreshToken,
  };
};

/**
 * Refresh access token with token rotation
 * Implements refresh token rotation: generates new refresh token and invalidates old one
 */
export const refreshAccessToken = async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
  if (!refreshToken) {
    throw new CustomError('Refresh token is required', 401);
  }

  // Verify refresh token
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new CustomError('Invalid or expired refresh token', 401);
  }

  // Find user and verify refresh token matches
  const user = await User.findById(decoded.userId).select('+refreshToken');
  if (!user || user.refreshToken !== refreshToken) {
    throw new CustomError('Invalid refresh token', 401);
  }

  // Generate new token pair (access + refresh)
  const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(user);

  // Update user with new refresh token (this invalidates the old one)
  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken: newRefreshToken };
};

/**
 * Get current user by ID
 */
export const getCurrentUser = async (userId: string): Promise<IUser> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new CustomError('User not found', 404);
  }

  // Exclude password and refreshToken from response
  const userResponse = user.toObject();
  delete userResponse.password;
  delete userResponse.refreshToken;

  return userResponse as IUser;
};

/**
 * Logout user (invalidate refresh token)
 */
export const logoutUser = async (userId: string): Promise<void> => {
  await User.findByIdAndUpdate(userId, {
    $unset: { refreshToken: 1 },
  });
};
