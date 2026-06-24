import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/async.middleware';
import { TaskService } from '../services/task.service';
import { ProjectService } from '../services/project.service';
import { ApiError } from '../utils/ApiError';
import { parsePagination, canAccess } from '../utils/controllerHelpers';

const VALID_STATUSES = ['Pending', 'In Progress', 'Done'] as const;
const VALID_PRIORITIES = ['Low', 'Medium', 'High'] as const;


// ─── Shared guard: resolve & authorize project ────────────────────────────────

const resolveProject = async (projectId: string, userId: string, role: string) => {
  const project = await ProjectService.getProjectById(projectId);
  if (!project) throw ApiError.notFound('Project not found');
  if (!canAccess(project.ownerId, userId, role)) {
    throw ApiError.forbidden('You do not have access to this project');
  }
  return project;
};

// @desc Create a task under a project
// @route post /api/projects/:projectId/tasks
// @acces private
export const createTask = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const projectId = req.params.projectId as string;
  const { id: userId, role } = req.user!;

  await resolveProject(projectId, userId, role);

  const { title, description, status, priority, dueDate } = req.body;
  const task = await TaskService.createTask({ title, description, status, priority, dueDate, projectId });

  res.status(201).json({ message: 'Task created successfully', task });
});

// @desc Get all tasks for a specific project
// @route get /api/projects/:projectId/tasks
// @acces private
export const getProjectTasks = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const projectId = req.params.projectId as string;
  const { id: userId, role } = req.user!;

  // Validate filter enums before anything else
  const statusParam = req.query.status as string | undefined;
  const priorityParam = req.query.priority as string | undefined;

  if (statusParam && !(VALID_STATUSES as readonly string[]).includes(statusParam)) {
    throw ApiError.badRequest('Validation error', [{ field: 'status', message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` }]);
  }
  if (priorityParam && !(VALID_PRIORITIES as readonly string[]).includes(priorityParam)) {
    throw ApiError.badRequest('Validation error', [{ field: 'priority', message: `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}` }]);
  }

  await resolveProject(projectId, userId, role);

  const { page, limit, offset, sortBy, sortOrder } = parsePagination(req.query);

  const result = await TaskService.getProjectTasks(projectId, {
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
export const getTaskById = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const projectId = req.params.projectId as string;
  const taskId = req.params.taskId as string;
  const { id: userId, role } = req.user!;

  await resolveProject(projectId, userId, role);

  const task = await TaskService.getTaskByIdAndProject(taskId, projectId);
  if (!task) throw ApiError.notFound('Task not found');

  res.status(200).json({ task });
});

// @desc Update task details
// @route put /api/projects/:projectId/tasks/:taskId
// @acces private
export const updateTask = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const projectId = req.params.projectId as string;
  const taskId = req.params.taskId as string;
  const { id: userId, role } = req.user!;

  await resolveProject(projectId, userId, role);

  const task = await TaskService.getTaskByIdAndProject(taskId, projectId);
  if (!task) throw ApiError.notFound('Task not found');

  const updated = await TaskService.updateTask(taskId, req.body);

  res.status(200).json({ message: 'Task updated successfully', task: updated });
});

// @desc Delete a task
// @route delete /api/projects/:projectId/tasks/:taskId
// @acces private
export const deleteTask = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const projectId = req.params.projectId as string;
  const taskId = req.params.taskId as string;
  const { id: userId, role } = req.user!;

  await resolveProject(projectId, userId, role);

  const task = await TaskService.getTaskByIdAndProject(taskId, projectId);
  if (!task) throw ApiError.notFound('Task not found');

  await TaskService.deleteTask(taskId);

  res.status(200).json({ message: 'Task deleted successfully' });
});
