"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectQuerySchema = exports.updateProjectSchema = exports.createProjectSchema = void 0;
const zod_1 = require("zod");
exports.createProjectSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string({ message: 'Title is required' }).trim().min(1, 'Title cannot be empty'),
        description: zod_1.z.string().optional(),
        status: zod_1.z.enum(['active', 'completed', 'on-hold']).optional(),
    }),
});
exports.updateProjectSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().trim().min(1, 'Title cannot be empty').optional(),
        description: zod_1.z.string().optional(),
        status: zod_1.z.enum(['active', 'completed', 'on-hold']).optional(),
    }),
});
exports.projectQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string().regex(/^\d+$/, 'Page must be a number').optional(),
        limit: zod_1.z.string().regex(/^\d+$/, 'Limit must be a number').optional(),
        sortBy: zod_1.z.enum(['title', 'status', 'createdAt', 'updatedAt']).optional(),
        sortOrder: zod_1.z.enum(['ASC', 'DESC']).optional(),
    }).optional(),
});
