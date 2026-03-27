import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { createContext } from "./context";
import { appRouter } from "../routers";
import healthRoutes from "../routes/health";
import asaasWebhookRoutes from "../routes/asaas-webhook";

export function createApp() {
  const app = express();

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  app.use(healthRoutes);
  app.use(asaasWebhookRoutes);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  return app;
}
