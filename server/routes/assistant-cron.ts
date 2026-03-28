import { Request, Router } from "express";
import { ENV } from "../_core/env";
import { runFinancialDailyCron, runFinancialMonthEndCron, runFinancialMonthStartCron } from "../whatsapp";

const router = Router();

function isAuthorized(req: Request) {
  if (!ENV.cronSecret) return true;
  const bearer = req.header("authorization")?.replace(/^Bearer\s+/i, "") || "";
  const header = req.header("x-cron-secret") || "";
  return bearer === ENV.cronSecret || header === ENV.cronSecret;
}

router.post("/api/cron/financial-daily", async (req, res) => {
  if (!isAuthorized(req)) return res.status(401).json({ ok: false, error: "Cron nao autorizado" });
  try {
    const result = await runFinancialDailyCron();
    return res.status(200).json({ ok: true, ...result });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error instanceof Error ? error.message : "Erro no cron diario" });
  }
});

router.post("/api/cron/financial-month-start", async (req, res) => {
  if (!isAuthorized(req)) return res.status(401).json({ ok: false, error: "Cron nao autorizado" });
  try {
    const result = await runFinancialMonthStartCron();
    return res.status(200).json({ ok: true, ...result });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error instanceof Error ? error.message : "Erro no cron de inicio do mes" });
  }
});

router.post("/api/cron/financial-month-end", async (req, res) => {
  if (!isAuthorized(req)) return res.status(401).json({ ok: false, error: "Cron nao autorizado" });
  try {
    const result = await runFinancialMonthEndCron();
    return res.status(200).json({ ok: true, ...result });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error instanceof Error ? error.message : "Erro no cron de fechamento do mes" });
  }
});

export default router;
