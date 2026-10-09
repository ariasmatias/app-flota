import { ConfigurationError } from '../config/env.js';
import { developmentAuthProvider } from './developmentAuthProvider.js';
import { createLdapGssapiAuthenticator } from './ldapGssapiAuthenticator.js';
import { kerberosAuthProvider } from './kerberosAuthProvider.js';

/**
 * Contratos de autenticación (la sesión permanece independiente del transporte):
 * assertReady(): falla al arrancar si el mecanismo no puede usarse con seguridad.
 * DEVELOPMENT: authenticate() -> Promise<Identity|null>, sin datos del navegador.
 * CORPORATIVO (contrato reservado, NO implementado):
 * authenticateHttp(req, res) -> Promise<
 *   { kind: 'authenticated', identity: Identity } | { kind: 'handled' }
 * >. Identity = { id: string|number, usuario: string, nombre: string }.
 *
 * Node: puede procesar Authorization: Negotiate, enviar 401 con
 * WWW-Authenticate: Negotiate [token] y finalizar la respuesta ('handled').
 * Puede necesitar varias solicitudes. Solo tras completar la verificación
 * devuelve 'authenticated'; puede establecer la cabecera final de autenticación
 * mutua antes de retornar. Nunca serializar tokens en JSON, sesión o logs.
 * Proxy: devuelve 'authenticated' únicamente tras comprobar el canal/origen
 * confiable y la identidad suministrada por el proxy. Cabeceras directas del
 * cliente nunca bastan. Sin identidad verificada, termina con 401 ('handled').
 *
 * Futuro middleware HTTP, montado DESPUÉS de cargar sesión y ANTES de las rutas:
 * - con sesión vigente continúa, sin negociar otra vez;
 * - con 'handled' NO continúa ni crea sesión;
 * - con 'authenticated' llama establishSession(req, identity) y continúa;
 * - errores -> JSON genérico, sin fallback.
 * La negociación permanece fuera de POST /api/sesion/login (solo desarrollo).
 * Este punto de extensión no requiere cambiar GET de sesión, logout ni el store.
 * Hoy no hay middleware SPNEGO y assertReady() impide activar ese modo.
 */
export function createAuthProvider(config) {
  if (config.authMode === 'development') return developmentAuthProvider(config);
  if (config.authMode === 'ldap-gssapi') {
    const authenticateCredentials = createLdapGssapiAuthenticator();
    return { assertReady() {}, authenticateCredentials };
  }
  if (config.authMode === 'kerberos') return kerberosAuthProvider();
  throw new ConfigurationError('Proveedor de autenticación no soportado.');
}

export function publicUser(identity) {
  if (!identity || !['string', 'number'].includes(typeof identity.id)
      || typeof identity.usuario !== 'string' || !identity.usuario
      || typeof identity.nombre !== 'string' || !identity.nombre) {
    throw new Error('Identidad no válida');
  }
  // Contrato EXACTO consumido por SesionContext.jsx. I-02 asignará el área.
  return { id: identity.id, usuario: identity.usuario, nombre: identity.nombre, area: null };
}
