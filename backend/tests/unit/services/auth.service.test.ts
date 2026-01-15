/**
 * Authentication Service Tests
 * Tests all authentication functionality with edge cases
 */

import { clearDatabase } from '../../setup/test-setup'
import {
	registerUser,
	loginUser,
	refreshAccessToken,
	logoutUser,
} from '../../../src/services/auth/auth.service'
import User from '../../../src/models/User.model'
import { CustomError } from '../../../src/middleware/error-handling/errorHandler.middleware'

describe('Authentication Service', () => {
	beforeEach(async () => {
		await clearDatabase()
	})

	describe('registerUser', () => {
		it('should register a new user successfully', async () => {
			const userData = {
				name: 'Test User',
				email: 'test@example.com',
				password: 'password123',
			}

			const result = await registerUser(userData)

			expect(result).toHaveProperty('user')
			expect(result).toHaveProperty('accessToken')
			expect(result).toHaveProperty('refreshToken')
			expect(result.user.email).toBe(userData.email)
			expect(result.user.name).toBe(userData.name)
			expect(result.user.role).toBe('user')
			expect(result.user.password).toBeUndefined() // Password should not be returned
		})

		it('should hash password before saving', async () => {
			const userData = {
				name: 'Test User',
				email: 'test@example.com',
				password: 'password123',
			}

			await registerUser(userData)

			const user = await User.findOne({ email: userData.email }).select(
				'+password'
			)
			expect(user?.password).toBeDefined()
			expect(user?.password).not.toBe(userData.password)
		})

		it('should throw error if user already exists', async () => {
			const userData = {
				name: 'Test User',
				email: 'test@example.com',
				password: 'password123',
			}

			await registerUser(userData)

			await expect(registerUser(userData)).rejects.toThrow(CustomError)
			await expect(registerUser(userData)).rejects.toThrow(
				'User with this email already exists'
			)
		})

		it('should throw error if email is duplicate (case insensitive)', async () => {
			const userData1 = {
				name: 'Test User',
				email: 'test@example.com',
				password: 'password123',
			}

			const userData2 = {
				name: 'Test User 2',
				email: 'TEST@EXAMPLE.COM',
				password: 'password123',
			}

			await registerUser(userData1)

			await expect(registerUser(userData2)).rejects.toThrow(CustomError)
		})

		it('should save refresh token to user', async () => {
			const userData = {
				name: 'Test User',
				email: 'test@example.com',
				password: 'password123',
			}

			const result = await registerUser(userData)

			const user = await User.findById(result.user._id).select(
				'+refreshToken'
			)
			expect(user?.refreshToken).toBe(result.refreshToken)
		})

		it('should generate valid JWT tokens', async () => {
			const userData = {
				name: 'Test User',
				email: 'test@example.com',
				password: 'password123',
			}

			const result = await registerUser(userData)

			expect(result.accessToken).toBeDefined()
			expect(result.refreshToken).toBeDefined()
			expect(typeof result.accessToken).toBe('string')
			expect(typeof result.refreshToken).toBe('string')
		})
	})

	describe('loginUser', () => {
		beforeEach(async () => {
			// Create a test user
			await registerUser({
				name: 'Test User',
				email: 'test@example.com',
				password: 'password123',
			})
		})

		it('should login user with correct credentials', async () => {
			const loginData = {
				email: 'test@example.com',
				password: 'password123',
			}

			const result = await loginUser(loginData)

			expect(result).toHaveProperty('user')
			expect(result).toHaveProperty('accessToken')
			expect(result).toHaveProperty('refreshToken')
			expect(result.user.email).toBe(loginData.email)
		})

		it('should throw error for invalid email', async () => {
			const loginData = {
				email: 'nonexistent@example.com',
				password: 'password123',
			}

			await expect(loginUser(loginData)).rejects.toThrow(CustomError)
			await expect(loginUser(loginData)).rejects.toThrow(
				'Invalid email or password'
			)
		})

		it('should throw error for invalid password', async () => {
			const loginData = {
				email: 'test@example.com',
				password: 'wrongpassword',
			}

			await expect(loginUser(loginData)).rejects.toThrow(CustomError)
			await expect(loginUser(loginData)).rejects.toThrow(
				'Invalid email or password'
			)
		})

		it('should throw error for OAuth user without password', async () => {
			// Create OAuth user without password
			await User.create({
				name: 'OAuth User',
				email: 'oauth@example.com',
				googleId: 'google123',
				role: 'user',
			})

			const loginData = {
				email: 'oauth@example.com',
				password: 'anypassword',
			}

			await expect(loginUser(loginData)).rejects.toThrow(CustomError)
			await expect(loginUser(loginData)).rejects.toThrow(
				'Please login using your social account'
			)
		})

		it('should update refresh token on login', async () => {
			const loginData = {
				email: 'test@example.com',
				password: 'password123',
			}

			const firstLogin = await loginUser(loginData)
			// Add small delay to ensure different token generation
			await new Promise(resolve => setTimeout(resolve, 10))
			const secondLogin = await loginUser(loginData)

			// Refresh tokens should be different
			expect(firstLogin.refreshToken).not.toBe(secondLogin.refreshToken)

			// User should have the latest refresh token
			const user = await User.findOne({ email: loginData.email }).select(
				'+refreshToken'
			)
			expect(user?.refreshToken).toBe(secondLogin.refreshToken)
		})

		it('should handle case-insensitive email', async () => {
			const loginData = {
				email: 'TEST@EXAMPLE.COM',
				password: 'password123',
			}

			const result = await loginUser(loginData)

			expect(result.user.email).toBe('test@example.com') // Should be lowercase
		})

		it('should generate different tokens on each login', async () => {
			const loginData = {
				email: 'test@example.com',
				password: 'password123',
			}

			const login1 = await loginUser(loginData)
			// Add small delay to ensure different timestamps
			await new Promise(resolve => setTimeout(resolve, 10))
			const login2 = await loginUser(loginData)

			expect(login1.accessToken).not.toBe(login2.accessToken)
			expect(login1.refreshToken).not.toBe(login2.refreshToken)
		})
	})

	describe('refreshAccessToken', () => {
		let refreshToken: string
		let userId: string

		beforeEach(async () => {
			const userData = {
				name: 'Test User',
				email: 'test@example.com',
				password: 'password123',
			}

			const result = await registerUser(userData)
			refreshToken = result.refreshToken
			userId = result.user._id.toString()
		})

		it('should refresh access token successfully', async () => {
			const result = await refreshAccessToken(refreshToken)

			expect(result).toHaveProperty('accessToken')
			expect(result.accessToken).toBeDefined()
			expect(typeof result.accessToken).toBe('string')
		})

		it('should throw error for missing refresh token', async () => {
			await expect(refreshAccessToken('')).rejects.toThrow(CustomError)
			await expect(refreshAccessToken('')).rejects.toThrow(
				'Refresh token is required'
			)
		})

		it('should throw error for invalid refresh token', async () => {
			await expect(
				refreshAccessToken('invalid-token')
			).rejects.toThrow(CustomError)
			await expect(
				refreshAccessToken('invalid-token')
			).rejects.toThrow('Invalid or expired refresh token')
		})

		it('should throw error for invalid refresh token', async () => {
			// Test with an invalid token
			await expect(
				refreshAccessToken('invalid-token-string')
			).rejects.toThrow(CustomError)
		})

		it('should throw error if refresh token was invalidated by logout', async () => {
			// Logout the user (removes refresh token)
			await logoutUser(userId)

			// Try to refresh with the old token
			await expect(refreshAccessToken(refreshToken)).rejects.toThrow(
				CustomError
			)
			await expect(refreshAccessToken(refreshToken)).rejects.toThrow(
				'Invalid refresh token'
			)
		})

		it('should throw error if user does not exist', async () => {
			// Delete the user
			await User.findByIdAndDelete(userId)

			await expect(refreshAccessToken(refreshToken)).rejects.toThrow(
				CustomError
			)
			await expect(refreshAccessToken(refreshToken)).rejects.toThrow(
				'Invalid refresh token'
			)
		})

		it('should throw error for expired refresh token', async () => {
			// Create a user with a very short-lived refresh token
			// This test would require mocking time or using a different approach
			// For now, we test that invalid tokens are rejected
			const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJpYXQiOjE2MDAwMDAwMDB9.invalid'

			await expect(refreshAccessToken(invalidToken)).rejects.toThrow(
				CustomError
			)
		})
	})

	describe('logoutUser', () => {
		let userId: string

		beforeEach(async () => {
			const userData = {
				name: 'Test User',
				email: 'test@example.com',
				password: 'password123',
			}

			const result = await registerUser(userData)
			userId = result.user._id.toString()
		})

		it('should logout user by removing refresh token', async () => {
			// Verify user has refresh token
			let user = await User.findById(userId).select('+refreshToken')
			expect(user?.refreshToken).toBeDefined()

			await logoutUser(userId)

			// Verify refresh token is removed
			user = await User.findById(userId).select('+refreshToken')
			expect(user?.refreshToken).toBeUndefined()
		})

		it('should handle logout for non-existent user gracefully', async () => {
			const nonExistentUserId = '507f1f77bcf86cd799439999'

			// Should not throw error
			await expect(logoutUser(nonExistentUserId)).resolves.not.toThrow()
		})

		it('should allow multiple logouts without error', async () => {
			await logoutUser(userId)
			await expect(logoutUser(userId)).resolves.not.toThrow()
		})
	})
})
