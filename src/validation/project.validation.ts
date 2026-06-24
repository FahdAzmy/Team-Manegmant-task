import { z } from 'zod';

export const createProjectSchema = z.object({
  body: z.object({
    title: z.string({ message: 'Title is required' }).trim().min(1, 'Title cannot be empty'),
    description: z.string().optional(),
    status: z.enum(['active', 'completed', 'on-hold']).optional(),
  }),
});

export const updateProjectSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, 'Title cannot be empty').optional(),
    description: z.string().optional(),
    status: z.enum(['active', 'completed', 'on-hold']).optional(),
  }),
});

export const projectQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, 'Page must be a number').optional(),
    limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional(),
    sortBy: z.enum(['title', 'status', 'createdAt', 'updatedAt']).optional(),
    sortOrder: z.enum(['ASC', 'DESC']).optional(),
  }).optional(),
});
