import { Router } from 'express';
import { env } from '../config/env.js';

const router = Router();
router.get('/', (_req, res) => {
  res.status(200).json({
    ok: true,
    service: 'app-flota-backend',
    environment: env.environment,
    timestamp: new Date().toISOString(),
  });
});
export default router;
