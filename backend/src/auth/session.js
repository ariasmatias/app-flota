import session from 'express-session';
import { ConfigurationError } from '../config/env.js';
import { publicUser } from './authProvider.js';

export const SESSION_COOKIE_NAME = 'flota.sid';

export function cookieOptions(config) {
  return { httpOnly: true, sameSite: 'lax', secure: config.session.secure, path: '/api' };
}

export function clearSessionCookie(res, config) {
  res.clearCookie(SESSION_COOKIE_NAME, cookieOptions(config));
}

export function createSessionMiddleware(config, store) {
  if (config.environment !== 'development'
      && (!store || store instanceof session.MemoryStore)) {
    throw new ConfigurationError('Se requiere un store de sesiones externo a memoria fuera de development.');
  }
  const sessionStore = store ?? new session.MemoryStore();
  // Contrato obligatorio: get excluye expirados; touch renueva SOLO si existe
  // y sigue vigente, de forma atómica respecto de destroy y de la expiración.
  // No admitir stores que obliguen a regrabar snapshots para renovar el TTL.
  if (typeof sessionStore.touch !== 'function') {
    throw new ConfigurationError('El store de sesiones debe implementar touch atómico sin crear registros.');
  }
  return session({
    name: SESSION_COOKIE_NAME,
    secret: config.session.secret,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: { ...cookieOptions(config), maxAge: config.session.idleMs },
  });
}

// Única escritura completa de sesión: alta tras autenticar, siempre con SID
// nuevo. Las consultas no modifican req.session; se renueva solo el vencimiento
// mediante touch. Un touch tardío no puede recrear un SID destruido o expirado.
// Un futuro adaptador SPNEGO usará esta misma función tras verificar identidad.
export async function establishSession(req, identity) {
  const user = publicUser(identity);
  await new Promise((resolve, reject) => req.session.regenerate(error => error ? reject(error) : resolve()));
  req.session.user = user;
  await new Promise((resolve, reject) => req.session.save(error => error ? reject(error) : resolve()));
  return user;
}
