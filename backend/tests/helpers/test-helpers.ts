/**
 * Test helper functions and utilities
 */

import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../../src/config'

/**
 * Create a mock Express request object
 */
export const createMockRequest = (
	overrides: Partial<Request> = {}
): Partial<Request> => {
	return {
		body: {},
		params: {},
		query: {},
		headers: {},
		user: undefined,
		...overrides,
	}
}

/**
 * Create a mock Express response object
 */
export const createMockResponse = (): Partial<Response> => {
	const res: Partial<Response> = {
		status: jest.fn().mockReturnThis(),
		json: jest.fn().mockReturnThis(),
		send: jest.fn().mockReturnThis(),
		cookie: jest.fn().mockReturnThis(),
		clearCookie: jest.fn().mockReturnThis(),
	}
	return res
}

/**
 * Create a mock Express next function
 */
export const createMockNext = (): NextFunction => {
	return jest.fn()
}

/**
 * Generate a JWT token for testing
 */
export const generateTestToken = (
	payload: { userId: string; email: string; role: string },
	secret: string = config.jwt.accessSecret,
	expiresIn: string = '1h'
): string => {
	return jwt.sign(payload, secret, { expiresIn })
}

/**
 * Generate access token for testing
 */
export const generateAccessToken = (payload: {
	userId: string
	email: string
	role: string
}): string => {
	return generateTestToken(payload, config.jwt.accessSecret, '15m')
}

/**
 * Generate refresh token for testing
 */
export const generateRefreshToken = (payload: {
	userId: string
	email: string
	role: string
}): string => {
	return generateTestToken(payload, config.jwt.refreshSecret, '7d')
}

/**
 * Wait for a specified amount of time (useful for async operations)
 */
export const wait = (ms: number): Promise<void> => {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Create a mock user object
 */
export const createMockUser = (overrides: any = {}) => {
	return {
		_id: '507f1f77bcf86cd799439011',
		name: 'Test User',
		email: 'test@example.com',
		password: 'hashedPassword123',
		role: 'user',
		isEmailVerified: false,
		createdAt: new Date(),
		updatedAt: new Date(),
		...overrides,
	}
}

/**
 * Create a mock post object
 */
export const createMockPost = (overrides: any = {}) => {
	return {
		_id: '507f1f77bcf86cd799439012',
		title: 'Test Post',
		slug: 'test-post',
		content: 'This is a test post content',
		author: '507f1f77bcf86cd799439011',
		isDeleted: false,
		createdAt: new Date(),
		updatedAt: new Date(),
		...overrides,
	}
}

/**
 * Create a mock comment object
 */
export const createMockComment = (overrides: any = {}) => {
	return {
		_id: '507f1f77bcf86cd799439013',
		content: 'This is a test comment',
		post: '507f1f77bcf86cd799439012',
		author: '507f1f77bcf86cd799439011',
		isDeleted: false,
		createdAt: new Date(),
		updatedAt: new Date(),
		...overrides,
	}
}
