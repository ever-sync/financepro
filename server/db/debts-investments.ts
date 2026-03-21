import { eq, and, desc } from "drizzle-orm";
import { getDb } from "./db";
import { 
  debts, InsertDebt,
  investments, InsertInvestment,
  reserveFunds, InsertReserveFund,
} from "../../drizzle/schema";

// ==================== DEBTS ====================
export async function getDebts(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(debts).where(eq(debts.userId, userId)).orderBy(desc(debts.interestRate));
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
export async function getInvestments(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(investments).where(eq(investments.userId, userId)).orderBy(desc(investments.date));
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
export async function getReserveFunds(userId: number, type?: "empresa" | "pessoal") {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(reserveFunds.userId, userId)];
  if (type) conditions.push(eq(reserveFunds.type, type));
  return db.select().from(reserveFunds).where(and(...conditions)).orderBy(desc(reserveFunds.date));
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
