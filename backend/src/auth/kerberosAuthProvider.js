import { ConfigurationError } from '../config/env.js';

export function kerberosAuthProvider() {
  return {
    assertReady() {
      throw new ConfigurationError(
        'Kerberos/SPNEGO web aún no está integrado. Faltan FQDN, SPN HTTP y keytab/identidad de servicio, y acordar la terminación SPNEGO con Infraestructura.',
      );
    },
    async authenticateHttp(_req, _res) {
      // Solo contrato: NO iniciar desafíos ni aceptar tokens/cabeceras todavía.
      // Node/proxy deberán cumplir la negociación y frontera de confianza
      // descritas en authProvider.js. No hay fallback ni simulación.
      throw new Error('Autenticación no disponible');
    },
  };
}
