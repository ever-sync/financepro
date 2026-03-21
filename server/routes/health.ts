import { Router } from 'express';
import { db } from '../db/_db';
import { sql } from 'drizzle-orm';

const router = Router();

/**
 * GET /health
 * Basic health check endpoint
 */
router.get('/health', async (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    status: 'OK',
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
  };

  try {
    // Check database connection
    await db.execute(sql`SELECT 1`);
    healthcheck.database = 'connected';
    
    res.json(healthcheck);
  } catch (error) {
    healthcheck.status = 'ERROR';
    healthcheck.database = 'disconnected';
    healthcheck.error = error instanceof Error ? error.message : 'Unknown error';
    
    res.status(503).json(healthcheck);
  }
});

/**
 * GET /ready
 * Readiness probe - checks if app is ready to receive traffic
 */
router.get('/ready', async (req, res) => {
  const readiness = {
    timestamp: new Date().toISOString(),
    status: 'READY',
    checks: {} as Record<string, string>,
  };

  try {
    // Check database connection
    await db.execute(sql`SELECT 1`);
    readiness.checks.database = 'connected';
    
    // Add more checks here (Redis, external APIs, etc.)
    // readiness.checks.redis = 'connected';
    
    res.json(readiness);
  } catch (error) {
    readiness.status = 'NOT_READY';
    readiness.checks.database = 'disconnected';
    readiness.checks.error = error instanceof Error ? error.message : 'Unknown error';
    
    res.status(503).json(readiness);
  }
});

/**
 * GET /metrics
 * Basic metrics endpoint (can be extended for Prometheus, etc.)
 */
router.get('/metrics', async (req, res) => {
  try {
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();
    
    const metrics = {
      timestamp: new Date().toISOString(),
      process: {
        uptime: Math.round(uptime),
        memory: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
        },
      },
      node: {
        version: process.version,
        platform: process.platform,
      },
    };
    
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve metrics' });
  }
});

export default router;
