import "dotenv/config";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import express from "express";
import { createContext } from "../../server/_core/context";
import { appRouter } from "../../server/routers";

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// On Vercel this file already lives under /api/trpc/[trpc], so the
// middleware needs to be mounted at the function root instead of /api/trpc.
app.use(
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

export default app;
