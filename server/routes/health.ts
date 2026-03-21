import { Router } from "express";
import { sql } from "drizzle-orm";
import { getDb } from "../db";

const router = Router();

async function checkDatabaseConnection() {
  const db = await getDb();
  if (!db) {
    return { connected: false as const, error: "Database not available" };
  }

  await db.execute(sql`SELECT 1`);
  return { connected: true as const };
}

router.get("/health", async (_req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    status: "OK",
    environment: process.env.NODE_ENV || "development",
    version: process.env.npm_package_version || "1.0.0",
  };

  try {
    const dbStatus = await checkDatabaseConnection();
    if (!dbStatus.connected) {
      return res.status(503).json({
        ...healthcheck,
        status: "ERROR",
        database: "disconnected",
        error: dbStatus.error,
      });
    }

    return res.json({ ...healthcheck, database: "connected" });
  } catch (error) {
    return res.status(503).json({
      ...healthcheck,
      status: "ERROR",
      database: "disconnected",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.get("/ready", async (_req, res) => {
  const readiness = {
    timestamp: new Date().toISOString(),
    status: "READY",
    checks: {} as Record<string, string>,
  };

  try {
    const dbStatus = await checkDatabaseConnection();
    if (!dbStatus.connected) {
      return res.status(503).json({
        ...readiness,
        status: "NOT_READY",
        checks: {
          ...readiness.checks,
          database: "disconnected",
          error: dbStatus.error,
        },
      });
    }

    return res.json({
      ...readiness,
      checks: {
        ...readiness.checks,
        database: "connected",
      },
    });
  } catch (error) {
    return res.status(503).json({
      ...readiness,
      status: "NOT_READY",
      checks: {
        ...readiness.checks,
        database: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });
  }
});

router.get("/metrics", async (_req, res) => {
  try {
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();

    const metrics = {
      timestamp: new Date().toISOString(),
      process: {
        uptime: Math.round(uptime),
        memory: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024),
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        },
      },
      node: {
        version: process.version,
        platform: process.platform,
      },
    };

    return res.json(metrics);
  } catch (error) {
    return res.status(500).json({ error: "Failed to retrieve metrics" });
  }
});

export default router;
