/**
 * Diagnostic script to check user data in database
 * Helps identify why only Michael Chen can log in
 */

import dotenv from 'dotenv'
import mongoose from 'mongoose'
import connectDatabase from '../config/database'
import User from '../models/User.model'
import { logger } from '../utils/logger'
import bcrypt from 'bcryptjs'

// Load environment variables
dotenv.config()

const diagnoseUsers = async (): Promise<void> => {
	try {
		// Connect to database
		await connectDatabase()
		logger.info('Connected to database')

		// Get all users with passwords
		const users = await User.find({}).select('+password')
		logger.info(`Found ${users.length} users\n`)

		const testPassword = 'password123'

		console.log('='.repeat(80))
		console.log('USER DIAGNOSTIC REPORT')
		console.log('='.repeat(80))
		console.log()

		for (const user of users) {
			console.log(`User: ${user.name}`)
			console.log(`  Email: "${user.email}"`)
			console.log(`  Email length: ${user.email.length}`)
			console.log(`  Email lowercase: ${user.email === user.email.toLowerCase()}`)
			console.log(`  Has password: ${!!user.password}`)
			
			if (user.password) {
				const passwordLength = user.password.length
				const isHashed = user.password.startsWith('$2a$') || 
				                 user.password.startsWith('$2b$') || 
				                 user.password.startsWith('$2y$')
				
				console.log(`  Password length: ${passwordLength}`)
				console.log(`  Password is hashed: ${isHashed}`)
				console.log(`  Password starts with: ${user.password.substring(0, 10)}...`)
				
				if (isHashed) {
					// Test password comparison
					try {
						const isValid = await bcrypt.compare(testPassword, user.password)
						console.log(`  Password comparison test: ${isValid ? '✓ PASS' : '✗ FAIL'}`)
						
						// Also test with normalized email lookup
						const normalizedEmail = user.email.toLowerCase().trim()
						const foundUser = await User.findOne({ email: normalizedEmail }).select('+password')
						console.log(`  Email lookup test: ${foundUser ? '✓ FOUND' : '✗ NOT FOUND'}`)
						if (foundUser && foundUser._id.toString() !== user._id.toString()) {
							console.log(`  ⚠ WARNING: Email lookup found different user!`)
						}
					} catch (error) {
						console.log(`  ✗ Password comparison error: ${error}`)
					}
				} else {
					console.log(`  ⚠ WARNING: Password is NOT hashed!`)
					console.log(`  Plain password matches: ${user.password === testPassword}`)
				}
			} else {
				console.log(`  ⚠ WARNING: User has no password!`)
			}
			
			console.log()
		}

		console.log('='.repeat(80))
		console.log('TESTING LOGIN QUERIES')
		console.log('='.repeat(80))
		console.log()

		const testEmails = [
			'sarah.johnson@example.com',
			'michael.chen@example.com',
			'emily.rodriguez@example.com',
			'david.kim@example.com',
			'jessica.williams@example.com',
			'james.anderson@example.com',
		]

		for (const testEmail of testEmails) {
			const normalized = testEmail.toLowerCase().trim()
			const user = await User.findOne({ email: normalized }).select('+password')
			
			if (user) {
				console.log(`✓ Found user for "${testEmail}" (normalized: "${normalized}")`)
				console.log(`  Name: ${user.name}`)
				console.log(`  Stored email: "${user.email}"`)
				console.log(`  Emails match: ${user.email === normalized}`)
				
				if (user.password) {
					const isHashed = user.password.startsWith('$2a$') || 
					                 user.password.startsWith('$2b$') || 
					                 user.password.startsWith('$2y$')
					
					if (isHashed) {
						const isValid = await bcrypt.compare(testPassword, user.password)
						console.log(`  Password valid: ${isValid ? '✓ YES' : '✗ NO'}`)
					} else {
						console.log(`  ⚠ Password not hashed!`)
					}
				} else {
					console.log(`  ⚠ No password!`)
				}
			} else {
				console.log(`✗ NOT FOUND: "${testEmail}" (normalized: "${normalized}")`)
			}
			console.log()
		}

		process.exit(0)
	} catch (error) {
		logger.error(`Error diagnosing users: ${error}`)
		console.error('❌ Error diagnosing users:', error)
		process.exit(1)
	}
}

// Run script
if (require.main === module) {
	diagnoseUsers()
}

export default diagnoseUsers
