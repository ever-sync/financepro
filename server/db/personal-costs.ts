import { eq, and, sql, desc, asc, count } from "drizzle-orm";
import { getDb } from "./db";
import {
  personalFixedCosts, InsertPersonalFixedCost,
  personalVariableCosts, InsertPersonalVariableCost,
} from "../../drizzle/schema";
import { randomUUID } from "crypto";

// ==================== PAGINATION ====================
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

// Utility functions for installments (shared with company costs)
function normalizeInstallmentCount(value?: number | null) {
  const count = Number(value ?? 1);
  if (!Number.isFinite(count) || count < 1) return 1;
  return Math.floor(count);
}

function splitAmountIntoInstallments(totalAmount: string, installmentCount: number) {
  const parsed = Number(totalAmount);
  const totalCents = Number.isFinite(parsed) ? Math.max(0, Math.round(parsed * 100)) : 0;
  const baseCents = Math.floor(totalCents / installmentCount);
  const remainder = totalCents % installmentCount;

  return Array.from({ length: installmentCount }, (_, index) => {
    const cents = baseCents + (index < remainder ? 1 : 0);
    return (cents / 100).toFixed(2);
  });
}

function addMonthsToIsoDate(dateStr: string, offset: number) {
  const [yearPart, monthPart, dayPart] = dateStr.split("-").map(Number);
  if (!yearPart || !monthPart || !dayPart) return dateStr;

  const monthIndex = monthPart - 1 + offset;
  const targetYear = yearPart + Math.floor(monthIndex / 12);
  const targetMonthIndex = ((monthIndex % 12) + 12) % 12;
  const lastDay = new Date(Date.UTC(targetYear, targetMonthIndex + 1, 0)).getUTCDate();
  const targetDay = Math.min(dayPart, lastDay);

  return `${String(targetYear).padStart(4, "0")}-${String(targetMonthIndex + 1).padStart(2, "0")}-${String(targetDay).padStart(2, "0")}`;
}

// ==================== PERSONAL FIXED COSTS ====================
export async function getPersonalFixedCosts(
  userId: number, 
  month?: number, 
  year?: number,
  pagination?: PaginationParams
) {
  const db = await getDb();
  if (!db) return { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasMore: false } };
  
  const conditions = [eq(personalFixedCosts.userId, userId)];
  if (month !== undefined) conditions.push(eq(personalFixedCosts.month, month));
  if (year !== undefined) conditions.push(eq(personalFixedCosts.year, year));
  
  // Obter total para paginação
  const totalResult = await db.select({ count: count() }).from(personalFixedCosts).where(and(...conditions));
  const total = totalResult[0]?.count ?? 0;
  
  // Parâmetros de paginação
  const page = Math.max(1, pagination?.page ?? 1);
  const limit = Math.min(100, Math.max(1, pagination?.limit ?? 20));
  const offset = (page - 1) * limit;
  
  // Ordenação
  const sortByField = pagination?.sortBy && personalFixedCosts[pagination.sortBy as keyof typeof personalFixedCosts] 
    ? personalFixedCosts[pagination.sortBy as keyof typeof personalFixedCosts] 
    : personalFixedCosts.dueDay;
  const orderFunc = pagination?.sortOrder === 'asc' ? asc : desc;
  
  const existing = await db.select()
    .from(personalFixedCosts)
    .where(and(...conditions))
    .orderBy(orderFunc(sortByField))
    .limit(limit)
    .offset(offset);

  // Auto-propagate: if querying a specific month with no records, copy from most recent month
  if (existing.data.length === 0 && month !== undefined && year !== undefined) {
    const allRecords = await db.select().from(personalFixedCosts)
      .where(eq(personalFixedCosts.userId, userId))
      .orderBy(desc(personalFixedCosts.year), desc(personalFixedCosts.month));
    if (allRecords.length > 0) {
      const srcYear = allRecords[0].year;
      const srcMonth = allRecords[0].month;
      if (year * 12 + month > srcYear * 12 + srcMonth) {
        const templates = allRecords.filter(r => r.year === srcYear && r.month === srcMonth);
        await db.insert(personalFixedCosts).values(
          templates.map(t => ({ userId, description: t.description, category: t.category, amount: t.amount, dueDay: t.dueDay, month, year, status: "pendente" as const }))
        );
        const refreshed = await db.select().from(personalFixedCosts).where(and(...conditions)).orderBy(asc(personalFixedCosts.dueDay));
        return { data: refreshed, pagination: { page: 1, limit: 20, total: refreshed.length, totalPages: 1, hasMore: false } };
      }
    }
  }
  
  return {
    data: existing,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: offset + existing.length < total
    }
  };
}

