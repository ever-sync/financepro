/**
 * Utilitários de Paginação para o Sistema Financeiro
 * Padroniza a paginação em todas as queries do banco de dados
 */

export interface PaginationParams {
  page: number;
  limit: number;
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
  page: number,
  limit: number,
  total: number
): {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
} {
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, Math.min(limit, 100)); // Limite máximo de 100 registros por página
  const totalPages = Math.ceil(total / safeLimit);
  
  return {
    page: safePage,
    limit: safeLimit,
    total,
    totalPages,
    hasMore: safePage < totalPages,
  };
}

export function getDefaultPagination(): PaginationParams {
  return {
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  };
}
