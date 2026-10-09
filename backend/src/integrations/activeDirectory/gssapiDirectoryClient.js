import { spawn } from 'node:child_process';
import { AD_DIRECTORY, buildEmployeeSearchFilter, buildExactAccountFilter } from './directorySearch.js';

// Ejecuta el cliente LDAP del sistema con SASL/GSSAPI. Jamás ejecuta un shell,
// acepta credenciales por HTTP ni utiliza el ticket personal de un desarrollador
// de manera implícita: el operador debe configurar un cache técnico dedicado.
export class DirectoryUnavailableError extends Error {
  constructor() {
    super('Directorio corporativo no disponible');
    this.name = 'DirectoryUnavailableError';
  }
}

export function parseLdif(source) {
  if (typeof source !== 'string') throw new TypeError('LDIF inválido');
  const result = [];
  const normalized = source.replace(/\r\n/g, '\n').replace(/\n /g, '');
  for (const record of normalized.split(/\n\s*\n/)) {
    const attributes = Object.create(null);
    for (const line of record.split('\n')) {
      if (!line || line.startsWith('#')) continue;
      const match = /^([a-zA-Z][a-zA-Z0-9;-]*)(::?) (.*)$/.exec(line);
      if (!match) continue;
      const [, key, marker, raw] = match;
      const value = marker === '::' ? Buffer.from(raw, 'base64').toString('utf8') : raw;
      attributes[key.toLowerCase()] = value;
    }
    if (attributes.dn) result.push(attributes);
  }
  return result;
}

export function createGssapiDirectoryClient({
  ticketCache,
  command = '/usr/bin/ldapsearch',
  execute = spawn,
  timeoutMs = 8000,
} = {}) {
  // Sin un cache Kerberos dedicado, nunca usar el TGT del usuario SSH.
  if (!ticketCache || !/^FILE:\/[a-zA-Z0-9_./-]+$/.test(ticketCache)) {
    throw new Error('Se requiere KRB5CCNAME FILE: de una identidad técnica');
  }
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1000 || timeoutMs > 30000) {
    throw new RangeError('Timeout LDAP inválido');
  }

  async function query(filter, sizeLimit) {
    const args = [
      '-LLL', '-Y', 'GSSAPI',
      '-H', 'ldap://' + AD_DIRECTORY.host + ':' + AD_DIRECTORY.port,
      '-o', 'nettimeout=5',
      '-l', '7', '-z', String(sizeLimit),
      '-b', AD_DIRECTORY.baseDn, '-s', 'sub', filter,
      ...AD_DIRECTORY.attributes,
    ];
    return new Promise((resolve, reject) => {
      let stdout = '';
      let stderr = '';
      let done = false;
      const fail = () => finish(new DirectoryUnavailableError());
      function finish(error, value) {
        if (done) return;
        done = true;
        if (error) reject(error);
        else resolve(value);
      }
      const child = execute(command, args, {
        shell: false,
        windowsHide: true,
        env: { ...process.env, KRB5CCNAME: ticketCache },
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      const timer = setTimeout(() => { child.kill('SIGKILL'); fail(); }, timeoutMs);
      child.stdout.on('data', chunk => {
        stdout += chunk.toString();
        if (Buffer.byteLength(stdout) > 65536) { child.kill('SIGKILL'); fail(); }
      });
      child.stderr.on('data', chunk => {
        stderr += chunk.toString();
        if (Buffer.byteLength(stderr) > 8192) { child.kill('SIGKILL'); fail(); }
      });
      child.on('error', () => { clearTimeout(timer); fail(); });
      child.on('close', code => {
        clearTimeout(timer);
        // ldapsearch imprime esta línea después de negociar la protección SASL.
        const securityLayer = /SASL data security layer installed\./.test(stderr);
        if (code !== 0 || !securityLayer) return fail();
        try { finish(null, parseLdif(stdout)); } catch { fail(); }
      });
    });
  }

  return Object.freeze({
    async searchEmployees(term) {
      const records = await query(buildEmployeeSearchFilter(term), AD_DIRECTORY.maxResults);
      return records.slice(0, AD_DIRECTORY.maxResults);
    },
    async findEmployeeByAccount(account) {
      const records = await query(buildExactAccountFilter(account), 2);
      if (records.length > 1) throw new DirectoryUnavailableError();
      return records[0] ?? null;
    },
  });
}
