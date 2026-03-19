import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ==================== SETTINGS ====================
  settings: router({
    get: protectedProcedure.query(({ ctx }) => db.getSettings(ctx.user.id)),
    upsert: protectedProcedure
      .input(z.object({
        taxPercent: z.string().optional(),
        tithePercent: z.string().optional(),
        investmentPercent: z.string().optional(),
        proLaboreGross: z.string().optional(),
        companyReserveMonths: z.number().optional(),
        personalReserveMonths: z.number().optional(),
        companyName: z.string().optional(),
      }))
      .mutation(({ ctx, input }) => db.upsertSettings({ userId: ctx.user.id, ...input })),
  }),

  // ==================== REVENUES ====================
  revenues: router({
    list: protectedProcedure
      .input(z.object({ month: z.number().optional(), year: z.number().optional() }))
      .query(({ ctx, input }) => db.getRevenues(ctx.user.id, input.month, input.year)),
    create: protectedProcedure
      .input(z.object({
        description: z.string().min(1),
        category: z.string().min(1),
        grossAmount: z.string(),
        taxAmount: z.string(),
        netAmount: z.string(),
        client: z.string().optional(),
        dueDate: z.string(),
        receivedDate: z.string().nullable().optional(),
        status: z.enum(["pendente", "recebido", "atrasado"]).optional(),
        notes: z.string().optional(),
      }))
      .mutation(({ ctx, input }) => db.createRevenue({ userId: ctx.user.id, ...input })),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        description: z.string().optional(),
        category: z.string().optional(),
        grossAmount: z.string().optional(),
        taxAmount: z.string().optional(),
        netAmount: z.string().optional(),
        client: z.string().nullable().optional(),
        dueDate: z.string().optional(),
        receivedDate: z.string().nullable().optional(),
        status: z.enum(["pendente", "recebido", "atrasado"]).optional(),
        notes: z.string().nullable().optional(),
      }))
      .mutation(({ ctx, input }) => {
        const { id, ...data } = input;
        return db.updateRevenue(id, ctx.user.id, data);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ ctx, input }) => db.deleteRevenue(input.id, ctx.user.id)),
  }),

  // ==================== COMPANY FIXED COSTS ====================
  companyFixedCosts: router({
    list: protectedProcedure
      .input(z.object({ month: z.number().optional(), year: z.number().optional() }))
      .query(({ ctx, input }) => db.getCompanyFixedCosts(ctx.user.id, input.month, input.year)),
    create: protectedProcedure
      .input(z.object({
        description: z.string().min(1),
        category: z.string().min(1),
        amount: z.string(),
        dueDay: z.number().min(1).max(31),
        dueDate: z.string().nullable().optional(),
        status: z.enum(["pago", "pendente", "atrasado"]).optional(),
        month: z.number(),
        year: z.number(),
        notes: z.string().optional(),
      }))
      .mutation(({ ctx, input }) => db.createCompanyFixedCost({ userId: ctx.user.id, ...input })),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        description: z.string().optional(),
        category: z.string().optional(),
        amount: z.string().optional(),
        dueDay: z.number().optional(),
        dueDate: z.string().nullable().optional(),
        status: z.enum(["pago", "pendente", "atrasado"]).optional(),
        notes: z.string().nullable().optional(),
      }))
      .mutation(({ ctx, input }) => {
        const { id, ...data } = input;
        return db.updateCompanyFixedCost(id, ctx.user.id, data);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ ctx, input }) => db.deleteCompanyFixedCost(input.id, ctx.user.id)),
  }),

  // ==================== COMPANY VARIABLE COSTS ====================
  companyVariableCosts: router({
    list: protectedProcedure
      .input(z.object({ month: z.number().optional(), year: z.number().optional() }))
      .query(({ ctx, input }) => db.getCompanyVariableCosts(ctx.user.id, input.month, input.year)),
    create: protectedProcedure
      .input(z.object({
        description: z.string().min(1),
        category: z.string().min(1),
        amount: z.string(),
        date: z.string(),
        supplier: z.string().optional(),
        status: z.enum(["pago", "pendente", "atrasado"]).optional(),
        notes: z.string().optional(),
      }))
      .mutation(({ ctx, input }) => db.createCompanyVariableCost({ userId: ctx.user.id, ...input })),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        description: z.string().optional(),
        category: z.string().optional(),
        amount: z.string().optional(),
        date: z.string().optional(),
        supplier: z.string().nullable().optional(),
        status: z.enum(["pago", "pendente", "atrasado"]).optional(),
        notes: z.string().nullable().optional(),
      }))
      .mutation(({ ctx, input }) => {
        const { id, ...data } = input;
        return db.updateCompanyVariableCost(id, ctx.user.id, data);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ ctx, input }) => db.deleteCompanyVariableCost(input.id, ctx.user.id)),
  }),

  // ==================== EMPLOYEES ====================
  employees: router({
    list: protectedProcedure.query(({ ctx }) => db.getEmployees(ctx.user.id)),
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        role: z.string().min(1),
        salary: z.string(),
        fgtsAmount: z.string(),
        thirteenthProvision: z.string(),
        vacationProvision: z.string(),
        totalCost: z.string(),
        admissionDate: z.string().nullable().optional(),
        status: z.enum(["ativo", "inativo"]).optional(),
        notes: z.string().optional(),
      }))
      .mutation(({ ctx, input }) => db.createEmployee({ userId: ctx.user.id, ...input })),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        role: z.string().optional(),
        salary: z.string().optional(),
        fgtsAmount: z.string().optional(),
        thirteenthProvision: z.string().optional(),
        vacationProvision: z.string().optional(),
        totalCost: z.string().optional(),
        admissionDate: z.string().nullable().optional(),
        status: z.enum(["ativo", "inativo"]).optional(),
        notes: z.string().nullable().optional(),
      }))
      .mutation(({ ctx, input }) => {
        const { id, ...data } = input;
        return db.updateEmployee(id, ctx.user.id, data);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ ctx, input }) => db.deleteEmployee(input.id, ctx.user.id)),
  }),

  // ==================== SUPPLIERS ====================
  suppliers: router({
    list: protectedProcedure.query(({ ctx }) => db.getSuppliers(ctx.user.id)),
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        cnpj: z.string().optional(),
        category: z.string().optional(),
        contact: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(({ ctx, input }) => db.createSupplier({ userId: ctx.user.id, ...input })),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        cnpj: z.string().nullable().optional(),
        category: z.string().nullable().optional(),
        contact: z.string().nullable().optional(),
        phone: z.string().nullable().optional(),
        email: z.string().nullable().optional(),
        notes: z.string().nullable().optional(),
      }))
      .mutation(({ ctx, input }) => {
        const { id, ...data } = input;
        return db.updateSupplier(id, ctx.user.id, data);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ ctx, input }) => db.deleteSupplier(input.id, ctx.user.id)),
  }),

  // ==================== SUPPLIER PURCHASES ====================
  supplierPurchases: router({
    list: protectedProcedure
      .input(z.object({ month: z.number().optional(), year: z.number().optional() }))
      .query(({ ctx, input }) => db.getSupplierPurchases(ctx.user.id, input.month, input.year)),
    create: protectedProcedure
      .input(z.object({
        supplierId: z.number(),
        description: z.string().min(1),
        amount: z.string(),
        dueDate: z.string(),
        paidDate: z.string().nullable().optional(),
        status: z.enum(["pago", "pendente", "atrasado"]).optional(),
        paymentMethod: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(({ ctx, input }) => db.createSupplierPurchase({ userId: ctx.user.id, ...input })),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        supplierId: z.number().optional(),
        description: z.string().optional(),
        amount: z.string().optional(),
        dueDate: z.string().optional(),
        paidDate: z.string().nullable().optional(),
        status: z.enum(["pago", "pendente", "atrasado"]).optional(),
        paymentMethod: z.string().nullable().optional(),
        notes: z.string().nullable().optional(),
      }))
      .mutation(({ ctx, input }) => {
        const { id, ...data } = input;
        return db.updateSupplierPurchase(id, ctx.user.id, data);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ ctx, input }) => db.deleteSupplierPurchase(input.id, ctx.user.id)),
  }),

  // ==================== PERSONAL FIXED COSTS ====================
  personalFixedCosts: router({
    list: protectedProcedure
      .input(z.object({ month: z.number().optional(), year: z.number().optional() }))
      .query(({ ctx, input }) => db.getPersonalFixedCosts(ctx.user.id, input.month, input.year)),
    create: protectedProcedure
      .input(z.object({
        description: z.string().min(1),
        category: z.string().min(1),
        amount: z.string(),
        dueDay: z.number().min(1).max(31),
        dueDate: z.string().nullable().optional(),
        status: z.enum(["pago", "pendente", "atrasado"]).optional(),
        month: z.number(),
        year: z.number(),
        notes: z.string().optional(),
      }))
      .mutation(({ ctx, input }) => db.createPersonalFixedCost({ userId: ctx.user.id, ...input })),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        description: z.string().optional(),
        category: z.string().optional(),
        amount: z.string().optional(),
        dueDay: z.number().optional(),
        dueDate: z.string().nullable().optional(),
        status: z.enum(["pago", "pendente", "atrasado"]).optional(),
        notes: z.string().nullable().optional(),
      }))
      .mutation(({ ctx, input }) => {
        const { id, ...data } = input;
        return db.updatePersonalFixedCost(id, ctx.user.id, data);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ ctx, input }) => db.deletePersonalFixedCost(input.id, ctx.user.id)),
  }),

  // ==================== PERSONAL VARIABLE COSTS ====================
  personalVariableCosts: router({
    list: protectedProcedure
      .input(z.object({ month: z.number().optional(), year: z.number().optional() }))
      .query(({ ctx, input }) => db.getPersonalVariableCosts(ctx.user.id, input.month, input.year)),
    create: protectedProcedure
      .input(z.object({
        description: z.string().min(1),
        category: z.string().min(1),
        amount: z.string(),
        date: z.string(),
        status: z.enum(["pago", "pendente", "atrasado"]).optional(),
        notes: z.string().optional(),
      }))
      .mutation(({ ctx, input }) => db.createPersonalVariableCost({ userId: ctx.user.id, ...input })),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        description: z.string().optional(),
        category: z.string().optional(),
        amount: z.string().optional(),
        date: z.string().optional(),
        status: z.enum(["pago", "pendente", "atrasado"]).optional(),
        notes: z.string().nullable().optional(),
      }))
      .mutation(({ ctx, input }) => {
        const { id, ...data } = input;
        return db.updatePersonalVariableCost(id, ctx.user.id, data);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ ctx, input }) => db.deletePersonalVariableCost(input.id, ctx.user.id)),
  }),

  // ==================== DEBTS ====================
  debts: router({
    list: protectedProcedure.query(({ ctx }) => db.getDebts(ctx.user.id)),
    create: protectedProcedure
      .input(z.object({
        creditor: z.string().min(1),
        description: z.string().min(1),
        originalAmount: z.string(),
        currentBalance: z.string(),
        monthlyPayment: z.string(),
        interestRate: z.string().optional(),
        totalInstallments: z.number(),
        paidInstallments: z.number().optional(),
        dueDay: z.number().min(1).max(31),
        status: z.enum(["ativa", "quitada", "renegociada"]).optional(),
        priority: z.enum(["alta", "media", "baixa"]).optional(),
        notes: z.string().optional(),
      }))
      .mutation(({ ctx, input }) => db.createDebt({ userId: ctx.user.id, ...input })),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        creditor: z.string().optional(),
        description: z.string().optional(),
        originalAmount: z.string().optional(),
        currentBalance: z.string().optional(),
        monthlyPayment: z.string().optional(),
        interestRate: z.string().optional(),
        totalInstallments: z.number().optional(),
        paidInstallments: z.number().optional(),
        dueDay: z.number().optional(),
        status: z.enum(["ativa", "quitada", "renegociada"]).optional(),
        priority: z.enum(["alta", "media", "baixa"]).optional(),
        notes: z.string().nullable().optional(),
      }))
      .mutation(({ ctx, input }) => {
        const { id, ...data } = input;
        return db.updateDebt(id, ctx.user.id, data);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ ctx, input }) => db.deleteDebt(input.id, ctx.user.id)),
  }),

  // ==================== INVESTMENTS ====================
  investments: router({
    list: protectedProcedure.query(({ ctx }) => db.getInvestments(ctx.user.id)),
    create: protectedProcedure
      .input(z.object({
        description: z.string().min(1),
        institution: z.string().min(1),
        type: z.string().min(1),
        depositAmount: z.string(),
        currentBalance: z.string().optional(),
        yieldAmount: z.string().optional(),
        date: z.string(),
        notes: z.string().optional(),
      }))
      .mutation(({ ctx, input }) => db.createInvestment({ userId: ctx.user.id, ...input })),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        description: z.string().optional(),
        institution: z.string().optional(),
        type: z.string().optional(),
        depositAmount: z.string().optional(),
        currentBalance: z.string().optional(),
        yieldAmount: z.string().optional(),
        date: z.string().optional(),
        notes: z.string().nullable().optional(),
      }))
      .mutation(({ ctx, input }) => {
        const { id, ...data } = input;
        return db.updateInvestment(id, ctx.user.id, data);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ ctx, input }) => db.deleteInvestment(input.id, ctx.user.id)),
  }),

  // ==================== RESERVE FUNDS ====================
  reserveFunds: router({
    list: protectedProcedure
      .input(z.object({ type: z.enum(["empresa", "pessoal"]).optional() }))
      .query(({ ctx, input }) => db.getReserveFunds(ctx.user.id, input.type)),
    create: protectedProcedure
      .input(z.object({
        type: z.enum(["empresa", "pessoal"]),
        depositAmount: z.string(),
        date: z.string(),
        description: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(({ ctx, input }) => db.createReserveFund({ userId: ctx.user.id, ...input })),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ ctx, input }) => db.deleteReserveFund(input.id, ctx.user.id)),
  }),

  // ==================== DASHBOARDS ====================
  dashboard: router({
    company: protectedProcedure
      .input(z.object({ month: z.number(), year: z.number() }))
      .query(({ ctx, input }) => db.getCompanyDashboardData(ctx.user.id, input.month, input.year)),
    personal: protectedProcedure
      .input(z.object({ month: z.number(), year: z.number() }))
      .query(({ ctx, input }) => db.getPersonalDashboardData(ctx.user.id, input.month, input.year)),
  }),

  // ==================== CALENDAR ====================
  calendar: router({
    data: protectedProcedure
      .input(z.object({ month: z.number(), year: z.number() }))
      .query(({ ctx, input }) => db.getCalendarData(ctx.user.id, input.month, input.year)),
  }),
});

export type AppRouter = typeof appRouter;
