import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/async.middleware';
import { ProjectService } from '../services/project.service';
import { ApiError } from '../utils/ApiError';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const parsePagination = (query: any) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  const offset = (page - 1) * limit;
  const sortBy = query.sortBy || 'createdAt';
  const sortOrder: 'ASC' | 'DESC' = query.sortOrder === 'ASC' ? 'ASC' : 'DESC';
  return { page, limit, offset, sortBy, sortOrder };
};

const canAccess = (ownerId: string, userId: string, role: string): boolean =>
  role === 'admin' || ownerId === userId;

// ─── Controllers ─────────────────────────────────────────────────────────────

export const createProject = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { title, description, status } = req.body;
  const ownerId = req.user!.id;

  const project = await ProjectService.createProject({ title, description, status, ownerId });

  res.status(201).json({ message: 'Project created successfully', project });
});

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
