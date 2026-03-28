import express from "express";
import whatsappWebhookRoutes from "../routes/whatsapp-uazapi-webhook";

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(whatsappWebhookRoutes);

export default app;

