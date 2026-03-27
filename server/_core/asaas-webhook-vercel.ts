import express from "express";
import asaasWebhookRoutes from "../routes/asaas-webhook";

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(asaasWebhookRoutes);

export default app;
