// Datos FICTICIOS para ver la pantalla principal "con vida" mientras no existen
// los servicios reales. Solo se usan con VITE_AUTH_MODE=development.
//
// Se reemplazan por datos del backend cuando estén:
//   - pendientes por módulo  → bandeja de notificaciones (N-02)
//   - avisos del día         → tablero de vencimientos (N-08) y alarmas (N-04/05/06)

// Número del globito rosa de cada tarjeta, por id de módulo.
export const PENDIENTES_DE_PRUEBA = {
  mantenimiento: 3,
  legales: 1,
  vencimientos: 5,
  notificaciones: 2,
}

// Chips debajo del saludo. tono: 'alerta' | 'info' | 'ok'
export const AVISOS_DE_PRUEBA = [
  { id: 'venc', tono: 'alerta', texto: '5 vencimientos esta semana', ruta: '/vencimientos' },
  { id: 'notif', tono: 'info', texto: '2 notificaciones', ruta: '/notificaciones' },
]
