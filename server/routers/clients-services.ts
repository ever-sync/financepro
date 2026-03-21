import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import * as db from "../db";

export const clientsRouter = router({
  list: protectedProcedure.query(({ ctx }) => db.getClients(ctx.user.id)),
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      document: z.string().optional(),
      category: z.string().optional(),
      contact: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      address: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(({ ctx, input }) => db.createClient({ userId: ctx.user.id, ...input })),
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      document: z.string().nullable().optional(),
      category: z.string().nullable().optional(),
      contact: z.string().nullable().optional(),
      phone: z.string().nullable().optional(),
      email: z.string().nullable().optional(),
      address: z.string().nullable().optional(),
      notes: z.string().nullable().optional(),
    }))
    .mutation(({ ctx, input }) => {
      const { id, ...data } = input;
      return db.updateClient(id, ctx.user.id, data);
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ ctx, input }) => db.deleteClient(input.id, ctx.user.id)),
});

export const servicesRouter = router({
  list: protectedProcedure.query(({ ctx }) => db.getServices(ctx.user.id)),
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      category: z.string().optional(),
      basePrice: z.string(),
      unit: z.string().optional(),
      status: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(({ ctx, input }) => db.createService({ userId: ctx.user.id, ...input })),
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().nullable().optional(),
      category: z.string().nullable().optional(),
      basePrice: z.string().optional(),
      unit: z.string().optional(),
      status: z.string().optional(),
      notes: z.string().nullable().optional(),
    }))
    .mutation(({ ctx, input }) => {
      const { id, ...data } = input;
      return db.updateService(id, ctx.user.id, data);
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ ctx, input }) => db.deleteService(input.id, ctx.user.id)),
});
