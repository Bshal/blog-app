/**
 * Jest global setup file
 * Runs before all tests
 */

import { connectTestDatabase } from './test-setup'

beforeAll(async () => {
	// Set test environment variables
	process.env.NODE_ENV = 'test'
	process.env.JWT_ACCESS_SECRET = 'test-access-secret-key'
	process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key'
	process.env.MONGODB_URI = '' // Will be set by MongoMemoryServer

	// Connect to test database
	await connectTestDatabase()
}, 30000) // 30 second timeout for database connection

afterAll(async () => {
	// Cleanup is handled in individual test files
}, 30000)
