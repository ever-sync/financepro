import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import * as db from "../db";

export const employeesRouter = router({
  list: protectedProcedure.query(({ ctx }) => db.getEmployees(ctx.user.id)),
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      role: z.string().min(1),
      contractType: z.enum(["clt", "pj"]).optional(),
      salary: z.string(),
      fgtsAmount: z.string(),
      thirteenthProvision: z.string(),
      vacationProvision: z.string(),
      totalCost: z.string(),
      paymentDay: z.number().min(1).max(31).optional(),
      admissionDate: z.string().nullable().optional(),
      status: z.enum(["ativo", "inativo"]).optional(),
      notes: z.string().optional(),
    }))
    .mutation(({ ctx, input }) => db.createEmployee({ userId: ctx.user.id, ...input, paymentDay: input.paymentDay ?? 5 })),
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      role: z.string().optional(),
      contractType: z.enum(["clt", "pj"]).optional(),
      salary: z.string().optional(),
      fgtsAmount: z.string().optional(),
      thirteenthProvision: z.string().optional(),
      vacationProvision: z.string().optional(),
      totalCost: z.string().optional(),
      paymentDay: z.number().min(1).max(31).optional(),
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
});

export const suppliersRouter = router({
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
});

export const supplierPurchasesRouter = router({
  list: protectedProcedure
    .input(z.object({ 
      page: z.number().optional(),
      limit: z.number().optional(),
      month: z.number().optional(), 
      year: z.number().optional() 
    }))
    .query(({ ctx, input }) => db.getSupplierPurchases(ctx.user.id, input.month, input.year, input.page, input.limit)),
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
});
