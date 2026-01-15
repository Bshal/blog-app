import { Request, Response, NextFunction } from 'express'
import { asyncHandler } from '../middleware/error-handling/errorHandler.middleware'
import {
	createComment,
	getCommentsByPost,
	getCommentById,
	updateComment,
	deleteComment,
	getCommentsByAuthor,
} from '../services/comment/comment.service'
import { parsePaginationOptions } from '../utils/pagination'

/**
 * @route   POST /api/v1/comments
 * @desc    Create a new comment
 * @access  Private
 */
export const create = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const userId = req.user?.userId
		if (!userId) {
			return res.status(401).json({
				success: false,
				message: 'Authentication required',
			})
		}

		const comment = await createComment({
			content: req.body.content,
			postId: req.body.postId,
			authorId: userId,
		})

		res.status(201).json({
			success: true,
			message: 'Comment created successfully',
			data: { comment },
		})
	}
)

/**
 * @route   GET /api/v1/comments/post/:postId
 * @desc    Get all comments for a post with pagination
 * @access  Public
 */
export const getByPost = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const { postId } = req.params
		const paginationOptions = parsePaginationOptions(req.query)
		const result = await getCommentsByPost(postId, paginationOptions)

		res.status(200).json({
			success: true,
			data: result.comments,
			pagination: result.pagination,
		})
	}
)

/**
 * @route   GET /api/v1/comments/:id
 * @desc    Get a single comment by ID
 * @access  Public
 */
export const getById = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const { id } = req.params
		const comment = await getCommentById(id)

		res.status(200).json({
			success: true,
			data: { comment },
		})
	}
)

/**
 * @route   PUT /api/v1/comments/:id
 * @desc    Update a comment
 * @access  Private
 */
export const update = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const { id } = req.params
		const userId = req.user?.userId
		const isAdmin = req.user?.role === 'admin'

		if (!userId) {
			return res.status(401).json({
				success: false,
				message: 'Authentication required',
			})
		}

		const comment = await updateComment(id, req.body, userId, isAdmin)

		res.status(200).json({
			success: true,
			message: 'Comment updated successfully',
			data: { comment },
		})
	}
)

/**
 * @route   DELETE /api/v1/comments/:id
 * @desc    Delete a comment (soft delete)
 * @access  Private
 */
export const remove = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const { id } = req.params
		const userId = req.user?.userId
		const isAdmin = req.user?.role === 'admin'

		if (!userId) {
			return res.status(401).json({
				success: false,
				message: 'Authentication required',
			})
		}

		await deleteComment(id, userId, isAdmin)

		res.status(200).json({
			success: true,
			message: 'Comment deleted successfully',
		})
	}
)

/**
 * @route   GET /api/v1/comments/author/:authorId
 * @desc    Get comments by author
 * @access  Public
 */
export const getByAuthor = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const { authorId } = req.params
		const paginationOptions = parsePaginationOptions(req.query)
		const result = await getCommentsByAuthor(authorId, paginationOptions)

		res.status(200).json({
			success: true,
			data: result.comments,
			pagination: result.pagination,
		})
	}
)
