import { Router } from "express";
import { TRPCError } from "@trpc/server";
import { handleAsaasWebhook } from "../asaas";

const router = Router();

router.post("/api/asaas/webhook", async (req, res) => {
  try {
    const result = await handleAsaasWebhook(req.header("asaas-access-token") || undefined, req.body);
    return res.status(200).json({ ok: true, ...result });
  } catch (error) {
    const status =
      error instanceof TRPCError && error.code === "UNAUTHORIZED"
        ? 401
        : error instanceof TRPCError && error.code === "PRECONDITION_FAILED"
          ? 412
          : 500;
    return res.status(status).json({
      ok: false,
      error: error instanceof Error ? error.message : "Erro ao processar webhook do Asaas",
    });
  }
});

export default router;
