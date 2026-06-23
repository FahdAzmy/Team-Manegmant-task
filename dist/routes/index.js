"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const router = (0, express_1.Router)();
// Mount sub-routers
router.use('/auth', auth_routes_1.default);
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
exports.default = router;
