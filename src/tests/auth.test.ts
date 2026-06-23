import request from 'supertest';
import app from '../app';
import { UserService } from '../services/user.service';

// Mock the UserService calls
jest.mock('../services/user.service');

describe('Auth API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should fail registration with invalid request body (Zod Validation)', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: '',
          email: 'not-an-email',
          password: '123', // less than 6 chars
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe(400);
      expect(response.body.message).toBe('Validation error');
      expect(response.body.errors).toHaveLength(3); // name, email, password errors
    });

    it('should successfully register a user when data is valid', async () => {
      // Mock search to return no duplicate email
      (UserService.getUserByEmail as jest.Mock).mockResolvedValue(null);

      // Mock creation
      (UserService.createUser as jest.Mock).mockResolvedValue({
        id: 'mocked-uuid-12345',
        name: 'Jane Doe',
        email: 'jane@example.com',
        role: 'member',
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'securePassword123',
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toEqual({
        id: 'mocked-uuid-12345',
        name: 'Jane Doe',
        email: 'jane@example.com',
        role: 'member',
      });
    });
  });

  describe('POST /api/auth/login', () => {
    it('should fail login if validation requirements are not met', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'not-an-email',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation error');
    });
  });
});
