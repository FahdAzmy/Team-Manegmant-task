"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const task_service_1 = require("../services/task.service");
const project_service_1 = require("../services/project.service");
const user_service_1 = require("../services/user.service");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
jest.mock('../services/task.service');
jest.mock('../services/project.service');
jest.mock('../services/user.service');
const jwtSecret = process.env.JWT_SECRET || 'super-secret-jwt-key-replace-in-production';
const makeToken = (id = 'user-uuid-1', email = 'test@example.com', role = 'member') => jsonwebtoken_1.default.sign({ id, email, role }, jwtSecret, { expiresIn: '1h' });
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
    user_service_1.UserService.getUserById.mockResolvedValue(mockMemberUser);
};
const setupAdminAuth = () => {
    user_service_1.UserService.getUserById.mockResolvedValue(mockAdminUser);
};
// ─── Tests ────────────────────────────────────────────────────────────────────
describe('Task API Endpoints', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    // ── POST /api/projects/:projectId/tasks ─────────────────────────────────────
    describe('POST /api/projects/:projectId/tasks', () => {
        it('should return 401 for unauthenticated requests', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/projects/project-uuid-1/tasks')
                .send({ title: 'Test Task' });
            expect(res.status).toBe(401);
        });
        it('should return 404 if project does not exist', async () => {
            setupMemberAuth();
            project_service_1.ProjectService.getProjectById.mockResolvedValue(null);
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/projects/nonexistent/tasks')
                .set('Authorization', `Bearer ${memberToken}`)
                .send({ title: 'Test Task' });
            expect(res.status).toBe(404);
            expect(res.body.message).toBe('Project not found');
        });
        it('should return 403 if member tries to add task to another user project', async () => {
            setupMemberAuth();
            project_service_1.ProjectService.getProjectById.mockResolvedValue({
                ...mockProject,
                ownerId: 'another-user',
            });
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/projects/project-uuid-1/tasks')
                .set('Authorization', `Bearer ${memberToken}`)
                .send({ title: 'Test Task' });
            expect(res.status).toBe(403);
        });
        it('should return 400 if title is missing', async () => {
            setupMemberAuth();
            project_service_1.ProjectService.getProjectById.mockResolvedValue(mockProject);
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/projects/project-uuid-1/tasks')
                .set('Authorization', `Bearer ${memberToken}`)
                .send({ description: 'No title' });
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Validation error');
        });
        it('should return 400 if status is invalid enum', async () => {
            setupMemberAuth();
            project_service_1.ProjectService.getProjectById.mockResolvedValue(mockProject);
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/projects/project-uuid-1/tasks')
                .set('Authorization', `Bearer ${memberToken}`)
                .send({ title: 'Task', status: 'InvalidStatus' });
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Validation error');
        });
        it('should return 400 if priority is invalid enum', async () => {
            setupMemberAuth();
            project_service_1.ProjectService.getProjectById.mockResolvedValue(mockProject);
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/projects/project-uuid-1/tasks')
                .set('Authorization', `Bearer ${memberToken}`)
                .send({ title: 'Task', priority: 'Critical' });
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Validation error');
        });
        it('should create a task and return 201', async () => {
            setupMemberAuth();
            project_service_1.ProjectService.getProjectById.mockResolvedValue(mockProject);
            task_service_1.TaskService.createTask.mockResolvedValue(mockTask);
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/projects/project-uuid-1/tasks')
                .set('Authorization', `Bearer ${memberToken}`)
                .send({ title: 'Fix Bug', priority: 'High' });
            expect(res.status).toBe(201);
            expect(res.body.message).toBe('Task created successfully');
            expect(res.body.task.title).toBe('Fix Bug');
            expect(task_service_1.TaskService.createTask).toHaveBeenCalledWith(expect.objectContaining({ title: 'Fix Bug', projectId: 'project-uuid-1' }));
        });
        it('should allow admin to create task in any project', async () => {
            setupAdminAuth();
            project_service_1.ProjectService.getProjectById.mockResolvedValue({
                ...mockProject,
                ownerId: 'other-user',
            });
            task_service_1.TaskService.createTask.mockResolvedValue(mockTask);
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/projects/project-uuid-1/tasks')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ title: 'Admin Task' });
            expect(res.status).toBe(201);
        });
    });
    // ── GET /api/projects/:projectId/tasks ──────────────────────────────────────
    describe('GET /api/projects/:projectId/tasks', () => {
        it('should return 401 for unauthenticated requests', async () => {
            const res = await (0, supertest_1.default)(app_1.default).get('/api/projects/project-uuid-1/tasks');
            expect(res.status).toBe(401);
        });
        it('should return 404 if project does not exist', async () => {
            setupMemberAuth();
            project_service_1.ProjectService.getProjectById.mockResolvedValue(null);
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/projects/nonexistent/tasks')
                .set('Authorization', `Bearer ${memberToken}`);
            expect(res.status).toBe(404);
            expect(res.body.message).toBe('Project not found');
        });
        it('should return 403 if member tries to get tasks from another user project', async () => {
            setupMemberAuth();
            project_service_1.ProjectService.getProjectById.mockResolvedValue({
                ...mockProject,
                ownerId: 'another-user',
            });
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/projects/project-uuid-1/tasks')
                .set('Authorization', `Bearer ${memberToken}`);
            expect(res.status).toBe(403);
        });
        it('should return paginated tasks for the project', async () => {
            setupMemberAuth();
            project_service_1.ProjectService.getProjectById.mockResolvedValue(mockProject);
            task_service_1.TaskService.getProjectTasks.mockResolvedValue({
                rows: [mockTask],
                count: 1,
            });
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/projects/project-uuid-1/tasks')
                .set('Authorization', `Bearer ${memberToken}`);
            expect(res.status).toBe(200);
            expect(res.body.tasks).toHaveLength(1);
            expect(res.body.pagination).toMatchObject({ total: 1, page: 1 });
        });
        it('should filter tasks by status', async () => {
            setupMemberAuth();
            project_service_1.ProjectService.getProjectById.mockResolvedValue(mockProject);
            task_service_1.TaskService.getProjectTasks.mockResolvedValue({ rows: [mockTask], count: 1 });
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/projects/project-uuid-1/tasks?status=Pending')
                .set('Authorization', `Bearer ${memberToken}`);
            expect(res.status).toBe(200);
            expect(task_service_1.TaskService.getProjectTasks).toHaveBeenCalledWith('project-uuid-1', expect.objectContaining({ status: 'Pending' }));
        });
        it('should filter tasks by priority', async () => {
            setupMemberAuth();
            project_service_1.ProjectService.getProjectById.mockResolvedValue(mockProject);
            task_service_1.TaskService.getProjectTasks.mockResolvedValue({ rows: [mockTask], count: 1 });
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/projects/project-uuid-1/tasks?priority=High')
                .set('Authorization', `Bearer ${memberToken}`);
            expect(res.status).toBe(200);
            expect(task_service_1.TaskService.getProjectTasks).toHaveBeenCalledWith('project-uuid-1', expect.objectContaining({ priority: 'High' }));
        });
        it('should return 400 for invalid status filter', async () => {
            setupMemberAuth();
            project_service_1.ProjectService.getProjectById.mockResolvedValue(mockProject);
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/projects/project-uuid-1/tasks?status=invalid')
                .set('Authorization', `Bearer ${memberToken}`);
            expect(res.status).toBe(400);
        });
        it('should respect pagination query params', async () => {
            setupMemberAuth();
            project_service_1.ProjectService.getProjectById.mockResolvedValue(mockProject);
            task_service_1.TaskService.getProjectTasks.mockResolvedValue({ rows: [], count: 0 });
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/projects/project-uuid-1/tasks?page=2&limit=5&sortBy=priority&sortOrder=ASC')
                .set('Authorization', `Bearer ${memberToken}`);
            expect(res.status).toBe(200);
            expect(task_service_1.TaskService.getProjectTasks).toHaveBeenCalledWith('project-uuid-1', {
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
            const res = await (0, supertest_1.default)(app_1.default).get('/api/projects/project-uuid-1/tasks/task-uuid-1');
            expect(res.status).toBe(401);
        });
        it('should return 404 if project not found', async () => {
            setupMemberAuth();
            project_service_1.ProjectService.getProjectById.mockResolvedValue(null);
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/projects/nonexistent/tasks/task-uuid-1')
                .set('Authorization', `Bearer ${memberToken}`);
            expect(res.status).toBe(404);
            expect(res.body.message).toBe('Project not found');
        });
        it('should return 403 if member tries to access task from another user project', async () => {
            setupMemberAuth();
            project_service_1.ProjectService.getProjectById.mockResolvedValue({
                ...mockProject,
                ownerId: 'another-user',
            });
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/projects/project-uuid-1/tasks/task-uuid-1')
                .set('Authorization', `Bearer ${memberToken}`);
            expect(res.status).toBe(403);
        });
        it('should return 404 if task not found in project', async () => {
            setupMemberAuth();
            project_service_1.ProjectService.getProjectById.mockResolvedValue(mockProject);
            task_service_1.TaskService.getTaskByIdAndProject.mockResolvedValue(null);
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/projects/project-uuid-1/tasks/nonexistent-task')
                .set('Authorization', `Bearer ${memberToken}`);
            expect(res.status).toBe(404);
            expect(res.body.message).toBe('Task not found');
        });
        it('should return task for project owner', async () => {
            setupMemberAuth();
            project_service_1.ProjectService.getProjectById.mockResolvedValue(mockProject);
            task_service_1.TaskService.getTaskByIdAndProject.mockResolvedValue(mockTask);
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/projects/project-uuid-1/tasks/task-uuid-1')
                .set('Authorization', `Bearer ${memberToken}`);
            expect(res.status).toBe(200);
            expect(res.body.task.id).toBe('task-uuid-1');
        });
        it('should allow admin to get any task', async () => {
            setupAdminAuth();
            project_service_1.ProjectService.getProjectById.mockResolvedValue({
                ...mockProject,
                ownerId: 'other-user',
            });
            task_service_1.TaskService.getTaskByIdAndProject.mockResolvedValue(mockTask);
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/projects/project-uuid-1/tasks/task-uuid-1')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(200);
        });
    });
    // ── PUT /api/projects/:projectId/tasks/:taskId ──────────────────────────────
    describe('PUT /api/projects/:projectId/tasks/:taskId', () => {
        it('should return 401 for unauthenticated requests', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .put('/api/projects/project-uuid-1/tasks/task-uuid-1')
                .send({ status: 'Done' });
            expect(res.status).toBe(401);
        });
        it('should return 404 if project not found', async () => {
            setupMemberAuth();
            project_service_1.ProjectService.getProjectById.mockResolvedValue(null);
            const res = await (0, supertest_1.default)(app_1.default)
                .put('/api/projects/nonexistent/tasks/task-uuid-1')
                .set('Authorization', `Bearer ${memberToken}`)
                .send({ title: 'Updated' });
            expect(res.status).toBe(404);
            expect(res.body.message).toBe('Project not found');
        });
        it('should return 403 if member tries to update task in another user project', async () => {
            setupMemberAuth();
            project_service_1.ProjectService.getProjectById.mockResolvedValue({
                ...mockProject,
                ownerId: 'another-user',
            });
            const res = await (0, supertest_1.default)(app_1.default)
                .put('/api/projects/project-uuid-1/tasks/task-uuid-1')
                .set('Authorization', `Bearer ${memberToken}`)
                .send({ title: 'Updated' });
            expect(res.status).toBe(403);
        });
        it('should return 404 if task not found in project', async () => {
            setupMemberAuth();
            project_service_1.ProjectService.getProjectById.mockResolvedValue(mockProject);
            task_service_1.TaskService.getTaskByIdAndProject.mockResolvedValue(null);
            const res = await (0, supertest_1.default)(app_1.default)
                .put('/api/projects/project-uuid-1/tasks/nonexistent-task')
                .set('Authorization', `Bearer ${memberToken}`)
                .send({ title: 'Updated' });
            expect(res.status).toBe(404);
            expect(res.body.message).toBe('Task not found');
        });
        it('should return 400 if status value is invalid', async () => {
            setupMemberAuth();
            project_service_1.ProjectService.getProjectById.mockResolvedValue(mockProject);
            task_service_1.TaskService.getTaskByIdAndProject.mockResolvedValue(mockTask);
            const res = await (0, supertest_1.default)(app_1.default)
                .put('/api/projects/project-uuid-1/tasks/task-uuid-1')
                .set('Authorization', `Bearer ${memberToken}`)
                .send({ status: 'INVALID' });
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Validation error');
        });
        it('should update task status and return 200', async () => {
            setupMemberAuth();
            project_service_1.ProjectService.getProjectById.mockResolvedValue(mockProject);
            task_service_1.TaskService.getTaskByIdAndProject.mockResolvedValue(mockTask);
            task_service_1.TaskService.updateTask.mockResolvedValue({
                ...mockTask,
                status: 'Done',
            });
            const res = await (0, supertest_1.default)(app_1.default)
                .put('/api/projects/project-uuid-1/tasks/task-uuid-1')
                .set('Authorization', `Bearer ${memberToken}`)
                .send({ status: 'Done' });
            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Task updated successfully');
            expect(res.body.task.status).toBe('Done');
        });
        it('should allow admin to update any task', async () => {
            setupAdminAuth();
            project_service_1.ProjectService.getProjectById.mockResolvedValue({
                ...mockProject,
                ownerId: 'other-user',
            });
            task_service_1.TaskService.getTaskByIdAndProject.mockResolvedValue(mockTask);
            task_service_1.TaskService.updateTask.mockResolvedValue({ ...mockTask, title: 'Admin Updated' });
            const res = await (0, supertest_1.default)(app_1.default)
                .put('/api/projects/project-uuid-1/tasks/task-uuid-1')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ title: 'Admin Updated' });
            expect(res.status).toBe(200);
        });
    });
    // ── DELETE /api/projects/:projectId/tasks/:taskId ───────────────────────────
    describe('DELETE /api/projects/:projectId/tasks/:taskId', () => {
        it('should return 401 for unauthenticated requests', async () => {
            const res = await (0, supertest_1.default)(app_1.default).delete('/api/projects/project-uuid-1/tasks/task-uuid-1');
            expect(res.status).toBe(401);
        });
        it('should return 404 if project not found', async () => {
            setupMemberAuth();
            project_service_1.ProjectService.getProjectById.mockResolvedValue(null);
            const res = await (0, supertest_1.default)(app_1.default)
                .delete('/api/projects/nonexistent/tasks/task-uuid-1')
                .set('Authorization', `Bearer ${memberToken}`);
            expect(res.status).toBe(404);
            expect(res.body.message).toBe('Project not found');
        });
        it('should return 403 if member tries to delete task from another user project', async () => {
            setupMemberAuth();
            project_service_1.ProjectService.getProjectById.mockResolvedValue({
                ...mockProject,
                ownerId: 'another-user',
            });
            const res = await (0, supertest_1.default)(app_1.default)
                .delete('/api/projects/project-uuid-1/tasks/task-uuid-1')
                .set('Authorization', `Bearer ${memberToken}`);
            expect(res.status).toBe(403);
        });
        it('should return 404 if task not found in project', async () => {
            setupMemberAuth();
            project_service_1.ProjectService.getProjectById.mockResolvedValue(mockProject);
            task_service_1.TaskService.getTaskByIdAndProject.mockResolvedValue(null);
            const res = await (0, supertest_1.default)(app_1.default)
                .delete('/api/projects/project-uuid-1/tasks/nonexistent-task')
                .set('Authorization', `Bearer ${memberToken}`);
            expect(res.status).toBe(404);
            expect(res.body.message).toBe('Task not found');
        });
        it('should delete task and return 200 for project owner', async () => {
            setupMemberAuth();
            project_service_1.ProjectService.getProjectById.mockResolvedValue(mockProject);
            task_service_1.TaskService.getTaskByIdAndProject.mockResolvedValue(mockTask);
            task_service_1.TaskService.deleteTask.mockResolvedValue(1);
            const res = await (0, supertest_1.default)(app_1.default)
                .delete('/api/projects/project-uuid-1/tasks/task-uuid-1')
                .set('Authorization', `Bearer ${memberToken}`);
            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Task deleted successfully');
        });
        it('should allow admin to delete any task', async () => {
            setupAdminAuth();
            project_service_1.ProjectService.getProjectById.mockResolvedValue({
                ...mockProject,
                ownerId: 'other-user',
            });
            task_service_1.TaskService.getTaskByIdAndProject.mockResolvedValue(mockTask);
            task_service_1.TaskService.deleteTask.mockResolvedValue(1);
            const res = await (0, supertest_1.default)(app_1.default)
                .delete('/api/projects/project-uuid-1/tasks/task-uuid-1')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(200);
        });
    });
});
