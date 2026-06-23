"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    let errors = err.errors || [];
    // Normalize Sequelize Database Validation / Unique Constraint Errors
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
        statusCode = 400;
        message = 'Validation error';
        errors = err.errors.map((e) => ({
            field: e.path,
            message: e.message,
        }));
    }
    const response = {
        code: statusCode,
        message,
        ...(errors.length > 0 && { errors }),
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    };
    if (process.env.NODE_ENV === 'development') {
        console.error(err);
    }
    res.status(statusCode).json(response);
};
exports.errorHandler = errorHandler;
