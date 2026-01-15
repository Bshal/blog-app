import { Request, Response, NextFunction } from 'express'
import { asyncHandler } from '../middleware/error-handling/errorHandler.middleware'
import User from '../models/User.model'
import Post from '../models/Post.model'
import Comment from '../models/Comment.model'

/**
 * @route   GET /api/v1/stats
 * @desc    Get public statistics (total users, posts, comments)
 * @access  Public
 */
export const getPublicStats = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const [totalUsers, totalPosts, totalComments] = await Promise.all([
			User.countDocuments(),
			Post.countDocuments({ isDeleted: false }),
			Comment.countDocuments({ isDeleted: false }),
		])

		res.status(200).json({
			success: true,
			data: {
				totalUsers,
				totalPosts,
				totalComments,
			},
		})
	}
)
