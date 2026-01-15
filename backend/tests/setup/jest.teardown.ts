/**
 * Jest global teardown file
 * Runs after all tests
 */

import { disconnectTestDatabase } from './test-setup'

export default async (): Promise<void> => {
	await disconnectTestDatabase()
}
