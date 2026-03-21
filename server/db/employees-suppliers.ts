import { eq, and, sql, desc, asc } from "drizzle-orm";
import { getDb } from "./db";
import { 
  employees, InsertEmployee,
  suppliers, InsertSupplier,
  supplierPurchases, InsertSupplierPurchase,
} from "../../drizzle/schema";

// ==================== EMPLOYEES ====================
export async function getEmployees(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(employees).where(eq(employees.userId, userId)).orderBy(asc(employees.name));
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
export async function getSuppliers(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(suppliers).where(eq(suppliers.userId, userId)).orderBy(asc(suppliers.name));
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
export async function getSupplierPurchases(userId: number, month?: number, year?: number) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(supplierPurchases.userId, userId)];
  if (month !== undefined && year !== undefined) {
    conditions.push(sql`EXTRACT(MONTH FROM ${supplierPurchases.dueDate}::date) = ${month}`);
    conditions.push(sql`EXTRACT(YEAR FROM ${supplierPurchases.dueDate}::date) = ${year}`);
  }
  return db.select().from(supplierPurchases).where(and(...conditions)).orderBy(desc(supplierPurchases.dueDate));
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
