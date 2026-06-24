import { Router } from 'express';
import authRoutes from './auth.routes';
import projectRoutes from './project.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);

// Health check endpoint
/**
 * @openapi
 * /api/health:
 *   get:
 *     summary: Verify server is running
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy
 */
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

export default router;
