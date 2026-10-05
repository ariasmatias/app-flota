import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import session from 'express-session';
import express from 'express';
import { createApp } from '../src/app.js';
import { ConfigurationError, readEnv } from '../src/config/env.js';
import { createAuthProvider, publicUser } from '../src/auth/authProvider.js';
import { createSessionMiddleware, cookieOptions } from '../src/auth/session.js';
import { developmentAuthProvider } from '../src/auth/developmentAuthProvider.js';
import { createSessionRoutes } from '../src/routes/session.routes.js';
import { notFound } from '../src/middleware/notFound.js';

const expectedUser = {
  id: 'development-user', usuario: 'usuario.desarrollo', nombre: 'Usuario de desarrollo', area: null,
};
const secret = () => randomBytes(48).toString('base64');
const config = (values = {}) => readEnv({ SESSION_SECRET: secret(), ...values });
const callStore = (store, method, ...args) => new Promise((resolve, reject) => {
  store[method](...args, (error, value) => error ? reject(error) : resolve(value));
});
const sessionCookie = response => response.headers.getSetCookie()
  .find(value => value.startsWith('flota.sid=')).split(';')[0];

async function fixture(t) {
  const configuration = config();
  const store = new session.MemoryStore();
  const app = createApp({ config: configuration, sessionStore: store });
  const server = await new Promise(resolve => {
    const instance = app.listen(0, '127.0.0.1', () => resolve(instance));
  });
  t.after(async () => {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
    await callStore(store, 'clear');
  });
  const request = (path, options) => fetch(`http://127.0.0.1:${server.address().port}${path}`, options);
  const login = (headers = {}) => request('/api/sesion/login', {
    method: 'POST', headers: { 'X-Flota-Session': '1', ...headers },
  });
  return { configuration, store, request, login };
}

test('sin sesión devuelve 401 JSON sin crear cookie ni almacenar sesión', async t => {
  const { request, store } = await fixture(t);
  const response = await request('/api/sesion');
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: 'No autenticado' });
  assert.equal(response.headers.get('set-cookie'), null);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(await callStore(store, 'length'), 0);
});

test('login y GET devuelven contrato exacto del frontend, sin secretos', async t => {
  const { request, login, configuration } = await fixture(t);
  const response = await login();
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), expectedUser);
  const cookie = sessionCookie(response);
  const current = await request('/api/sesion', { headers: { Cookie: cookie } });
  assert.equal(current.status, 200);
  const text = await current.text();
  assert.deepEqual(JSON.parse(text), expectedUser);
  assert.ok(!text.includes(configuration.session.secret));
  assert.ok(!text.includes(cookie));
  assert.doesNotMatch(text, /password|ticket|authorization|token|secret/i);
});

test('cookie HttpOnly, SameSite=Lax, ruta /api, vencimiento y sin identidad legible', async t => {
  const { login } = await fixture(t);
  const response = await login();
  const cookie = response.headers.get('set-cookie');
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /SameSite=Lax/);
  assert.match(cookie, /Path=\/api/);
  assert.match(cookie, /Expires=/);
  assert.doesNotMatch(cookie, /usuario.desarrollo|development-user/);
});

test('identidad arbitraria del cliente y cabeceras de proxy no autentican', async t => {
  const { request } = await fixture(t);
  const headers = { 'X-Remote-User': 'administrador', Authorization: 'Negotiate ficticio' };
  assert.equal((await request('/api/sesion', { headers })).status, 401);
  const response = await request('/api/sesion/login?usuario=administrador', {
    method: 'POST', headers: { ...headers, 'Content-Type': 'application/json', 'X-Flota-Session': '1' },
    body: JSON.stringify({ usuario: 'administrador', area: 'SISTEMAS', roles: ['admin'] }),
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), expectedUser);
});

