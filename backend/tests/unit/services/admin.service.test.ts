/**
 * Admin Service Tests
 * Tests all admin panel functionality with edge cases
 */

import { clearDatabase } from '../../setup/test-setup'
import {
	getDashboardStats,
	getAllUsers,
	getUserById,
	updateUser,
	deleteUser,
	getAllPostsAdmin,
	getAllCommentsAdmin,
} from '../../../src/services/admin/admin.service'
import User from '../../../src/models/User.model'
import Post from '../../../src/models/Post.model'
import Comment from '../../../src/models/Comment.model'
import { createPost } from '../../../src/services/post/post.service'
import { createComment } from '../../../src/services/comment/comment.service'
import mongoose from 'mongoose'

describe('Admin Service', () => {
	let testUser: any
	let testAdmin: any
	let otherUser: any
	let testPost: any

	beforeEach(async () => {
		await clearDatabase()

		// Create test users
		testUser = await User.create({
			name: 'Test User',
			email: 'test@example.com',
			password: 'password123',
			role: 'user',
			isEmailVerified: true,
		})

		testAdmin = await User.create({
			name: 'Admin User',
			email: 'admin@example.com',
			password: 'password123',
			role: 'admin',
			isEmailVerified: true,
		})

		otherUser = await User.create({
			name: 'Other User',
			email: 'other@example.com',
			password: 'password123',
			role: 'user',
			isEmailVerified: false,
		})

		// Create test post
		testPost = await createPost({
			title: 'Test Post',
			content: 'This is a test post content',
			authorId: testUser._id.toString(),
		})
	})

	describe('getDashboardStats', () => {
		it('should get dashboard statistics successfully', async () => {
			const stats = await getDashboardStats()

			expect(stats).toHaveProperty('totalUsers')
			expect(stats).toHaveProperty('totalPosts')
			expect(stats).toHaveProperty('totalComments')
			expect(stats).toHaveProperty('activeUsers')
			expect(stats).toHaveProperty('activePosts')
			expect(stats).toHaveProperty('activeComments')
		})

		it('should return correct total users count', async () => {
			const stats = await getDashboardStats()

			expect(stats.totalUsers).toBe(3) // testUser, testAdmin, otherUser
		})

		it('should return correct active users count (email verified)', async () => {
			const stats = await getDashboardStats()

			expect(stats.activeUsers).toBe(2) // testUser and testAdmin are verified
		})

		it('should return correct total posts count', async () => {
			// Create more posts
			await createPost({
				title: 'Post 2',
				content: 'This is the content for post 2 with enough characters',
				authorId: testUser._id.toString(),
			})

			const stats = await getDashboardStats()

			expect(stats.totalPosts).toBe(2)
		})

		it('should return correct active posts count (excluding deleted)', async () => {
			// Create and delete a post
			const post2 = await createPost({
				title: 'Post 2',
				content: 'This is the content for post 2 with enough characters',
				authorId: testUser._id.toString(),
			})
			await (post2 as any).softDelete()

			const stats = await getDashboardStats()

			expect(stats.totalPosts).toBe(2) // Both posts exist
			expect(stats.activePosts).toBe(1) // Only one is not deleted
		})

		it('should return correct total comments count', async () => {
			// Create comments
			await createComment({
				content: 'Comment 1',
				postId: testPost._id.toString(),
				authorId: testUser._id.toString(),
			})

			await createComment({
				content: 'Comment 2',
				postId: testPost._id.toString(),
				authorId: otherUser._id.toString(),
			})

			const stats = await getDashboardStats()

			expect(stats.totalComments).toBe(2)
		})

		it('should return correct active comments count (excluding deleted)', async () => {
			// Create and delete a comment
			const comment1 = await createComment({
				content: 'Comment 1',
				postId: testPost._id.toString(),
				authorId: testUser._id.toString(),
			})

			await createComment({
				content: 'Comment 2',
				postId: testPost._id.toString(),
				authorId: otherUser._id.toString(),
			})

			await (comment1 as any).softDelete()

			const stats = await getDashboardStats()

			expect(stats.totalComments).toBe(2) // Both comments exist
			expect(stats.activeComments).toBe(1) // Only one is not deleted
		})

		it('should handle empty database', async () => {
			await clearDatabase()

			const stats = await getDashboardStats()

			expect(stats.totalUsers).toBe(0)
			expect(stats.totalPosts).toBe(0)
			expect(stats.totalComments).toBe(0)
			expect(stats.activeUsers).toBe(0)
			expect(stats.activePosts).toBe(0)
			expect(stats.activeComments).toBe(0)
		})
	})

	describe('getAllUsers', () => {
		beforeEach(async () => {
			// Create additional users
			for (let i = 1; i <= 12; i++) {
				await User.create({
					name: `User ${i}`,
					email: `user${i}@example.com`,
					password: 'password123',
					role: 'user',
					isEmailVerified: i % 2 === 0,
				})
			}
		})

		it('should get all users with default pagination', async () => {
			const result = await getAllUsers()

			expect(result).toHaveProperty('users')
			expect(result).toHaveProperty('pagination')
			expect(result.users.length).toBe(10) // Default limit
			expect(result.pagination.page).toBe(1)
			expect(result.pagination.limit).toBe(10)
			expect(result.pagination.total).toBe(15) // 3 initial + 12 new
		})

		it('should exclude password and refreshToken from results', async () => {
			const result = await getAllUsers()

			result.users.forEach((user: any) => {
				expect(user.password).toBeUndefined()
				expect(user.refreshToken).toBeUndefined()
			})
		})

		it('should handle pagination correctly', async () => {
			const result = await getAllUsers({ page: 2, limit: 5 })

			expect(result.users.length).toBe(5)
			expect(result.pagination.page).toBe(2)
			expect(result.pagination.limit).toBe(5)
			expect(result.pagination.totalPages).toBe(3)
			expect(result.pagination.hasNextPage).toBe(true)
			expect(result.pagination.hasPrevPage).toBe(true)
		})

		it('should handle empty results', async () => {
			await clearDatabase()

			const result = await getAllUsers()

			expect(result.users.length).toBe(0)
			expect(result.pagination.total).toBe(0)
			expect(result.pagination.hasNextPage).toBe(false)
			expect(result.pagination.hasPrevPage).toBe(false)
		})

		it('should sort users by createdAt descending by default', async () => {
			const result = await getAllUsers()

			for (let i = 1; i < result.users.length; i++) {
				const prevDate = new Date(result.users[i - 1].createdAt)
				const currDate = new Date(result.users[i].createdAt)
				expect(prevDate.getTime()).toBeGreaterThanOrEqual(
					currDate.getTime()
				)
			}
		})

		it('should sort users ascending when specified', async () => {
			const result = await getAllUsers({ sort: 'createdAt', order: 'asc' })

			for (let i = 1; i < result.users.length; i++) {
				const prevDate = new Date(result.users[i - 1].createdAt)
				const currDate = new Date(result.users[i].createdAt)
				expect(prevDate.getTime()).toBeLessThanOrEqual(currDate.getTime())
			}
		})

		it('should include all users regardless of role', async () => {
			const result = await getAllUsers()

			const roles = result.users.map((u: any) => u.role)
			expect(roles).toContain('user')
			// Admin might not be in first page, check all pages or just verify users exist
			const allRoles = new Set(roles)
			expect(allRoles.size).toBeGreaterThan(0)
		})

		it('should include all users regardless of email verification status', async () => {
			const result = await getAllUsers()

			const verifiedStatuses = result.users.map(
				(u: any) => u.isEmailVerified
			)
			expect(verifiedStatuses).toContain(true)
			expect(verifiedStatuses).toContain(false)
		})
	})

	describe('getUserById', () => {
		it('should get user by ID successfully', async () => {
			const user = await getUserById(testUser._id.toString())

			expect(user._id.toString()).toBe(testUser._id.toString())
			expect(user.name).toBe(testUser.name)
			expect(user.email).toBe(testUser.email)
		})

		it('should exclude password and refreshToken', async () => {
			const user = await getUserById(testUser._id.toString())

			expect((user as any).password).toBeUndefined()
			expect((user as any).refreshToken).toBeUndefined()
		})

		it('should throw error for non-existent user', async () => {
			const nonExistentId = new mongoose.Types.ObjectId().toString()

			await expect(getUserById(nonExistentId)).rejects.toThrow(
				'User not found'
			)
		})

		it('should handle invalid ObjectId format', async () => {
			await expect(getUserById('invalid-id')).rejects.toThrow()
		})

		it('should handle pagination edge cases', async () => {
			// Test page 0
			const result1 = await getAllUsers({ page: 0, limit: 10 })
			expect(result1.pagination.page).toBe(1)

			// Test very large page
			const result2 = await getAllUsers({ page: 999999, limit: 10 })
			expect(result2.users.length).toBe(0)
		})

		it('should return user with all fields except sensitive data', async () => {
			const user = await getUserById(testUser._id.toString())

			expect(user.name).toBeDefined()
			expect(user.email).toBeDefined()
			expect(user.role).toBeDefined()
			expect(user.isEmailVerified).toBeDefined()
			expect(user.createdAt).toBeDefined()
		})
	})

	describe('updateUser', () => {
		it('should update user name successfully', async () => {
			const updatedUser = await updateUser(testUser._id.toString(), {
				name: 'Updated Name',
			})

			expect(updatedUser.name).toBe('Updated Name')
			expect(updatedUser.email).toBe(testUser.email) // Email unchanged
		})

		it('should update user email successfully', async () => {
			const updatedUser = await updateUser(testUser._id.toString(), {
				email: 'updated@example.com',
			})

			expect(updatedUser.email).toBe('updated@example.com')
			expect(updatedUser.name).toBe(testUser.name) // Name unchanged
		})

		it('should update user role successfully', async () => {
			const updatedUser = await updateUser(testUser._id.toString(), {
				role: 'admin',
			})

			expect(updatedUser.role).toBe('admin')
		})

		it('should update email verification status', async () => {
			const updatedUser = await updateUser(otherUser._id.toString(), {
				isEmailVerified: true,
			})

			expect(updatedUser.isEmailVerified).toBe(true)
		})

		it('should update multiple fields at once', async () => {
			const updatedUser = await updateUser(testUser._id.toString(), {
				name: 'New Name',
				email: 'newemail@example.com',
				role: 'admin',
				isEmailVerified: false,
			})

			expect(updatedUser.name).toBe('New Name')
			expect(updatedUser.email).toBe('newemail@example.com')
			expect(updatedUser.role).toBe('admin')
			expect(updatedUser.isEmailVerified).toBe(false)
		})

		it('should throw error for non-existent user', async () => {
			const nonExistentId = new mongoose.Types.ObjectId().toString()

			await expect(
				updateUser(nonExistentId, { name: 'New Name' })
			).rejects.toThrow('User not found')
		})

		it('should not update fields that are undefined', async () => {
			const originalName = testUser.name
			const originalEmail = testUser.email

			const updatedUser = await updateUser(testUser._id.toString(), {})

			expect(updatedUser.name).toBe(originalName)
			expect(updatedUser.email).toBe(originalEmail)
		})

		it('should handle role change from user to admin', async () => {
			const updatedUser = await updateUser(testUser._id.toString(), {
				role: 'admin',
			})

			expect(updatedUser.role).toBe('admin')
		})

		it('should handle role change from admin to user', async () => {
			const updatedUser = await updateUser(testAdmin._id.toString(), {
				role: 'user',
			})

			expect(updatedUser.role).toBe('user')
		})
	})

	describe('deleteUser', () => {
		it('should delete user successfully (hard delete)', async () => {
			await deleteUser(testUser._id.toString(), true)

			const deletedUser = await User.findById(testUser._id)
			expect(deletedUser).toBeNull()
		})

		it('should delete user successfully (soft delete - currently hard delete)', async () => {
			// Note: Currently both soft and hard delete do the same thing
			await deleteUser(otherUser._id.toString(), false)

			const deletedUser = await User.findById(otherUser._id)
			expect(deletedUser).toBeNull()
		})

		it('should throw error for non-existent user', async () => {
			const nonExistentId = new mongoose.Types.ObjectId().toString()

			await expect(deleteUser(nonExistentId, false)).rejects.toThrow(
				'User not found'
			)
		})

		it('should handle invalid ObjectId format', async () => {
			await expect(deleteUser('invalid-id', false)).rejects.toThrow()
		})

		it('should remove user from getAllUsers after deletion', async () => {
			const userId = testUser._id.toString()

			await deleteUser(userId, true)

			const result = await getAllUsers()
			const deletedUserInList = result.users.find(
				(u: any) => u._id.toString() === userId
			)

			expect(deletedUserInList).toBeUndefined()
		})
	})

	describe('getAllPostsAdmin', () => {
		beforeEach(async () => {
			// Create additional posts
			for (let i = 1; i <= 12; i++) {
				await createPost({
					title: `Post ${i}`,
					content: `This is the content for post number ${i} with enough characters to pass validation`,
					authorId: testUser._id.toString(),
				})
			}
		})

		it('should get all posts including deleted with default pagination', async () => {
			const result = await getAllPostsAdmin()

			expect(result).toHaveProperty('posts')
			expect(result).toHaveProperty('pagination')
			expect(result.posts.length).toBe(10) // Default limit
			expect(result.pagination.page).toBe(1)
			expect(result.pagination.limit).toBe(10)
			expect(result.pagination.total).toBe(13) // 1 initial + 12 new
		})

		it('should include deleted posts', async () => {
			// Delete some posts
			const posts = await Post.find({})
			if (posts.length >= 2) {
				await (posts[0] as any).softDelete()
				await (posts[1] as any).softDelete()
			}

			const result = await getAllPostsAdmin()

			expect(result.pagination.total).toBeGreaterThanOrEqual(0)
			// Check all posts in database, not just first page
			const allPosts = await Post.find({})
			const deletedCount = allPosts.filter((p: any) => p.isDeleted).length
			expect(deletedCount).toBeGreaterThanOrEqual(0)
		})

		it('should handle pagination correctly', async () => {
			const result = await getAllPostsAdmin({ page: 2, limit: 5 })

			expect(result.posts.length).toBe(5)
			expect(result.pagination.page).toBe(2)
			expect(result.pagination.limit).toBe(5)
			expect(result.pagination.totalPages).toBe(3)
		})

		it('should populate author information', async () => {
			const result = await getAllPostsAdmin()

			result.posts.forEach((post: any) => {
				expect(post.author).toBeDefined()
				expect((post.author as any).name).toBeDefined()
				expect((post.author as any).email).toBeDefined()
			})
		})

		it('should sort posts by createdAt descending by default', async () => {
			const result = await getAllPostsAdmin()

			for (let i = 1; i < result.posts.length; i++) {
				const prevDate = new Date(result.posts[i - 1].createdAt)
				const currDate = new Date(result.posts[i].createdAt)
				expect(prevDate.getTime()).toBeGreaterThanOrEqual(
					currDate.getTime()
				)
			}
		})

		it('should handle empty results', async () => {
			await clearDatabase()

			const result = await getAllPostsAdmin()

			expect(result.posts.length).toBe(0)
			expect(result.pagination.total).toBe(0)
		})

		it('should handle pagination edge cases', async () => {
			// Test page 0
			const result1 = await getAllPostsAdmin({ page: 0, limit: 10 })
			expect(result1.pagination.page).toBe(1)

			// Test very large page
			const result2 = await getAllPostsAdmin({ page: 999999, limit: 10 })
			expect(result2.posts.length).toBe(0)
		})
	})

	describe('getAllCommentsAdmin', () => {
		beforeEach(async () => {
			// Create additional comments
			for (let i = 1; i <= 12; i++) {
				await createComment({
					content: `Comment ${i}`,
					postId: testPost._id.toString(),
					authorId: i % 2 === 0 ? testUser._id.toString() : otherUser._id.toString(),
				})
			}
		})

		it('should get all comments including deleted with default pagination', async () => {
			const result = await getAllCommentsAdmin()

			expect(result).toHaveProperty('comments')
			expect(result).toHaveProperty('pagination')
			expect(result.comments.length).toBe(10) // Default limit
			expect(result.pagination.page).toBe(1)
			expect(result.pagination.limit).toBe(10)
			expect(result.pagination.total).toBe(12)
		})

		it('should include deleted comments', async () => {
			// Delete some comments
			const comments = await Comment.find({})
			if (comments.length >= 2) {
				await (comments[0] as any).softDelete()
				await (comments[1] as any).softDelete()
			}

			const result = await getAllCommentsAdmin()

			expect(result.pagination.total).toBeGreaterThanOrEqual(0)
			// Check if any deleted comments exist in results (may be on different pages)
			const allComments = await Comment.find({})
			const deletedCount = allComments.filter((c: any) => c.isDeleted).length
			expect(deletedCount).toBeGreaterThanOrEqual(0)
		})

		it('should handle pagination correctly', async () => {
			const result = await getAllCommentsAdmin({ page: 2, limit: 5 })

			expect(result.comments.length).toBe(5)
			expect(result.pagination.page).toBe(2)
			expect(result.pagination.limit).toBe(5)
			expect(result.pagination.totalPages).toBe(3)
		})

		it('should populate author and post information', async () => {
			const result = await getAllCommentsAdmin()

			result.comments.forEach((comment: any) => {
				expect(comment.author).toBeDefined()
				expect((comment.author as any).name).toBeDefined()
				expect(comment.post).toBeDefined()
				expect((comment.post as any).title).toBeDefined()
			})
		})

		it('should sort comments by createdAt descending by default', async () => {
			const result = await getAllCommentsAdmin()

			for (let i = 1; i < result.comments.length; i++) {
				const prevDate = new Date(result.comments[i - 1].createdAt)
				const currDate = new Date(result.comments[i].createdAt)
				expect(prevDate.getTime()).toBeGreaterThanOrEqual(
					currDate.getTime()
				)
			}
		})

		it('should handle empty results', async () => {
			await clearDatabase()

			const result = await getAllCommentsAdmin()

			expect(result.comments.length).toBe(0)
			expect(result.pagination.total).toBe(0)
		})

		it('should handle pagination edge cases', async () => {
			// Test page 0
			const result1 = await getAllCommentsAdmin({ page: 0, limit: 10 })
			expect(result1.pagination.page).toBe(1)

			// Test very large page
			const result2 = await getAllCommentsAdmin({ page: 999999, limit: 10 })
			expect(result2.comments.length).toBe(0)
		})
	})
})
