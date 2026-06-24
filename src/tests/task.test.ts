import request from 'supertest';
import app from '../app';
import { TaskService } from '../services/task.service';
import { ProjectService } from '../services/project.service';
import { UserService } from '../services/user.service';
import jwt from 'jsonwebtoken';

jest.mock('../services/task.service');
jest.mock('../services/project.service');
jest.mock('../services/user.service');

const jwtSecret = process.env.JWT_SECRET || 'super-secret-jwt-key-replace-in-production';

const makeToken = (id = 'user-uuid-1', email = 'test@example.com', role = 'member') =>
  jwt.sign({ id, email, role }, jwtSecret, { expiresIn: '1h' });

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockMemberUser = {
  id: 'user-uuid-1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'member',
};

const mockAdminUser = {
  id: 'admin-uuid-1',
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'admin',
};

const mockProject = {
  id: 'project-uuid-1',
  title: 'My Project',
  description: 'A test project',
  status: 'active',
  ownerId: 'user-uuid-1',
};

const mockTask = {
  id: 'task-uuid-1',
  title: 'Fix Bug',
  description: 'Fix the login bug',
  status: 'Pending',
  priority: 'High',
  dueDate: '2025-12-31T00:00:00.000Z',
  projectId: 'project-uuid-1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const memberToken = makeToken();
const adminToken = makeToken('admin-uuid-1', 'admin@example.com', 'admin');

const setupMemberAuth = () => {
  (UserService.getUserById as jest.Mock).mockResolvedValue(mockMemberUser);
};

const setupAdminAuth = () => {
  (UserService.getUserById as jest.Mock).mockResolvedValue(mockAdminUser);
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Task API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── POST /api/projects/:projectId/tasks ─────────────────────────────────────
  describe('POST /api/projects/:projectId/tasks', () => {
    it('should return 401 for unauthenticated requests', async () => {
      const res = await request(app)
        .post('/api/projects/project-uuid-1/tasks')
        .send({ title: 'Test Task' });
      expect(res.status).toBe(401);
    });

    it('should return 404 if project does not exist', async () => {
      setupMemberAuth();
      (ProjectService.getProjectById as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post('/api/projects/nonexistent/tasks')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ title: 'Test Task' });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Project not found');
    });

    it('should return 403 if member tries to add task to another user project', async () => {
      setupMemberAuth();
      (ProjectService.getProjectById as jest.Mock).mockResolvedValue({
        ...mockProject,
        ownerId: 'another-user',
      });

      const res = await request(app)
        .post('/api/projects/project-uuid-1/tasks')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ title: 'Test Task' });

      expect(res.status).toBe(403);
    });

    it('should return 400 if title is missing', async () => {
      setupMemberAuth();
      (ProjectService.getProjectById as jest.Mock).mockResolvedValue(mockProject);

      const res = await request(app)
        .post('/api/projects/project-uuid-1/tasks')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ description: 'No title' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Validation error');
    });

    it('should return 400 if status is invalid enum', async () => {
      setupMemberAuth();
      (ProjectService.getProjectById as jest.Mock).mockResolvedValue(mockProject);

      const res = await request(app)
        .post('/api/projects/project-uuid-1/tasks')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ title: 'Task', status: 'InvalidStatus' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Validation error');
    });

    it('should return 400 if priority is invalid enum', async () => {
      setupMemberAuth();
      (ProjectService.getProjectById as jest.Mock).mockResolvedValue(mockProject);

      const res = await request(app)
        .post('/api/projects/project-uuid-1/tasks')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ title: 'Task', priority: 'Critical' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Validation error');
    });

    it('should create a task and return 201', async () => {
      setupMemberAuth();
      (ProjectService.getProjectById as jest.Mock).mockResolvedValue(mockProject);
      (TaskService.createTask as jest.Mock).mockResolvedValue(mockTask);

      const res = await request(app)
        .post('/api/projects/project-uuid-1/tasks')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ title: 'Fix Bug', priority: 'High' });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Task created successfully');
      expect(res.body.task.title).toBe('Fix Bug');
      expect(TaskService.createTask).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Fix Bug', projectId: 'project-uuid-1' })
      );
    });

    it('should allow admin to create task in any project', async () => {
      setupAdminAuth();
      (ProjectService.getProjectById as jest.Mock).mockResolvedValue({
        ...mockProject,
        ownerId: 'other-user',
      });
      (TaskService.createTask as jest.Mock).mockResolvedValue(mockTask);

      const res = await request(app)
        .post('/api/projects/project-uuid-1/tasks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Admin Task' });

      expect(res.status).toBe(201);
    });
  });

  // ── GET /api/projects/:projectId/tasks ──────────────────────────────────────
  describe('GET /api/projects/:projectId/tasks', () => {
    it('should return 401 for unauthenticated requests', async () => {
      const res = await request(app).get('/api/projects/project-uuid-1/tasks');
      expect(res.status).toBe(401);
    });

    it('should return 404 if project does not exist', async () => {
      setupMemberAuth();
      (ProjectService.getProjectById as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .get('/api/projects/nonexistent/tasks')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Project not found');
    });

    it('should return 403 if member tries to get tasks from another user project', async () => {
      setupMemberAuth();
      (ProjectService.getProjectById as jest.Mock).mockResolvedValue({
        ...mockProject,
        ownerId: 'another-user',
      });

      const res = await request(app)
        .get('/api/projects/project-uuid-1/tasks')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(403);
    });

    it('should return paginated tasks for the project', async () => {
      setupMemberAuth();
      (ProjectService.getProjectById as jest.Mock).mockResolvedValue(mockProject);
      (TaskService.getProjectTasks as jest.Mock).mockResolvedValue({
        rows: [mockTask],
        count: 1,
      });

      const res = await request(app)
        .get('/api/projects/project-uuid-1/tasks')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(200);
      expect(res.body.tasks).toHaveLength(1);
      expect(res.body.pagination).toMatchObject({ total: 1, page: 1 });
    });

    it('should filter tasks by status', async () => {
      setupMemberAuth();
      (ProjectService.getProjectById as jest.Mock).mockResolvedValue(mockProject);
      (TaskService.getProjectTasks as jest.Mock).mockResolvedValue({ rows: [mockTask], count: 1 });

      const res = await request(app)
        .get('/api/projects/project-uuid-1/tasks?status=Pending')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(200);
      expect(TaskService.getProjectTasks).toHaveBeenCalledWith(
        'project-uuid-1',
        expect.objectContaining({ status: 'Pending' })
      );
    });

    it('should filter tasks by priority', async () => {
      setupMemberAuth();
      (ProjectService.getProjectById as jest.Mock).mockResolvedValue(mockProject);
      (TaskService.getProjectTasks as jest.Mock).mockResolvedValue({ rows: [mockTask], count: 1 });

      const res = await request(app)
        .get('/api/projects/project-uuid-1/tasks?priority=High')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(200);
      expect(TaskService.getProjectTasks).toHaveBeenCalledWith(
        'project-uuid-1',
        expect.objectContaining({ priority: 'High' })
      );
    });

    it('should return 400 for invalid status filter', async () => {
      setupMemberAuth();
      (ProjectService.getProjectById as jest.Mock).mockResolvedValue(mockProject);

      const res = await request(app)
        .get('/api/projects/project-uuid-1/tasks?status=invalid')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(400);
    });

    it('should respect pagination query params', async () => {
      setupMemberAuth();
      (ProjectService.getProjectById as jest.Mock).mockResolvedValue(mockProject);
      (TaskService.getProjectTasks as jest.Mock).mockResolvedValue({ rows: [], count: 0 });

      const res = await request(app)
        .get('/api/projects/project-uuid-1/tasks?page=2&limit=5&sortBy=priority&sortOrder=ASC')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(200);
      expect(TaskService.getProjectTasks).toHaveBeenCalledWith('project-uuid-1', {
        status: undefined,
        priority: undefined,
        limit: 5,
        offset: 5,
        sortBy: 'priority',
        sortOrder: 'ASC',
      });
    });
  });

  // ── GET /api/projects/:projectId/tasks/:taskId ──────────────────────────────
  describe('GET /api/projects/:projectId/tasks/:taskId', () => {
    it('should return 401 for unauthenticated requests', async () => {
      const res = await request(app).get('/api/projects/project-uuid-1/tasks/task-uuid-1');
      expect(res.status).toBe(401);
    });

    it('should return 404 if project not found', async () => {
      setupMemberAuth();
      (ProjectService.getProjectById as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .get('/api/projects/nonexistent/tasks/task-uuid-1')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Project not found');
    });

    it('should return 403 if member tries to access task from another user project', async () => {
      setupMemberAuth();
      (ProjectService.getProjectById as jest.Mock).mockResolvedValue({
        ...mockProject,
        ownerId: 'another-user',
      });

      const res = await request(app)
        .get('/api/projects/project-uuid-1/tasks/task-uuid-1')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(403);
    });

    it('should return 404 if task not found in project', async () => {
      setupMemberAuth();
      (ProjectService.getProjectById as jest.Mock).mockResolvedValue(mockProject);
      (TaskService.getTaskByIdAndProject as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .get('/api/projects/project-uuid-1/tasks/nonexistent-task')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Task not found');
    });

    it('should return task for project owner', async () => {
      setupMemberAuth();
      (ProjectService.getProjectById as jest.Mock).mockResolvedValue(mockProject);
      (TaskService.getTaskByIdAndProject as jest.Mock).mockResolvedValue(mockTask);

      const res = await request(app)
        .get('/api/projects/project-uuid-1/tasks/task-uuid-1')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(200);
      expect(res.body.task.id).toBe('task-uuid-1');
    });

    it('should allow admin to get any task', async () => {
      setupAdminAuth();
      (ProjectService.getProjectById as jest.Mock).mockResolvedValue({
        ...mockProject,
        ownerId: 'other-user',
      });
      (TaskService.getTaskByIdAndProject as jest.Mock).mockResolvedValue(mockTask);

      const res = await request(app)
        .get('/api/projects/project-uuid-1/tasks/task-uuid-1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });
  });

  // ── PUT /api/projects/:projectId/tasks/:taskId ──────────────────────────────
  describe('PUT /api/projects/:projectId/tasks/:taskId', () => {
    it('should return 401 for unauthenticated requests', async () => {
      const res = await request(app)
        .put('/api/projects/project-uuid-1/tasks/task-uuid-1')
        .send({ status: 'Done' });
      expect(res.status).toBe(401);
    });

    it('should return 404 if project not found', async () => {
      setupMemberAuth();
      (ProjectService.getProjectById as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .put('/api/projects/nonexistent/tasks/task-uuid-1')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ title: 'Updated' });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Project not found');
    });

    it('should return 403 if member tries to update task in another user project', async () => {
      setupMemberAuth();
      (ProjectService.getProjectById as jest.Mock).mockResolvedValue({
        ...mockProject,
        ownerId: 'another-user',
      });

      const res = await request(app)
        .put('/api/projects/project-uuid-1/tasks/task-uuid-1')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ title: 'Updated' });

      expect(res.status).toBe(403);
    });

    it('should return 404 if task not found in project', async () => {
      setupMemberAuth();
      (ProjectService.getProjectById as jest.Mock).mockResolvedValue(mockProject);
      (TaskService.getTaskByIdAndProject as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .put('/api/projects/project-uuid-1/tasks/nonexistent-task')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ title: 'Updated' });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Task not found');
    });

    it('should return 400 if status value is invalid', async () => {
      setupMemberAuth();
      (ProjectService.getProjectById as jest.Mock).mockResolvedValue(mockProject);
      (TaskService.getTaskByIdAndProject as jest.Mock).mockResolvedValue(mockTask);

      const res = await request(app)
        .put('/api/projects/project-uuid-1/tasks/task-uuid-1')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ status: 'INVALID' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Validation error');
    });

    it('should update task status and return 200', async () => {
      setupMemberAuth();
      (ProjectService.getProjectById as jest.Mock).mockResolvedValue(mockProject);
      (TaskService.getTaskByIdAndProject as jest.Mock).mockResolvedValue(mockTask);
      (TaskService.updateTask as jest.Mock).mockResolvedValue({
        ...mockTask,
        status: 'Done',
      });

      const res = await request(app)
        .put('/api/projects/project-uuid-1/tasks/task-uuid-1')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ status: 'Done' });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Task updated successfully');
      expect(res.body.task.status).toBe('Done');
    });

    it('should allow admin to update any task', async () => {
      setupAdminAuth();
      (ProjectService.getProjectById as jest.Mock).mockResolvedValue({
        ...mockProject,
        ownerId: 'other-user',
      });
      (TaskService.getTaskByIdAndProject as jest.Mock).mockResolvedValue(mockTask);
      (TaskService.updateTask as jest.Mock).mockResolvedValue({ ...mockTask, title: 'Admin Updated' });

      const res = await request(app)
        .put('/api/projects/project-uuid-1/tasks/task-uuid-1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Admin Updated' });

      expect(res.status).toBe(200);
    });
  });

  // ── DELETE /api/projects/:projectId/tasks/:taskId ───────────────────────────
  describe('DELETE /api/projects/:projectId/tasks/:taskId', () => {
    it('should return 401 for unauthenticated requests', async () => {
      const res = await request(app).delete('/api/projects/project-uuid-1/tasks/task-uuid-1');
      expect(res.status).toBe(401);
    });

    it('should return 404 if project not found', async () => {
      setupMemberAuth();
      (ProjectService.getProjectById as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .delete('/api/projects/nonexistent/tasks/task-uuid-1')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Project not found');
    });

    it('should return 403 if member tries to delete task from another user project', async () => {
      setupMemberAuth();
      (ProjectService.getProjectById as jest.Mock).mockResolvedValue({
        ...mockProject,
        ownerId: 'another-user',
      });

      const res = await request(app)
        .delete('/api/projects/project-uuid-1/tasks/task-uuid-1')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(403);
    });

    it('should return 404 if task not found in project', async () => {
      setupMemberAuth();
      (ProjectService.getProjectById as jest.Mock).mockResolvedValue(mockProject);
      (TaskService.getTaskByIdAndProject as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .delete('/api/projects/project-uuid-1/tasks/nonexistent-task')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Task not found');
    });

    it('should delete task and return 200 for project owner', async () => {
      setupMemberAuth();
      (ProjectService.getProjectById as jest.Mock).mockResolvedValue(mockProject);
      (TaskService.getTaskByIdAndProject as jest.Mock).mockResolvedValue(mockTask);
      (TaskService.deleteTask as jest.Mock).mockResolvedValue(1);

      const res = await request(app)
        .delete('/api/projects/project-uuid-1/tasks/task-uuid-1')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Task deleted successfully');
    });

    it('should allow admin to delete any task', async () => {
      setupAdminAuth();
      (ProjectService.getProjectById as jest.Mock).mockResolvedValue({
        ...mockProject,
        ownerId: 'other-user',
      });
      (TaskService.getTaskByIdAndProject as jest.Mock).mockResolvedValue(mockTask);
      (TaskService.deleteTask as jest.Mock).mockResolvedValue(1);

      const res = await request(app)
        .delete('/api/projects/project-uuid-1/tasks/task-uuid-1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });
  });
});
