import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import * as db from "../db";

export const companyFixedCostsRouter = router({
  list: protectedProcedure
    .input(z.object({ 
      page: z.number().optional(),
      limit: z.number().optional(),
      month: z.number().optional(), 
      year: z.number().optional() 
    }))
    .query(({ ctx, input }) => db.getCompanyFixedCosts(ctx.user.id, input.month, input.year, input.page, input.limit)),
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
});

export const companyVariableCostsRouter = router({
  list: protectedProcedure
    .input(z.object({ 
      page: z.number().optional(),
      limit: z.number().optional(),
      month: z.number().optional(), 
      year: z.number().optional() 
    }))
    .query(({ ctx, input }) => db.getCompanyVariableCosts(ctx.user.id, input.month, input.year, input.page, input.limit)),
  create: protectedProcedure
    .input(z.object({
      description: z.string().min(1),
      category: z.string().min(1),
      amount: z.string(),
      date: z.string(),
      supplier: z.string().optional(),
      installmentCount: z.number().min(1).max(120).optional(),
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
});
