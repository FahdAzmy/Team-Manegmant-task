import request from 'supertest';
import app from '../app';
import { UserService } from '../services/user.service';
import jwt from 'jsonwebtoken';

jest.mock('../services/user.service');

describe('Auth API Endpoints', () => {
  const jwtSecret = process.env.JWT_SECRET || 'super-secret-jwt-key-replace-in-production';
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-key-replace-in-production';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should fail registration with invalid request body (Zod Validation)', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ name: '', email: 'not-an-email', password: '123' });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe(400);
      expect(response.body.message).toBe('Validation error');
      expect(response.body.errors).toHaveLength(3);
    });

    it('should successfully register a user and set a refresh token cookie', async () => {
      (UserService.getUserByEmail as jest.Mock).mockResolvedValue(null);
      (UserService.createUser as jest.Mock).mockResolvedValue({
        id: 'mocked-uuid-12345',
        name: 'Jane Doe',
        email: 'jane@example.com',
        role: 'member',
      });
      (UserService.updateRefreshToken as jest.Mock).mockResolvedValue([1]);

      const response = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Jane Doe', email: 'jane@example.com', password: 'securePassword123' });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeUndefined(); // no longer in body
      expect(response.headers['set-cookie']).toBeDefined(); // cookie set
      expect(response.headers['set-cookie'][0]).toMatch(/refreshToken=/);
      expect(response.headers['set-cookie'][0]).toMatch(/HttpOnly/);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should fail login if validation requirements are not met', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'not-an-email' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation error');
    });

    it('should fail login if credentials are invalid', async () => {
      (UserService.getUserByEmail as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'jane@example.com', password: 'wrongPassword' });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should fail login if password check fails', async () => {
      const mockUser = {
        id: 'mocked-uuid-12345',
        name: 'Jane Doe',
        email: 'jane@example.com',
        role: 'member',
        validatePassword: jest.fn().mockResolvedValue(false),
      };
      (UserService.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'jane@example.com', password: 'wrongPassword' });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should login successfully and set refresh token as HTTP-only cookie', async () => {
      const mockUser = {
        id: 'mocked-uuid-12345',
        name: 'Jane Doe',
        email: 'jane@example.com',
        role: 'member',
        validatePassword: jest.fn().mockResolvedValue(true),
      };
      (UserService.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      (UserService.updateRefreshToken as jest.Mock).mockResolvedValue([1]);

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'jane@example.com', password: 'securePassword123' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeUndefined(); // no longer in body
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toMatch(/HttpOnly/);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should fail if no refresh token cookie is present', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send();

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Refresh token not found');
    });

    it('should fail if refresh token cookie is invalid', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', 'refreshToken=invalid-token')
        .send();

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Invalid or expired refresh token');
    });

    it('should fail if token does not match the one stored in DB', async () => {
      const refreshToken = jwt.sign(
        { id: 'mocked-uuid-12345', email: 'jane@example.com', tokenId: 'abc' },
        jwtRefreshSecret,
        { expiresIn: '7d' }
      );
      (UserService.getUserById as jest.Mock).mockResolvedValue({
        id: 'mocked-uuid-12345',
        email: 'jane@example.com',
        role: 'member',
        refreshToken: 'different-token-in-db',
      });

      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', `refreshToken=${refreshToken}`)
        .send();

      expect(response.status).toBe(403);
    });

    it('should return new access token and rotate refresh token cookie', async () => {
      const refreshToken = jwt.sign(
        { id: 'mocked-uuid-12345', email: 'jane@example.com', tokenId: 'abc' },
        jwtRefreshSecret,
        { expiresIn: '7d' }
      );
      (UserService.getUserById as jest.Mock).mockResolvedValue({
        id: 'mocked-uuid-12345',
        name: 'Jane Doe',
        email: 'jane@example.com',
        role: 'member',
        refreshToken,
      });
      (UserService.updateRefreshToken as jest.Mock).mockResolvedValue([1]);

      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', `refreshToken=${refreshToken}`)
        .send();

      expect(response.status).toBe(200);
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeUndefined(); // rotated via cookie
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toMatch(/HttpOnly/);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should fail logout if not authenticated', async () => {
      const response = await request(app).post('/api/auth/logout').send();
      expect(response.status).toBe(401);
    });

    it('should logout successfully and clear the refresh token cookie', async () => {
      const accessToken = jwt.sign(
        { id: 'mocked-uuid-12345', email: 'jane@example.com' },
        jwtSecret,
        { expiresIn: '15m' }
      );
      const mockUser = {
        id: 'mocked-uuid-12345',
        name: 'Jane Doe',
        email: 'jane@example.com',
        role: 'member',
      };
      (UserService.getUserById as jest.Mock).mockResolvedValue(mockUser);
      (UserService.updateRefreshToken as jest.Mock).mockResolvedValue([1]);

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send();

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Logout successful');
      expect(UserService.updateRefreshToken).toHaveBeenCalledWith('mocked-uuid-12345', null);
      // Cookie should be cleared
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toMatch(/refreshToken=/);
    });
  });
});
