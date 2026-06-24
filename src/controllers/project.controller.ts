import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/async.middleware';
import { ProjectService } from '../services/project.service';
import { ApiError } from '../utils/ApiError';
import { parsePagination, canAccess } from '../utils/controllerHelpers';


// @desc Create a new project
// @route post /api/projects
// @acces private
export const createProject = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { title, description, status } = req.body;
  const ownerId = req.user!.id;

  const project = await ProjectService.createProject({ title, description, status, ownerId });

  res.status(201).json({ message: 'Project created successfully', project });
});

// @desc Get all projects for the authenticated user
// @route get /api/projects
// @acces private
export const getProjects = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { page, limit, offset, sortBy, sortOrder } = parsePagination(req.query);
  const { id: userId, role } = req.user!;

  const result = role === 'admin'
    ? await ProjectService.getAllProjects({ limit, offset, sortBy, sortOrder })
    : await ProjectService.getUserProjects(userId, { limit, offset, sortBy, sortOrder });

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
export const getProjectById = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const { id: userId, role } = req.user!;

  const project = await ProjectService.getProjectById(id);
  if (!project) throw ApiError.notFound('Project not found');

  if (!canAccess(project.ownerId, userId, role)) {
    throw ApiError.forbidden('You do not have access to this project');
  }

  res.status(200).json({ project });
});

// @desc Update project details
// @route put /api/projects/:id
// @acces private
export const updateProject = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const { id: userId, role } = req.user!;

  const project = await ProjectService.getProjectById(id);
  if (!project) throw ApiError.notFound('Project not found');

  if (!canAccess(project.ownerId, userId, role)) {
    throw ApiError.forbidden('You do not have access to this project');
  }

  const updated = await ProjectService.updateProject(id, req.body);

  res.status(200).json({ message: 'Project updated successfully', project: updated });
});

// @desc Delete a project
// @route delete /api/projects/:id
// @acces private
export const deleteProject = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const { id: userId, role } = req.user!;

  const project = await ProjectService.getProjectById(id);
  if (!project) throw ApiError.notFound('Project not found');

  if (!canAccess(project.ownerId, userId, role)) {
    throw ApiError.forbidden('You do not have access to this project');
  }

  await ProjectService.deleteProject(id);

  res.status(200).json({ message: 'Project deleted successfully' });
});
