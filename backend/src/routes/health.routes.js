import { Router } from 'express';
export function createHealthRoutes(config) {
  const router = Router();
  router.get('/', (_req, res) => {
    res.status(200).json({
      ok: true,
      service: 'app-flota-backend',
      environment: config.environment,
      timestamp: new Date().toISOString(),
    });
  });
  return router;
}
