import { eq, and, sql, desc, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  settings, InsertSettings,
  revenues, InsertRevenue,
  companyFixedCosts, InsertCompanyFixedCost,
  companyVariableCosts, InsertCompanyVariableCost,
  employees, InsertEmployee,
  suppliers, InsertSupplier,
  supplierPurchases, InsertSupplierPurchase,
  personalFixedCosts, InsertPersonalFixedCost,
  personalVariableCosts, InsertPersonalVariableCost,
  debts, InsertDebt,
  investments, InsertInvestment,
  reserveFunds, InsertReserveFund,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ==================== USERS ====================
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; } else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) { console.error("[Database] Failed to upsert user:", error); throw error; }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ==================== SETTINGS ====================
export async function getSettings(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(settings).where(eq(settings.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertSettings(data: InsertSettings) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getSettings(data.userId);
  if (existing) {
    await db.update(settings).set(data).where(eq(settings.userId, data.userId));
    return { ...existing, ...data };
  } else {
    await db.insert(settings).values(data);
    return data;
  }
}

// ==================== REVENUES ====================
export async function getRevenues(userId: number, month?: number, year?: number) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(revenues.userId, userId)];
  if (month !== undefined && year !== undefined) {
    conditions.push(sql`MONTH(${revenues.dueDate}) = ${month}`);
    conditions.push(sql`YEAR(${revenues.dueDate}) = ${year}`);
  }
  return db.select().from(revenues).where(and(...conditions)).orderBy(desc(revenues.dueDate));
}

export async function createRevenue(data: InsertRevenue) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(revenues).values(data);
  return { id: result[0].insertId, ...data };
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

// ==================== COMPANY FIXED COSTS ====================
export async function getCompanyFixedCosts(userId: number, month?: number, year?: number) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(companyFixedCosts.userId, userId)];
  if (month !== undefined) conditions.push(eq(companyFixedCosts.month, month));
  if (year !== undefined) conditions.push(eq(companyFixedCosts.year, year));
  return db.select().from(companyFixedCosts).where(and(...conditions)).orderBy(asc(companyFixedCosts.dueDay));
}

export async function createCompanyFixedCost(data: InsertCompanyFixedCost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(companyFixedCosts).values(data);
  return { id: result[0].insertId, ...data };
}

export async function updateCompanyFixedCost(id: number, userId: number, data: Partial<InsertCompanyFixedCost>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(companyFixedCosts).set(data).where(and(eq(companyFixedCosts.id, id), eq(companyFixedCosts.userId, userId)));
}

export async function deleteCompanyFixedCost(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(companyFixedCosts).where(and(eq(companyFixedCosts.id, id), eq(companyFixedCosts.userId, userId)));
}

// ==================== COMPANY VARIABLE COSTS ====================
export async function getCompanyVariableCosts(userId: number, month?: number, year?: number) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(companyVariableCosts.userId, userId)];
  if (month !== undefined && year !== undefined) {
    conditions.push(sql`MONTH(${companyVariableCosts.date}) = ${month}`);
    conditions.push(sql`YEAR(${companyVariableCosts.date}) = ${year}`);
  }
  return db.select().from(companyVariableCosts).where(and(...conditions)).orderBy(desc(companyVariableCosts.date));
}

export async function createCompanyVariableCost(data: InsertCompanyVariableCost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(companyVariableCosts).values(data);
  return { id: result[0].insertId, ...data };
}

export async function updateCompanyVariableCost(id: number, userId: number, data: Partial<InsertCompanyVariableCost>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(companyVariableCosts).set(data).where(and(eq(companyVariableCosts.id, id), eq(companyVariableCosts.userId, userId)));
}

export async function deleteCompanyVariableCost(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(companyVariableCosts).where(and(eq(companyVariableCosts.id, id), eq(companyVariableCosts.userId, userId)));
}

// ==================== EMPLOYEES ====================
export async function getEmployees(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(employees).where(eq(employees.userId, userId)).orderBy(asc(employees.name));
}

export async function createEmployee(data: InsertEmployee) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(employees).values(data);
  return { id: result[0].insertId, ...data };
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
  const result = await db.insert(suppliers).values(data);
  return { id: result[0].insertId, ...data };
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
    conditions.push(sql`MONTH(${supplierPurchases.dueDate}) = ${month}`);
    conditions.push(sql`YEAR(${supplierPurchases.dueDate}) = ${year}`);
  }
  return db.select().from(supplierPurchases).where(and(...conditions)).orderBy(desc(supplierPurchases.dueDate));
}

