export function errorHandler(error, _req, res, next) {
  if (res.headersSent) return next(error);

  // Solo mensajes propios; nunca reflejar el cuerpo, error.message o stack.
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON inválido' });
  }
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ error: 'El cuerpo de la solicitud es demasiado grande' });
  }
  if (error.status === 415) {
    return res.status(415).json({ error: 'Formato de solicitud no soportado' });
  }
  res.status(500).json({ error: 'Error interno del servidor' });
}
