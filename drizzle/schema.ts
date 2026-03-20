import { pgTable, pgEnum, serial, varchar, text, timestamp, integer, numeric } from "drizzle-orm/pg-core";

// ==================== ENUMS ====================
export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const revenueStatusEnum = pgEnum("revenue_status", ["pendente", "recebido", "atrasado"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pago", "pendente", "atrasado"]);
export const employeeStatusEnum = pgEnum("employee_status", ["ativo", "inativo"]);
export const contractTypeEnum = pgEnum("contract_type", ["clt", "pj"]);
export const debtStatusEnum = pgEnum("debt_status", ["ativa", "atrasada", "quitada", "renegociada"]);
export const debtPriorityEnum = pgEnum("debt_priority", ["alta", "media", "baixa"]);
export const fundTypeEnum = pgEnum("fund_type", ["empresa", "pessoal"]);

// ==================== USERS ====================
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: userRoleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ==================== CONFIGURAÇÕES ====================
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  taxPercent: numeric("taxPercent", { precision: 5, scale: 2 }).default("6.00").notNull(),
  tithePercent: numeric("tithePercent", { precision: 5, scale: 2 }).default("10.00").notNull(),
  investmentPercent: numeric("investmentPercent", { precision: 5, scale: 2 }).default("10.00").notNull(),
  proLaboreGross: numeric("proLaboreGross", { precision: 12, scale: 2 }).default("0.00").notNull(),
  companyReserveMonths: integer("companyReserveMonths").default(3).notNull(),
  personalReserveMonths: integer("personalReserveMonths").default(6).notNull(),
  companyName: varchar("companyName", { length: 255 }).default("Minha Empresa"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Settings = typeof settings.$inferSelect;
export type InsertSettings = typeof settings.$inferInsert;

// ==================== RECEITAS (EMPRESA) ====================
export const revenues = pgTable("revenues", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  description: varchar("description", { length: 500 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  grossAmount: numeric("grossAmount", { precision: 12, scale: 2 }).notNull(),
  taxAmount: numeric("taxAmount", { precision: 12, scale: 2 }).notNull(),
  netAmount: numeric("netAmount", { precision: 12, scale: 2 }).notNull(),
  client: varchar("client", { length: 255 }),
  dueDate: varchar("dueDate", { length: 10 }).notNull(),
  receivedDate: varchar("receivedDate", { length: 10 }),
  status: revenueStatusEnum("status").default("pendente").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Revenue = typeof revenues.$inferSelect;
export type InsertRevenue = typeof revenues.$inferInsert;

// ==================== CUSTOS FIXOS EMPRESA ====================
export const companyFixedCosts = pgTable("company_fixed_costs", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  description: varchar("description", { length: 500 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  dueDay: integer("dueDay").notNull(),
  dueDate: varchar("dueDate", { length: 10 }),
  status: paymentStatusEnum("status").default("pendente").notNull(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type CompanyFixedCost = typeof companyFixedCosts.$inferSelect;
export type InsertCompanyFixedCost = typeof companyFixedCosts.$inferInsert;

// ==================== CUSTOS VARIÁVEIS EMPRESA ====================
export const companyVariableCosts = pgTable("company_variable_costs", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  description: varchar("description", { length: 500 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  date: varchar("date", { length: 10 }).notNull(),
  supplier: varchar("supplier", { length: 255 }),
  installmentSeriesId: varchar("installmentSeriesId", { length: 64 }),
  installmentCount: integer("installmentCount").default(1).notNull(),
  installmentNumber: integer("installmentNumber").default(1).notNull(),
  status: paymentStatusEnum("status").default("pendente").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type CompanyVariableCost = typeof companyVariableCosts.$inferSelect;
export type InsertCompanyVariableCost = typeof companyVariableCosts.$inferInsert;

// ==================== FUNCIONÁRIOS ====================
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("empRole", { length: 255 }).notNull(),
  contractType: contractTypeEnum("contractType").default("clt").notNull(),
  salary: numeric("salary", { precision: 12, scale: 2 }).notNull(),
  fgtsAmount: numeric("fgtsAmount", { precision: 12, scale: 2 }).notNull(),
  thirteenthProvision: numeric("thirteenthProvision", { precision: 12, scale: 2 }).notNull(),
  vacationProvision: numeric("vacationProvision", { precision: 12, scale: 2 }).notNull(),
  totalCost: numeric("totalCost", { precision: 12, scale: 2 }).notNull(),
  admissionDate: varchar("admissionDate", { length: 10 }),
  status: employeeStatusEnum("empStatus").default("ativo").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = typeof employees.$inferInsert;

// ==================== FORNECEDORES ====================
export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  cnpj: varchar("cnpj", { length: 20 }),
  category: varchar("category", { length: 100 }),
  contact: varchar("contact", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = typeof suppliers.$inferInsert;

// ==================== COMPRAS DE FORNECEDORES ====================
export const supplierPurchases = pgTable("supplier_purchases", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  supplierId: integer("supplierId").notNull(),
  description: varchar("description", { length: 500 }).notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  dueDate: varchar("dueDate", { length: 10 }).notNull(),
  paidDate: varchar("paidDate", { length: 10 }),
  status: paymentStatusEnum("status").default("pendente").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type SupplierPurchase = typeof supplierPurchases.$inferSelect;
export type InsertSupplierPurchase = typeof supplierPurchases.$inferInsert;

// ==================== CONTAS FIXAS PESSOAIS ====================
export const personalFixedCosts = pgTable("personal_fixed_costs", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  description: varchar("description", { length: 500 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  dueDay: integer("dueDay").notNull(),
  dueDate: varchar("dueDate", { length: 10 }),
  status: paymentStatusEnum("status").default("pendente").notNull(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type PersonalFixedCost = typeof personalFixedCosts.$inferSelect;
export type InsertPersonalFixedCost = typeof personalFixedCosts.$inferInsert;

// ==================== CONTAS VARIÁVEIS PESSOAIS ====================
export const personalVariableCosts = pgTable("personal_variable_costs", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  description: varchar("description", { length: 500 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  date: varchar("date", { length: 10 }).notNull(),
  installmentSeriesId: varchar("installmentSeriesId", { length: 64 }),
  installmentCount: integer("installmentCount").default(1).notNull(),
  installmentNumber: integer("installmentNumber").default(1).notNull(),
  status: paymentStatusEnum("status").default("pendente").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type PersonalVariableCost = typeof personalVariableCosts.$inferSelect;
export type InsertPersonalVariableCost = typeof personalVariableCosts.$inferInsert;

// ==================== DÍVIDAS PESSOAIS ====================
export const debts = pgTable("debts", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  creditor: varchar("creditor", { length: 255 }).notNull(),
  description: varchar("description", { length: 500 }).notNull(),
  originalAmount: numeric("originalAmount", { precision: 12, scale: 2 }).notNull(),
  currentBalance: numeric("currentBalance", { precision: 12, scale: 2 }).notNull(),
  monthlyPayment: numeric("monthlyPayment", { precision: 12, scale: 2 }).notNull(),
  interestRate: numeric("interestRate", { precision: 5, scale: 2 }).default("0.00").notNull(),
  totalInstallments: integer("totalInstallments").notNull(),
  paidInstallments: integer("paidInstallments").default(0).notNull(),
  dueDay: integer("dueDay").notNull(),
  status: debtStatusEnum("debtStatus").default("ativa").notNull(),
  priority: debtPriorityEnum("priority").default("media").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Debt = typeof debts.$inferSelect;
export type InsertDebt = typeof debts.$inferInsert;

// ==================== INVESTIMENTOS PESSOAIS ====================
export const investments = pgTable("investments", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  description: varchar("description", { length: 500 }).notNull(),
  institution: varchar("institution", { length: 255 }).notNull(),
  type: varchar("investType", { length: 100 }).notNull(),
  depositAmount: numeric("depositAmount", { precision: 12, scale: 2 }).notNull(),
  currentBalance: numeric("currentBalance", { precision: 12, scale: 2 }).default("0.00").notNull(),
  yieldAmount: numeric("yieldAmount", { precision: 12, scale: 2 }).default("0.00").notNull(),
  date: varchar("date", { length: 10 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Investment = typeof investments.$inferSelect;
export type InsertInvestment = typeof investments.$inferInsert;

// ==================== CLIENTES ====================
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  document: varchar("document", { length: 20 }),
  category: varchar("category", { length: 100 }),
  contact: varchar("contact", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  address: varchar("address", { length: 500 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

// ==================== SERVIÇOS ====================
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  basePrice: numeric("basePrice", { precision: 12, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 50 }).default("projeto").notNull(),
  status: varchar("status", { length: 20 }).default("ativo").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Service = typeof services.$inferSelect;
export type InsertService = typeof services.$inferInsert;

// ==================== FUNDO DE RESERVA ====================
export const reserveFunds = pgTable("reserve_funds", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  type: fundTypeEnum("fundType").notNull(),
  depositAmount: numeric("depositAmount", { precision: 12, scale: 2 }).notNull(),
  date: varchar("date", { length: 10 }).notNull(),
  description: varchar("description", { length: 500 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type ReserveFund = typeof reserveFunds.$inferSelect;
export type InsertReserveFund = typeof reserveFunds.$inferInsert;