export async function createSupplierPurchase(data: InsertSupplierPurchase) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(supplierPurchases).values(data);
  return { id: result[0].insertId, ...data };
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

// ==================== PERSONAL FIXED COSTS ====================
export async function getPersonalFixedCosts(userId: number, month?: number, year?: number) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(personalFixedCosts.userId, userId)];
  if (month !== undefined) conditions.push(eq(personalFixedCosts.month, month));
  if (year !== undefined) conditions.push(eq(personalFixedCosts.year, year));
  return db.select().from(personalFixedCosts).where(and(...conditions)).orderBy(asc(personalFixedCosts.dueDay));
}

export async function createPersonalFixedCost(data: InsertPersonalFixedCost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(personalFixedCosts).values(data);
  return { id: result[0].insertId, ...data };
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
export async function getPersonalVariableCosts(userId: number, month?: number, year?: number) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(personalVariableCosts.userId, userId)];
  if (month !== undefined && year !== undefined) {
    conditions.push(sql`MONTH(${personalVariableCosts.date}) = ${month}`);
    conditions.push(sql`YEAR(${personalVariableCosts.date}) = ${year}`);
  }
  return db.select().from(personalVariableCosts).where(and(...conditions)).orderBy(desc(personalVariableCosts.date));
}

export async function createPersonalVariableCost(data: InsertPersonalVariableCost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(personalVariableCosts).values(data);
  return { id: result[0].insertId, ...data };
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

// ==================== DEBTS ====================
export async function getDebts(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(debts).where(eq(debts.userId, userId)).orderBy(desc(debts.interestRate));
}

export async function createDebt(data: InsertDebt) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(debts).values(data);
  return { id: result[0].insertId, ...data };
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
  const result = await db.insert(investments).values(data);
  return { id: result[0].insertId, ...data };
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
  const result = await db.insert(reserveFunds).values(data);
  return { id: result[0].insertId, ...data };
}

export async function deleteReserveFund(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(reserveFunds).where(and(eq(reserveFunds.id, id), eq(reserveFunds.userId, userId)));
}

// ==================== DASHBOARD SUMMARIES ====================
export async function getCompanyDashboardData(userId: number, month: number, year: number) {
  const db = await getDb();
  if (!db) return null;

  const [revenueData] = await db.select({
    totalGross: sql<string>`COALESCE(SUM(${revenues.grossAmount}), 0)`,
    totalTax: sql<string>`COALESCE(SUM(${revenues.taxAmount}), 0)`,
    totalNet: sql<string>`COALESCE(SUM(${revenues.netAmount}), 0)`,
    count: sql<number>`COUNT(*)`,
  }).from(revenues).where(and(
    eq(revenues.userId, userId),
    sql`MONTH(${revenues.dueDate}) = ${month}`,
    sql`YEAR(${revenues.dueDate}) = ${year}`
  ));

  const [fixedCostsData] = await db.select({
    total: sql<string>`COALESCE(SUM(${companyFixedCosts.amount}), 0)`,
    paid: sql<string>`COALESCE(SUM(CASE WHEN ${companyFixedCosts.status} = 'pago' THEN ${companyFixedCosts.amount} ELSE 0 END), 0)`,
  }).from(companyFixedCosts).where(and(
    eq(companyFixedCosts.userId, userId),
    eq(companyFixedCosts.month, month),
    eq(companyFixedCosts.year, year)
  ));

  const [varCostsData] = await db.select({
    total: sql<string>`COALESCE(SUM(${companyVariableCosts.amount}), 0)`,
  }).from(companyVariableCosts).where(and(
    eq(companyVariableCosts.userId, userId),
    sql`MONTH(${companyVariableCosts.date}) = ${month}`,
    sql`YEAR(${companyVariableCosts.date}) = ${year}`
  ));

  const [employeesData] = await db.select({
    totalCost: sql<string>`COALESCE(SUM(${employees.totalCost}), 0)`,
    count: sql<number>`COUNT(*)`,
  }).from(employees).where(and(
    eq(employees.userId, userId),
    eq(employees.status, "ativo")
  ));

  const [purchasesData] = await db.select({
    total: sql<string>`COALESCE(SUM(${supplierPurchases.amount}), 0)`,
  }).from(supplierPurchases).where(and(
    eq(supplierPurchases.userId, userId),
    sql`MONTH(${supplierPurchases.dueDate}) = ${month}`,
    sql`YEAR(${supplierPurchases.dueDate}) = ${year}`
  ));

  const [reserveData] = await db.select({
    total: sql<string>`COALESCE(SUM(${reserveFunds.depositAmount}), 0)`,
  }).from(reserveFunds).where(and(
    eq(reserveFunds.userId, userId),
    eq(reserveFunds.type, "empresa")
  ));

  const userSettings = await getSettings(userId);

  return {
    revenue: revenueData,
    fixedCosts: fixedCostsData,
    variableCosts: varCostsData,
    employees: employeesData,
    purchases: purchasesData,
    reserve: reserveData,
    settings: userSettings,
  };
}

