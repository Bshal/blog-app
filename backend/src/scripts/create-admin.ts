/**
 * Script to create an admin user
 * Usage: npm run create-admin
 * Or: tsx src/scripts/create-admin.ts
 */

import dotenv from 'dotenv'
import connectDatabase from '../config/database'
import { createAdminUser } from '../utils/createAdmin'
import { logger } from '../utils/logger'

// Load environment variables
dotenv.config()

const createAdmin = async (): Promise<void> => {
	try {
		// Connect to database
		await connectDatabase()
		logger.info('Connected to database')

		// Default admin credentials (can be overridden via environment variables)
		const adminName = process.env.ADMIN_NAME || 'Admin User'
		const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com'
		const adminPassword = process.env.ADMIN_PASSWORD || 'password123'

		console.log('\n📝 Creating admin user...')
		console.log(`   Name: ${adminName}`)
		console.log(`   Email: ${adminEmail}`)
		console.log(`   Password: ${adminPassword}\n`)

		await createAdminUser({
			name: adminName,
			email: adminEmail,
			password: adminPassword,
		})

		logger.info('Admin user created successfully!')
		console.log('\n✅ Admin user created successfully!')
		console.log(`\nYou can now login with:`)
		console.log(`   Email: ${adminEmail}`)
		console.log(`   Password: ${adminPassword}\n`)

		process.exit(0)
	} catch (error) {
		logger.error(`Error creating admin user: ${error}`)
		console.error('❌ Error creating admin user:', error)
		process.exit(1)
	}
}

// Run script
if (require.main === module) {
	createAdmin()
}

export default createAdmin
