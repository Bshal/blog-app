import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { config } from './index';
import User from '../models/User.model';
import { generateTokenPair } from '../utils/jwt';

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
if (config.google.clientId && config.google.clientSecret) {
  passport.use(
    'google',
    new GoogleStrategy(
      {
        clientID: config.google.clientId,
        clientSecret: config.google.clientSecret,
        callbackURL: config.google.callbackUrl,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user exists with this Google ID
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            // User exists, return user
            return done(null, user);
          }

          // Check if user exists with this email
          user = await User.findOne({ email: profile.emails?.[0]?.value });

          if (user) {
            // User exists but doesn't have Google ID, link it
            user.googleId = profile.id;
            if (profile.photos?.[0]?.value) {
              user.avatar = profile.photos[0].value;
            }
            await user.save();
            return done(null, user);
          }

          // Create new user
          user = await User.create({
            name: profile.displayName || profile.name?.givenName || 'User',
            email: profile.emails?.[0]?.value || '',
            googleId: profile.id,
            avatar: profile.photos?.[0]?.value || '',
            isEmailVerified: true, // Google emails are verified
            role: 'user',
          });

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
}

// Facebook OAuth Strategy
if (config.facebook.appId && config.facebook.appSecret) {
  passport.use(
    'facebook',
    new FacebookStrategy(
      {
        clientID: config.facebook.appId,
        clientSecret: config.facebook.appSecret,
        callbackURL: config.facebook.callbackUrl,
        profileFields: ['id', 'displayName', 'email', 'picture.type(large)'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user exists with this Facebook ID
          let user = await User.findOne({ facebookId: profile.id });

          if (user) {
            // User exists, return user
            return done(null, user);
          }

          // Check if user exists with this email
          const email = profile.emails?.[0]?.value;
          if (email) {
            user = await User.findOne({ email });

            if (user) {
              // User exists but doesn't have Facebook ID, link it
              user.facebookId = profile.id;
              if (profile.photos?.[0]?.value) {
                user.avatar = profile.photos[0].value;
              }
              await user.save();
              return done(null, user);
            }
          }

          // Create new user
          user = await User.create({
            name: profile.displayName || 'User',
            email: email || `${profile.id}@facebook.com`,
            facebookId: profile.id,
            avatar: profile.photos?.[0]?.value || '',
            isEmailVerified: !!email, // Only verified if email exists
            role: 'user',
          });

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
}

export default passport;
