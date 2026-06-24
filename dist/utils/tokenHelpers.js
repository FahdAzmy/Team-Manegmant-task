"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.COOKIE_OPTIONS = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
/**
 * Generates a short-lived JWT access token containing user id, email, and role.
 */
const generateAccessToken = (id, email, role) => {
    const jwtSecret = process.env.JWT_SECRET || 'super-secret-jwt-key-replace-in-production';
    const expiresIn = process.env.JWT_EXPIRES_IN || '15m';
    return jsonwebtoken_1.default.sign({ id, email, role }, jwtSecret, { expiresIn: expiresIn });
};
exports.generateAccessToken = generateAccessToken;
/**
 * Generates a long-lived JWT refresh token with a unique tokenId for rotation.
 */
const generateRefreshToken = (id, email) => {
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-key-replace-in-production';
    const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
    return jsonwebtoken_1.default.sign({ id, email, tokenId: crypto_1.default.randomUUID() }, jwtRefreshSecret, { expiresIn: expiresIn });
};
exports.generateRefreshToken = generateRefreshToken;
/**
 * HTTP-only cookie options for the refresh token cookie.
 */
exports.COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};
