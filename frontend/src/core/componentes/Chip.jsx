import { Link } from 'react-router-dom'

// Pastilla de vidrio, mismo criterio que ChipVidrio de Atención al Usuario.
// tono: 'alerta' | 'info' | 'ok' | 'neutro'
const COLORES = {
  alerta: '#be1717',
  info: '#00759a',
  ok: '#22a954',
  neutro: '#838383',
}

export default function Chip({ tono = 'neutro', icono: Icono, ruta, children }) {
  const contenido = (
    <>
      {Icono && <Icono size={14} aria-hidden="true" />}
      {children}
    </>
  )
  const estilo = { '--c': COLORES[tono] ?? COLORES.neutro }

  return ruta ? (
    <Link to={ruta} className="chip" style={estilo}>
      {contenido}
    </Link>
  ) : (
    <span className="chip" style={estilo}>
      {contenido}
    </span>
  )
}
