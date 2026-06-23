"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const user_service_1 = require("../services/user.service");
// Mock the UserService calls
jest.mock('../services/user.service');
describe('Auth API Endpoints', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('POST /api/auth/register', () => {
        it('should fail registration with invalid request body (Zod Validation)', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
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
            user_service_1.UserService.getUserByEmail.mockResolvedValue(null);
            // Mock creation
            user_service_1.UserService.createUser.mockResolvedValue({
                id: 'mocked-uuid-12345',
                name: 'Jane Doe',
                email: 'jane@example.com',
                role: 'member',
            });
            const response = await (0, supertest_1.default)(app_1.default)
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
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({
                email: 'not-an-email',
            });
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Validation error');
        });
    });
});
