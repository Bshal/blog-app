/**
 * Script to fix password hashing for existing users
 * Re-hashes passwords that might not have been hashed correctly
 */

import dotenv from 'dotenv'
import mongoose from 'mongoose'
import connectDatabase from '../config/database'
import User from '../models/User.model'
import { logger } from '../utils/logger'
import bcrypt from 'bcryptjs'

// Load environment variables
dotenv.config()

const fixPasswords = async (): Promise<void> => {
	try {
		// Connect to database
		await connectDatabase()
		logger.info('Connected to database')

		// Get all users
		const users = await User.find({}).select('+password')
		logger.info(`Found ${users.length} users`)

		let fixedCount = 0
		for (const user of users) {
			if (!user.password) {
				logger.warn(`User ${user.email} has no password, skipping`)
				continue
			}

			// Check if password is already hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
			const isHashed = user.password.startsWith('$2a$') || 
			                  user.password.startsWith('$2b$') || 
			                  user.password.startsWith('$2y$')

			if (!isHashed) {
				// Password is not hashed, hash it now
				logger.info(`Hashing password for user: ${user.email}`)
				const plainPassword = user.password // Store plain password before hashing
				user.password = await bcrypt.hash(plainPassword, 12)
				await user.save({ validateBeforeSave: false })
				fixedCount++
				logger.info(`✓ Password hashed for ${user.email}`)
			} else {
				// Verify the hash works with the expected password
				// For seeded users, password should be 'password123'
				const testPassword = 'password123'
				const isValid = await bcrypt.compare(testPassword, user.password)
				
				if (!isValid) {
					logger.warn(`Password hash for ${user.email} doesn't match expected password 'password123'`)
				} else {
					logger.info(`✓ Password hash verified for ${user.email}`)
				}
			}

			// Also ensure email is lowercase
			if (user.email !== user.email.toLowerCase()) {
				logger.info(`Normalizing email for user: ${user.email}`)
				user.email = user.email.toLowerCase().trim()
				await user.save({ validateBeforeSave: false })
			}
		}

		logger.info(`Fixed ${fixedCount} passwords`)
		console.log(`\n✅ Password fix completed!`)
		console.log(`   - Fixed ${fixedCount} passwords`)
		console.log(`   - Total users checked: ${users.length}\n`)

		process.exit(0)
	} catch (error) {
		logger.error(`Error fixing passwords: ${error}`)
		console.error('❌ Error fixing passwords:', error)
		process.exit(1)
	}
}

// Run script
if (require.main === module) {
	fixPasswords()
}

export default fixPasswords
