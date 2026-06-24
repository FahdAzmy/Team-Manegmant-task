import { z } from 'zod';

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string({ message: 'Title is required' }).trim().min(1, 'Title cannot be empty'),
    description: z.string().optional(),
    status: z.enum(['Pending', 'In Progress', 'Done']).optional(),
    priority: z.enum(['Low', 'Medium', 'High']).optional(),
    dueDate: z.string().datetime({ message: 'dueDate must be a valid ISO 8601 datetime' }).optional(),
  }),
});

export const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, 'Title cannot be empty').optional(),
    description: z.string().optional(),
    status: z.enum(['Pending', 'In Progress', 'Done']).optional(),
    priority: z.enum(['Low', 'Medium', 'High']).optional(),
    dueDate: z.string().datetime({ message: 'dueDate must be a valid ISO 8601 datetime' }).optional(),
  }),
});

export const taskQuerySchema = z.object({
  query: z
    .object({
      status: z.enum(['Pending', 'In Progress', 'Done']).optional(),
      priority: z.enum(['Low', 'Medium', 'High']).optional(),
      page: z.string().regex(/^\d+$/, 'Page must be a number').optional(),
      limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional(),
      sortBy: z.enum(['title', 'status', 'priority', 'dueDate', 'createdAt', 'updatedAt']).optional(),
      sortOrder: z.enum(['ASC', 'DESC']).optional(),
    })
    .optional(),
});
