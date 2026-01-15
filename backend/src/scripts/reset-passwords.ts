/**
 * Script to reset all user passwords to 'password123' with proper hashing
 * This fixes any double-hashing or incorrect hashing issues
 */

import dotenv from 'dotenv'
import mongoose from 'mongoose'
import connectDatabase from '../config/database'
import User from '../models/User.model'
import { logger } from '../utils/logger'
import bcrypt from 'bcryptjs'

// Load environment variables
dotenv.config()

const resetPasswords = async (): Promise<void> => {
	try {
		// Connect to database
		await connectDatabase()
		logger.info('Connected to database')

		// Get all users
		const users = await User.find({}).select('+password')
		logger.info(`Found ${users.length} users`)

		const newPassword = 'password123'
		const hashedPassword = await bcrypt.hash(newPassword, 12)

		let resetCount = 0
		for (const user of users) {
			// Directly set the hashed password (bypassing pre-save hook)
			await User.findByIdAndUpdate(user._id, {
				$set: { password: hashedPassword }
			}, { runValidators: false })
			
			logger.info(`Reset password for user: ${user.email}`)
			resetCount++
		}

		logger.info(`Reset ${resetCount} passwords`)
		console.log(`\n✅ Password reset completed!`)
		console.log(`   - Reset ${resetCount} passwords to 'password123'`)
		console.log(`   - All users can now login with: password123\n`)

		process.exit(0)
	} catch (error) {
		logger.error(`Error resetting passwords: ${error}`)
		console.error('❌ Error resetting passwords:', error)
		process.exit(1)
	}
}

// Run script
if (require.main === module) {
	resetPasswords()
}

export default resetPasswords
