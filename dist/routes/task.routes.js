"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const task_controller_1 = require("../controllers/task.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const task_validation_1 = require("../validation/task.validation");
const router = (0, express_1.Router)({ mergeParams: true }); // mergeParams to access :projectId from parent router
router.use(auth_middleware_1.authenticateJWT);
/**
 * @openapi
 * /api/projects/{projectId}/tasks:
 *   post:
 *     summary: Create a task under a project
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
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
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Fix Login Bug
 *               description:
 *                 type: string
 *                 example: The login form doesn't validate emails.
 *               status:
 *                 type: string
 *                 enum: [Pending, In Progress, Done]
 *                 example: Pending
 *               priority:
 *                 type: string
 *                 enum: [Low, Medium, High]
 *                 example: High
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-12-31T00:00:00.000Z"
 *     responses:
 *       201:
 *         description: Task created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Project not found
 *
 *   get:
 *     summary: Get all tasks for a project (with filtering & pagination)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project UUID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pending, In Progress, Done]
 *         description: Filter by status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [Low, Medium, High]
 *         description: Filter by priority
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [title, status, priority, dueDate, createdAt, updatedAt]
 *           default: createdAt
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Paginated list of tasks
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Project not found
 */
router.post('/', (0, validation_middleware_1.validate)(task_validation_1.createTaskSchema), task_controller_1.createTask);
router.get('/', task_controller_1.getProjectTasks);
/**
 * @openapi
 * /api/projects/{projectId}/tasks/{taskId}:
 *   get:
 *     summary: Get a single task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project UUID
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: Task UUID
 *     responses:
 *       200:
 *         description: Task details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Project or Task not found
 *
 *   put:
 *     summary: Update a task (title, description, status, priority, dueDate)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project UUID
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: Task UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Updated Task Title
 *               description:
 *                 type: string
 *                 example: Updated description.
 *               status:
 *                 type: string
 *                 enum: [Pending, In Progress, Done]
 *                 example: Done
 *               priority:
 *                 type: string
 *                 enum: [Low, Medium, High]
 *                 example: Low
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-01-15T00:00:00.000Z"
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Project or Task not found
 *
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project UUID
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: Task UUID
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Project or Task not found
 */
router.get('/:taskId', task_controller_1.getTaskById);
router.put('/:taskId', (0, validation_middleware_1.validate)(task_validation_1.updateTaskSchema), task_controller_1.updateTask);
router.delete('/:taskId', task_controller_1.deleteTask);
exports.default = router;
