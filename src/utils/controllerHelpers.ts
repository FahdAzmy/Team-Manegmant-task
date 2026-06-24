/**
 * Parses pagination and sorting query parameters with safe defaults.
 */
export const parsePagination = (query: any) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  const offset = (page - 1) * limit;
  const sortBy = query.sortBy || 'createdAt';
  const sortOrder: 'ASC' | 'DESC' = query.sortOrder === 'ASC' ? 'ASC' : 'DESC';
  return { page, limit, offset, sortBy, sortOrder };
};

/**
 * Returns true if the requesting user is an admin or the resource owner.
 */
export const canAccess = (ownerId: string, userId: string, role: string): boolean =>
  role === 'admin' || ownerId === userId;
