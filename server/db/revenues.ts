import { eq, and, sql, desc, asc, count } from "drizzle-orm";
import { getDb } from "./db";
import { revenues, InsertRevenue } from "../../drizzle/schema";

// ==================== REVENUES ====================
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

export async function getRevenues(
  userId: number, 
  month?: number, 
  year?: number,
  pagination?: PaginationParams
) {
  const db = await getDb();
  if (!db) return { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasMore: false } };
  
  const conditions = [eq(revenues.userId, userId)];
  if (month !== undefined && year !== undefined) {
    conditions.push(sql`EXTRACT(MONTH FROM ${revenues.dueDate}::date) = ${month}`);
    conditions.push(sql`EXTRACT(YEAR FROM ${revenues.dueDate}::date) = ${year}`);
  }
  
  // Obter total para paginação
  const totalResult = await db.select({ count: count() }).from(revenues).where(and(...conditions));
  const total = totalResult[0]?.count ?? 0;
  
  // Parâmetros de paginação
  const page = Math.max(1, pagination?.page ?? 1);
  const limit = Math.min(100, Math.max(1, pagination?.limit ?? 20));
  const offset = (page - 1) * limit;
  
  // Ordenação
  const sortByField = pagination?.sortBy && revenues[pagination.sortBy as keyof typeof revenues] 
    ? revenues[pagination.sortBy as keyof typeof revenues] 
    : revenues.dueDate;
  const orderFunc = pagination?.sortOrder === 'asc' ? asc : desc;
  
  const data = await db.select()
    .from(revenues)
    .where(and(...conditions))
    .orderBy(orderFunc(sortByField))
    .limit(limit)
    .offset(offset);
  
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: offset + data.length < total
    }
  };
}

export async function createRevenue(data: InsertRevenue) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [inserted] = await db.insert(revenues).values(data).returning({ id: revenues.id });
  return { id: inserted.id, ...data };
}

export async function updateRevenue(id: number, userId: number, data: Partial<InsertRevenue>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(revenues).set(data).where(and(eq(revenues.id, id), eq(revenues.userId, userId)));
}

export async function deleteRevenue(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(revenues).where(and(eq(revenues.id, id), eq(revenues.userId, userId)));
}
