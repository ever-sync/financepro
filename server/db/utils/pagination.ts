// Utilitários de paginação compartilhados
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export function calculatePagination(
  total: number,
  page?: number,
  limit?: number
): PaginatedResult<never>['pagination'] {
  const safePage = Math.max(1, page ?? 1);
  const safeLimit = Math.min(100, Math.max(1, limit ?? 20));
  const offset = (safePage - 1) * safeLimit;
  
  return {
    page: safePage,
    limit: safeLimit,
    total,
    totalPages: Math.ceil(total / safeLimit),
    hasMore: offset + safeLimit < total
  };
}
