// Piezas visuales chicas que comparten las pantallas de Mantenimiento.

export const fecha = (v) =>
  v ? new Intl.DateTimeFormat('es-AR', { timeZone: 'UTC' }).format(new Date(`${v}T12:00:00Z`)) : '—'

export const persona = (datos, id) => datos.personas.find((p) => p.id === id)?.apellido_nombre ?? '—'
export const dominio = (datos, id) => datos.vehiculos.find((v) => v.id === id)?.dominio ?? '—'
export const categoria = (datos, id) => datos.categorias.find((c) => c.id === id)?.codigo ?? 'Sin exigencia'

const TONO = {
  activo: 'ok', Vigente: 'ok', si: 'ok', 'Al día': 'ok',
  taller: 'alerta', 'Por vencer': 'alerta', pendiente: 'alerta',
  baja: 'error', Vencida: 'error', no: 'error', 'Sin dato': 'neutro', 'Sin cobertura': 'error',
}

export function Etiqueta({ children, tono }) {
  return <span className={`mant-etiqueta ${tono ?? TONO[children] ?? ''}`}>{children === 'si' ? 'sí' : children}</span>
}

export function Panel({ titulo, subtitulo, acciones, children, className = '' }) {
  return (
    <div className={`vidrio mant-panel ${className}`}>
      {(titulo || acciones) && (
        <div className="mant-panel-titulo">
          <div>
            {titulo && <h2>{titulo}</h2>}
            {subtitulo && <p className="mant-muted">{subtitulo}</p>}
          </div>
          {acciones}
        </div>
      )}
      {children}
    </div>
  )
}

export function MensajeError({ texto }) {
  return texto ? <p className="mant-error" role="alert">{texto}</p> : null
}

// Ejecuta una operación del servicio y muestra el error de la regla si falla.
export function intentar(fn, setError) {
  setError('')
  try {
    fn()
    return true
  } catch (e) {
    setError(e.message)
    return false
  }
}
