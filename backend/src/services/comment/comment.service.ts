import Comment, { IComment } from '../../models/Comment.model'
import Post from '../../models/Post.model'
import { CustomError } from '../../middleware/error-handling/errorHandler.middleware'
import mongoose from 'mongoose'
import {
	PaginationOptions,
	calculateSkip,
	calculateSortOrder,
	createPaginatedResponse,
} from '../../utils/pagination'
import {
	POPULATE_FIELDS,
	executePaginatedQuery,
} from '../../utils/query-optimizer'

export interface CreateCommentData {
	content: string
	postId: string
	authorId: string
}

export interface UpdateCommentData {
	content: string
}

export interface PaginatedComments {
	comments: IComment[]
	pagination: {
		page: number
		limit: number
		total: number
		totalPages: number
		hasNextPage: boolean
		hasPrevPage: boolean
	}
}

/**
 * Create a new comment
 */
export const createComment = async (
	data: CreateCommentData
): Promise<IComment> => {
	const { content, postId, authorId } = data

	// Verify post exists and is not deleted
	const post = await Post.findOne({
		_id: postId,
		isDeleted: false,
	})

	if (!post) {
		throw new CustomError('Post not found', 404)
	}

	const comment = await Comment.create({
		content,
		post: new mongoose.Types.ObjectId(postId),
		author: new mongoose.Types.ObjectId(authorId),
		isDeleted: false,
	})

	await comment.populate('author', POPULATE_FIELDS.commentAuthor)
	await comment.populate('post', POPULATE_FIELDS.post)

	return comment
}

/**
 * Get all comments for a post with pagination
 */
export const getCommentsByPost = async (
	postId: string,
	options: PaginationOptions = {}
): Promise<PaginatedComments> => {
	// Verify post exists
	if (!mongoose.Types.ObjectId.isValid(postId)) {
		throw new CustomError('Post not found', 404)
	}
	const post = await Post.findById(postId)
	if (!post) {
		throw new CustomError('Post not found', 404)
	}

	const page = Math.max(1, options.page || 1)
	const limit = Math.max(1, Math.min(100, options.limit || 10))
	const sort = options.sort || 'createdAt'
	const order = options.order || 'asc'

	const skip = calculateSkip(page, limit)
	const sortOrder = calculateSortOrder(order)

	const filter = {
		post: new mongoose.Types.ObjectId(postId),
		isDeleted: false,
	}

	const query = Comment.find(filter)
		.populate('author', POPULATE_FIELDS.commentAuthor)
		.populate('post', POPULATE_FIELDS.post)
		.sort({ [sort]: sortOrder })
		.skip(skip)
		.limit(limit)

	const countQuery = Comment.countDocuments(filter)

	const { data: comments, total } = await executePaginatedQuery(
		query,
		countQuery
	)

	return {
		comments: comments as IComment[],
		pagination: createPaginatedResponse(comments, page, limit, total)
			.pagination,
	}
}

/**
 * Get a single comment by ID
 */
export const getCommentById = async (commentId: string): Promise<IComment> => {
	if (!mongoose.Types.ObjectId.isValid(commentId)) {
		throw new CustomError('Comment not found', 404)
	}
	const comment = await Comment.findOne({
		_id: commentId,
		isDeleted: false,
	})
		.populate('author', POPULATE_FIELDS.commentAuthor)
		.populate('post', POPULATE_FIELDS.post)

	if (!comment) {
		throw new CustomError('Comment not found', 404)
	}

	return comment
}

/**
 * Update a comment
 */
export const updateComment = async (
	commentId: string,
	data: UpdateCommentData,
	userId: string,
	isAdmin: boolean = false
): Promise<IComment> => {
	if (!mongoose.Types.ObjectId.isValid(commentId)) {
		throw new CustomError('Comment not found', 404)
	}
	const comment = await Comment.findById(commentId)

	if (!comment) {
		throw new CustomError('Comment not found', 404)
	}

	if (comment.isDeleted) {
		throw new CustomError('Comment has been deleted', 404)
	}

	// Check ownership (admin can update any comment)
	if (!isAdmin && comment.author.toString() !== userId) {
		throw new CustomError('You can only update your own comments', 403)
	}

	comment.content = data.content
	await comment.save()
	await comment.populate('author', POPULATE_FIELDS.commentAuthor)
	await comment.populate('post', POPULATE_FIELDS.post)

	return comment
}

/**
 * Delete a comment (soft delete)
 */
export const deleteComment = async (
	commentId: string,
	userId: string,
	isAdmin: boolean = false
): Promise<void> => {
	const comment = await Comment.findById(commentId)

	if (!comment) {
		throw new CustomError('Comment not found', 404)
	}

	if (comment.isDeleted) {
		throw new CustomError('Comment already deleted', 404)
	}

	// Check ownership (admin can delete any comment)
	if (!isAdmin && comment.author.toString() !== userId) {
		throw new CustomError('You can only delete your own comments', 403)
	}

	await (comment as any).softDelete()
}

/**
 * Get comments by author
 */
export const getCommentsByAuthor = async (
	authorId: string,
	options: PaginationOptions = {}
): Promise<PaginatedComments> => {
	if (!mongoose.Types.ObjectId.isValid(authorId)) {
		return {
			comments: [],
			pagination: createPaginatedResponse([], 1, 10, 0).pagination,
		}
	}

	const page = Math.max(1, options.page || 1)
	const limit = Math.max(1, Math.min(100, options.limit || 10))
	const sort = options.sort || 'createdAt'
	const order = options.order || 'desc'

	const skip = calculateSkip(page, limit)
	const sortOrder = calculateSortOrder(order)

	const filter = {
		author: new mongoose.Types.ObjectId(authorId),
		isDeleted: false,
	}

	const query = Comment.find(filter)
		.populate('author', POPULATE_FIELDS.commentAuthor)
		.populate('post', POPULATE_FIELDS.post)
		.sort({ [sort]: sortOrder })
		.skip(skip)
		.limit(limit)

	const countQuery = Comment.countDocuments(filter)

	const { data: comments, total } = await executePaginatedQuery(
		query,
		countQuery
	)

	return {
		comments: comments as IComment[],
		pagination: createPaginatedResponse(comments, page, limit, total)
			.pagination,
	}
}
