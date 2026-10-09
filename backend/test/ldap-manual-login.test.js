import test from 'node:test';
import assert from 'node:assert/strict';
import { createLdapGssapiAuthenticator, normalizeDomainUser } from '../src/auth/ldapGssapiAuthenticator.js';
import { readEnv, ConfigurationError } from '../src/config/env.js';

test('normaliza usuarios y rechaza entradas inválidas', () => {
  assert.equal(normalizeDomainUser(' Matias.Arias '), 'matias.arias');
  assert.equal(normalizeDomainUser('foo@otro.dominio'), null);
  assert.equal(normalizeDomainUser('(cn=*)'), null);
});

test('contraseña inválida no ejecuta comandos', async () => {
  const auth = createLdapGssapiAuthenticator({run: () => { throw new Error('No debe ejecutarse'); }});
  assert.equal(await auth('nombre', ''), null);
});

test('valida credenciales sin pasarlas como argumentos, exige GSSAPI', async () => {
  const calls = [];
  const run = async (binary, args, options) => {
    calls.push({binary, args, options});
    return binary.includes('kinit')
      ? {code:0, stdout:'', stderr:''}
      : {code:0, stdout:'dn:CN=Test,DC=ad', stderr:'SASL data security layer installed.'};
  };
  const auth = createLdapGssapiAuthenticator({run});
  const result = await auth('USUARIO.Test', 'clave-de-prueba');
  assert.equal(result.usuario, 'usuario.test');
  assert.equal(calls.length, 2);
  assert.ok(calls[0].binary.endsWith('/kinit'));
  assert.ok(calls[1].args.includes('GSSAPI'));
  assert.ok(!calls[1].args.includes('-Q'), 'ldapwhoami debe informar la negociación SASL');
  assert.ok(calls[1].args.some(arg => arg.startsWith('ldap://') && arg.endsWith(':389')));
  assert.ok(!calls.some(c => c.args.includes('clave-de-prueba')));
  assert.equal(calls[0].options.stdin, 'clave-de-prueba\n');
  assert.equal(calls[0].options.env.KRB5CCNAME, calls[1].options.env.KRB5CCNAME);
});

test('rechaza contraseña errónea y comunicación sin protección SASL', async () => {
  const badPassword = createLdapGssapiAuthenticator({run: async () => ({code:1,stdout:'',stderr:''})});
  assert.equal(await badPassword('usuario', 'clave'), null);
  const unprotected = createLdapGssapiAuthenticator({run: async (binary) =>
    binary.endsWith('/kinit') ? {code:0,stdout:'',stderr:''} : {code:0,stdout:'u:usuario',stderr:''}});
  await assert.rejects(() => unprotected('usuario', 'clave'), /protegido|canal/);
});

test('bloquea modo corporativo en producción hasta tener permisos y sesiones externas', () => {
  assert.throws(() => readEnv({
    SESSION_SECRET:'x'.repeat(48), APP_ENV:'production', AUTH_MODE:'ldap-gssapi',
  }), ConfigurationError);
});
