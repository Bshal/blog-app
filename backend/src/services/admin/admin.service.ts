import User from '../../models/User.model'
import Post from '../../models/Post.model'
import Comment from '../../models/Comment.model'
import {
	PaginationOptions,
	calculateSkip,
	calculateSortOrder,
	createPaginatedResponse,
} from '../../utils/pagination'
import {
	executePaginatedQuery,
	POPULATE_FIELDS,
} from '../../utils/query-optimizer'

export interface DashboardStats {
	totalUsers: number
	totalPosts: number
	totalComments: number
	activeUsers: number
	activePosts: number
	activeComments: number
}

export interface PaginatedUsers {
	users: any[]
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
 * Get dashboard statistics
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
	const [
		totalUsers,
		totalPosts,
		totalComments,
		activeUsers,
		activePosts,
		activeComments,
	] = await Promise.all([
		User.countDocuments(),
		Post.countDocuments(),
		Comment.countDocuments(),
		User.countDocuments({ isEmailVerified: true }),
		Post.countDocuments({ isDeleted: false }),
		Comment.countDocuments({ isDeleted: false }),
	])

	return {
		totalUsers,
		totalPosts,
		totalComments,
		activeUsers,
		activePosts,
		activeComments,
	}
}

/**
 * Get all users with pagination (for admin)
 */
export const getAllUsers = async (
	options: PaginationOptions = {}
): Promise<PaginatedUsers> => {
	const page = Math.max(1, options.page || 1)
	const limit = Math.max(1, Math.min(100, options.limit || 10))
	const sort = options.sort || 'createdAt'
	const order = options.order || 'desc'

	const skip = calculateSkip(page, limit)
	const sortOrder = calculateSortOrder(order)

	const query = User.find()
		.select('-password -refreshToken')
		.sort({ [sort]: sortOrder })
		.skip(skip)
		.limit(limit)

	const countQuery = User.countDocuments()

	const { data: users, total } = await executePaginatedQuery(query, countQuery)

	return {
		users: users as any[],
		pagination: createPaginatedResponse(users, page, limit, total)
			.pagination,
	}
}

/**
 * Get user by ID (for admin)
 */
export const getUserById = async (userId: string) => {
	const user = await User.findById(userId).select('-password -refreshToken')

	if (!user) {
		throw new Error('User not found')
	}

	return user
}

/**
 * Update user (for admin)
 */
export const updateUser = async (
	userId: string,
	data: {
		name?: string
		email?: string
		role?: 'user' | 'admin'
		isEmailVerified?: boolean
	}
) => {
	const user = await User.findById(userId)

	if (!user) {
		throw new Error('User not found')
	}

	if (data.name !== undefined) {
		user.name = data.name
	}
	if (data.email !== undefined) {
		user.email = data.email
	}
	if (data.role !== undefined) {
		user.role = data.role
	}
	if (data.isEmailVerified !== undefined) {
		user.isEmailVerified = data.isEmailVerified
	}

	await user.save()
	return user
}

/**
 * Delete user (soft delete or hard delete)
 */
export const deleteUser = async (userId: string, hardDelete: boolean = false) => {
	const user = await User.findById(userId)

	if (!user) {
		throw new Error('User not found')
	}

	if (hardDelete) {
		await User.findByIdAndDelete(userId)
	} else {
		// Soft delete: mark as deleted (you may want to add isDeleted field to User model)
		// For now, we'll just delete the user
		await User.findByIdAndDelete(userId)
	}
}

/**
 * Get all posts (including deleted) for admin
 */
export const getAllPostsAdmin = async (
	options: PaginationOptions = {}
): Promise<any> => {
	const page = Math.max(1, options.page || 1)
	const limit = Math.max(1, Math.min(100, options.limit || 10))
	const sort = options.sort || 'createdAt'
	const order = options.order || 'desc'

	const skip = calculateSkip(page, limit)
	const sortOrder = calculateSortOrder(order)

	const query = Post.find()
		.populate('author', POPULATE_FIELDS.author)
		.sort({ [sort]: sortOrder })
		.skip(skip)
		.limit(limit)

	const countQuery = Post.countDocuments()

	const { data: posts, total } = await executePaginatedQuery(query, countQuery)

	return {
		posts: posts as any[],
		pagination: createPaginatedResponse(posts, page, limit, total)
			.pagination,
	}
}

/**
 * Get all comments (including deleted) for admin
 */
export const getAllCommentsAdmin = async (
	options: PaginationOptions = {}
): Promise<any> => {
	const page = Math.max(1, options.page || 1)
	const limit = Math.max(1, Math.min(100, options.limit || 10))
	const sort = options.sort || 'createdAt'
	const order = options.order || 'desc'

	const skip = calculateSkip(page, limit)
	const sortOrder = calculateSortOrder(order)

	const query = Comment.find()
		.populate('author', POPULATE_FIELDS.commentAuthor)
		.populate('post', POPULATE_FIELDS.post)
		.sort({ [sort]: sortOrder })
		.skip(skip)
		.limit(limit)

	const countQuery = Comment.countDocuments()

	const { data: comments, total } = await executePaginatedQuery(
		query,
		countQuery
	)

	return {
		comments: comments as any[],
		pagination: createPaginatedResponse(comments, page, limit, total)
			.pagination,
	}
}
