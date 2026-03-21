import { router } from "../_core/trpc";
import { systemRouter } from "../_core/systemRouter";
import { authRouter } from "./auth";
import { settingsRouter } from "./settings";
import { revenuesRouter } from "./revenues";
import { companyFixedCostsRouter, companyVariableCostsRouter } from "./company-costs";
import { employeesRouter, suppliersRouter, supplierPurchasesRouter } from "./employees-suppliers";
import { personalFixedCostsRouter, personalVariableCostsRouter } from "./personal-costs";
import { debtsRouter, investmentsRouter, reserveFundsRouter } from "./debts-investments";
import { clientsRouter, servicesRouter } from "./clients-services";
import { dashboardRouter, calendarRouter } from "./dashboard";

export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  settings: settingsRouter,
  revenues: revenuesRouter,
  companyFixedCosts: companyFixedCostsRouter,
  companyVariableCosts: companyVariableCostsRouter,
  employees: employeesRouter,
  suppliers: suppliersRouter,
  supplierPurchases: supplierPurchasesRouter,
  personalFixedCosts: personalFixedCostsRouter,
  personalVariableCosts: personalVariableCostsRouter,
  debts: debtsRouter,
  investments: investmentsRouter,
  reserveFunds: reserveFundsRouter,
  clients: clientsRouter,
  services: servicesRouter,
  dashboard: dashboardRouter,
  calendar: calendarRouter,
});

export type AppRouter = typeof appRouter;
