import { Router } from 'express'
import { getPublicStats } from '../../controllers/stats.controller'

const router = Router()

/**
 * @route   GET /api/v1/stats
 * @desc    Get public statistics
 * @access  Public
 */
router.get('/', getPublicStats)

export default router
