/**
 * Comprehensive fix script to ensure all users can log in
 * - Normalizes all emails to lowercase
 * - Ensures all passwords are properly hashed (not double-hashed)
 * - Tests password comparison for each user
 */

import dotenv from 'dotenv'
import mongoose from 'mongoose'
import connectDatabase from '../config/database'
import User from '../models/User.model'
import { logger } from '../utils/logger'
import bcrypt from 'bcryptjs'

// Load environment variables
dotenv.config()

const fixAllUsers = async (): Promise<void> => {
	try {
		// Connect to database
		await connectDatabase()
		logger.info('Connected to database')

		// Get all users with passwords
		const users = await User.find({}).select('+password')
		logger.info(`Found ${users.length} users`)

		const correctPassword = 'password123'
		const correctHash = await bcrypt.hash(correctPassword, 12)

		let fixedCount = 0
		let errorCount = 0

		for (const user of users) {
			try {
				let needsUpdate = false
				const updates: any = {}

				// 1. Normalize email to lowercase
				const normalizedEmail = user.email.toLowerCase().trim()
				if (user.email !== normalizedEmail) {
					updates.email = normalizedEmail
					needsUpdate = true
					logger.info(`Normalizing email for ${user.name}: "${user.email}" -> "${normalizedEmail}"`)
				}

				// 2. Check and fix password
				if (!user.password) {
					logger.warn(`User ${user.email} has no password, setting to 'password123'`)
					updates.password = correctHash
					needsUpdate = true
				} else {
					const isHashed = user.password.startsWith('$2a$') || 
					                 user.password.startsWith('$2b$') || 
					                 user.password.startsWith('$2y$')

					if (!isHashed) {
						// Password is plain text, hash it
						logger.info(`Hashing plain text password for ${user.email}`)
						updates.password = await bcrypt.hash(user.password, 12)
						needsUpdate = true
					} else {
						// Password is hashed, test if it works
						const isValid = await bcrypt.compare(correctPassword, user.password)
						if (!isValid) {
							// Hash doesn't match, reset it
							logger.warn(`Password hash for ${user.email} doesn't match 'password123', resetting`)
							updates.password = correctHash
							needsUpdate = true
						} else {
							logger.info(`✓ Password for ${user.email} is correct`)
						}
					}
				}

				// 3. Update user if needed
				if (needsUpdate) {
					// Use updateOne to bypass pre-save hooks and avoid double-hashing
					await User.updateOne(
						{ _id: user._id },
						{ $set: updates }
					)
					fixedCount++
					logger.info(`✓ Fixed user: ${user.email}`)
				} else {
					logger.info(`✓ User ${user.email} is already correct`)
				}

				// 4. Verify the fix worked
				const updatedUser = await User.findById(user._id).select('+password')
				if (updatedUser) {
					const finalTest = await bcrypt.compare(correctPassword, updatedUser.password || '')
					if (!finalTest) {
						logger.error(`✗ Verification failed for ${updatedUser.email} - password still incorrect!`)
						errorCount++
					}
				}

			} catch (error) {
				logger.error(`Error fixing user ${user.email}: ${error}`)
				errorCount++
			}
		}

		logger.info(`\nFix completed!`)
		console.log(`\n✅ User fix completed!`)
		console.log(`   - Fixed ${fixedCount} users`)
		console.log(`   - Errors: ${errorCount}`)
		console.log(`   - Total users: ${users.length}`)
		console.log(`\nAll users should now be able to login with: password123\n`)

		process.exit(0)
	} catch (error) {
		logger.error(`Error fixing users: ${error}`)
		console.error('❌ Error fixing users:', error)
		process.exit(1)
	}
}

// Run script
if (require.main === module) {
	fixAllUsers()
}

export default fixAllUsers
