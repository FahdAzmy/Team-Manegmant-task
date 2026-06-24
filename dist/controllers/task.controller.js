"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTask = exports.updateTask = exports.getTaskById = exports.getProjectTasks = exports.createTask = void 0;
const async_middleware_1 = require("../middleware/async.middleware");
const task_service_1 = require("../services/task.service");
const project_service_1 = require("../services/project.service");
const ApiError_1 = require("../utils/ApiError");
const controllerHelpers_1 = require("../utils/controllerHelpers");
const VALID_STATUSES = ['Pending', 'In Progress', 'Done'];
const VALID_PRIORITIES = ['Low', 'Medium', 'High'];
// ─── Shared guard: resolve & authorize project ────────────────────────────────
const resolveProject = async (projectId, userId, role) => {
    const project = await project_service_1.ProjectService.getProjectById(projectId);
    if (!project)
        throw ApiError_1.ApiError.notFound('Project not found');
    if (!(0, controllerHelpers_1.canAccess)(project.ownerId, userId, role)) {
        throw ApiError_1.ApiError.forbidden('You do not have access to this project');
    }
    return project;
};
// @desc Create a task under a project
// @route post /api/projects/:projectId/tasks
// @acces private
exports.createTask = (0, async_middleware_1.asyncHandler)(async (req, res) => {
    const projectId = req.params.projectId;
    const { id: userId, role } = req.user;
    await resolveProject(projectId, userId, role);
    const { title, description, status, priority, dueDate } = req.body;
    const task = await task_service_1.TaskService.createTask({ title, description, status, priority, dueDate, projectId });
    res.status(201).json({ message: 'Task created successfully', task });
});
// @desc Get all tasks for a specific project
// @route get /api/projects/:projectId/tasks
// @acces private
exports.getProjectTasks = (0, async_middleware_1.asyncHandler)(async (req, res) => {
    const projectId = req.params.projectId;
    const { id: userId, role } = req.user;
    // Validate filter enums before anything else
    const statusParam = req.query.status;
    const priorityParam = req.query.priority;
    if (statusParam && !VALID_STATUSES.includes(statusParam)) {
        throw ApiError_1.ApiError.badRequest('Validation error', [{ field: 'status', message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` }]);
    }
    if (priorityParam && !VALID_PRIORITIES.includes(priorityParam)) {
        throw ApiError_1.ApiError.badRequest('Validation error', [{ field: 'priority', message: `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}` }]);
    }
    await resolveProject(projectId, userId, role);
    const { page, limit, offset, sortBy, sortOrder } = (0, controllerHelpers_1.parsePagination)(req.query);
    const result = await task_service_1.TaskService.getProjectTasks(projectId, {
        status: statusParam,
        priority: priorityParam,
        limit,
        offset,
        sortBy,
        sortOrder,
    });
    res.status(200).json({
        tasks: result.rows,
        pagination: {
            total: result.count,
            page,
            limit,
            totalPages: Math.ceil(result.count / limit),
        },
    });
});
// @desc Get a single task by ID
// @route get /api/projects/:projectId/tasks/:taskId
// @acces private
exports.getTaskById = (0, async_middleware_1.asyncHandler)(async (req, res) => {
    const projectId = req.params.projectId;
    const taskId = req.params.taskId;
    const { id: userId, role } = req.user;
    await resolveProject(projectId, userId, role);
    const task = await task_service_1.TaskService.getTaskByIdAndProject(taskId, projectId);
    if (!task)
        throw ApiError_1.ApiError.notFound('Task not found');
    res.status(200).json({ task });
});
// @desc Update task details
// @route put /api/projects/:projectId/tasks/:taskId
// @acces private
exports.updateTask = (0, async_middleware_1.asyncHandler)(async (req, res) => {
    const projectId = req.params.projectId;
    const taskId = req.params.taskId;
    const { id: userId, role } = req.user;
    await resolveProject(projectId, userId, role);
    const task = await task_service_1.TaskService.getTaskByIdAndProject(taskId, projectId);
    if (!task)
        throw ApiError_1.ApiError.notFound('Task not found');
    const updated = await task_service_1.TaskService.updateTask(taskId, req.body);
    res.status(200).json({ message: 'Task updated successfully', task: updated });
});
// @desc Delete a task
// @route delete /api/projects/:projectId/tasks/:taskId
// @acces private
exports.deleteTask = (0, async_middleware_1.asyncHandler)(async (req, res) => {
    const projectId = req.params.projectId;
    const taskId = req.params.taskId;
    const { id: userId, role } = req.user;
    await resolveProject(projectId, userId, role);
    const task = await task_service_1.TaskService.getTaskByIdAndProject(taskId, projectId);
    if (!task)
        throw ApiError_1.ApiError.notFound('Task not found');
    await task_service_1.TaskService.deleteTask(taskId);
    res.status(200).json({ message: 'Task deleted successfully' });
});
