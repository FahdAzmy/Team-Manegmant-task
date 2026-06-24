import request from 'supertest';
import app from '../app';
import { ProjectService } from '../services/project.service';
import { UserService } from '../services/user.service';
import jwt from 'jsonwebtoken';

jest.mock('../services/project.service');
jest.mock('../services/user.service');

const jwtSecret = process.env.JWT_SECRET || 'super-secret-jwt-key-replace-in-production';

/** Helper: generate a valid JWT for testing */
const makeToken = (id = 'user-uuid-1', email = 'test@example.com', role = 'member') =>
  jwt.sign({ id, email, role }, jwtSecret, { expiresIn: '1h' });

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
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('Project API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── POST /api/projects ─────────────────────────────────────────────────────
  describe('POST /api/projects', () => {
    it('should return 401 for unauthenticated requests', async () => {
      const res = await request(app).post('/api/projects').send({ title: 'Test' });
      expect(res.status).toBe(401);
    });

    it('should return 400 if title is missing', async () => {
      (UserService.getUserById as jest.Mock).mockResolvedValue(mockMemberUser);

      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ description: 'No title here' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Validation error');
    });

    it('should return 400 if title is empty string', async () => {
      (UserService.getUserById as jest.Mock).mockResolvedValue(mockMemberUser);

      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ title: '   ' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Validation error');
    });

    it('should return 400 if status is invalid enum value', async () => {
      (UserService.getUserById as jest.Mock).mockResolvedValue(mockMemberUser);

      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ title: 'Valid Title', status: 'invalid-status' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Validation error');
    });

    it('should create a project and return 201 with default status', async () => {
      (UserService.getUserById as jest.Mock).mockResolvedValue(mockMemberUser);
      (ProjectService.createProject as jest.Mock).mockResolvedValue(mockProject);

      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ title: 'My Project', description: 'A test project' });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Project created successfully');
      expect(res.body.project.title).toBe('My Project');
      expect(ProjectService.createProject).toHaveBeenCalledWith({
        title: 'My Project',
        description: 'A test project',
        status: undefined,
        ownerId: 'user-uuid-1',
      });
    });
  });

  // ── GET /api/projects ──────────────────────────────────────────────────────
  describe('GET /api/projects', () => {
    it('should return 401 for unauthenticated requests', async () => {
      const res = await request(app).get('/api/projects');
      expect(res.status).toBe(401);
    });

    it('should return only own projects for a member', async () => {
      (UserService.getUserById as jest.Mock).mockResolvedValue(mockMemberUser);
      (ProjectService.getUserProjects as jest.Mock).mockResolvedValue({
        rows: [mockProject],
        count: 1,
      });

      const res = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${makeToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.projects).toHaveLength(1);
      expect(res.body.pagination).toMatchObject({ total: 1, page: 1 });
      expect(ProjectService.getUserProjects).toHaveBeenCalled();
      expect(ProjectService.getAllProjects).not.toHaveBeenCalled();
    });

    it('should return all projects for admin', async () => {
      (UserService.getUserById as jest.Mock).mockResolvedValue(mockAdminUser);
      (ProjectService.getAllProjects as jest.Mock).mockResolvedValue({
        rows: [mockProject],
        count: 1,
      });

      const res = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${makeToken('admin-uuid-1', 'admin@example.com', 'admin')}`);

      expect(res.status).toBe(200);
      expect(res.body.projects).toHaveLength(1);
      expect(ProjectService.getAllProjects).toHaveBeenCalled();
      expect(ProjectService.getUserProjects).not.toHaveBeenCalled();
    });

    it('should respect pagination query params', async () => {
      (UserService.getUserById as jest.Mock).mockResolvedValue(mockMemberUser);
      (ProjectService.getUserProjects as jest.Mock).mockResolvedValue({ rows: [], count: 0 });

      const res = await request(app)
        .get('/api/projects?page=2&limit=5&sortBy=title&sortOrder=ASC')
        .set('Authorization', `Bearer ${makeToken()}`);

      expect(res.status).toBe(200);
      expect(ProjectService.getUserProjects).toHaveBeenCalledWith('user-uuid-1', {
        limit: 5,
        offset: 5,
        sortBy: 'title',
        sortOrder: 'ASC',
      });
    });
  });

  // ── GET /api/projects/:id ──────────────────────────────────────────────────
  describe('GET /api/projects/:id', () => {
    it('should return 404 if project not found', async () => {
      (UserService.getUserById as jest.Mock).mockResolvedValue(mockMemberUser);
      (ProjectService.getProjectById as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .get('/api/projects/nonexistent-id')
        .set('Authorization', `Bearer ${makeToken()}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Project not found');
    });

    it('should return 403 if member tries to access another user project', async () => {
      (UserService.getUserById as jest.Mock).mockResolvedValue(mockMemberUser);
      (ProjectService.getProjectById as jest.Mock).mockResolvedValue({
        ...mockProject,
        ownerId: 'another-user-id',
      });

      const res = await request(app)
        .get('/api/projects/project-uuid-1')
        .set('Authorization', `Bearer ${makeToken()}`);

      expect(res.status).toBe(403);
    });

    it('should return 200 for project owner', async () => {
      (UserService.getUserById as jest.Mock).mockResolvedValue(mockMemberUser);
      (ProjectService.getProjectById as jest.Mock).mockResolvedValue(mockProject);

      const res = await request(app)
        .get('/api/projects/project-uuid-1')
        .set('Authorization', `Bearer ${makeToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.project.id).toBe('project-uuid-1');
    });

    it('should allow admin to access any project', async () => {
      (UserService.getUserById as jest.Mock).mockResolvedValue(mockAdminUser);
      (ProjectService.getProjectById as jest.Mock).mockResolvedValue({
        ...mockProject,
        ownerId: 'some-other-user',
      });

      const res = await request(app)
        .get('/api/projects/project-uuid-1')
        .set('Authorization', `Bearer ${makeToken('admin-uuid-1', 'admin@example.com', 'admin')}`);

      expect(res.status).toBe(200);
    });
  });

  // ── PUT /api/projects/:id ──────────────────────────────────────────────────
  describe('PUT /api/projects/:id', () => {
    it('should return 404 if project not found', async () => {
      (UserService.getUserById as jest.Mock).mockResolvedValue(mockMemberUser);
      (ProjectService.getProjectById as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .put('/api/projects/nonexistent-id')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ title: 'Updated' });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Project not found');
    });

    it('should return 403 if member tries to update another user project', async () => {
      (UserService.getUserById as jest.Mock).mockResolvedValue(mockMemberUser);
      (ProjectService.getProjectById as jest.Mock).mockResolvedValue({
        ...mockProject,
        ownerId: 'another-user-id',
      });

      const res = await request(app)
        .put('/api/projects/project-uuid-1')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ title: 'Updated' });

      expect(res.status).toBe(403);
    });

    it('should return 400 if update body has invalid status', async () => {
      (UserService.getUserById as jest.Mock).mockResolvedValue(mockMemberUser);
      (ProjectService.getProjectById as jest.Mock).mockResolvedValue(mockProject);

      const res = await request(app)
        .put('/api/projects/project-uuid-1')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ status: 'not-valid' });

      expect(res.status).toBe(400);
    });

    it('should update project and return 200 for owner', async () => {
      (UserService.getUserById as jest.Mock).mockResolvedValue(mockMemberUser);
      (ProjectService.getProjectById as jest.Mock).mockResolvedValue(mockProject);
      (ProjectService.updateProject as jest.Mock).mockResolvedValue({
        ...mockProject,
        title: 'Updated Title',
        status: 'completed',
      });

      const res = await request(app)
        .put('/api/projects/project-uuid-1')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ title: 'Updated Title', status: 'completed' });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Project updated successfully');
      expect(res.body.project.title).toBe('Updated Title');
      expect(res.body.project.status).toBe('completed');
    });
  });

  // ── DELETE /api/projects/:id ───────────────────────────────────────────────
  describe('DELETE /api/projects/:id', () => {
    it('should return 404 if project not found', async () => {
      (UserService.getUserById as jest.Mock).mockResolvedValue(mockMemberUser);
      (ProjectService.getProjectById as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .delete('/api/projects/nonexistent-id')
        .set('Authorization', `Bearer ${makeToken()}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Project not found');
    });

    it('should return 403 if member tries to delete another user project', async () => {
      (UserService.getUserById as jest.Mock).mockResolvedValue(mockMemberUser);
      (ProjectService.getProjectById as jest.Mock).mockResolvedValue({
        ...mockProject,
        ownerId: 'another-user-id',
      });

      const res = await request(app)
        .delete('/api/projects/project-uuid-1')
        .set('Authorization', `Bearer ${makeToken()}`);

      expect(res.status).toBe(403);
    });

    it('should delete project and return 200 for owner', async () => {
      (UserService.getUserById as jest.Mock).mockResolvedValue(mockMemberUser);
      (ProjectService.getProjectById as jest.Mock).mockResolvedValue(mockProject);
      (ProjectService.deleteProject as jest.Mock).mockResolvedValue(1);

      const res = await request(app)
        .delete('/api/projects/project-uuid-1')
        .set('Authorization', `Bearer ${makeToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Project deleted successfully');
    });

    it('should allow admin to delete any project', async () => {
      (UserService.getUserById as jest.Mock).mockResolvedValue(mockAdminUser);
      (ProjectService.getProjectById as jest.Mock).mockResolvedValue({
        ...mockProject,
        ownerId: 'some-other-user',
      });
      (ProjectService.deleteProject as jest.Mock).mockResolvedValue(1);

      const res = await request(app)
        .delete('/api/projects/project-uuid-1')
        .set('Authorization', `Bearer ${makeToken('admin-uuid-1', 'admin@example.com', 'admin')}`);

      expect(res.status).toBe(200);
    });
  });
});