test('logout destruye el registro y limpia la cookie; reutilizarla da 401', async t => {
  const { request, login, store } = await fixture(t);
  const cookie = sessionCookie(await login());
  assert.equal(await callStore(store, 'length'), 1);
  const response = await request('/api/sesion/logout', {
    method: 'POST', headers: { Cookie: cookie, 'X-Flota-Session': '1' },
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
  assert.match(response.headers.get('set-cookie'), /flota.sid=;/);
  assert.match(response.headers.get('set-cookie'), /Expires=Thu, 01 Jan 1970/);
  assert.equal(await callStore(store, 'length'), 0);
  assert.equal((await request('/api/sesion', { headers: { Cookie: cookie } })).status, 401);
  assert.equal((await request('/api/sesion/logout', { method: 'POST', headers: { 'X-Flota-Session': '1' } })).status, 200);
});

test('cada autenticación regenera el id e invalida la sesión anterior', async t => {
  const { login, request, store } = await fixture(t);
  const oldCookie = sessionCookie(await login());
  const newCookie = sessionCookie(await login({ Cookie: oldCookie }));
  assert.notEqual(oldCookie, newCookie);
  assert.equal(await callStore(store, 'length'), 1);
  assert.equal((await request('/api/sesion', { headers: { Cookie: oldCookie } })).status, 401);
  assert.equal((await request('/api/sesion', { headers: { Cookie: newCookie } })).status, 200);
});

test('la inactividad vence del lado servidor aunque se reenvíe una cookie', async t => {
  const { login, request, store } = await fixture(t);
  const cookie = sessionCookie(await login());
  const [[id, data]] = Object.entries(await callStore(store, 'all'));
  data.cookie.expires = new Date(Date.now() - 1).toISOString();
  await callStore(store, 'set', id, data);
  const expired = await request('/api/sesion', { headers: { Cookie: cookie } });
  assert.equal(expired.status, 401);
  assert.deepEqual(await expired.json(), { error: 'No autenticado' });
  assert.equal(await callStore(store, 'length'), 0);
});

test('actividad válida renueva TTL y cookie con touch, sin regrabar la sesión', async t => {
  const { login, request, store } = await fixture(t);
  const cookie = sessionCookie(await login());
  const [[id, data]] = Object.entries(await callStore(store, 'all'));
  const before = Date.now() + 5_000;
  data.cookie.expires = new Date(before).toISOString();
  await callStore(store, 'set', id, data);
  let writes = 0;
  let touches = 0;
  const originalSet = store.set.bind(store);
  const originalTouch = store.touch.bind(store);
  store.set = (...args) => { writes++; originalSet(...args); };
  store.touch = (...args) => { touches++; originalTouch(...args); };
  const response = await request('/api/sesion', { headers: { Cookie: cookie } });
  assert.equal(response.status, 200);
  const renewed = await callStore(store, 'get', id);
  assert.ok(Date.parse(renewed.cookie.expires) > before);
  assert.deepEqual(renewed.user, expectedUser);
  assert.equal(writes, 0);
  assert.equal(touches, 1);
  assert.match(response.headers.get('set-cookie'), /Expires=/);
});

test('request pendiente -> logout -> escritura tardía: la sesión NO revive', { timeout: 5000 }, async t => {
  const { login, request, store } = await fixture(t);
  const cookie = sessionCookie(await login());
  const originalSet = store.set.bind(store);
  const originalTouch = store.touch.bind(store);
  let writes = 0;
  let release;
  let signalPending;
  const pending = new Promise(resolve => { signalPending = resolve; });
  // También interceptar set: con la implementación anterior se reproduce
  // la reescritura que resucitaba la sesión. No demorar la creación del login.
  store.set = (...args) => {
    writes++;
    release = () => originalSet(...args);
    signalPending();
  };
  store.touch = (...args) => {
    release = () => originalTouch(...args);
    signalPending();
  };
  const reading = request('/api/sesion', { headers: { Cookie: cookie } });
  try {
    await pending;
    const logout = await request('/api/sesion/logout', {
      method: 'POST', headers: { Cookie: cookie, 'X-Flota-Session': '1' },
    });
    assert.equal(logout.status, 200);
    await logout.arrayBuffer();
    assert.equal(await callStore(store, 'length'), 0);
  } finally {
    store.set = originalSet;
    store.touch = originalTouch;
    if (release) release();
  }
  // Una respuesta autorizada ANTES del logout puede terminar después. Aunque
  // lleve Set-Cookie tardío, ese SID no debe volver a ser válido en el servidor.
  const completed = await reading;
  assert.equal(completed.status, 200);
  await completed.arrayBuffer();
  assert.equal(writes, 0);
  assert.equal(await callStore(store, 'length'), 0);
  const replay = await request('/api/sesion', { headers: { Cookie: cookie } });
  assert.equal(replay.status, 401);
  assert.deepEqual(await replay.json(), { error: 'No autenticado' });
  assert.equal(await callStore(store, 'length'), 0);
});

test('touch tardío tampoco recrea una sesión cuyo TTL ya venció', async t => {
  const { login, request, store, configuration } = await fixture(t);
  const cookie = sessionCookie(await login());
  const [[id, snapshot]] = Object.entries(await callStore(store, 'all'));
  const expired = structuredClone(snapshot);
  expired.cookie.expires = new Date(Date.now() - 1).toISOString();
  await callStore(store, 'set', id, expired);
  snapshot.cookie.expires = new Date(Date.now() + configuration.session.idleMs).toISOString();
  await callStore(store, 'touch', id, snapshot);
  assert.equal(await callStore(store, 'get', id), undefined);
  assert.equal((await request('/api/sesion', { headers: { Cookie: cookie } })).status, 401);
});

for (const [environment, authMode] of [
  ['development', 'kerberos'], ['production', 'development'],
  ['production', 'kerberos'], ['staging', 'development'], ['test', 'development'],
]) {
  test(`router no registra login con ${environment}/${authMode}`, async t => {
    // Aislar el router para comprobar que la ruta ni siquiera existe, además
    // del bloqueo de arranque/configuración probado por los otros tests.
    const app = express();
    const provider = { authenticate() { assert.fail('No debe llamarse al proveedor'); } };
    app.use('/api/sesion', createSessionRoutes({ config: { environment, authMode }, provider }));
    app.use(notFound);
    const server = await new Promise(resolve => {
      const instance = app.listen(0, '127.0.0.1', () => resolve(instance));
    });
    t.after(async () => {
      server.closeAllConnections();
      await new Promise(resolve => server.close(resolve));
    });
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/sesion/login`, {
      method: 'POST', headers: { 'X-Flota-Session': '1' },
    });
    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), { error: 'Recurso no encontrado' });
    assert.equal(response.headers.get('set-cookie'), null);
  });
}

test('cookie manipulada no autentica', async t => {
  const { request } = await fixture(t);
  assert.equal((await request('/api/sesion', { headers: { Cookie: 'flota.sid=identidad-inventada' } })).status, 401);
});

test('login y logout rechazan solicitudes sin cabecera y de otros orígenes', async t => {
  const { request, login } = await fixture(t);
  const cookie = sessionCookie(await login());
  for (const path of ['/api/sesion/login', '/api/sesion/logout']) {
    for (const headers of [
      { Cookie: cookie },
      { Cookie: cookie, 'X-Flota-Session': '1', Origin: 'https://ajeno.invalid' },
      { Cookie: cookie, 'X-Flota-Session': '1', 'Sec-Fetch-Site': 'cross-site' },
    ]) {
      const response = await request(path, { method: 'POST', headers });
      assert.equal(response.status, 403);
      assert.deepEqual(await response.json(), { error: 'Solicitud no permitida' });
    }
  }
  assert.equal((await request('/api/sesion', { headers: { Cookie: cookie } })).status, 200);
});

test('CORS permite credenciales de Vite y no autoriza origen ajeno', async t => {
  const { request, login } = await fixture(t);
  const allowed = await login({ Origin: 'http://localhost:5173' });
  assert.equal(allowed.status, 200);
  assert.equal(allowed.headers.get('access-control-allow-origin'), 'http://localhost:5173');
  assert.equal(allowed.headers.get('access-control-allow-credentials'), 'true');
  const other = await request('/api/sesion', { headers: { Origin: 'https://ajeno.invalid' } });
  assert.notEqual(other.headers.get('access-control-allow-origin'), 'https://ajeno.invalid');
  assert.notEqual(other.headers.get('access-control-allow-origin'), '*');
});

test('health, Helmet y 404 base siguen funcionando', async t => {
  const { request } = await fixture(t);
  const health = await request('/api/health');
  assert.equal(health.status, 200);
  assert.equal((await health.json()).service, 'app-flota-backend');
  assert.equal(health.headers.get('x-content-type-options'), 'nosniff');
  const missing = await request('/api/no-existe');
  assert.equal(missing.status, 404);
  assert.deepEqual(await missing.json(), { error: 'Recurso no encontrado' });
});

test('development está prohibido fuera de APP_ENV=development', async () => {
  for (const environment of ['production', 'staging', 'test']) {
    assert.throws(() => config({ APP_ENV: environment }), /solo se permite/);
    await assert.rejects(developmentAuthProvider({ environment }).authenticate(), ConfigurationError);
  }
});

test('secreto ausente, vacío o corto se rechaza también fuera de development', () => {
  for (const environment of ['development', 'production']) {
    for (const value of [undefined, '', 'corto', 'x'.repeat(31), ' '.repeat(32)]) {
      assert.throws(() => config({ APP_ENV: environment, AUTH_MODE: 'kerberos', SESSION_SECRET: value }), /SESSION_SECRET/);
    }
  }
});

test('la validación exige longitud, no afirma medir entropía', () => {
  // Datos deliberadamente predecibles para probar los límites del validador;
  // NO son valores aptos para configurar una aplicación real.
  for (const value of ['x'.repeat(32), 'esta-es-una-clave-de-prueba-no-usar']) {
    assert.doesNotThrow(() => config({ APP_ENV: 'production', AUTH_MODE: 'kerberos', SESSION_SECRET: value }));
  }
});

test('cookie Secure obligatoria fuera de desarrollo y activable en desarrollo', () => {
  const production = config({ APP_ENV: 'production', AUTH_MODE: 'kerberos' });
  assert.equal(cookieOptions(production).secure, true);
  assert.throws(() => config({ APP_ENV: 'production', AUTH_MODE: 'kerberos', SESSION_COOKIE_SECURE: 'false' }), /debe ser true/);
  assert.equal(cookieOptions(config({ SESSION_COOKIE_SECURE: 'true' })).secure, true);
});

test('MemoryStore y store implícito se rechazan fuera de desarrollo', () => {
  const production = config({ APP_ENV: 'production', AUTH_MODE: 'kerberos' });
  assert.throws(() => createSessionMiddleware(production), /store de sesiones/);
  assert.throws(() => createSessionMiddleware(production, new session.MemoryStore()), /store de sesiones/);
});

test('store sin touch no permite renovar mediante reescrituras inseguras', () => {
  const store = new session.MemoryStore();
  store.touch = undefined;
  assert.throws(() => createSessionMiddleware(config(), store), /touch/);
});

test('configuración inválida se rechaza sin revelar valores privados', () => {
  for (const values of [
    { SESSION_IDLE_MINUTES: '0' }, { SESSION_IDLE_MINUTES: '1.5' },
    { SESSION_IDLE_MINUTES: '1441' }, { SESSION_IDLE_MINUTES: 'NaN' },
    { SESSION_COOKIE_SECURE: 'yes' }, { AUTH_MODE: 'otro' }, { PORT: '0' },
  ]) assert.throws(() => config(values), ConfigurationError);
});

test('proveedor Kerberos falla cerrado sin fallback ni aceptación de cabeceras', async () => {
  const configuration = config({ AUTH_MODE: 'kerberos' });
  assert.throws(() => createApp({ config: configuration }), /Kerberos\/SPNEGO web aún no está integrado/);
  const provider = createAuthProvider(configuration);
  assert.throws(() => provider.assertReady(), ConfigurationError);
  assert.equal(provider.authenticate, undefined);
  await assert.rejects(provider.authenticateHttp({ headers: { 'x-remote-user': 'administrador' } }, {}));
});

test('arranque Kerberos sale con error explícito, sin secreto ni escucha HTTP', () => {
  const value = secret();
  const result = spawnSync(process.execPath, ['src/server.js'], {
    cwd: new URL('../', import.meta.url), encoding: 'utf8', timeout: 5000,
    env: { ...process.env, APP_ENV: 'development', AUTH_MODE: 'kerberos', SESSION_SECRET: value },
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Kerberos\/SPNEGO/);
  assert.doesNotMatch(result.stdout, /escuchando/);
  assert.ok(!result.stderr.includes(value));
});

test('proyección de identidad excluye secretos y no asigna permisos', () => {
  assert.deepEqual(publicUser({ ...expectedUser, password: 'ficticio', ticket: 'ficticio', area: 'SISTEMAS' }), expectedUser);
});
