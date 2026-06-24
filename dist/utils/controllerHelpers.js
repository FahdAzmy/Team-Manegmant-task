"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canAccess = exports.parsePagination = void 0;
/**
 * Parses pagination and sorting query parameters with safe defaults.
 */
const parsePagination = (query) => {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
    const offset = (page - 1) * limit;
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder === 'ASC' ? 'ASC' : 'DESC';
    return { page, limit, offset, sortBy, sortOrder };
};
exports.parsePagination = parsePagination;
/**
 * Returns true if the requesting user is an admin or the resource owner.
 */
const canAccess = (ownerId, userId, role) => role === 'admin' || ownerId === userId;
exports.canAccess = canAccess;
