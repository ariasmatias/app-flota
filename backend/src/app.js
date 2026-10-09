import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createHealthRoutes } from './routes/health.routes.js';
import { createAuthProvider } from './auth/authProvider.js';
import { createSessionMiddleware } from './auth/session.js';
import { createSessionRoutes } from './routes/session.routes.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createApp({ config, sessionStore } = {}) {
  const provider = createAuthProvider(config);
  provider.assertReady();
  const sessionMiddleware = createSessionMiddleware(config, sessionStore);
  const app = express();
  app.set('env', config.environment);
  // Solo confiar en el proxy local de Nginx al usar el piloto AD.
  // El backend debe escuchar exclusivamente en 127.0.0.1.
  if (config.authMode === 'ldap-gssapi') app.set('trust proxy', 'loopback');
  // No confiar en cabeceras de proxy sin definir antes la frontera de confianza.
  app.use(helmet());
  app.use(cors({
    origin: config.environment === 'development' ? 'http://localhost:5173' : false,
    credentials: config.environment === 'development',
  }));
  app.use(express.json());
  app.use('/api/health', createHealthRoutes(config));
  app.use('/api', sessionMiddleware);
  app.use('/api/sesion', createSessionRoutes({ config, provider }));
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
