import express from "express";
import assistantCronRoutes from "../routes/assistant-cron";

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(assistantCronRoutes);

export default app;
