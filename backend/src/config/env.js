import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

export class ConfigurationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

export function readEnv(source = process.env) {
  const environment = source.APP_ENV || 'development';
  const port = Number(source.PORT ?? 3001);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new ConfigurationError('PORT debe ser un entero entre 1 y 65535.');
  }
  const secret = source.SESSION_SECRET ?? '';
  // Comprobar longitud NO demuestra aleatoriedad. La generación criptográfica
  // es un requisito operativo, documentado en README; no se estima entropía.
  if (Buffer.byteLength(secret.trim(), 'utf8') < 32) {
    throw new ConfigurationError('SESSION_SECRET requiere al menos 32 bytes, provistos por el entorno.');
  }
  const authMode = source.AUTH_MODE ?? 'development';
  if (!['development', 'kerberos'].includes(authMode)) {
    throw new ConfigurationError('AUTH_MODE debe ser development o kerberos.');
  }
  if (authMode === 'development' && environment !== 'development') {
    throw new ConfigurationError('AUTH_MODE=development solo se permite con APP_ENV=development.');
  }
  const idleMinutes = Number(source.SESSION_IDLE_MINUTES ?? 30);
  if (!Number.isInteger(idleMinutes) || idleMinutes < 1 || idleMinutes > 1440) {
    throw new ConfigurationError('SESSION_IDLE_MINUTES debe ser un entero entre 1 y 1440.');
  }
  const secureValue = source.SESSION_COOKIE_SECURE ?? String(environment !== 'development');
  if (!['true', 'false'].includes(secureValue)) {
    throw new ConfigurationError('SESSION_COOKIE_SECURE debe ser true o false.');
  }
  const secure = secureValue === 'true';
  if (environment !== 'development' && !secure) {
    throw new ConfigurationError('SESSION_COOKIE_SECURE debe ser true fuera de development.');
  }
  return {
    environment,
    port,
    database: {
      host: source.DB_HOST ?? 'localhost',
      port: source.DB_PORT ?? '5432',
      name: source.DB_NAME ?? 'app_flota',
      user: source.DB_USER ?? '',
      password: source.DB_PASSWORD ?? '',
    },
    integrationsMode: source.INTEGRATIONS_MODE ?? 'mock',
    authMode,
    uploadsDir: source.UPLOADS_DIR ?? './uploads',
    session: { secret, idleMs: idleMinutes * 60_000, secure },
  };
}

export function loadEnv() {
  const result = dotenv.config({
    path: fileURLToPath(new URL('../../../.env', import.meta.url)),
    quiet: true,
  });
  if (result.error && result.error.code !== 'ENOENT') {
    throw new ConfigurationError('No se pudo leer el archivo de configuración .env.');
  }
  return readEnv();
}
