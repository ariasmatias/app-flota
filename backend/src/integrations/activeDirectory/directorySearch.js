/**
 * Reglas puras para la futura búsqueda de empleados en AD.
 * NO abre conexiones LDAP ni autentica usuarios. El adaptador corporativo
 * GSSAPI deberá usar estos filtros y aplicar límites de tiempo/resultados.
 */
const BASE_DN = 'DC=ad,DC=aubasa,DC=com,DC=ar';
const ACCOUNT_ENABLED = '(!(userAccountControl:1.2.840.113556.1.4.803:=2))';
const PERSON = '(objectCategory=person)(objectClass=user)';
const ATTRIBUTES = Object.freeze([
  'objectGUID', 'sAMAccountName', 'displayName', 'mail', 'userAccountControl',
]);

export const AD_DIRECTORY = Object.freeze({
  host: 'Srvad2019ds.ad.aubasa.com.ar',
  port: 389,
  baseDn: BASE_DN,
  attributes: ATTRIBUTES,
  maxResults: 20,
});

/** RFC 4515: escapar caracteres que cambian el significado del filtro. */
export function escapeLdapFilter(value) {
  if (typeof value !== 'string') throw new TypeError('Valor LDAP inválido');
  return value.replace(/[\\*()\x00]/g, char => ({
    '\\': '\\5c', '*': '\\2a', '(': '\\28', ')': '\\29', '\x00': '\\00',
  })[char]);
}

export function normalizeSearchTerm(value) {
  if (typeof value !== 'string') throw new TypeError('Búsqueda inválida');
  const query = value.trim().replace(/\s+/g, ' ');
  if (query.length < 2 || query.length > 80 || /[\x00-\x1f\x7f]/.test(query) || !/[a-zA-Z0-9\u00C0-\u024F]/.test(query)) {
    throw new RangeError('La búsqueda debe tener entre 2 y 80 caracteres válidos.');
  }
  return query;
}

/** Búsqueda parcial para administración; nunca usar como autorización. */
export function buildEmployeeSearchFilter(term) {
  const safe = escapeLdapFilter(normalizeSearchTerm(term));
  const match = ['displayName', 'sAMAccountName', 'mail']
    .map(attribute => `(${attribute}=*${safe}*)`).join('');
  return `(&${PERSON}${ACCOUNT_ENABLED}(|${match}))`;
}

/** La búsqueda exacta por login sirve para vincular una identidad verificada. */
export function buildExactAccountFilter(account) {
  if (typeof account !== 'string' || !/^[a-zA-Z0-9._-]{1,100}$/.test(account)) {
    throw new TypeError('Nombre de cuenta inválido');
  }
  return `(&${PERSON}${ACCOUNT_ENABLED}(sAMAccountName=${escapeLdapFilter(account)}))`;
}

/** El bit ACCOUNTDISABLE (0x2) es el que define deshabilitación. */
export function isAdAccountEnabled(userAccountControl) {
  if (userAccountControl === null || userAccountControl === undefined || userAccountControl === '') return false;
  const value = Number(userAccountControl);
  return Number.isSafeInteger(value) && value >= 0 && (value & 2) === 0;
}
