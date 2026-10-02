import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

// Tarjeta de vidrio de un módulo en la pantalla principal.
// --c1 es el color del módulo y --c2 su versión clara para modo oscuro (ver estilos.css).
export default function TarjetaModulo({ modulo, pendientes = 0 }) {
  const Icono = modulo.icono

  return (
    <Link
      to={modulo.ruta}
      className="tarjeta vidrio"
      style={{ '--c1': modulo.acento, '--c2': modulo.acentoClaro ?? modulo.acento }}
    >
      {pendientes > 0 && (
        <span className="globito" aria-label={`${pendientes} pendientes`}>
          {pendientes}
        </span>
      )}
      <span className="tarjeta-icono" aria-hidden="true">
        <Icono size={26} strokeWidth={1.9} />
      </span>
      <h3 className="tarjeta-titulo">{modulo.nombre}</h3>
      <p className="tarjeta-descripcion">{modulo.descripcion}</p>
      <span className="tarjeta-abrir">
        Abrir <ChevronRight size={16} aria-hidden="true" />
      </span>
    </Link>
  )
}
