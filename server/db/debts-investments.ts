import { eq, and, desc, asc } from "drizzle-orm";
import { getDb } from "./db";
import { 
  debts, InsertDebt,
  investments, InsertInvestment,
  reserveFunds, InsertReserveFund,
} from "../../drizzle/schema";
import type { PaginationParams, PaginatedResult } from "./utils/pagination";
import { calculatePagination } from "./utils/pagination";

// ==================== DEBTS ====================
export async function getDebts(
  userId: number,
  pagination?: PaginationParams
): Promise<PaginatedResult<typeof debts.$inferSelect>> {
  const db = await getDb();
  if (!db) {
    return { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasMore: false } };
  }

  const safePage = Math.max(1, pagination?.page ?? 1);
  const safeLimit = Math.min(100, Math.max(1, pagination?.limit ?? 20));
  const offset = (safePage - 1) * safeLimit;

  // Count total
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(debts)
    .where(eq(debts.userId, userId));

  // Build order clause
  const sortBy = pagination?.sortBy && debts[pagination.sortBy as keyof typeof debts] 
    ? debts[pagination.sortBy as keyof typeof debts] 
    : debts.interestRate;
  const orderDir = pagination?.sortOrder === 'desc' ? desc(sortBy) : asc(sortBy);

  const data = await db
    .select()
    .from(debts)
    .where(eq(debts.userId, userId))
    .orderBy(orderDir)
    .limit(safeLimit)
    .offset(offset);

  return {
    data,
    pagination: calculatePagination(Number(count), safePage, safeLimit)
  };
}

export async function createDebt(data: InsertDebt) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [inserted] = await db.insert(debts).values(data).returning({ id: debts.id });
  return { id: inserted.id, ...data };
}

export async function updateDebt(id: number, userId: number, data: Partial<InsertDebt>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(debts).set(data).where(and(eq(debts.id, id), eq(debts.userId, userId)));
}

export async function deleteDebt(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(debts).where(and(eq(debts.id, id), eq(debts.userId, userId)));
}

// ==================== INVESTMENTS ====================
export async function getInvestments(
  userId: number,
  pagination?: PaginationParams
): Promise<PaginatedResult<typeof investments.$inferSelect>> {
  const db = await getDb();
  if (!db) {
    return { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasMore: false } };
  }

  const safePage = Math.max(1, pagination?.page ?? 1);
  const safeLimit = Math.min(100, Math.max(1, pagination?.limit ?? 20));
  const offset = (safePage - 1) * safeLimit;

  // Count total
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(investments)
    .where(eq(investments.userId, userId));

  // Build order clause
  const sortBy = pagination?.sortBy && investments[pagination.sortBy as keyof typeof investments] 
    ? investments[pagination.sortBy as keyof typeof investments] 
    : investments.date;
  const orderDir = pagination?.sortOrder === 'desc' ? desc(sortBy) : asc(sortBy);

  const data = await db
    .select()
    .from(investments)
    .where(eq(investments.userId, userId))
    .orderBy(orderDir)
    .limit(safeLimit)
    .offset(offset);

  return {
    data,
    pagination: calculatePagination(Number(count), safePage, safeLimit)
  };
}

export async function createInvestment(data: InsertInvestment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [inserted] = await db.insert(investments).values(data).returning({ id: investments.id });
  return { id: inserted.id, ...data };
}

export async function updateInvestment(id: number, userId: number, data: Partial<InsertInvestment>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(investments).set(data).where(and(eq(investments.id, id), eq(investments.userId, userId)));
}

export async function deleteInvestment(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(investments).where(and(eq(investments.id, id), eq(investments.userId, userId)));
}

// ==================== RESERVE FUNDS ====================
export async function getReserveFunds(
  userId: number, 
  type?: "empresa" | "pessoal",
  pagination?: PaginationParams
): Promise<PaginatedResult<typeof reserveFunds.$inferSelect>> {
  const db = await getDb();
  if (!db) {
    return { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasMore: false } };
  }

  const safePage = Math.max(1, pagination?.page ?? 1);
  const safeLimit = Math.min(100, Math.max(1, pagination?.limit ?? 20));
  const offset = (safePage - 1) * safeLimit;

  // Build conditions
  const conditions = [eq(reserveFunds.userId, userId)];
  if (type) conditions.push(eq(reserveFunds.type, type));

  // Count total
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(reserveFunds)
    .where(and(...conditions));

  // Build order clause
  const sortBy = pagination?.sortBy && reserveFunds[pagination.sortBy as keyof typeof reserveFunds] 
    ? reserveFunds[pagination.sortBy as keyof typeof reserveFunds] 
    : reserveFunds.date;
  const orderDir = pagination?.sortOrder === 'desc' ? desc(sortBy) : asc(sortBy);

  const data = await db
    .select()
    .from(reserveFunds)
    .where(and(...conditions))
    .orderBy(orderDir)
    .limit(safeLimit)
    .offset(offset);

  return {
    data,
    pagination: calculatePagination(Number(count), safePage, safeLimit)
  };
}

export async function createReserveFund(data: InsertReserveFund) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [inserted] = await db.insert(reserveFunds).values(data).returning({ id: reserveFunds.id });
  return { id: inserted.id, ...data };
}

export async function deleteReserveFund(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(reserveFunds).where(and(eq(reserveFunds.id, id), eq(reserveFunds.userId, userId)));
}
