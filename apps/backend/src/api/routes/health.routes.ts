import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * Health check endpoint
 * GET /api/v1/health
 *
 * Returns:
 * - 200 OK: Service is healthy and database is connected
 * - 503 Service Unavailable: Database connection failed
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'mi-tienda-backend',
      database: 'connected',
      uptime: process.uptime(),
    });
  } catch (error) {
    console.error('Health check failed:', error);

    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      service: 'mi-tienda-backend',
      database: 'disconnected',
      error: 'Database connection failed',
    });
  }
});

export default router;
