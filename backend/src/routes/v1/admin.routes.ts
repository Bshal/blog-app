import { Router } from 'express'
import {
	createAdmin,
	getDashboard,
	getUsers,
	getUser,
	updateUserAdmin,
	deleteUserAdmin,
	getPosts,
	getComments,
} from '../../controllers/admin.controller'
import { authenticate } from '../../middleware/auth/authenticate.middleware'
import { authorize } from '../../middleware/auth/authorize.middleware'
import { activityLogger } from '../../middleware/logging/activityLogger.middleware'

const router = Router()

// All admin routes require authentication and admin role
router.use(authenticate)
router.use(authorize('admin'))

/**
 * @route   GET /api/v1/admin/dashboard
 * @desc    Get dashboard statistics
 * @access  Private (Admin only)
 */
router.get('/dashboard', getDashboard)

/**
 * @route   POST /api/v1/admin/create-admin
 * @desc    Create an admin user
 * @access  Private (Admin only)
 */
router.post(
	'/create-admin',
	activityLogger('admin_creation'),
	createAdmin
)

/**
 * @route   GET /api/v1/admin/users
 * @desc    Get all users with pagination
 * @access  Private (Admin only)
 */
router.get('/users', getUsers)

/**
 * @route   GET /api/v1/admin/users/:id
 * @desc    Get user by ID
 * @access  Private (Admin only)
 */
router.get('/users/:id', getUser)

/**
 * @route   PUT /api/v1/admin/users/:id
 * @desc    Update user
 * @access  Private (Admin only)
 */
router.put(
	'/users/:id',
	activityLogger('user_update'),
	updateUserAdmin
)

/**
 * @route   DELETE /api/v1/admin/users/:id
 * @desc    Delete user
 * @access  Private (Admin only)
 */
router.delete(
	'/users/:id',
	activityLogger('user_deletion'),
	deleteUserAdmin
)

/**
 * @route   GET /api/v1/admin/posts
 * @desc    Get all posts (including deleted) with pagination
 * @access  Private (Admin only)
 */
router.get('/posts', getPosts)

/**
 * @route   GET /api/v1/admin/comments
 * @desc    Get all comments (including deleted) with pagination
 * @access  Private (Admin only)
 */
router.get('/comments', getComments)

export default router
