import { Router } from 'express';
import { publicUser } from '../auth/authProvider.js';
import { clearSessionCookie, establishSession } from '../auth/session.js';

export function createSessionRoutes({ config, provider }) {
  const router = Router();
  router.use((_req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });

  // Una cabecera no simple impide POST de formularios externos. CORS conserva
  // la lista restringida; además se rechazan orígenes ajenos explícitamente.
  function sessionMutation(req, res, next) {
    const origin = req.get('origin');
    const sameOrigin = `${req.protocol}://${req.get('host')}`;
    const viteOrigin = config.environment === 'development' && origin === 'http://localhost:5173';
    if (req.get('X-Flota-Session') !== '1'
        || req.get('Sec-Fetch-Site') === 'cross-site'
        || (origin && origin !== sameOrigin && !viteOrigin)) {
      return res.status(403).json({ error: 'Solicitud no permitida' });
    }
    next();
  }

  router.get('/', (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'No autenticado' });
    res.json(publicUser(req.session.user));
  });

  // Esta ruta es solo una herramienta local. Nunca será un login de AD.
  if (config.environment === 'development' && config.authMode === 'development') {
    router.post('/login', sessionMutation, async (req, res) => {
      let identity;
      try {
        // Sin argumentos: el proveedor ficticio no necesita datos del cliente.
        identity = await provider.authenticate();
      } catch {
        return res.status(503).json({ error: 'Autenticación no disponible' });
      }
      if (!identity) return res.status(401).json({ error: 'No autenticado' });
      res.json(await establishSession(req, identity));
    });
  }

  if (config.authMode === 'ldap-gssapi') {
    router.post('/login', sessionMutation, async (req, res) => {
      const { usuario, password } = req.body ?? {};
      if (typeof usuario !== 'string' || typeof password !== 'string') {
        return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
      }
      // Impedir que una contraseña corporativa viaje por HTTP desde otra máquina.
      // Producción sigue bloqueada hasta contar con TLS y autorización en BD.
      const remote = req.socket.remoteAddress;
      const loopback = remote === '127.0.0.1' || remote === '::1' || remote === '::ffff:127.0.0.1';
      if (!req.secure && !(loopback && req.get('host') === '127.0.0.1:3001')) {
        return res.status(403).json({ error: 'El inicio de sesión requiere HTTPS' });
      }
      let identity;
      try {
        identity = await provider.authenticateCredentials(usuario, password);
      } catch {
        return res.status(503).json({ error: 'Autenticación no disponible' });
      }
      if (!identity) return res.status(401).json({ error: 'Credenciales incorrectas' });
      if (!config.adDemoAllowedUsers.includes(identity.usuario.toLowerCase())) {
        return res.status(403).json({ error: 'Acceso no autorizado' });
      }
      // Importante: solo pruebas en development hasta implementar autorización en BD.
      res.json(await establishSession(req, identity));
    });
  }

  router.post('/logout', sessionMutation, async (req, res) => {
    await new Promise((resolve, reject) => req.session.destroy(error => error ? reject(error) : resolve()));
    clearSessionCookie(res, config);
    res.json({ ok: true });
  });
  return router;
}
