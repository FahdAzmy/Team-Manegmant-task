"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const ApiError_1 = require("../utils/ApiError");
const validate = (schema) => {
    return async (req, res, next) => {
        try {
            const parsed = await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            // Assign sanitized data back to request properties
            if (parsed.body)
                req.body = parsed.body;
            if (parsed.query)
                req.query = parsed.query;
            if (parsed.params)
                req.params = parsed.params;
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const formattedErrors = error.issues.map((issue) => ({
                    field: issue.path.length > 1 ? issue.path.slice(1).join('.') : issue.path.join('.'),
                    message: issue.message,
                }));
                next(ApiError_1.ApiError.badRequest('Validation error', formattedErrors));
                return;
            }
            next(error);
        }
    };
};
exports.validate = validate;