export async function getPersonalDashboardData(userId: number, month: number, year: number) {
  const db = await getDb();
  if (!db) return null;

  const [fixedCostsData] = await db.select({
    total: sql<string>`COALESCE(SUM(${personalFixedCosts.amount}), 0)`,
    paid: sql<string>`COALESCE(SUM(CASE WHEN ${personalFixedCosts.status} = 'pago' THEN ${personalFixedCosts.amount} ELSE 0 END), 0)`,
  }).from(personalFixedCosts).where(and(
    eq(personalFixedCosts.userId, userId),
    eq(personalFixedCosts.month, month),
    eq(personalFixedCosts.year, year)
  ));

  const [varCostsData] = await db.select({
    total: sql<string>`COALESCE(SUM(${personalVariableCosts.amount}), 0)`,
  }).from(personalVariableCosts).where(and(
    eq(personalVariableCosts.userId, userId),
    sql`MONTH(${personalVariableCosts.date}) = ${month}`,
    sql`YEAR(${personalVariableCosts.date}) = ${year}`
  ));

  const [debtsData] = await db.select({
    totalBalance: sql<string>`COALESCE(SUM(${debts.currentBalance}), 0)`,
    totalMonthly: sql<string>`COALESCE(SUM(${debts.monthlyPayment}), 0)`,
    count: sql<number>`COUNT(*)`,
  }).from(debts).where(and(
    eq(debts.userId, userId),
    eq(debts.status, "ativa")
  ));

  const [investmentsData] = await db.select({
    totalDeposited: sql<string>`COALESCE(SUM(${investments.depositAmount}), 0)`,
    totalBalance: sql<string>`COALESCE(SUM(${investments.currentBalance}), 0)`,
  }).from(investments).where(eq(investments.userId, userId));

  const [reserveData] = await db.select({
    total: sql<string>`COALESCE(SUM(${reserveFunds.depositAmount}), 0)`,
  }).from(reserveFunds).where(and(
    eq(reserveFunds.userId, userId),
    eq(reserveFunds.type, "pessoal")
  ));

  const userSettings = await getSettings(userId);

  return {
    fixedCosts: fixedCostsData,
    variableCosts: varCostsData,
    debts: debtsData,
    investments: investmentsData,
    reserve: reserveData,
    settings: userSettings,
  };
}

// ==================== CALENDAR DATA ====================
export async function getCalendarData(userId: number, month: number, year: number) {
  const db = await getDb();
  if (!db) return [];

  const items: Array<{ day: number; description: string; amount: string; type: string; status: string }> = [];

  const fixedCo = await getCompanyFixedCosts(userId, month, year);
  fixedCo.forEach(c => items.push({ day: c.dueDay, description: `[EMP] ${c.description}`, amount: c.amount, type: "custo_fixo_emp", status: c.status }));

  const fixedPe = await getPersonalFixedCosts(userId, month, year);
  fixedPe.forEach(c => items.push({ day: c.dueDay, description: `[PES] ${c.description}`, amount: c.amount, type: "custo_fixo_pes", status: c.status }));

  const activeDebts = await getDebts(userId);
  activeDebts.filter(d => d.status === "ativa").forEach(d => items.push({ day: d.dueDay, description: `[DIV] ${d.creditor}`, amount: d.monthlyPayment, type: "divida", status: "pendente" }));

  return items.sort((a, b) => a.day - b.day);
}
