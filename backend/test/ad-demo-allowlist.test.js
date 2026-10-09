import test from 'node:test';
import assert from 'node:assert/strict';
import { readEnv, ConfigurationError } from '../src/config/env.js';

const base = {
  SESSION_SECRET: 'demo-test-secret'.repeat(4),
  APP_ENV: 'development',
  AUTH_MODE: 'ldap-gssapi',
};

test('inicio AD de demo requiere lista de usuarios autorizados', () => {
  assert.throws(() => readEnv(base), ConfigurationError);
  assert.throws(() => readEnv({...base, AD_DEMO_ALLOWED_USERS: '  '}), ConfigurationError);
  assert.throws(() => readEnv({...base, AD_DEMO_ALLOWED_USERS: 'user@ad.aubasa.com.ar'}), ConfigurationError);
});

test('lista de acceso acepta varias cuentas y normaliza mayúsculas', () => {
  const conf = readEnv({...base, AD_DEMO_ALLOWED_USERS: ' Matias.Arias, PEDRO.usuario '});
  assert.deepEqual(conf.adDemoAllowedUsers, ['matias.arias', 'pedro.usuario']);
});

test('lista configurada no habilita LDAP demo en producción', () => {
  assert.throws(() => readEnv({...base, APP_ENV:'production', AD_DEMO_ALLOWED_USERS:'matias.arias'}), ConfigurationError);
});
