import { ConfigurationError, loadEnv } from './config/env.js';

try {
  const env = loadEnv();
  const { createApp } = await import('./app.js');
  const app = createApp({ config: env });
  const server = app.listen(env.port, (error) => {
    if (error) return; // El evento error informa el fallo de apertura.
    console.log(`App FLOTA backend escuchando en puerto ${env.port} (ambiente: ${env.environment})`);
  });
  server.on('error', (error) => {
    const message = error.code === 'EADDRINUSE'
      ? `El puerto ${env.port} ya está en uso.`
      : 'No se pudo abrir el puerto del backend.';
    console.error(message);
    process.exitCode = 1;
  });
} catch (error) {
  // Solo los mensajes controlados de configuración son aptos para consola.
  console.error(error instanceof ConfigurationError
    ? error.message
    : 'No se pudo iniciar el backend. Revisar dependencias y configuración.');
  process.exitCode = 1;
}
