import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// LDAP 389 protegido por SASL/GSSAPI: jamás hacemos simple bind sin TLS.
// Ticket Kerberos efímero por solicitud; no reutilizamos el ticket de liriart.
export function normalizeDomainUser(value) {
  if (typeof value !== 'string') return null;
  const user = value.trim().toLowerCase();
  return /^[a-z0-9][a-z0-9._-]{0,59}$/.test(user) ? user : null;
}

export function runCommand(binary, args, { stdin, env, timeoutMs = 8000 } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(binary, args, { env: { ...process.env, ...env }, stdio: ['pipe', 'pipe', 'pipe'] });
    let output = '';
    let stderr = '';
    let completed = false;
    const finish = (error, result) => {
      if (completed) return;
      completed = true;
      clearTimeout(timer);
      if (error) reject(error);
      else resolve(result);
    };
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      finish(new Error('Timeout en autenticación'));
    }, timeoutMs);
    child.stdout.on('data', chunk => {
      output += chunk.toString('utf8');
      if (output.length > 16384) {
        child.kill('SIGKILL');
        finish(new Error('Respuesta de AD demasiado grande'));
      }
    });
    child.stderr.on('data', chunk => {
      stderr += chunk.toString('utf8');
      if (stderr.length > 16384) {
        child.kill('SIGKILL');
        finish(new Error('Respuesta de AD demasiado grande'));
      }
    });
    child.on('error', error => finish(error));
    child.on('close', code => finish(null, { code, stdout: output, stderr }));
    child.stdin.on('error', () => {});
    child.stdin.end(stdin ?? '');
  });
}

export function createLdapGssapiAuthenticator({
  realm = 'AD.AUBASA.COM.AR',
  host = 'Srvad2019ds.ad.aubasa.com.ar',
  run = runCommand,
} = {}) {
  if (!/^[A-Z0-9.-]+$/.test(realm) || !/^[A-Za-z0-9.-]+$/.test(host)) {
    throw new Error('Configuración AD inválida');
  }
  return async function authenticate(username, password) {
    const user = normalizeDomainUser(username);
    if (!user || typeof password !== 'string' || password.length < 1 || password.length > 1024) return null;
    const directory = await mkdtemp(join(tmpdir(), 'flota-krb-'));
    const cache = join(directory, 'cache');
    const env = { KRB5CCNAME: 'FILE:' + cache };
    try {
      // kinit obtiene ticket con la contraseña ingresada, sin pasarla por argv.
      const login = await run('/usr/bin/kinit', ['-c', cache, user + '@' + realm], {
        stdin: password + '\n', env,
      });
      if (login.code !== 0) return null;
      // Una segunda prueba obliga a autenticar con el directorio por LDAP 389.
      // Exigimos la capa SASL protegida: ni simple bind ni anonimato.
      const ldap = await run('/usr/bin/ldapwhoami', [
        '-Y', 'GSSAPI', '-H', 'ldap://' + host + ':389', '-Q',
      ], { env });
      if (ldap.code !== 0 || !/SASL data security layer installed\./.test(ldap.stderr)
          || !/^(?:dn:|u:)/m.test(ldap.stdout)) {
        throw new Error('No se pudo comprobar el canal LDAP/GSSAPI');
      }
      return { id: user, usuario: user, nombre: user };
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  };
}
