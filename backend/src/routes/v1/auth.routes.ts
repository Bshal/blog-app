import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import passport from 'passport'
import { config } from '../../config'
import {
	register,
	login,
	refresh,
	getMe,
	logout,
	googleCallback,
	facebookCallback,
} from '../../controllers/auth.controller'
import { validate } from '../../middleware/validation/validate.middleware'
import { validateRegister, validateLogin } from '../../validators/auth'
import { authenticate } from '../../middleware/auth/authenticate.middleware'
import { activityLogger } from '../../middleware/logging/activityLogger.middleware'

const router = Router()

// Rate limiting for auth endpoints
const authRateLimiter = rateLimit({
	windowMs: config.rateLimit.windowMs,
	max: config.rateLimit.maxRequests,
	message: 'Too many requests from this IP, please try again later.',
	standardHeaders: true,
	legacyHeaders: false,
})

// Apply rate limiting to all auth routes
router.use(authRateLimiter)

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
	'/register',
	validate(validateRegister),
	activityLogger('user_registration'),
	register
)

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
	'/login',
	validate(validateLogin),
	activityLogger('user_login'),
	login
)

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', refresh)

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current authenticated user
 * @access  Private
 */
router.get('/me', authenticate, getMe)

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', authenticate, activityLogger('user_logout'), logout)

/**
 * @route   GET /api/v1/auth/google
 * @desc    Initiate Google OAuth login
 * @access  Public
 */
router.get('/google', (req, res, next) => {
	if (!config.google.clientId || !config.google.clientSecret) {
		return res.status(503).json({
			success: false,
			message:
				'Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in environment variables.',
		})
	}
	passport.authenticate('google', {
		scope: ['profile', 'email'],
	})(req, res, next)
})

/**
 * @route   GET /api/v1/auth/google/callback
 * @desc    Google OAuth callback
 * @access  Public
 */
router.get(
	'/google/callback',
	(req, res, next) => {
		if (!config.google.clientId || !config.google.clientSecret) {
			return res.status(503).json({
				success: false,
				message: 'Google OAuth is not configured.',
			})
		}
		passport.authenticate('google', { session: false })(req, res, (err) => {
			if (err) {
				return res.status(401).json({
					success: false,
					message: 'Google authentication failed',
					error: err.message,
				})
			}
			next()
		})
	},
	activityLogger('google_oauth_login'),
	googleCallback
)

/**
 * @route   GET /api/v1/auth/facebook
 * @desc    Initiate Facebook OAuth login
 * @access  Public
 */
router.get('/facebook', (req, res, next) => {
	if (!config.facebook.appId || !config.facebook.appSecret) {
		return res.status(503).json({
			success: false,
			message:
				'Facebook OAuth is not configured. Please set FACEBOOK_APP_ID and FACEBOOK_APP_SECRET in environment variables.',
		})
	}
	passport.authenticate('facebook', {
		scope: ['email'],
	})(req, res, next)
})

/**
 * @route   GET /api/v1/auth/facebook/callback
 * @desc    Facebook OAuth callback
 * @access  Public
 */
router.get(
	'/facebook/callback',
	(req, res, next) => {
		if (!config.facebook.appId || !config.facebook.appSecret) {
			return res.status(503).json({
				success: false,
				message: 'Facebook OAuth is not configured.',
			})
		}
		passport.authenticate('facebook', { session: false })(req, res, (err) => {
			if (err) {
				return res.status(401).json({
					success: false,
					message: 'Facebook authentication failed',
					error: err.message,
				})
			}
			next()
		})
	},
	activityLogger('facebook_oauth_login'),
	facebookCallback
)

export default router
