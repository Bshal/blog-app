import { Router } from 'express'
import {
	create,
	getAll,
	getById,
	update,
	remove,
	getByAuthor,
} from '../../controllers/post.controller'
import { validate } from '../../middleware/validation/validate.middleware'
import {
	validateCreatePost,
	validateUpdatePost,
} from '../../validators/post'
import { authenticate } from '../../middleware/auth/authenticate.middleware'
import { activityLogger } from '../../middleware/logging/activityLogger.middleware'

const router = Router()

/**
 * @route   GET /api/v1/posts
 * @desc    Get all posts with pagination
 * @access  Public
 */
router.get('/', getAll)

/**
 * @route   GET /api/v1/posts/author/:authorId
 * @desc    Get posts by author
 * @access  Public
 */
router.get('/author/:authorId', getByAuthor)

/**
 * @route   GET /api/v1/posts/:id
 * @desc    Get a single post by ID or slug
 * @access  Public
 */
router.get('/:id', getById)

/**
 * @route   POST /api/v1/posts
 * @desc    Create a new post
 * @access  Private
 */
router.post(
	'/',
	authenticate,
	validate(validateCreatePost),
	activityLogger('post_creation'),
	create
)

/**
 * @route   PUT /api/v1/posts/:id
 * @desc    Update a post
 * @access  Private
 */
router.put(
	'/:id',
	authenticate,
	validate(validateUpdatePost),
	activityLogger('post_update'),
	update
)

/**
 * @route   DELETE /api/v1/posts/:id
 * @desc    Delete a post (soft delete)
 * @access  Private
 */
router.delete(
	'/:id',
	authenticate,
	activityLogger('post_deletion'),
	remove
)

export default router
