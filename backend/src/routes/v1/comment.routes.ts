import { Router } from 'express'
import {
	create,
	getByPost,
	getById,
	update,
	remove,
	getByAuthor,
} from '../../controllers/comment.controller'
import { validate } from '../../middleware/validation/validate.middleware'
import {
	validateCreateComment,
	validateUpdateComment,
} from '../../validators/comment'
import { authenticate } from '../../middleware/auth/authenticate.middleware'
import { activityLogger } from '../../middleware/logging/activityLogger.middleware'

const router = Router()

/**
 * @route   GET /api/v1/comments/post/:postId
 * @desc    Get all comments for a post with pagination
 * @access  Public
 */
router.get('/post/:postId', getByPost)

/**
 * @route   GET /api/v1/comments/author/:authorId
 * @desc    Get comments by author
 * @access  Public
 */
router.get('/author/:authorId', getByAuthor)

/**
 * @route   GET /api/v1/comments/:id
 * @desc    Get a single comment by ID
 * @access  Public
 */
router.get('/:id', getById)

/**
 * @route   POST /api/v1/comments
 * @desc    Create a new comment
 * @access  Private
 */
router.post(
	'/',
	authenticate,
	validate(validateCreateComment),
	activityLogger('comment_creation'),
	create
)

/**
 * @route   PUT /api/v1/comments/:id
 * @desc    Update a comment
 * @access  Private
 */
router.put(
	'/:id',
	authenticate,
	validate(validateUpdateComment),
	activityLogger('comment_update'),
	update
)

/**
 * @route   DELETE /api/v1/comments/:id
 * @desc    Delete a comment (soft delete)
 * @access  Private
 */
router.delete(
	'/:id',
	authenticate,
	activityLogger('comment_deletion'),
	remove
)

export default router
