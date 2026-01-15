/**
 * Database seed script
 * Populates the database with mock data for development and testing
 */

import dotenv from 'dotenv'
import mongoose from 'mongoose'
import connectDatabase from '../config/database'
import User from '../models/User.model'
import Post from '../models/Post.model'
import { logger } from '../utils/logger'
import { generateSlug } from '../utils/slugGenerator'

// Load environment variables
dotenv.config()

// Mock data based on the UI reference image
const mockUsers = [
	{
		name: 'Admin User',
		email: 'admin@example.com',
		password: 'password123',
		role: 'admin' as const,
		isEmailVerified: true,
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
	},
	{
		name: 'Sarah Johnson',
		email: 'sarah.johnson@example.com',
		password: 'password123',
		role: 'user' as const,
		isEmailVerified: true,
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
	},
	{
		name: 'Michael Chen',
		email: 'michael.chen@example.com',
		password: 'password123',
		role: 'user' as const,
		isEmailVerified: true,
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael',
	},
	{
		name: 'Emily Rodriguez',
		email: 'emily.rodriguez@example.com',
		password: 'password123',
		role: 'user' as const,
		isEmailVerified: true,
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily',
	},
	{
		name: 'David Kim',
		email: 'david.kim@example.com',
		password: 'password123',
		role: 'user' as const,
		isEmailVerified: true,
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
	},
	{
		name: 'Jessica Williams',
		email: 'jessica.williams@example.com',
		password: 'password123',
		role: 'user' as const,
		isEmailVerified: true,
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jessica',
	},
	{
		name: 'James Anderson',
		email: 'james.anderson@example.com',
		password: 'password123',
		role: 'user' as const,
		isEmailVerified: true,
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=james',
	},
]

// Random abstract images from Unsplash
// Use images from public/posts folder
const availableImages = [
	'cover-1.webp',
	'cover-2.webp',
	'cover-3.webp',
	'cover-4.webp',
	'cover-5.webp',
	'cover-6.webp',
	'cover-7.webp',
	'cover-8.webp',
]

const mockPosts = [
	{
		title: 'The Future of Renewable Energy: Innovations and Challenges Ahead',
		content:
			'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.',
		imageUrl: availableImages[0],
		isDeleted: false,
		createdAt: new Date('2026-01-13'),
	},
	{
		title: 'Exploring the Impact of Artificial Intelligence on Modern Healthcare',
		content:
			'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.',
		imageUrl: availableImages[1],
		isDeleted: false,
		createdAt: new Date('2026-01-12'),
	},
	{
		title: 'Climate Change and Its Effects on Global Food Security',
		content:
			'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.',
		imageUrl: availableImages[2],
		isDeleted: false,
		createdAt: new Date('2026-01-11'),
	},
	{
		title: 'The Rise of Remote Work: Benefits, Challenges, and Future Trends',
		content:
			'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.',
		imageUrl: availableImages[3],
		isDeleted: false,
		createdAt: new Date('2026-01-10'),
	},
	{
		title: 'Understanding Blockchain Technology: Beyond Cryptocurrency',
		content:
			'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.',
		imageUrl: availableImages[4],
		isDeleted: false,
		createdAt: new Date('2026-01-09'),
	},
	{
		title: 'Mental Health in the Digital Age: Navigating Social Media and Well-being',
		content:
			'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.',
		imageUrl: availableImages[5],
		isDeleted: false,
		createdAt: new Date('2026-01-08'),
	},
	{
		title: 'Sustainable Fashion: How the Industry is Embracing Eco-Friendly Practices',
		content:
			'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.',
		imageUrl: availableImages[6],
		isDeleted: true, // Draft post
		createdAt: new Date('2026-01-07'),
	},
	{
		title: 'The Evolution of Electric Vehicles: From Niche to Mainstream',
		content:
			'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.',
		imageUrl: availableImages[7],
		isDeleted: false,
		createdAt: new Date('2026-01-06'),
	},
	{
		title: 'Space Exploration: The Next Frontier for Humanity',
		content:
			'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.',
		imageUrl: availableImages[0], // Cycle back to first image
		isDeleted: false,
		createdAt: new Date('2026-01-05'),
	},
	{
		title: 'The Power of Data Analytics in Business Decision Making',
		content:
			'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.',
		imageUrl: availableImages[1], // Cycle back to second image
		isDeleted: false,
		createdAt: new Date('2026-01-04'),
	},
]

const seedDatabase = async (): Promise<void> => {
	try {
		// Connect to database
		await connectDatabase()
		logger.info('Connected to database')

		// Clear existing data (optional - comment out if you want to keep existing data)
		await Post.deleteMany({})
		await User.deleteMany({})
		logger.info('Cleared existing data')

		// Create users one by one to trigger pre-save hooks (password hashing)
		// Use new User() + save() instead of User.create() to ensure pre-save hooks are triggered
		const users = []
		for (const userData of mockUsers) {
			const user = new User(userData)
			await user.save()
			// Verify password was hashed
			const userWithPassword = await User.findById(user._id).select('+password')
			const isHashed = userWithPassword?.password?.startsWith('$2')
			if (!isHashed) {
				logger.error(`WARNING: Password for ${user.email} was NOT hashed!`)
			}
			users.push(user)
		}
		logger.info(`Created ${users.length} users`)

		// Create posts with authors and slugs
		// Note: We need to create posts one by one to trigger pre-save hooks for slug generation
		const posts = []
		for (let i = 0; i < mockPosts.length; i++) {
			const postData = {
				...mockPosts[i],
				author: users[i % users.length]._id,
				slug: generateSlug(mockPosts[i].title),
			}
			
			// Ensure slug is unique
			let slug = postData.slug
			let counter = 1
			while (await Post.findOne({ slug })) {
				slug = `${postData.slug}-${counter}`
				counter++
			}
			postData.slug = slug
			
			const post = new Post(postData)
			await post.save()
			posts.push(post)
		}
		logger.info(`Created ${posts.length} posts`)

		logger.info('Database seeded successfully!')
		console.log('\n✅ Database seeded successfully!')
		console.log(`   - Created ${users.length} users`)
		console.log(`   - Created ${posts.length} posts`)
		console.log('\n📋 Login Credentials:')
		console.log('   Admin User:')
		console.log('     Email: admin@example.com')
		console.log('     Password: password123')
		console.log('\n   Regular Users (all use password: password123):')
		users.filter(u => u.role === 'user').slice(0, 3).forEach(u => {
			console.log(`     - ${u.email}`)
		})
		console.log('\nYou can now start the server and view the posts.\n')

		process.exit(0)
	} catch (error) {
		logger.error(`Error seeding database: ${error}`)
		console.error('❌ Error seeding database:', error)
		process.exit(1)
	}
}

// Run seed script
if (require.main === module) {
	seedDatabase()
}

export default seedDatabase
