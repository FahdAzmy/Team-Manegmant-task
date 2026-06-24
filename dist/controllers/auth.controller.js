"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.logout = exports.refresh = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_service_1 = require("../services/user.service");
const async_middleware_1 = require("../middleware/async.middleware");
const ApiError_1 = require("../utils/ApiError");
const tokenHelpers_1 = require("../utils/tokenHelpers");
// @desc Register user
// @route post /api/auth/register
// @acces public
exports.register = (0, async_middleware_1.asyncHandler)(async (req, res) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
        throw ApiError_1.ApiError.badRequest('Name, email, and password are required');
    }
    const existingUser = await user_service_1.UserService.getUserByEmail(email);
    if (existingUser) {
        throw ApiError_1.ApiError.badRequest('Email is already registered');
    }
    const newUser = await user_service_1.UserService.createUser({
        name,
        email,
        password,
        role: role || 'member',
    });
    const accessToken = (0, tokenHelpers_1.generateAccessToken)(newUser.id, newUser.email, newUser.role);
    const refreshToken = (0, tokenHelpers_1.generateRefreshToken)(newUser.id, newUser.email);
    await user_service_1.UserService.updateRefreshToken(newUser.id, refreshToken);
    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, tokenHelpers_1.COOKIE_OPTIONS);
    res.status(201).json({
        message: 'User registered successfully',
        accessToken,
        user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
        },
    });
});
// @desc Login user
// @route post /api/auth/login
// @acces public
exports.login = (0, async_middleware_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw ApiError_1.ApiError.badRequest('Email and password are required');
    }
    const user = await user_service_1.UserService.getUserByEmail(email);
    if (!user) {
        throw ApiError_1.ApiError.unauthorized('Invalid credentials');
    }
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
        throw ApiError_1.ApiError.unauthorized('Invalid credentials');
    }
    const accessToken = (0, tokenHelpers_1.generateAccessToken)(user.id, user.email, user.role);
    const refreshToken = (0, tokenHelpers_1.generateRefreshToken)(user.id, user.email);
    await user_service_1.UserService.updateRefreshToken(user.id, refreshToken);
    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, tokenHelpers_1.COOKIE_OPTIONS);
    res.status(200).json({
        message: 'Login successful',
        accessToken,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    });
});
// @desc Refresh access token
// @route post /api/auth/refresh
// @acces public
exports.refresh = (0, async_middleware_1.asyncHandler)(async (req, res) => {
    // Read refresh token from HTTP-only cookie (not request body)
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
        throw ApiError_1.ApiError.unauthorized('Refresh token not found');
    }
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-key-replace-in-production';
    let decoded;
    try {
        decoded = jsonwebtoken_1.default.verify(refreshToken, jwtRefreshSecret);
    }
    catch (err) {
        throw ApiError_1.ApiError.forbidden('Invalid or expired refresh token');
    }
    const user = await user_service_1.UserService.getUserById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
        throw ApiError_1.ApiError.forbidden('Invalid or expired refresh token');
    }
    // Token Rotation: generate a brand new pair
    const newAccessToken = (0, tokenHelpers_1.generateAccessToken)(user.id, user.email, user.role);
    const newRefreshToken = (0, tokenHelpers_1.generateRefreshToken)(user.id, user.email);
    await user_service_1.UserService.updateRefreshToken(user.id, newRefreshToken);
    // Rotate the cookie as well
    res.cookie('refreshToken', newRefreshToken, tokenHelpers_1.COOKIE_OPTIONS);
    res.status(200).json({ accessToken: newAccessToken });
});
// @desc Logout user
// @route post /api/auth/logout
// @acces private
exports.logout = (0, async_middleware_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw ApiError_1.ApiError.unauthorized('Not authenticated');
    }
    await user_service_1.UserService.updateRefreshToken(req.user.id, null);
    // Clear the refresh token cookie
    res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict' });
    res.status(200).json({ message: 'Logout successful' });
});
// @desc Get current user profile
// @route get /api/auth/me
// @acces private
exports.getMe = (0, async_middleware_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw ApiError_1.ApiError.unauthorized('Not authenticated');
    }
    res.status(200).json({
        user: {
            id: req.user.id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            createdAt: req.user.createdAt,
            updatedAt: req.user.updatedAt,
        },
    });
});
