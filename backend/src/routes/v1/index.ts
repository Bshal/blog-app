import { Router } from 'express';

const router = Router();

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API v1 is running',
    version: '1.0.0',
  });
});

// Route imports
import authRoutes from './auth.routes';
import adminRoutes from './admin.routes';
import postRoutes from './post.routes';
import commentRoutes from './comment.routes';
import statsRoutes from './stats.routes';

// Mount routes
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/posts', postRoutes);
router.use('/comments', commentRoutes);
router.use('/stats', statsRoutes);
// router.use('/users', userRoutes);

export default router;
