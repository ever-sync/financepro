import { Router } from "express";
import { handleUazapiWebhook } from "../whatsapp";

const router = Router();

router.post("/api/whatsapp/uazapi/webhook", async (req, res) => {
  try {
    const result = await handleUazapiWebhook(req.body);
    return res.status(200).json({ ok: true, ...result });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : "Erro ao processar webhook da Uazapi",
    });
  }
});

export default router;

