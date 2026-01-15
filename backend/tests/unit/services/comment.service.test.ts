/**
 * Comment Service Tests
 * Tests all comment management functionality with edge cases
 */

import { clearDatabase } from '../../setup/test-setup'
import {
	createComment,
	getCommentsByPost,
	getCommentById,
	updateComment,
	deleteComment,
	getCommentsByAuthor,
} from '../../../src/services/comment/comment.service'
import Comment from '../../../src/models/Comment.model'
import User from '../../../src/models/User.model'
import { CustomError } from '../../../src/middleware/error-handling/errorHandler.middleware'
import mongoose from 'mongoose'
import { createPost } from '../../../src/services/post/post.service'

describe('Comment Service', () => {
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
		})

		testAdmin = await User.create({
			name: 'Admin User',
			email: 'admin@example.com',
			password: 'password123',
			role: 'admin',
		})

		otherUser = await User.create({
			name: 'Other User',
			email: 'other@example.com',
			password: 'password123',
			role: 'user',
		})

		// Create test post
		testPost = await createPost({
			title: 'Test Post',
			content: 'This is a test post content',
			authorId: testUser._id.toString(),
		})
	})

	describe('createComment', () => {
		it('should create a new comment successfully', async () => {
			const commentData = {
				content: 'This is a test comment',
				postId: testPost._id.toString(),
				authorId: testUser._id.toString(),
			}

			const comment = await createComment(commentData)

			expect(comment).toHaveProperty('_id')
			expect(comment.content).toBe(commentData.content)
			expect(comment.post._id.toString()).toBe(testPost._id.toString())
			expect(comment.author._id.toString()).toBe(testUser._id.toString())
			expect(comment.isDeleted).toBe(false)
		})

		it('should populate author and post information', async () => {
			const commentData = {
				content: 'Test comment',
				postId: testPost._id.toString(),
				authorId: testUser._id.toString(),
			}

			const comment = await createComment(commentData)

			expect(comment.author).toBeDefined()
			expect((comment.author as any).name).toBe(testUser.name)
			expect((comment.author as any).email).toBe(testUser.email)
			expect(comment.post).toBeDefined()
			expect((comment.post as any).title).toBe(testPost.title)
		})

		it('should throw error for non-existent post', async () => {
			const nonExistentPostId = new mongoose.Types.ObjectId().toString()
			const commentData = {
				content: 'Test comment',
				postId: nonExistentPostId,
				authorId: testUser._id.toString(),
			}

			await expect(createComment(commentData)).rejects.toThrow(CustomError)
			await expect(createComment(commentData)).rejects.toThrow(
				'Post not found'
			)
		})

		it('should throw error for deleted post', async () => {
			await (testPost as any).softDelete()

			const commentData = {
				content: 'Test comment',
				postId: testPost._id.toString(),
				authorId: testUser._id.toString(),
			}

			await expect(createComment(commentData)).rejects.toThrow(CustomError)
			await expect(createComment(commentData)).rejects.toThrow(
				'Post not found'
			)
		})

		it('should handle very long comment content', async () => {
			const longContent = 'A'.repeat(1000)
			const commentData = {
				content: longContent,
				postId: testPost._id.toString(),
				authorId: testUser._id.toString(),
			}

			const comment = await createComment(commentData)

			expect(comment.content).toBe(longContent)
		})

		it('should handle minimum length comment', async () => {
			const commentData = {
				content: 'A', // Minimum 1 character
				postId: testPost._id.toString(),
				authorId: testUser._id.toString(),
			}

			const comment = await createComment(commentData)

			expect(comment.content).toBe('A')
		})

		it('should handle maximum length comment', async () => {
			const maxContent = 'A'.repeat(1000) // Maximum 1000 characters
			const commentData = {
				content: maxContent,
				postId: testPost._id.toString(),
				authorId: testUser._id.toString(),
			}

			const comment = await createComment(commentData)

			expect(comment.content).toBe(maxContent)
			expect(comment.content.length).toBe(1000)
		})

		it('should handle special characters in comment', async () => {
			const specialContent = 'Comment with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?'
			const commentData = {
				content: specialContent,
				postId: testPost._id.toString(),
				authorId: testUser._id.toString(),
			}

			const comment = await createComment(commentData)

			expect(comment.content).toBe(specialContent)
		})

		it('should allow multiple comments on same post', async () => {
			const commentData1 = {
				content: 'First comment',
				postId: testPost._id.toString(),
				authorId: testUser._id.toString(),
			}

			const commentData2 = {
				content: 'Second comment',
				postId: testPost._id.toString(),
				authorId: otherUser._id.toString(),
			}

			const comment1 = await createComment(commentData1)
			const comment2 = await createComment(commentData2)

			expect(comment1._id).not.toBe(comment2._id)
			expect(comment1.post._id.toString()).toBe(comment2.post._id.toString())
		})
	})

	describe('getCommentsByPost', () => {
		beforeEach(async () => {
			// Create multiple comments
			for (let i = 1; i <= 12; i++) {
				await createComment({
					content: `Comment ${i}`,
					postId: testPost._id.toString(),
					authorId: i % 2 === 0 ? testUser._id.toString() : otherUser._id.toString(),
				})
			}
		})

		it('should get all comments for a post with default pagination', async () => {
			const result = await getCommentsByPost(testPost._id.toString())

			expect(result).toHaveProperty('comments')
			expect(result).toHaveProperty('pagination')
			expect(result.comments.length).toBe(10) // Default limit
			expect(result.pagination.page).toBe(1)
			expect(result.pagination.limit).toBe(10)
			expect(result.pagination.total).toBe(12)
		})

		it('should exclude deleted comments', async () => {
			// Delete some comments
			const comments = await Comment.find({ post: testPost._id })
			await (comments[0] as any).softDelete()
			await (comments[1] as any).softDelete()

			const result = await getCommentsByPost(testPost._id.toString())

			expect(result.pagination.total).toBe(10) // 12 - 2 deleted
			result.comments.forEach((comment) => {
				expect(comment.isDeleted).toBe(false)
			})
		})

		it('should handle pagination correctly', async () => {
			const result = await getCommentsByPost(testPost._id.toString(), {
				page: 2,
				limit: 5,
			})

			expect(result.comments.length).toBe(5)
			expect(result.pagination.page).toBe(2)
			expect(result.pagination.limit).toBe(5)
			expect(result.pagination.totalPages).toBe(3)
			expect(result.pagination.hasNextPage).toBe(true)
			expect(result.pagination.hasPrevPage).toBe(true)
		})

		it('should throw error for non-existent post', async () => {
			const nonExistentPostId = new mongoose.Types.ObjectId().toString()

			await expect(
				getCommentsByPost(nonExistentPostId)
			).rejects.toThrow(CustomError)
			await expect(
				getCommentsByPost(nonExistentPostId)
			).rejects.toThrow('Post not found')
		})

		it('should handle empty comments for a post', async () => {
			const newPost = await createPost({
				title: 'New Post',
				content: 'This is the content for the new post with enough characters',
				authorId: testUser._id.toString(),
			})

			const result = await getCommentsByPost(newPost._id.toString())

			expect(result.comments.length).toBe(0)
			expect(result.pagination.total).toBe(0)
			expect(result.pagination.hasNextPage).toBe(false)
			expect(result.pagination.hasPrevPage).toBe(false)
		})

		it('should handle invalid post ID format', async () => {
			await expect(
				getCommentsByPost('invalid-id')
			).rejects.toThrow(CustomError)
		})

		it('should handle pagination edge cases', async () => {
			// Test page 0 - should default to page 1
			const result1 = await getCommentsByPost(testPost._id.toString(), {
				page: 0,
				limit: 10,
			})
			expect(result1.pagination.page).toBe(1)

			// Test very large page - should return empty results
			const result2 = await getCommentsByPost(testPost._id.toString(), {
				page: 999999,
				limit: 10,
			})
			expect(result2.comments.length).toBe(0)
			expect(result2.pagination.page).toBe(999999)
		})

		it('should sort comments by createdAt ascending by default', async () => {
			const result = await getCommentsByPost(testPost._id.toString())

			for (let i = 1; i < result.comments.length; i++) {
				const prevDate = new Date(result.comments[i - 1].createdAt)
				const currDate = new Date(result.comments[i].createdAt)
				expect(prevDate.getTime()).toBeLessThanOrEqual(currDate.getTime())
			}
		})

		it('should sort comments descending when specified', async () => {
			const result = await getCommentsByPost(testPost._id.toString(), {
				sort: 'createdAt',
				order: 'desc',
			})

			for (let i = 1; i < result.comments.length; i++) {
				const prevDate = new Date(result.comments[i - 1].createdAt)
				const currDate = new Date(result.comments[i].createdAt)
				expect(prevDate.getTime()).toBeGreaterThanOrEqual(
					currDate.getTime()
				)
			}
		})

		it('should populate author and post information', async () => {
			const result = await getCommentsByPost(testPost._id.toString())

			result.comments.forEach((comment) => {
				expect(comment.author).toBeDefined()
				expect((comment.author as any).name).toBeDefined()
				expect(comment.post).toBeDefined()
				expect((comment.post as any).title).toBeDefined()
			})
		})

		it('should work for deleted post (getCommentsByPost only checks existence)', async () => {
			// Create a comment before deleting the post
			await createComment({
				content: 'Comment on post before deletion',
				postId: testPost._id.toString(),
				authorId: testUser._id.toString(),
			})

			// Delete the post
			await (testPost as any).softDelete()

			// This should still work because Post.findById doesn't check isDeleted
			const result = await getCommentsByPost(testPost._id.toString())
			expect(result).toBeDefined()
			expect(result.comments.length).toBeGreaterThan(0)
		})
	})

	describe('getCommentById', () => {
		let testComment: any

		beforeEach(async () => {
			testComment = await createComment({
				content: 'Test Comment',
				postId: testPost._id.toString(),
				authorId: testUser._id.toString(),
			})
		})

		it('should get comment by ID successfully', async () => {
			const comment = await getCommentById(testComment._id.toString())

			expect(comment._id.toString()).toBe(testComment._id.toString())
			expect(comment.content).toBe(testComment.content)
		})

		it('should populate author and post information', async () => {
			const comment = await getCommentById(testComment._id.toString())

			expect(comment.author).toBeDefined()
			expect((comment.author as any).name).toBe(testUser.name)
			expect(comment.post).toBeDefined()
			expect((comment.post as any).title).toBe(testPost.title)
		})

		it('should throw error for non-existent comment', async () => {
			const nonExistentId = new mongoose.Types.ObjectId().toString()

			await expect(getCommentById(nonExistentId)).rejects.toThrow(
				CustomError
			)
			await expect(getCommentById(nonExistentId)).rejects.toThrow(
				'Comment not found'
			)
		})

		it('should throw error for deleted comment', async () => {
			await (testComment as any).softDelete()

			await expect(
				getCommentById(testComment._id.toString())
			).rejects.toThrow(CustomError)
			await expect(
				getCommentById(testComment._id.toString())
			).rejects.toThrow('Comment not found')
		})

		it('should handle invalid ObjectId format', async () => {
			await expect(getCommentById('invalid-id')).rejects.toThrow(CustomError)
		})
	})

	describe('updateComment', () => {
		let testComment: any

		beforeEach(async () => {
			testComment = await createComment({
				content: 'Original Comment',
				postId: testPost._id.toString(),
				authorId: testUser._id.toString(),
			})
		})

		it('should update comment content successfully', async () => {
			const updatedComment = await updateComment(
				testComment._id.toString(),
				{ content: 'Updated Comment' },
				testUser._id.toString(),
				false
			)

			expect(updatedComment.content).toBe('Updated Comment')
		})

		it('should throw error for non-existent comment', async () => {
			const nonExistentId = new mongoose.Types.ObjectId().toString()

			await expect(
				updateComment(
					nonExistentId,
					{ content: 'Updated' },
					testUser._id.toString(),
					false
				)
			).rejects.toThrow(CustomError)
			await expect(
				updateComment(
					nonExistentId,
					{ content: 'Updated' },
					testUser._id.toString(),
					false
				)
			).rejects.toThrow('Comment not found')
		})

		it('should throw error for deleted comment', async () => {
			await (testComment as any).softDelete()

			await expect(
				updateComment(
					testComment._id.toString(),
					{ content: 'Updated' },
					testUser._id.toString(),
					false
				)
			).rejects.toThrow(CustomError)
			await expect(
				updateComment(
					testComment._id.toString(),
					{ content: 'Updated' },
					testUser._id.toString(),
					false
				)
			).rejects.toThrow('Comment has been deleted')
		})

		it('should throw error when user tries to update another user comment', async () => {
			await expect(
				updateComment(
					testComment._id.toString(),
					{ content: 'Updated' },
					otherUser._id.toString(),
					false
				)
			).rejects.toThrow(CustomError)
			await expect(
				updateComment(
					testComment._id.toString(),
					{ content: 'Updated' },
					otherUser._id.toString(),
					false
				)
			).rejects.toThrow('You can only update your own comments')
		})

		it('should allow admin to update any comment', async () => {
			const updatedComment = await updateComment(
				testComment._id.toString(),
				{ content: 'Admin Updated Comment' },
				testAdmin._id.toString(),
				true
			)

			expect(updatedComment.content).toBe('Admin Updated Comment')
		})

		it('should populate author and post after update', async () => {
			const updatedComment = await updateComment(
				testComment._id.toString(),
				{ content: 'Updated' },
				testUser._id.toString(),
				false
			)

			expect(updatedComment.author).toBeDefined()
			expect((updatedComment.author as any).name).toBe(testUser.name)
			expect(updatedComment.post).toBeDefined()
			expect((updatedComment.post as any).title).toBe(testPost.title)
		})

		it('should handle very long comment content', async () => {
			const longContent = 'A'.repeat(1000)
			const updatedComment = await updateComment(
				testComment._id.toString(),
				{ content: longContent },
				testUser._id.toString(),
				false
			)

			expect(updatedComment.content).toBe(longContent)
		})

		it('should handle minimum length comment', async () => {
			const updatedComment = await updateComment(
				testComment._id.toString(),
				{ content: 'A' },
				testUser._id.toString(),
				false
			)

			expect(updatedComment.content).toBe('A')
		})

		it('should handle maximum length comment on update', async () => {
			const maxContent = 'A'.repeat(1000)
			const updatedComment = await updateComment(
				testComment._id.toString(),
				{ content: maxContent },
				testUser._id.toString(),
				false
			)

			expect(updatedComment.content).toBe(maxContent)
			expect(updatedComment.content.length).toBe(1000)
		})

		it('should throw error for invalid comment ID format', async () => {
			await expect(
				updateComment(
					'invalid-id',
					{ content: 'Updated' },
					testUser._id.toString(),
					false
				)
			).rejects.toThrow(CustomError)
		})
	})

	describe('deleteComment', () => {
		let testComment: any

		beforeEach(async () => {
			testComment = await createComment({
				content: 'Test Comment',
				postId: testPost._id.toString(),
				authorId: testUser._id.toString(),
			})
		})

		it('should soft delete comment successfully', async () => {
			await deleteComment(
				testComment._id.toString(),
				testUser._id.toString(),
				false
			)

			const deletedComment = await Comment.findById(testComment._id)
			expect(deletedComment?.isDeleted).toBe(true)
			expect(deletedComment?.deletedAt).toBeDefined()
		})

		it('should throw error for non-existent comment', async () => {
			const nonExistentId = new mongoose.Types.ObjectId().toString()

			await expect(
				deleteComment(nonExistentId, testUser._id.toString(), false)
			).rejects.toThrow(CustomError)
			await expect(
				deleteComment(nonExistentId, testUser._id.toString(), false)
			).rejects.toThrow('Comment not found')
		})

		it('should throw error when trying to delete already deleted comment', async () => {
			await (testComment as any).softDelete()

			await expect(
				deleteComment(
					testComment._id.toString(),
					testUser._id.toString(),
					false
				)
			).rejects.toThrow(CustomError)
			await expect(
				deleteComment(
					testComment._id.toString(),
					testUser._id.toString(),
					false
				)
			).rejects.toThrow('Comment already deleted')
		})

		it('should throw error when user tries to delete another user comment', async () => {
			await expect(
				deleteComment(
					testComment._id.toString(),
					otherUser._id.toString(),
					false
				)
			).rejects.toThrow(CustomError)
			await expect(
				deleteComment(
					testComment._id.toString(),
					otherUser._id.toString(),
					false
				)
			).rejects.toThrow('You can only delete your own comments')
		})

		it('should allow admin to delete any comment', async () => {
			await deleteComment(
				testComment._id.toString(),
				testAdmin._id.toString(),
				true
			)

			const deletedComment = await Comment.findById(testComment._id)
			expect(deletedComment?.isDeleted).toBe(true)
		})

		it('should not appear in getCommentsByPost after deletion', async () => {
			await deleteComment(
				testComment._id.toString(),
				testUser._id.toString(),
				false
			)

			const result = await getCommentsByPost(testPost._id.toString())
			const deletedCommentInList = result.comments.find(
				(c) => c._id.toString() === testComment._id.toString()
			)

			expect(deletedCommentInList).toBeUndefined()
		})

		it('should not appear in getCommentById after deletion', async () => {
			await deleteComment(
				testComment._id.toString(),
				testUser._id.toString(),
				false
			)

			await expect(
				getCommentById(testComment._id.toString())
			).rejects.toThrow(CustomError)
		})
	})

	describe('getCommentsByAuthor', () => {
		let secondPost: any

		beforeEach(async () => {
			secondPost = await createPost({
				title: 'Second Post',
				content: 'This is the content for the second post with enough characters',
				authorId: testUser._id.toString(),
			})

			// Create comments for testUser
			for (let i = 1; i <= 8; i++) {
				await createComment({
					content: `User Comment ${i}`,
					postId: i % 2 === 0 ? testPost._id.toString() : secondPost._id.toString(),
					authorId: testUser._id.toString(),
				})
			}

			// Create comments for otherUser
			for (let i = 1; i <= 5; i++) {
				await createComment({
					content: `Other Comment ${i}`,
					postId: testPost._id.toString(),
					authorId: otherUser._id.toString(),
				})
			}
		})

		it('should get comments by author', async () => {
			const result = await getCommentsByAuthor(testUser._id.toString())

			expect(result.comments.length).toBe(8)
			result.comments.forEach((comment) => {
				expect(comment.author._id.toString()).toBe(testUser._id.toString())
			})
		})

		it('should exclude deleted comments', async () => {
			// Delete some comments
			const comments = await Comment.find({ author: testUser._id })
			await (comments[0] as any).softDelete()
			await (comments[1] as any).softDelete()

			const result = await getCommentsByAuthor(testUser._id.toString())

			expect(result.pagination.total).toBe(6) // 8 - 2 deleted
		})

		it('should handle pagination correctly', async () => {
			const result = await getCommentsByAuthor(testUser._id.toString(), {
				page: 1,
				limit: 3,
			})

			expect(result.comments.length).toBe(3)
			expect(result.pagination.total).toBe(8)
			expect(result.pagination.totalPages).toBe(3)
		})

		it('should return empty array for author with no comments', async () => {
			const newUser = await User.create({
				name: 'New User',
				email: 'new@example.com',
				password: 'password123',
				role: 'user',
			})

			const result = await getCommentsByAuthor(newUser._id.toString())

			expect(result.comments.length).toBe(0)
			expect(result.pagination.total).toBe(0)
		})

		it('should handle non-existent author ID', async () => {
			const nonExistentId = new mongoose.Types.ObjectId().toString()

			const result = await getCommentsByAuthor(nonExistentId)

			expect(result.comments.length).toBe(0)
			expect(result.pagination.total).toBe(0)
		})

		it('should handle invalid author ID format', async () => {
			// Should not throw error, just return empty results
			const result = await getCommentsByAuthor('invalid-id')

			expect(result.comments.length).toBe(0)
			expect(result.pagination.total).toBe(0)
		})

		it('should handle pagination edge cases for author comments', async () => {
			// Test page 0
			const result1 = await getCommentsByAuthor(testUser._id.toString(), {
				page: 0,
				limit: 10,
			})
			expect(result1.pagination.page).toBe(1)

			// Test very large page
			const result2 = await getCommentsByAuthor(testUser._id.toString(), {
				page: 999999,
				limit: 10,
			})
			expect(result2.comments.length).toBe(0)
		})

		it('should populate author and post information', async () => {
			const result = await getCommentsByAuthor(testUser._id.toString())

			result.comments.forEach((comment) => {
				expect(comment.author).toBeDefined()
				expect((comment.author as any).name).toBe(testUser.name)
				expect(comment.post).toBeDefined()
				expect((comment.post as any).title).toBeDefined()
			})
		})

		it('should sort comments by createdAt descending by default', async () => {
			const result = await getCommentsByAuthor(testUser._id.toString())

			for (let i = 1; i < result.comments.length; i++) {
				const prevDate = new Date(result.comments[i - 1].createdAt)
				const currDate = new Date(result.comments[i].createdAt)
				expect(prevDate.getTime()).toBeGreaterThanOrEqual(
					currDate.getTime()
				)
			}
		})

		it('should sort comments ascending when specified', async () => {
			const result = await getCommentsByAuthor(testUser._id.toString(), {
				sort: 'createdAt',
				order: 'asc',
			})

			for (let i = 1; i < result.comments.length; i++) {
				const prevDate = new Date(result.comments[i - 1].createdAt)
				const currDate = new Date(result.comments[i].createdAt)
				expect(prevDate.getTime()).toBeLessThanOrEqual(currDate.getTime())
			}
		})

		it('should get comments across multiple posts', async () => {
			const result = await getCommentsByAuthor(testUser._id.toString())

			const postIds = result.comments.map((c) => c.post._id.toString())
			const uniquePostIds = [...new Set(postIds)]

			expect(uniquePostIds.length).toBeGreaterThan(1)
		})
	})
})
