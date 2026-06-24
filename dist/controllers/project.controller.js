"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProject = exports.updateProject = exports.getProjectById = exports.getProjects = exports.createProject = void 0;
const async_middleware_1 = require("../middleware/async.middleware");
const project_service_1 = require("../services/project.service");
const ApiError_1 = require("../utils/ApiError");
const controllerHelpers_1 = require("../utils/controllerHelpers");
// @desc Create a new project
// @route post /api/projects
// @acces private
exports.createProject = (0, async_middleware_1.asyncHandler)(async (req, res) => {
    const { title, description, status } = req.body;
    const ownerId = req.user.id;
    const project = await project_service_1.ProjectService.createProject({ title, description, status, ownerId });
    res.status(201).json({ message: 'Project created successfully', project });
});
// @desc Get all projects for the authenticated user
// @route get /api/projects
// @acces private
exports.getProjects = (0, async_middleware_1.asyncHandler)(async (req, res) => {
    const { page, limit, offset, sortBy, sortOrder } = (0, controllerHelpers_1.parsePagination)(req.query);
    const { id: userId, role } = req.user;
    const result = role === 'admin'
        ? await project_service_1.ProjectService.getAllProjects({ limit, offset, sortBy, sortOrder })
        : await project_service_1.ProjectService.getUserProjects(userId, { limit, offset, sortBy, sortOrder });
    res.status(200).json({
        projects: result.rows,
        pagination: {
            total: result.count,
            page,
            limit,
            totalPages: Math.ceil(result.count / limit),
        },
    });
});
// @desc Get a single project by ID
// @route get /api/projects/:id
// @acces private
exports.getProjectById = (0, async_middleware_1.asyncHandler)(async (req, res) => {
    const id = req.params.id;
    const { id: userId, role } = req.user;
    const project = await project_service_1.ProjectService.getProjectById(id);
    if (!project)
        throw ApiError_1.ApiError.notFound('Project not found');
    if (!(0, controllerHelpers_1.canAccess)(project.ownerId, userId, role)) {
        throw ApiError_1.ApiError.forbidden('You do not have access to this project');
    }
    res.status(200).json({ project });
});
// @desc Update project details
// @route put /api/projects/:id
// @acces private
exports.updateProject = (0, async_middleware_1.asyncHandler)(async (req, res) => {
    const id = req.params.id;
    const { id: userId, role } = req.user;
    const project = await project_service_1.ProjectService.getProjectById(id);
    if (!project)
        throw ApiError_1.ApiError.notFound('Project not found');
    if (!(0, controllerHelpers_1.canAccess)(project.ownerId, userId, role)) {
        throw ApiError_1.ApiError.forbidden('You do not have access to this project');
    }
    const updated = await project_service_1.ProjectService.updateProject(id, req.body);
    res.status(200).json({ message: 'Project updated successfully', project: updated });
});
// @desc Delete a project
// @route delete /api/projects/:id
// @acces private
exports.deleteProject = (0, async_middleware_1.asyncHandler)(async (req, res) => {
    const id = req.params.id;
    const { id: userId, role } = req.user;
    const project = await project_service_1.ProjectService.getProjectById(id);
    if (!project)
        throw ApiError_1.ApiError.notFound('Project not found');
    if (!(0, controllerHelpers_1.canAccess)(project.ownerId, userId, role)) {
        throw ApiError_1.ApiError.forbidden('You do not have access to this project');
    }
    await project_service_1.ProjectService.deleteProject(id);
    res.status(200).json({ message: 'Project deleted successfully' });
});
