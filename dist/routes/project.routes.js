"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const project_controller_1 = require("../controllers/project.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const project_validation_1 = require("../validation/project.validation");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticateJWT);
/**
 * @openapi
 * /api/projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Website Redesign
 *               description:
 *                 type: string
 *                 example: Overhaul the company website frontend and backend.
 *               status:
 *                 type: string
 *                 enum: [active, completed, on-hold]
 *                 example: active
 *     responses:
 *       201:
 *         description: Project created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *
 *   get:
 *     summary: Get all projects (paginated)
 *     description: Members only see their own projects, while Admins see all projects.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [title, status, createdAt, updatedAt]
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Successfully retrieved projects list
 *       401:
 *         description: Unauthorized
 */
router.post('/', (0, validation_middleware_1.validate)(project_validation_1.createProjectSchema), project_controller_1.createProject);
router.get('/', project_controller_1.getProjects);
/**
 * @openapi
 * /api/projects/{id}:
 *   get:
 *     summary: Get a project by ID
 *     description: Accessible by the project owner or an admin.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project UUID
 *     responses:
 *       200:
 *         description: Project details retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - You do not have access to this project
 *       404:
 *         description: Project not found
 *
 *   put:
 *     summary: Update project details
 *     description: Accessible by the project owner or an admin.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Updated Website Redesign
 *               description:
 *                 type: string
 *                 example: Updated description details.
 *               status:
 *                 type: string
 *                 enum: [active, completed, on-hold]
 *                 example: completed
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - You do not have access to this project
 *       404:
 *         description: Project not found
 *
 *   delete:
 *     summary: Delete a project
 *     description: Accessible by the project owner or an admin.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project UUID
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - You do not have access to this project
 *       404:
 *         description: Project not found
 */
router.get('/:id', project_controller_1.getProjectById);
router.put('/:id', (0, validation_middleware_1.validate)(project_validation_1.updateProjectSchema), project_controller_1.updateProject);
router.delete('/:id', project_controller_1.deleteProject);
exports.default = router;
