import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import * as db from "../db";

export const settingsRouter = router({
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
});
