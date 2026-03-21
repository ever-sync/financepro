import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import * as db from "../db";

export const dashboardRouter = router({
  company: protectedProcedure
    .input(z.object({ month: z.number(), year: z.number() }))
    .query(({ ctx, input }) => db.getCompanyDashboardData(ctx.user.id, input.month, input.year)),
  personal: protectedProcedure
    .input(z.object({ month: z.number(), year: z.number() }))
    .query(({ ctx, input }) => db.getPersonalDashboardData(ctx.user.id, input.month, input.year)),
});

export const calendarRouter = router({
  data: protectedProcedure
    .input(z.object({ month: z.number(), year: z.number() }))
    .query(({ ctx, input }) => db.getCalendarData(ctx.user.id, input.month, input.year)),
});
