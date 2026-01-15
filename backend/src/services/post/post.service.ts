import Post, { IPost } from '../../models/Post.model'
import Comment from '../../models/Comment.model'
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

export interface CreatePostData {
	title: string
	content: string
	authorId: string
	imageUrl?: string
}

export interface UpdatePostData {
	title?: string
	content?: string
	imageUrl?: string
}

export interface PaginatedPosts {
	posts: IPost[]
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
 * Create a new post
 */
export const createPost = async (data: CreatePostData): Promise<IPost> => {
	const { title, content, authorId, imageUrl } = data

	const post = await Post.create({
		title,
		content,
		author: new mongoose.Types.ObjectId(authorId),
		imageUrl: imageUrl || '',
		isDeleted: false,
	})

	await post.populate('author', POPULATE_FIELDS.author)

	return post
}

/**
 * Get all posts with pagination (excluding deleted)
 */
export const getAllPosts = async (
	options: PaginationOptions = {}
): Promise<PaginatedPosts> => {
	const page = Math.max(1, options.page || 1)
	const limit = Math.max(1, Math.min(100, options.limit || 10))
	const sort = options.sort || 'createdAt'
	const order = options.order || 'desc'

	const skip = calculateSkip(page, limit)
	const sortOrder = calculateSortOrder(order)

	const query = Post.find({ isDeleted: false })
		.populate('author', POPULATE_FIELDS.author)
		.sort({ [sort]: sortOrder })
		.skip(skip)
		.limit(limit)

	const countQuery = Post.countDocuments({ isDeleted: false })

	const { data: posts, total } = await executePaginatedQuery(query, countQuery)

	// Add comment count to each post
	const postsWithCommentCount = await Promise.all(
		(posts as IPost[]).map(async (post) => {
			const commentCount = await Comment.countDocuments({
				post: post._id,
				isDeleted: false,
			})
			// Handle both Mongoose documents and plain objects
			const postObject = post.toObject ? post.toObject() : post
			return {
				...postObject,
				commentCount,
			}
		})
	)

	return {
		posts: postsWithCommentCount as unknown as IPost[],
		pagination: createPaginatedResponse(posts, page, limit, total)
			.pagination,
	}
}

/**
 * Get a single post by ID or slug
 */
export const getPostByIdOrSlug = async (
	identifier: string
): Promise<IPost> => {
	const isObjectId = mongoose.Types.ObjectId.isValid(identifier)

	const query = isObjectId
		? { _id: identifier, isDeleted: false }
		: { slug: identifier.toLowerCase().trim(), isDeleted: false }

	const post = await Post.findOne(query).populate(
		'author',
		POPULATE_FIELDS.author
	)

	if (!post) {
		throw new CustomError('Post not found', 404)
	}

	// Add comment count
	const commentCount = await Comment.countDocuments({
		post: post._id,
		isDeleted: false,
	})

	// Convert to object and add commentCount
	// Use unknown first to avoid TypeScript error when casting plain object to IPost
	const postObject = post.toObject()
	return {
		...postObject,
		commentCount,
	} as unknown as IPost
}

/**
 * Update a post
 */
export const updatePost = async (
	postId: string,
	data: UpdatePostData,
	userId: string,
	isAdmin: boolean = false
): Promise<IPost> => {
	const post = await Post.findById(postId)

	if (!post) {
		throw new CustomError('Post not found', 404)
	}

	if (post.isDeleted) {
		throw new CustomError('Post has been deleted', 404)
	}

	// Check ownership (admin can update any post)
	if (!isAdmin && post.author.toString() !== userId) {
		throw new CustomError('You can only update your own posts', 403)
	}

	// Update fields
	if (data.title !== undefined) {
		post.title = data.title
	}
	if (data.content !== undefined) {
		post.content = data.content
	}
	if (data.imageUrl !== undefined) {
		post.imageUrl = data.imageUrl
	}

	await post.save()
	await post.populate('author', POPULATE_FIELDS.author)

	return post
}

/**
 * Delete a post (soft delete)
 */
export const deletePost = async (
	postId: string,
	userId: string,
	isAdmin: boolean = false
): Promise<void> => {
	const post = await Post.findById(postId)

	if (!post) {
		throw new CustomError('Post not found', 404)
	}

	if (post.isDeleted) {
		throw new CustomError('Post already deleted', 404)
	}

	// Check ownership (admin can delete any post)
	if (!isAdmin && post.author.toString() !== userId) {
		throw new CustomError('You can only delete your own posts', 403)
	}

	await (post as any).softDelete()
}

/**
 * Get posts by author
 */
export const getPostsByAuthor = async (
	authorId: string,
	options: PaginationOptions = {}
): Promise<PaginatedPosts> => {
	if (!mongoose.Types.ObjectId.isValid(authorId)) {
		return {
			posts: [],
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

	const query = Post.find(filter)
		.populate('author', POPULATE_FIELDS.author)
		.sort({ [sort]: sortOrder })
		.skip(skip)
		.limit(limit)

	const countQuery = Post.countDocuments(filter)

	const { data: posts, total } = await executePaginatedQuery(query, countQuery)

	// Add comment count to each post
	const postsWithCommentCount = await Promise.all(
		(posts as IPost[]).map(async (post) => {
			const commentCount = await Comment.countDocuments({
				post: post._id,
				isDeleted: false,
			})
			// Handle both Mongoose documents and plain objects
			const postObject = post.toObject ? post.toObject() : post
			return {
				...postObject,
				commentCount,
			}
		})
	)

	return {
		posts: postsWithCommentCount as unknown as IPost[],
		pagination: createPaginatedResponse(posts, page, limit, total)
			.pagination,
	}
}
