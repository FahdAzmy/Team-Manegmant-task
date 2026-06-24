"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const auth_validation_1 = require("../validation/auth.validation");
const router = (0, express_1.Router)();
/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: securePassword123
 *               role:
 *                 type: string
 *                 enum: [admin, member]
 *                 example: member
 *     responses:
 *       201:
 *         description: User registered successfully, refresh token set in HTTP-only cookie
 *       400:
 *         description: Bad request or user already exists
 */
router.post('/register', (0, validation_middleware_1.validate)(auth_validation_1.registerSchema), auth_controller_1.register);
/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: securePassword123
 *     responses:
 *       200:
 *         description: Login successful, refresh token set in HTTP-only cookie
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', (0, validation_middleware_1.validate)(auth_validation_1.loginSchema), auth_controller_1.login);
/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     summary: Get new access token using refresh token stored in cookie
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Returns new access token; rotates refresh token cookie
 *       401:
 *         description: Refresh token cookie not found
 *       403:
 *         description: Invalid or expired refresh token
 */
router.post('/refresh', auth_controller_1.refresh);
/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: Logout and clear refresh token cookie
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful, cookie cleared
 *       401:
 *         description: Unauthorized
 */
router.post('/logout', auth_middleware_1.authenticateJWT, auth_controller_1.logout);
/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Get profile of logged-in user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/me', auth_middleware_1.authenticateJWT, auth_controller_1.getMe);
exports.default = router;
