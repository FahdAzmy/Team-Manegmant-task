import { Router } from "express";
import authRoutes from "./auth.routes";

const router = Router();

// Mount sub-routers
router.use("/auth", authRoutes);

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
router.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date() });
});

export default router;
