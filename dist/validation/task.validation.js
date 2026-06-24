"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskQuerySchema = exports.updateTaskSchema = exports.createTaskSchema = void 0;
const zod_1 = require("zod");
exports.createTaskSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string({ message: 'Title is required' }).trim().min(1, 'Title cannot be empty'),
        description: zod_1.z.string().optional(),
        status: zod_1.z.enum(['Pending', 'In Progress', 'Done']).optional(),
        priority: zod_1.z.enum(['Low', 'Medium', 'High']).optional(),
        dueDate: zod_1.z.string().datetime({ message: 'dueDate must be a valid ISO 8601 datetime' }).optional(),
    }),
});
exports.updateTaskSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().trim().min(1, 'Title cannot be empty').optional(),
        description: zod_1.z.string().optional(),
        status: zod_1.z.enum(['Pending', 'In Progress', 'Done']).optional(),
        priority: zod_1.z.enum(['Low', 'Medium', 'High']).optional(),
        dueDate: zod_1.z.string().datetime({ message: 'dueDate must be a valid ISO 8601 datetime' }).optional(),
    }),
});
exports.taskQuerySchema = zod_1.z.object({
    query: zod_1.z
        .object({
        status: zod_1.z.enum(['Pending', 'In Progress', 'Done']).optional(),
        priority: zod_1.z.enum(['Low', 'Medium', 'High']).optional(),
        page: zod_1.z.string().regex(/^\d+$/, 'Page must be a number').optional(),
        limit: zod_1.z.string().regex(/^\d+$/, 'Limit must be a number').optional(),
        sortBy: zod_1.z.enum(['title', 'status', 'priority', 'dueDate', 'createdAt', 'updatedAt']).optional(),
        sortOrder: zod_1.z.enum(['ASC', 'DESC']).optional(),
    })
        .optional(),
});
