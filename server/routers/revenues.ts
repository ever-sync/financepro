import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import * as db from "../db";

export const revenuesRouter = router({
  list: protectedProcedure
    .input(z.object({ 
      page: z.number().optional(),
      limit: z.number().optional(),
      month: z.number().optional(), 
      year: z.number().optional() 
    }))
    .query(({ ctx, input }) => db.getRevenues(ctx.user.id, input.month, input.year, input.page, input.limit)),
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
});
