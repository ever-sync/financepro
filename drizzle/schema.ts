import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal } from "drizzle-orm/mysql-core";

// ==================== USERS ====================
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ==================== CONFIGURAÇÕES ====================
export const settings = mysqlTable("settings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  taxPercent: decimal("taxPercent", { precision: 5, scale: 2 }).default("6.00").notNull(),
  tithePercent: decimal("tithePercent", { precision: 5, scale: 2 }).default("10.00").notNull(),
  investmentPercent: decimal("investmentPercent", { precision: 5, scale: 2 }).default("10.00").notNull(),
  proLaboreGross: decimal("proLaboreGross", { precision: 12, scale: 2 }).default("0.00").notNull(),
  companyReserveMonths: int("companyReserveMonths").default(3).notNull(),
  personalReserveMonths: int("personalReserveMonths").default(6).notNull(),
  companyName: varchar("companyName", { length: 255 }).default("Minha Empresa"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Settings = typeof settings.$inferSelect;
export type InsertSettings = typeof settings.$inferInsert;

// ==================== RECEITAS (EMPRESA) ====================
export const revenues = mysqlTable("revenues", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  description: varchar("description", { length: 500 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  grossAmount: decimal("grossAmount", { precision: 12, scale: 2 }).notNull(),
  taxAmount: decimal("taxAmount", { precision: 12, scale: 2 }).notNull(),
  netAmount: decimal("netAmount", { precision: 12, scale: 2 }).notNull(),
  client: varchar("client", { length: 255 }),
  dueDate: varchar("dueDate", { length: 10 }).notNull(),
  receivedDate: varchar("receivedDate", { length: 10 }),
  status: mysqlEnum("status", ["pendente", "recebido", "atrasado"]).default("pendente").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Revenue = typeof revenues.$inferSelect;
export type InsertRevenue = typeof revenues.$inferInsert;

// ==================== CUSTOS FIXOS EMPRESA ====================
export const companyFixedCosts = mysqlTable("company_fixed_costs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  description: varchar("description", { length: 500 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  dueDay: int("dueDay").notNull(),
  dueDate: varchar("dueDate", { length: 10 }),
  status: mysqlEnum("status", ["pago", "pendente", "atrasado"]).default("pendente").notNull(),
  month: int("month").notNull(),
  year: int("year").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CompanyFixedCost = typeof companyFixedCosts.$inferSelect;
export type InsertCompanyFixedCost = typeof companyFixedCosts.$inferInsert;

// ==================== CUSTOS VARIÁVEIS EMPRESA ====================
export const companyVariableCosts = mysqlTable("company_variable_costs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  description: varchar("description", { length: 500 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  date: varchar("date", { length: 10 }).notNull(),
  supplier: varchar("supplier", { length: 255 }),
  status: mysqlEnum("status", ["pago", "pendente", "atrasado"]).default("pendente").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CompanyVariableCost = typeof companyVariableCosts.$inferSelect;
export type InsertCompanyVariableCost = typeof companyVariableCosts.$inferInsert;

// ==================== FUNCIONÁRIOS ====================
export const employees = mysqlTable("employees", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("empRole", { length: 255 }).notNull(),
  salary: decimal("salary", { precision: 12, scale: 2 }).notNull(),
  fgtsAmount: decimal("fgtsAmount", { precision: 12, scale: 2 }).notNull(),
  thirteenthProvision: decimal("thirteenthProvision", { precision: 12, scale: 2 }).notNull(),
  vacationProvision: decimal("vacationProvision", { precision: 12, scale: 2 }).notNull(),
  totalCost: decimal("totalCost", { precision: 12, scale: 2 }).notNull(),
  admissionDate: varchar("admissionDate", { length: 10 }),
  status: mysqlEnum("empStatus", ["ativo", "inativo"]).default("ativo").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = typeof employees.$inferInsert;

// ==================== FORNECEDORES ====================
export const suppliers = mysqlTable("suppliers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  cnpj: varchar("cnpj", { length: 20 }),
  category: varchar("category", { length: 100 }),
  contact: varchar("contact", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = typeof suppliers.$inferInsert;

// ==================== COMPRAS DE FORNECEDORES ====================
export const supplierPurchases = mysqlTable("supplier_purchases", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  supplierId: int("supplierId").notNull(),
  description: varchar("description", { length: 500 }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  dueDate: varchar("dueDate", { length: 10 }).notNull(),
  paidDate: varchar("paidDate", { length: 10 }),
  status: mysqlEnum("status", ["pago", "pendente", "atrasado"]).default("pendente").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SupplierPurchase = typeof supplierPurchases.$inferSelect;
export type InsertSupplierPurchase = typeof supplierPurchases.$inferInsert;

// ==================== CONTAS FIXAS PESSOAIS ====================
export const personalFixedCosts = mysqlTable("personal_fixed_costs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  description: varchar("description", { length: 500 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  dueDay: int("dueDay").notNull(),
  dueDate: varchar("dueDate", { length: 10 }),
  status: mysqlEnum("status", ["pago", "pendente", "atrasado"]).default("pendente").notNull(),
  month: int("month").notNull(),
  year: int("year").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PersonalFixedCost = typeof personalFixedCosts.$inferSelect;
export type InsertPersonalFixedCost = typeof personalFixedCosts.$inferInsert;

// ==================== CONTAS VARIÁVEIS PESSOAIS ====================
export const personalVariableCosts = mysqlTable("personal_variable_costs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  description: varchar("description", { length: 500 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  date: varchar("date", { length: 10 }).notNull(),
  status: mysqlEnum("status", ["pago", "pendente", "atrasado"]).default("pendente").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PersonalVariableCost = typeof personalVariableCosts.$inferSelect;
export type InsertPersonalVariableCost = typeof personalVariableCosts.$inferInsert;

// ==================== DÍVIDAS PESSOAIS ====================
export const debts = mysqlTable("debts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  creditor: varchar("creditor", { length: 255 }).notNull(),
  description: varchar("description", { length: 500 }).notNull(),
  originalAmount: decimal("originalAmount", { precision: 12, scale: 2 }).notNull(),
  currentBalance: decimal("currentBalance", { precision: 12, scale: 2 }).notNull(),
  monthlyPayment: decimal("monthlyPayment", { precision: 12, scale: 2 }).notNull(),
  interestRate: decimal("interestRate", { precision: 5, scale: 2 }).default("0.00").notNull(),
  totalInstallments: int("totalInstallments").notNull(),
  paidInstallments: int("paidInstallments").default(0).notNull(),
  dueDay: int("dueDay").notNull(),
  status: mysqlEnum("debtStatus", ["ativa", "quitada", "renegociada"]).default("ativa").notNull(),
  priority: mysqlEnum("priority", ["alta", "media", "baixa"]).default("media").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Debt = typeof debts.$inferSelect;
export type InsertDebt = typeof debts.$inferInsert;

// ==================== INVESTIMENTOS PESSOAIS ====================
export const investments = mysqlTable("investments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  description: varchar("description", { length: 500 }).notNull(),
  institution: varchar("institution", { length: 255 }).notNull(),
  type: varchar("investType", { length: 100 }).notNull(),
  depositAmount: decimal("depositAmount", { precision: 12, scale: 2 }).notNull(),
  currentBalance: decimal("currentBalance", { precision: 12, scale: 2 }).default("0.00").notNull(),
  yieldAmount: decimal("yieldAmount", { precision: 12, scale: 2 }).default("0.00").notNull(),
  date: varchar("date", { length: 10 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Investment = typeof investments.$inferSelect;
export type InsertInvestment = typeof investments.$inferInsert;

// ==================== FUNDO DE RESERVA ====================
export const reserveFunds = mysqlTable("reserve_funds", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("fundType", ["empresa", "pessoal"]).notNull(),
  depositAmount: decimal("depositAmount", { precision: 12, scale: 2 }).notNull(),
  date: varchar("date", { length: 10 }).notNull(),
  description: varchar("description", { length: 500 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ReserveFund = typeof reserveFunds.$inferSelect;
export type InsertReserveFund = typeof reserveFunds.$inferInsert;
