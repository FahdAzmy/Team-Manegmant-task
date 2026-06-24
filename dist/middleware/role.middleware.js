"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = void 0;
const ApiError_1 = require("../utils/ApiError");
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            throw ApiError_1.ApiError.unauthorized('Not authenticated');
        }
        if (!allowedRoles.includes(req.user.role)) {
            throw ApiError_1.ApiError.forbidden('Forbidden: Access denied');
        }
        next();
    };
};
exports.requireRole = requireRole;
