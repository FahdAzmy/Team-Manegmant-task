"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_service_1 = require("../services/user.service");
const async_middleware_1 = require("./async.middleware");
const ApiError_1 = require("../utils/ApiError");
exports.authenticateJWT = (0, async_middleware_1.asyncHandler)(async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw ApiError_1.ApiError.unauthorized('Authorization token missing or malformed');
    }
    const token = authHeader.split(' ')[1];
    try {
        const jwtSecret = process.env.JWT_SECRET || 'super-secret-jwt-key-replace-in-production';
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        const user = await user_service_1.UserService.getUserById(decoded.id);
        if (!user) {
            throw ApiError_1.ApiError.unauthorized('User not found or authorization revoked');
        }
        req.user = user;
        next();
    }
    catch (error) {
        throw ApiError_1.ApiError.forbidden('Invalid or expired token');
    }
});
