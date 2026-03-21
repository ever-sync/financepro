import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import * as db from "../db";

export const debtsRouter = router({
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
      status: z.enum(["ativa", "atrasada", "quitada", "renegociada"]).optional(),
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
      status: z.enum(["ativa", "atrasada", "quitada", "renegociada"]).optional(),
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
});

export const investmentsRouter = router({
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
});

export const reserveFundsRouter = router({
  list: protectedProcedure
    .input(z.object({ 
      type: z.enum(["empresa", "pessoal"]).optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
    }))
    .query(({ ctx, input }) => db.getReserveFunds(ctx.user.id, input.type, input.page, input.limit)),
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
});
