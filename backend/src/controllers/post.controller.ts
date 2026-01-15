import { Request, Response, NextFunction } from 'express'
import { asyncHandler } from '../middleware/error-handling/errorHandler.middleware'
import {
	createPost,
	getAllPosts,
	getPostByIdOrSlug,
	updatePost,
	deletePost,
	getPostsByAuthor,
} from '../services/post/post.service'
import { parsePaginationOptions } from '../utils/pagination'

/**
 * @route   POST /api/v1/posts
 * @desc    Create a new post
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

		const post = await createPost({
			title: req.body.title,
			content: req.body.content,
			authorId: userId,
			imageUrl: req.body.imageUrl,
		})

		res.status(201).json({
			success: true,
			message: 'Post created successfully',
			data: { post },
		})
	}
)

/**
 * @route   GET /api/v1/posts
 * @desc    Get all posts with pagination
 * @access  Public
 */
export const getAll = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const paginationOptions = parsePaginationOptions(req.query)
		const result = await getAllPosts(paginationOptions)

		res.status(200).json({
			success: true,
			data: result.posts,
			pagination: result.pagination,
		})
	}
)

/**
 * @route   GET /api/v1/posts/:id
 * @desc    Get a single post by ID or slug
 * @access  Public
 */
export const getById = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const { id } = req.params
		const post = await getPostByIdOrSlug(id)

		res.status(200).json({
			success: true,
			data: { post },
		})
	}
)

/**
 * @route   PUT /api/v1/posts/:id
 * @desc    Update a post
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

		const post = await updatePost(id, req.body, userId, isAdmin)

		res.status(200).json({
			success: true,
			message: 'Post updated successfully',
			data: { post },
		})
	}
)

/**
 * @route   DELETE /api/v1/posts/:id
 * @desc    Delete a post (soft delete)
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

		await deletePost(id, userId, isAdmin)

		res.status(200).json({
			success: true,
			message: 'Post deleted successfully',
		})
	}
)

/**
 * @route   GET /api/v1/posts/author/:authorId
 * @desc    Get posts by author
 * @access  Public
 */
export const getByAuthor = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const { authorId } = req.params
		const paginationOptions = parsePaginationOptions(req.query)
		const result = await getPostsByAuthor(authorId, paginationOptions)

		res.status(200).json({
			success: true,
			data: result.posts,
			pagination: result.pagination,
		})
	}
)
