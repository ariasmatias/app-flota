import { ConfigurationError } from '../config/env.js';

export function developmentAuthProvider(config) {
  function assertReady() {
    if (config.environment !== 'development') {
      throw new ConfigurationError('El proveedor development está prohibido fuera de development.');
    }
  }
  return {
    assertReady,
    async authenticate() {
      assertReady();
      // Identidad fija y ficticia; nunca leer identidad desde body o headers.
      return { id: 'development-user', usuario: 'usuario.desarrollo', nombre: 'Usuario de desarrollo' };
    },
  };
}