export async function createPersonalFixedCost(data: InsertPersonalFixedCost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [inserted] = await db.insert(personalFixedCosts).values(data).returning({ id: personalFixedCosts.id });
  return { id: inserted.id, ...data };
}

export async function updatePersonalFixedCost(id: number, userId: number, data: Partial<InsertPersonalFixedCost>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(personalFixedCosts).set(data).where(and(eq(personalFixedCosts.id, id), eq(personalFixedCosts.userId, userId)));
}

export async function deletePersonalFixedCost(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(personalFixedCosts).where(and(eq(personalFixedCosts.id, id), eq(personalFixedCosts.userId, userId)));
}

// ==================== PERSONAL VARIABLE COSTS ====================
export async function getPersonalVariableCosts(
  userId: number, 
  month?: number, 
  year?: number,
  pagination?: PaginationParams
) {
  const db = await getDb();
  if (!db) return { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasMore: false } };
  
  const conditions = [eq(personalVariableCosts.userId, userId)];
  if (month !== undefined && year !== undefined) {
    conditions.push(sql`EXTRACT(MONTH FROM ${personalVariableCosts.date}::date) = ${month}`);
    conditions.push(sql`EXTRACT(YEAR FROM ${personalVariableCosts.date}::date) = ${year}`);
  }
  
  // Obter total para paginação
  const totalResult = await db.select({ count: count() }).from(personalVariableCosts).where(and(...conditions));
  const total = totalResult[0]?.count ?? 0;
  
  // Parâmetros de paginação
  const page = Math.max(1, pagination?.page ?? 1);
  const limit = Math.min(100, Math.max(1, pagination?.limit ?? 20));
  const offset = (page - 1) * limit;
  
  // Ordenação
  const sortByField = pagination?.sortBy && personalVariableCosts[pagination.sortBy as keyof typeof personalVariableCosts] 
    ? personalVariableCosts[pagination.sortBy as keyof typeof personalVariableCosts] 
    : personalVariableCosts.date;
  const orderFunc = pagination?.sortOrder === 'asc' ? asc : desc;
  
  const data = await db.select()
    .from(personalVariableCosts)
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

export async function createPersonalVariableCost(data: InsertPersonalVariableCost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const installmentCount = normalizeInstallmentCount(data.installmentCount);
  const installmentSeriesId = installmentCount > 1 ? randomUUID() : null;
  const installmentAmounts = splitAmountIntoInstallments(data.amount, installmentCount);
  const rows = installmentAmounts.map((amount, index) => ({
    ...data,
    amount,
    date: addMonthsToIsoDate(data.date, index),
    installmentSeriesId,
    installmentCount,
    installmentNumber: index + 1,
  }));
  const inserted = await db.insert(personalVariableCosts).values(rows).returning({ id: personalVariableCosts.id });
  return { id: inserted[0].id, ...rows[0] };
}

export async function updatePersonalVariableCost(id: number, userId: number, data: Partial<InsertPersonalVariableCost>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(personalVariableCosts).set(data).where(and(eq(personalVariableCosts.id, id), eq(personalVariableCosts.userId, userId)));
}

export async function deletePersonalVariableCost(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(personalVariableCosts).where(and(eq(personalVariableCosts.id, id), eq(personalVariableCosts.userId, userId)));
}
