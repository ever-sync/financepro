import { eq, and, sql, desc, asc, ne } from "drizzle-orm";
import { getDb } from "./db";
import { getSettings } from "./settings";
import { 
  revenues,
  companyFixedCosts,
  companyVariableCosts,
  employees,
  supplierPurchases,
  reserveFunds,
  personalFixedCosts,
  personalVariableCosts,
  debts,
  investments,
} from "../../drizzle/schema";

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
    sql`EXTRACT(MONTH FROM ${revenues.dueDate}::date) = ${month}`,
    sql`EXTRACT(YEAR FROM ${revenues.dueDate}::date) = ${year}`
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
    sql`EXTRACT(MONTH FROM ${companyVariableCosts.date}::date) = ${month}`,
    sql`EXTRACT(YEAR FROM ${companyVariableCosts.date}::date) = ${year}`
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
    sql`EXTRACT(MONTH FROM ${supplierPurchases.dueDate}::date) = ${month}`,
    sql`EXTRACT(YEAR FROM ${supplierPurchases.dueDate}::date) = ${year}`
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
    sql`EXTRACT(MONTH FROM ${personalVariableCosts.date}::date) = ${month}`,
    sql`EXTRACT(YEAR FROM ${personalVariableCosts.date}::date) = ${year}`
  ));

  const [debtsData] = await db.select({
    totalBalance: sql<string>`COALESCE(SUM(${debts.currentBalance}), 0)`,
    totalMonthly: sql<string>`COALESCE(SUM(${debts.monthlyPayment}), 0)`,
    count: sql<number>`COUNT(*)`,
  }).from(debts).where(and(
    eq(debts.userId, userId),
    ne(debts.status, "quitada")
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
  const today = new Date().getDate();
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const isCurrentMonth = month === currentMonth && year === currentYear;

  // Import functions locally to avoid circular dependency
  const { getCompanyFixedCosts } = await import("./company-costs");
  const { getCompanyVariableCosts } = await import("./company-costs");
  const { getPersonalFixedCosts } = await import("./personal-costs");
  const { getPersonalVariableCosts } = await import("./personal-costs");
  const { getEmployees } = await import("./employees-suppliers");
  const { getDebts } = await import("./debts-investments");

  const fixedCo = await getCompanyFixedCosts(userId, month, year);
  fixedCo.forEach(c => items.push({ day: c.dueDay, description: `[EMP] ${c.description}`, amount: c.amount, type: "empresa-fixo", status: c.status }));

  const variableCo = await getCompanyVariableCosts(userId, month, year);
  variableCo.forEach(c => items.push({
    day: Number(c.date.slice(8, 10)),
    description: `[EMP] ${c.description}`,
    amount: c.amount,
    type: "empresa-variavel",
    status: c.status,
  }));

  const fixedPe = await getPersonalFixedCosts(userId, month, year);
  fixedPe.forEach(c => items.push({ day: c.dueDay, description: `[PES] ${c.description}`, amount: c.amount, type: "pessoal-fixo", status: c.status }));

  const variablePe = await getPersonalVariableCosts(userId, month, year);
  variablePe.forEach(c => items.push({
    day: Number(c.date.slice(8, 10)),
    description: `[PES] ${c.description}`,
    amount: c.amount,
    type: "pessoal-variavel",
    status: c.status,
  }));

  const employeesList = await getEmployees(userId);
  employeesList.filter(e => e.status === "ativo").forEach(e =>
    items.push({
      day: e.paymentDay ?? 5,
      description: `[EMP] Salário - ${e.name}`,
      amount: e.totalCost,
      type: "empresa-folha",
      status: isCurrentMonth && (e.paymentDay ?? 5) < today ? "atrasada" : "pendente",
    })
  );

  const activeDebts = await getDebts(userId);
  activeDebts.filter(d => d.status !== "quitada").forEach(d =>
    items.push({
      day: d.dueDay,
      description: `[DIV] ${d.creditor}`,
      amount: d.monthlyPayment,
      type: "divida",
      status: d.status === "atrasada" || (isCurrentMonth && d.dueDay < today) ? "atrasada" : "pendente",
    })
  );

  return items.sort((a, b) => a.day - b.day);
}
