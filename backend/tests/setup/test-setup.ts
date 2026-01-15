/**
 * Test setup and teardown utilities
 */

import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

let mongoServer: MongoMemoryServer | null = null

/**
 * Connect to in-memory MongoDB instance for testing
 */
export const connectTestDatabase = async (): Promise<void> => {
	if (!mongoServer) {
		mongoServer = await MongoMemoryServer.create()
	}
	const mongoUri = mongoServer.getUri()

	if (mongoose.connection.readyState === 0) {
		await mongoose.connect(mongoUri)
	}
}

/**
 * Disconnect from test database and clean up
 */
export const disconnectTestDatabase = async (): Promise<void> => {
	if (mongoose.connection.readyState !== 0) {
		await mongoose.connection.dropDatabase()
		await mongoose.connection.close()
	}

	if (mongoServer) {
		await mongoServer.stop()
		mongoServer = null
	}
}

/**
 * Clear all collections in test database
 */
export const clearDatabase = async (): Promise<void> => {
	const collections = mongoose.connection.collections

	for (const key in collections) {
		const collection = collections[key]
		await collection.deleteMany({})
	}
}
