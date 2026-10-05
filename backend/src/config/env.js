import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

// La ruta no depende del directorio desde el que se ejecute Node.
const result = dotenv.config({
  path: fileURLToPath(new URL('../../../.env', import.meta.url)),
  quiet: true,
});
if (result.error && result.error.code !== 'ENOENT') {
  throw new Error('No se pudo leer el archivo de configuración .env');
}

const port = Number(process.env.PORT ?? 3001);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT debe ser un entero entre 1 y 65535');
}

export const env = {
  environment: process.env.APP_ENV || 'development',
  port,
  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: process.env.DB_PORT ?? '5432',
    name: process.env.DB_NAME ?? 'app_flota',
    user: process.env.DB_USER ?? '',
    password: process.env.DB_PASSWORD ?? '',
  },
  integrationsMode: process.env.INTEGRATIONS_MODE ?? 'mock',
  authMode: process.env.AUTH_MODE ?? 'development',
  uploadsDir: process.env.UPLOADS_DIR ?? './uploads',
};
