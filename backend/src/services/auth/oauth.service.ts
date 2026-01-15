import { IUser } from '../../models/User.model';
import { generateTokenPair } from '../../utils/jwt';

export interface OAuthResponse {
  user: IUser;
  accessToken: string;
  refreshToken: string;
}

/**
 * Handle OAuth authentication and return tokens
 */
export const handleOAuthCallback = async (user: IUser): Promise<OAuthResponse> => {
  // Generate tokens
  const { accessToken, refreshToken } = generateTokenPair(user);

  // Save refresh token to user
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return {
    user,
    accessToken,
    refreshToken,
  };
};
