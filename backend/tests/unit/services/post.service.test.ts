/**
 * Post Service Tests
 * Tests all post management functionality with edge cases
 */

import { clearDatabase } from '../../setup/test-setup'
import {
	createPost,
	getAllPosts,
	getPostByIdOrSlug,
	updatePost,
	deletePost,
	getPostsByAuthor,
} from '../../../src/services/post/post.service'
import Post from '../../../src/models/Post.model'
import User from '../../../src/models/User.model'
import { CustomError } from '../../../src/middleware/error-handling/errorHandler.middleware'
import mongoose from 'mongoose'

describe('Post Service', () => {
	let testUser: any
	let testAdmin: any

	beforeEach(async () => {
		await clearDatabase()

		// Create test users
		testUser = await User.create({
			name: 'Test User',
			email: 'test@example.com',
			password: 'password123',
			role: 'user',
		})

		testAdmin = await User.create({
			name: 'Admin User',
			email: 'admin@example.com',
			password: 'password123',
			role: 'admin',
		})
	})

	describe('createPost', () => {
		it('should create a new post successfully', async () => {
			const postData = {
				title: 'Test Post Title',
				content: 'This is the content of the test post',
				authorId: testUser._id.toString(),
			}

			const post = await createPost(postData)

			expect(post).toHaveProperty('_id')
			expect(post.title).toBe(postData.title)
			expect(post.content).toBe(postData.content)
			expect(post.author._id.toString()).toBe(testUser._id.toString())
			expect(post.isDeleted).toBe(false)
			expect(post.slug).toBeDefined()
		})

		it('should generate a unique slug from title', async () => {
			const postData = {
				title: 'Test Post Title',
				content: 'Content here',
				authorId: testUser._id.toString(),
			}

			const post = await createPost(postData)

			expect(post.slug).toBeDefined()
			expect(post.slug).toContain('test-post-title')
			expect(typeof post.slug).toBe('string')
		})

		it('should handle special characters in title for slug', async () => {
			const postData = {
				title: 'Test Post! @#$% Title',
				content: 'Content here',
				authorId: testUser._id.toString(),
			}

			const post = await createPost(postData)

			expect(post.slug).toBeDefined()
			expect(post.slug).not.toContain('!')
			expect(post.slug).not.toContain('@')
		})

		it('should populate author information', async () => {
			const postData = {
				title: 'Test Post',
				content: 'Content here',
				authorId: testUser._id.toString(),
			}

			const post = await createPost(postData)

			expect(post.author).toBeDefined()
			expect((post.author as any).name).toBe(testUser.name)
			expect((post.author as any).email).toBe(testUser.email)
		})

		it('should handle very long title', async () => {
			const longTitle = 'A'.repeat(200)
			const postData = {
				title: longTitle,
				content: 'Content here',
				authorId: testUser._id.toString(),
			}

			const post = await createPost(postData)

			expect(post.title).toBe(longTitle)
			expect(post.slug).toBeDefined()
		})

		it('should handle very long content', async () => {
			const longContent = 'A'.repeat(10000)
			const postData = {
				title: 'Test Post',
				content: longContent,
				authorId: testUser._id.toString(),
			}

			const post = await createPost(postData)

			expect(post.content).toBe(longContent)
		})

		it('should handle invalid author ID gracefully', async () => {
			const postData = {
				title: 'Test Post',
				content: 'Content here',
				authorId: '507f1f77bcf86cd799439999', // Non-existent user ID
			}

			// Should still create post but author won't be populated
			const post = await createPost(postData)
			expect(post).toBeDefined()
			expect(post.author).toBeDefined()
		})

		it('should regenerate slug when title is updated', async () => {
			const postData = {
				title: 'Original Title',
				content: 'Content here',
				authorId: testUser._id.toString(),
			}

			const post = await createPost(postData)
			const originalSlug = post.slug

			const updatedPost = await updatePost(
				post._id.toString(),
				{ title: 'Updated Title' },
				testUser._id.toString(),
				false
			)

			expect(updatedPost.slug).not.toBe(originalSlug)
			expect(updatedPost.slug).toContain('updated-title')
		})

		it('should handle duplicate slugs by appending timestamp', async () => {
			const postData1 = {
				title: 'Test Post',
				content: 'Content here',
				authorId: testUser._id.toString(),
			}

			const post1 = await createPost(postData1)
			const slug1 = post1.slug

			// Create another post with same title (should get unique slug)
			const post2 = await createPost(postData1)
			const slug2 = post2.slug

			expect(slug1).not.toBe(slug2)
			expect(slug2).toContain(slug1.split('-')[0]) // Should start with same base
		})
	})

	describe('getAllPosts', () => {
		beforeEach(async () => {
			// Create multiple posts
			for (let i = 1; i <= 15; i++) {
				await createPost({
					title: `Post ${i}`,
					content: `This is the content for post number ${i} with enough characters`,
					authorId: testUser._id.toString(),
				})
			}
		})

		it('should get all posts with default pagination', async () => {
			const result = await getAllPosts()

			expect(result).toHaveProperty('posts')
			expect(result).toHaveProperty('pagination')
			expect(result.posts.length).toBe(10) // Default limit
			expect(result.pagination.page).toBe(1)
			expect(result.pagination.limit).toBe(10)
			expect(result.pagination.total).toBe(15)
		})

		it('should exclude deleted posts', async () => {
			// Delete some posts
			const posts = await Post.find({})
			await (posts[0] as any).softDelete()
			await (posts[1] as any).softDelete()

			const result = await getAllPosts()

			expect(result.pagination.total).toBe(13) // 15 - 2 deleted
			result.posts.forEach((post) => {
				expect(post.isDeleted).toBe(false)
			})
		})

		it('should handle pagination correctly', async () => {
			const result = await getAllPosts({ page: 2, limit: 5 })

			expect(result.posts.length).toBe(5)
			expect(result.pagination.page).toBe(2)
			expect(result.pagination.limit).toBe(5)
			expect(result.pagination.totalPages).toBe(3)
			expect(result.pagination.hasNextPage).toBe(true)
			expect(result.pagination.hasPrevPage).toBe(true)
		})

		it('should handle empty results', async () => {
			await clearDatabase()

			const result = await getAllPosts()

			expect(result.posts.length).toBe(0)
			expect(result.pagination.total).toBe(0)
			expect(result.pagination.totalPages).toBe(0)
			expect(result.pagination.hasNextPage).toBe(false)
			expect(result.pagination.hasPrevPage).toBe(false)
		})

		it('should sort posts by createdAt descending by default', async () => {
			const result = await getAllPosts()

			for (let i = 1; i < result.posts.length; i++) {
				const prevDate = new Date(result.posts[i - 1].createdAt)
				const currDate = new Date(result.posts[i].createdAt)
				expect(prevDate.getTime()).toBeGreaterThanOrEqual(
					currDate.getTime()
				)
			}
		})

		it('should sort posts ascending when specified', async () => {
			const result = await getAllPosts({ sort: 'createdAt', order: 'asc' })

			for (let i = 1; i < result.posts.length; i++) {
				const prevDate = new Date(result.posts[i - 1].createdAt)
				const currDate = new Date(result.posts[i].createdAt)
				expect(prevDate.getTime()).toBeLessThanOrEqual(currDate.getTime())
			}
		})

		it('should handle invalid page number', async () => {
			const result = await getAllPosts({ page: -1, limit: 10 })

			// Should default to page 1
			expect(result.pagination.page).toBe(1)
		})

		it('should handle page 0', async () => {
			const result = await getAllPosts({ page: 0, limit: 10 })

			// Should default to page 1
			expect(result.pagination.page).toBe(1)
		})

		it('should handle very large page number', async () => {
			const result = await getAllPosts({ page: 999999, limit: 10 })

			// Should return empty results but valid pagination
			expect(result.posts.length).toBe(0)
			expect(result.pagination.page).toBe(999999)
		})

		it('should handle invalid limit', async () => {
			const result = await getAllPosts({ page: 1, limit: -5 })

			// Should use default limit
			expect(result.pagination.limit).toBeGreaterThan(0)
		})

		it('should handle limit 0', async () => {
			const result = await getAllPosts({ page: 1, limit: 0 })

			// Should use default limit
			expect(result.pagination.limit).toBeGreaterThan(0)
		})

		it('should handle very large limit', async () => {
			const result = await getAllPosts({ page: 1, limit: 999999 })

			// Should return all posts up to the limit
			expect(result.posts.length).toBeLessThanOrEqual(15)
		})

		it('should populate author information', async () => {
			const result = await getAllPosts()

			result.posts.forEach((post) => {
				expect(post.author).toBeDefined()
				expect((post.author as any).name).toBeDefined()
				expect((post.author as any).email).toBeDefined()
			})
		})
	})

	describe('getPostByIdOrSlug', () => {
		let testPost: any

		beforeEach(async () => {
			testPost = await createPost({
				title: 'Test Post',
				content: 'Content here',
				authorId: testUser._id.toString(),
			})
		})

		it('should get post by ID', async () => {
			const post = await getPostByIdOrSlug(testPost._id.toString())

			expect(post._id.toString()).toBe(testPost._id.toString())
			expect(post.title).toBe(testPost.title)
		})

		it('should get post by slug', async () => {
			const post = await getPostByIdOrSlug(testPost.slug)

			expect(post._id.toString()).toBe(testPost._id.toString())
			expect(post.slug).toBe(testPost.slug)
		})

		it('should throw error for non-existent post ID', async () => {
			const nonExistentId = new mongoose.Types.ObjectId().toString()

			await expect(getPostByIdOrSlug(nonExistentId)).rejects.toThrow(
				CustomError
			)
			await expect(getPostByIdOrSlug(nonExistentId)).rejects.toThrow(
				'Post not found'
			)
		})

		it('should throw error for non-existent slug', async () => {
			await expect(
				getPostByIdOrSlug('non-existent-slug')
			).rejects.toThrow(CustomError)
		})

		it('should throw error for deleted post', async () => {
			await (testPost as any).softDelete()

			await expect(
				getPostByIdOrSlug(testPost._id.toString())
			).rejects.toThrow(CustomError)
		})

		it('should populate author information', async () => {
			const post = await getPostByIdOrSlug(testPost._id.toString())

			expect(post.author).toBeDefined()
			expect((post.author as any).name).toBe(testUser.name)
			expect((post.author as any).email).toBe(testUser.email)
		})

		it('should handle invalid ObjectId format', async () => {
			await expect(getPostByIdOrSlug('invalid-id')).rejects.toThrow(
				CustomError
			)
		})
	})

	describe('updatePost', () => {
		let testPost: any

		beforeEach(async () => {
			testPost = await createPost({
				title: 'Original Title',
				content: 'Original Content',
				authorId: testUser._id.toString(),
			})
		})

		it('should update post title successfully', async () => {
			const updatedPost = await updatePost(
				testPost._id.toString(),
				{ title: 'Updated Title' },
				testUser._id.toString(),
				false
			)

			expect(updatedPost.title).toBe('Updated Title')
			expect(updatedPost.content).toBe('Original Content')
		})

		it('should update post content successfully', async () => {
			const updatedPost = await updatePost(
				testPost._id.toString(),
				{ content: 'Updated Content' },
				testUser._id.toString(),
				false
			)

			expect(updatedPost.content).toBe('Updated Content')
			expect(updatedPost.title).toBe('Original Title')
		})

		it('should update both title and content', async () => {
			const updatedPost = await updatePost(
				testPost._id.toString(),
				{ title: 'New Title', content: 'New Content' },
				testUser._id.toString(),
				false
			)

			expect(updatedPost.title).toBe('New Title')
			expect(updatedPost.content).toBe('New Content')
		})

		it('should throw error for non-existent post', async () => {
			const nonExistentId = new mongoose.Types.ObjectId().toString()

			await expect(
				updatePost(
					nonExistentId,
					{ title: 'New Title' },
					testUser._id.toString(),
					false
				)
			).rejects.toThrow(CustomError)
			await expect(
				updatePost(
					nonExistentId,
					{ title: 'New Title' },
					testUser._id.toString(),
					false
				)
			).rejects.toThrow('Post not found')
		})

		it('should throw error for deleted post', async () => {
			await (testPost as any).softDelete()

			await expect(
				updatePost(
					testPost._id.toString(),
					{ title: 'New Title' },
					testUser._id.toString(),
					false
				)
			).rejects.toThrow(CustomError)
			await expect(
				updatePost(
					testPost._id.toString(),
					{ title: 'New Title' },
					testUser._id.toString(),
					false
				)
			).rejects.toThrow('Post has been deleted')
		})

		it('should throw error when user tries to update another user post', async () => {
			const otherUser = await User.create({
				name: 'Other User',
				email: 'other@example.com',
				password: 'password123',
				role: 'user',
			})

			await expect(
				updatePost(
					testPost._id.toString(),
					{ title: 'New Title' },
					otherUser._id.toString(),
					false
				)
			).rejects.toThrow(CustomError)
			await expect(
				updatePost(
					testPost._id.toString(),
					{ title: 'New Title' },
					otherUser._id.toString(),
					false
				)
			).rejects.toThrow('You can only update your own posts')
		})

		it('should allow admin to update any post', async () => {
			const updatedPost = await updatePost(
				testPost._id.toString(),
				{ title: 'Admin Updated Title' },
				testAdmin._id.toString(),
				true
			)

			expect(updatedPost.title).toBe('Admin Updated Title')
		})

		it('should not update fields that are undefined', async () => {
			const updatedPost = await updatePost(
				testPost._id.toString(),
				{},
				testUser._id.toString(),
				false
			)

			expect(updatedPost.title).toBe('Original Title')
			expect(updatedPost.content).toBe('Original Content')
		})

		it('should update slug when title changes', async () => {
			const originalSlug = testPost.slug

			const updatedPost = await updatePost(
				testPost._id.toString(),
				{ title: 'Completely New Title' },
				testUser._id.toString(),
				false
			)

			expect(updatedPost.slug).not.toBe(originalSlug)
			expect(updatedPost.slug).toContain('completely-new-title')
		})

		it('should not update slug when only content changes', async () => {
			const originalSlug = testPost.slug

			const updatedPost = await updatePost(
				testPost._id.toString(),
				{ content: 'New Content Only' },
				testUser._id.toString(),
				false
			)

			expect(updatedPost.slug).toBe(originalSlug)
		})

		it('should populate author after update', async () => {
			const updatedPost = await updatePost(
				testPost._id.toString(),
				{ title: 'Updated' },
				testUser._id.toString(),
				false
			)

			expect(updatedPost.author).toBeDefined()
			expect((updatedPost.author as any).name).toBe(testUser.name)
		})
	})

	describe('deletePost', () => {
		let testPost: any

		beforeEach(async () => {
			testPost = await createPost({
				title: 'Test Post',
				content: 'Content here',
				authorId: testUser._id.toString(),
			})
		})

		it('should soft delete post successfully', async () => {
			await deletePost(
				testPost._id.toString(),
				testUser._id.toString(),
				false
			)

			const deletedPost = await Post.findById(testPost._id)
			expect(deletedPost?.isDeleted).toBe(true)
			expect(deletedPost?.deletedAt).toBeDefined()
		})

		it('should throw error for non-existent post', async () => {
			const nonExistentId = new mongoose.Types.ObjectId().toString()

			await expect(
				deletePost(nonExistentId, testUser._id.toString(), false)
			).rejects.toThrow(CustomError)
			await expect(
				deletePost(nonExistentId, testUser._id.toString(), false)
			).rejects.toThrow('Post not found')
		})

		it('should throw error when trying to delete already deleted post', async () => {
			await (testPost as any).softDelete()

			await expect(
				deletePost(
					testPost._id.toString(),
					testUser._id.toString(),
					false
				)
			).rejects.toThrow(CustomError)
			await expect(
				deletePost(
					testPost._id.toString(),
					testUser._id.toString(),
					false
				)
			).rejects.toThrow('Post already deleted')
		})

		it('should throw error when user tries to delete another user post', async () => {
			const otherUser = await User.create({
				name: 'Other User',
				email: 'other@example.com',
				password: 'password123',
				role: 'user',
			})

			await expect(
				deletePost(
					testPost._id.toString(),
					otherUser._id.toString(),
					false
				)
			).rejects.toThrow(CustomError)
			await expect(
				deletePost(
					testPost._id.toString(),
					otherUser._id.toString(),
					false
				)
			).rejects.toThrow('You can only delete your own posts')
		})

		it('should allow admin to delete any post', async () => {
			await deletePost(
				testPost._id.toString(),
				testAdmin._id.toString(),
				true
			)

			const deletedPost = await Post.findById(testPost._id)
			expect(deletedPost?.isDeleted).toBe(true)
		})

		it('should not appear in getAllPosts after deletion', async () => {
			await deletePost(
				testPost._id.toString(),
				testUser._id.toString(),
				false
			)

			const result = await getAllPosts()
			const deletedPostInList = result.posts.find(
				(p) => p._id.toString() === testPost._id.toString()
			)

			expect(deletedPostInList).toBeUndefined()
		})
	})

	describe('getPostsByAuthor', () => {
		let otherUser: any

		beforeEach(async () => {
			otherUser = await User.create({
				name: 'Other User',
				email: 'other@example.com',
				password: 'password123',
				role: 'user',
			})

			// Create posts for testUser
			for (let i = 1; i <= 5; i++) {
				await createPost({
					title: `User Post ${i}`,
					content: `This is the content for user post number ${i} with enough characters`,
					authorId: testUser._id.toString(),
				})
			}

			// Create posts for otherUser
			for (let i = 1; i <= 3; i++) {
				await createPost({
					title: `Other Post ${i}`,
					content: `This is the content for other post number ${i} with enough characters`,
					authorId: otherUser._id.toString(),
				})
			}
		})

		it('should get posts by author', async () => {
			const result = await getPostsByAuthor(testUser._id.toString())

			expect(result.posts.length).toBe(5)
			result.posts.forEach((post) => {
				expect(post.author._id.toString()).toBe(testUser._id.toString())
			})
		})

		it('should exclude deleted posts', async () => {
			// Delete one post
			const posts = await Post.find({ author: testUser._id })
			await (posts[0] as any).softDelete()

			const result = await getPostsByAuthor(testUser._id.toString())

			expect(result.pagination.total).toBe(4) // 5 - 1 deleted
		})

		it('should handle pagination correctly', async () => {
			const result = await getPostsByAuthor(testUser._id.toString(), {
				page: 1,
				limit: 2,
			})

			expect(result.posts.length).toBe(2)
			expect(result.pagination.total).toBe(5)
			expect(result.pagination.totalPages).toBe(3)
		})

		it('should return empty array for author with no posts', async () => {
			const newUser = await User.create({
				name: 'New User',
				email: 'new@example.com',
				password: 'password123',
				role: 'user',
			})

			const result = await getPostsByAuthor(newUser._id.toString())

			expect(result.posts.length).toBe(0)
			expect(result.pagination.total).toBe(0)
		})

		it('should handle non-existent author ID', async () => {
			const nonExistentId = new mongoose.Types.ObjectId().toString()

			const result = await getPostsByAuthor(nonExistentId)

			expect(result.posts.length).toBe(0)
			expect(result.pagination.total).toBe(0)
		})

		it('should handle invalid author ID format', async () => {
			// Should not throw error, just return empty results
			const result = await getPostsByAuthor('invalid-id')

			expect(result.posts.length).toBe(0)
			expect(result.pagination.total).toBe(0)
		})

		it('should populate author information', async () => {
			const result = await getPostsByAuthor(testUser._id.toString())

			result.posts.forEach((post) => {
				expect(post.author).toBeDefined()
				expect((post.author as any).name).toBe(testUser.name)
			})
		})

		it('should sort posts correctly', async () => {
			const result = await getPostsByAuthor(testUser._id.toString(), {
				sort: 'createdAt',
				order: 'desc',
			})

			for (let i = 1; i < result.posts.length; i++) {
				const prevDate = new Date(result.posts[i - 1].createdAt)
				const currDate = new Date(result.posts[i].createdAt)
				expect(prevDate.getTime()).toBeGreaterThanOrEqual(
					currDate.getTime()
				)
			}
		})
	})
})
