"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
class ApiError extends Error {
    statusCode;
    errors;
    isOperational;
    constructor(statusCode, message, errors = [], stack = '') {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.isOperational = true;
        if (stack) {
            this.stack = stack;
        }
        else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
    static badRequest(message, errors = []) {
        return new ApiError(400, message, errors);
    }
    static unauthorized(message, errors = []) {
        return new ApiError(401, message, errors);
    }
    static forbidden(message, errors = []) {
        return new ApiError(403, message, errors);
    }
    static notFound(message, errors = []) {
        return new ApiError(404, message, errors);
    }
    static internal(message, errors = []) {
        return new ApiError(500, message, errors);
    }
}
exports.ApiError = ApiError;
