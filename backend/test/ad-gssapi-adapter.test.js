import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import {
  createGssapiDirectoryClient, DirectoryUnavailableError, parseLdif,
} from '../src/integrations/activeDirectory/gssapiDirectoryClient.js';

function mockProcess({ output = '', error = 'SASL data security layer installed.\n', code = 0 } = {}) {
  const requests = [];
  function execute(command, args, options) {
    requests.push({ command, args, options });
    const child = new EventEmitter();
    child.stdout = new EventEmitter();
    child.stderr = new EventEmitter();
    child.kill = () => {};
    queueMicrotask(() => {
      child.stdout.emit('data', Buffer.from(output));
      child.stderr.emit('data', Buffer.from(error));
      child.emit('close', code);
    });
    return child;
  }
  return { execute, requests };
}

const ticketCache = 'FILE:/run/app-flota/krb5cc_flota';

test('analiza resultados LDIF sin serializar credenciales', () => {
  const [user] = parseLdif('dn: CN=Usuario,DC=ad\nsAMAccountName: usuario\nmail: usuario@aubasa.com.ar\n\n');
  assert.equal(user.dn, 'CN=Usuario,DC=ad');
  assert.equal(user.samaccountname, 'usuario');
  assert.equal(user.mail, 'usuario@aubasa.com.ar');
});

test('no hereda por accidente un ticket personal de SSH', () => {
  assert.throws(() => createGssapiDirectoryClient(), /identidad técnica/);
  assert.throws(() => createGssapiDirectoryClient({ ticketCache: '/tmp/krb5cc_1001' }), /identidad técnica/);
});

test('realiza búsqueda escapada con GSSAPI y límites explícitos', async () => {
  const mock = mockProcess({
    output: 'dn: CN=Empleado,DC=ad\nsAMAccountName: empleado\n\n',
  });
  const client = createGssapiDirectoryClient({ ticketCache, execute: mock.execute });
  const result = await client.searchEmployees('a*(b)');
  assert.equal(result.length, 1);
  const { command, args, options } = mock.requests[0];
  assert.equal(command, '/usr/bin/ldapsearch');
  assert.equal(options.shell, false);
  assert.equal(options.env.KRB5CCNAME, ticketCache);
  assert.ok(args.includes('GSSAPI'));
  assert.ok(args.includes('20'));
  assert.ok(args.some(value => value.includes('a\\2a\\28b\\29')));
});

test('bloquea resultados cuando falta capa SASL protegida', async () => {
  const mock = mockProcess({ error: 'SASL/GSSAPI authentication started\n' });
  const client = createGssapiDirectoryClient({ ticketCache, execute: mock.execute });
  await assert.rejects(client.searchEmployees('empleado'), DirectoryUnavailableError);
});

test('bloquea errores de LDAP aunque el cliente imprima resultados', async () => {
  const mock = mockProcess({ code: 1, output: 'dn: CN=Empleado,DC=ad\n' });
  const client = createGssapiDirectoryClient({ ticketCache, execute: mock.execute });
  await assert.rejects(client.searchEmployees('empleado'), DirectoryUnavailableError);
});

test('consulta exacta devuelve null sin coincidencias', async () => {
  const mock = mockProcess();
  const client = createGssapiDirectoryClient({ ticketCache, execute: mock.execute });
  assert.equal(await client.findEmployeeByAccount('empleado'), null);
});
