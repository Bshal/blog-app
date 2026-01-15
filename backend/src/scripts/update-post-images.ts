/**
 * Script to update existing posts with images from public/posts directory
 * Assigns images from cover-1.webp to cover-8.webp to existing posts
 */

import dotenv from 'dotenv'
import connectDatabase from '../config/database'
import Post from '../models/Post.model'
import { logger } from '../utils/logger'

// Load environment variables
dotenv.config()

// Available images in public/posts folder
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

const updatePostImages = async (): Promise<void> => {
	try {
		// Connect to database
		await connectDatabase()
		logger.info('Connected to database')

		// Get all posts (excluding deleted)
		const posts = await Post.find({ isDeleted: false })
		logger.info(`Found ${posts.length} posts`)

		let updatedCount = 0
		for (let i = 0; i < posts.length; i++) {
			const post = posts[i]
			// Cycle through available images
			const imageIndex = i % availableImages.length
			const newImageUrl = availableImages[imageIndex]

			// Only update if the imageUrl is different (e.g., if it's an external URL)
			if (post.imageUrl !== newImageUrl) {
				post.imageUrl = newImageUrl
				await post.save()
				logger.info(`Updated post "${post.title}" with image: ${newImageUrl}`)
				updatedCount++
			} else {
				logger.info(`Post "${post.title}" already has correct image: ${newImageUrl}`)
			}
		}

		logger.info(`Updated ${updatedCount} posts`)
		console.log(`\n✅ Post images update completed!`)
		console.log(`   - Updated ${updatedCount} posts`)
		console.log(`   - Total posts: ${posts.length}`)
		console.log(`\nAll posts now use images from /posts directory.\n`)

		process.exit(0)
	} catch (error) {
		logger.error(`Error updating post images: ${error}`)
		console.error('❌ Error updating post images:', error)
		process.exit(1)
	}
}

// Run script
if (require.main === module) {
	updatePostImages()
}

export default updatePostImages
