import { Request, Response, NextFunction } from 'express'
import { asyncHandler } from '../middleware/error-handling/errorHandler.middleware'
import { createAdminUser } from '../utils/createAdmin'
import {
	getDashboardStats,
	getAllUsers,
	getUserById,
	updateUser,
	deleteUser,
	getAllPostsAdmin,
	getAllCommentsAdmin,
} from '../services/admin/admin.service'
import { CustomError } from '../middleware/error-handling/errorHandler.middleware'
import { parsePaginationOptions } from '../utils/pagination'

/**
 * @route   POST /api/v1/admin/create-admin
 * @desc    Create an admin user
 * @access  Private (Admin only)
 */
export const createAdmin = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const { name, email, password } = req.body

		if (!name || !email || !password) {
			return res.status(400).json({
				success: false,
				message: 'Name, email, and password are required',
			})
		}

		await createAdminUser({ name, email, password })

		res.status(201).json({
			success: true,
			message: 'Admin user created successfully',
		})
	}
)

/**
 * @route   GET /api/v1/admin/dashboard
 * @desc    Get dashboard statistics
 * @access  Private (Admin only)
 */
export const getDashboard = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const stats = await getDashboardStats()

		res.status(200).json({
			success: true,
			data: stats,
		})
	}
)

/**
 * @route   GET /api/v1/admin/users
 * @desc    Get all users with pagination
 * @access  Private (Admin only)
 */
export const getUsers = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const paginationOptions = parsePaginationOptions(req.query)
		const result = await getAllUsers(paginationOptions)

		res.status(200).json({
			success: true,
			data: result.users,
			pagination: result.pagination,
		})
	}
)

/**
 * @route   GET /api/v1/admin/users/:id
 * @desc    Get user by ID
 * @access  Private (Admin only)
 */
export const getUser = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const { id } = req.params

		try {
			const user = await getUserById(id)

			res.status(200).json({
				success: true,
				data: { user },
			})
		} catch (error: any) {
			throw new CustomError(error.message || 'User not found', 404)
		}
	}
)

/**
 * @route   PUT /api/v1/admin/users/:id
 * @desc    Update user
 * @access  Private (Admin only)
 */
export const updateUserAdmin = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const { id } = req.params

		try {
			const user = await updateUser(id, req.body)

			res.status(200).json({
				success: true,
				message: 'User updated successfully',
				data: { user },
			})
		} catch (error: any) {
			throw new CustomError(error.message || 'User not found', 404)
		}
	}
)

/**
 * @route   DELETE /api/v1/admin/users/:id
 * @desc    Delete user
 * @access  Private (Admin only)
 */
export const deleteUserAdmin = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const { id } = req.params
		const hardDelete = req.query.hardDelete === 'true'

		try {
			await deleteUser(id, hardDelete)

			res.status(200).json({
				success: true,
				message: 'User deleted successfully',
			})
		} catch (error: any) {
			throw new CustomError(error.message || 'User not found', 404)
		}
	}
)

/**
 * @route   GET /api/v1/admin/posts
 * @desc    Get all posts (including deleted) with pagination
 * @access  Private (Admin only)
 */
export const getPosts = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const paginationOptions = parsePaginationOptions(req.query)
		const result = await getAllPostsAdmin(paginationOptions)

		res.status(200).json({
			success: true,
			data: result.posts,
			pagination: result.pagination,
		})
	}
)

/**
 * @route   GET /api/v1/admin/comments
 * @desc    Get all comments (including deleted) with pagination
 * @access  Private (Admin only)
 */
export const getComments = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const paginationOptions = parsePaginationOptions(req.query)
		const result = await getAllCommentsAdmin(paginationOptions)

		res.status(200).json({
			success: true,
			data: result.comments,
			pagination: result.pagination,
		})
	}
)
