try {
  const { env } = await import('./config/env.js');
  const { default: app } = await import('./app.js');
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
} catch {
  // No imprimir el error original: podría contener rutas o configuración privada.
  console.error('No se pudo iniciar el backend. Revisar dependencias, acceso a .env y PORT (1–65535).');
  process.exitCode = 1;
}
