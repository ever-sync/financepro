import { Router } from "express";
import { handleAsaasWebhook } from "../asaas";

const router = Router();

router.post("/api/asaas/webhook", async (req, res) => {
  try {
    const result = await handleAsaasWebhook(req.header("asaas-access-token") || undefined, req.body);
    return res.status(200).json({ ok: true, ...result });
  } catch (error) {
    return res.status(200).json({
      ok: false,
      error: error instanceof Error ? error.message : "Erro ao processar webhook do Asaas",
    });
  }
});

export default router;
