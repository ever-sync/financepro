import { eq, and, sql, desc, asc } from "drizzle-orm";
import { getDb } from "./db";
import { 
  employees, InsertEmployee,
  suppliers, InsertSupplier,
  supplierPurchases, InsertSupplierPurchase,
} from "../../drizzle/schema";
import type { PaginationParams, PaginatedResult } from "./utils/pagination";
import { calculatePagination } from "./utils/pagination";

// ==================== EMPLOYEES ====================
export async function getEmployees(
  userId: number, 
  pagination?: PaginationParams
): Promise<PaginatedResult<typeof employees.$inferSelect>> {
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
    .from(employees)
    .where(eq(employees.userId, userId));

  // Build order clause
  const sortBy = pagination?.sortBy && employees[pagination.sortBy as keyof typeof employees] 
    ? employees[pagination.sortBy as keyof typeof employees] 
    : employees.name;
  const orderDir = pagination?.sortOrder === 'desc' ? desc(sortBy) : asc(sortBy);

  const data = await db
    .select()
    .from(employees)
    .where(eq(employees.userId, userId))
    .orderBy(orderDir)
    .limit(safeLimit)
    .offset(offset);

  return {
    data,
    pagination: calculatePagination(Number(count), safePage, safeLimit)
  };
}

export async function createEmployee(data: InsertEmployee) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [inserted] = await db.insert(employees).values(data).returning({ id: employees.id });
  return { id: inserted.id, ...data };
}

export async function updateEmployee(id: number, userId: number, data: Partial<InsertEmployee>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(employees).set(data).where(and(eq(employees.id, id), eq(employees.userId, userId)));
}

export async function deleteEmployee(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(employees).where(and(eq(employees.id, id), eq(employees.userId, userId)));
}

// ==================== SUPPLIERS ====================
export async function getSuppliers(
  userId: number,
  pagination?: PaginationParams
): Promise<PaginatedResult<typeof suppliers.$inferSelect>> {
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
    .from(suppliers)
    .where(eq(suppliers.userId, userId));

  // Build order clause
  const sortBy = pagination?.sortBy && suppliers[pagination.sortBy as keyof typeof suppliers] 
    ? suppliers[pagination.sortBy as keyof typeof suppliers] 
    : suppliers.name;
  const orderDir = pagination?.sortOrder === 'desc' ? desc(sortBy) : asc(sortBy);

  const data = await db
    .select()
    .from(suppliers)
    .where(eq(suppliers.userId, userId))
    .orderBy(orderDir)
    .limit(safeLimit)
    .offset(offset);

  return {
    data,
    pagination: calculatePagination(Number(count), safePage, safeLimit)
  };
}

export async function createSupplier(data: InsertSupplier) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [inserted] = await db.insert(suppliers).values(data).returning({ id: suppliers.id });
  return { id: inserted.id, ...data };
}

export async function updateSupplier(id: number, userId: number, data: Partial<InsertSupplier>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(suppliers).set(data).where(and(eq(suppliers.id, id), eq(suppliers.userId, userId)));
}

export async function deleteSupplier(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(suppliers).where(and(eq(suppliers.id, id), eq(suppliers.userId, userId)));
}

// ==================== SUPPLIER PURCHASES ====================
export async function getSupplierPurchases(
  userId: number, 
  month?: number, 
  year?: number,
  pagination?: PaginationParams
): Promise<PaginatedResult<typeof supplierPurchases.$inferSelect>> {
  const db = await getDb();
  if (!db) {
    return { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasMore: false } };
  }

  const safePage = Math.max(1, pagination?.page ?? 1);
  const safeLimit = Math.min(100, Math.max(1, pagination?.limit ?? 20));
  const offset = (safePage - 1) * safeLimit;

  // Build conditions
  const conditions = [eq(supplierPurchases.userId, userId)];
  if (month !== undefined && year !== undefined) {
    conditions.push(sql`EXTRACT(MONTH FROM ${supplierPurchases.dueDate}::date) = ${month}`);
    conditions.push(sql`EXTRACT(YEAR FROM ${supplierPurchases.dueDate}::date) = ${year}`);
  }

  // Count total
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(supplierPurchases)
    .where(and(...conditions));

  // Build order clause
  const sortBy = pagination?.sortBy && supplierPurchases[pagination.sortBy as keyof typeof supplierPurchases] 
    ? supplierPurchases[pagination.sortBy as keyof typeof supplierPurchases] 
    : supplierPurchases.dueDate;
  const orderDir = pagination?.sortOrder === 'desc' ? desc(sortBy) : asc(sortBy);

  const data = await db
    .select()
    .from(supplierPurchases)
    .where(and(...conditions))
    .orderBy(orderDir)
    .limit(safeLimit)
    .offset(offset);

  return {
    data,
    pagination: calculatePagination(Number(count), safePage, safeLimit)
  };
}

export async function createSupplierPurchase(data: InsertSupplierPurchase) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [inserted] = await db.insert(supplierPurchases).values(data).returning({ id: supplierPurchases.id });
  return { id: inserted.id, ...data };
}

export async function updateSupplierPurchase(id: number, userId: number, data: Partial<InsertSupplierPurchase>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(supplierPurchases).set(data).where(and(eq(supplierPurchases.id, id), eq(supplierPurchases.userId, userId)));
}

export async function deleteSupplierPurchase(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(supplierPurchases).where(and(eq(supplierPurchases.id, id), eq(supplierPurchases.userId, userId)));
}
