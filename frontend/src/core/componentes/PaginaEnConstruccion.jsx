import { Link } from 'react-router-dom'
import { ArrowLeft, Construction } from 'lucide-react'
import { buscarModulo } from '../config/modulos'

// Pantalla provisoria de un módulo, hasta que su responsable la reemplace.
export default function PaginaEnConstruccion({ id }) {
  const modulo = buscarModulo(id)
  const Icono = modulo.icono

  return (
    <section className="pagina">
      <Link to="/" className="volver">
        <ArrowLeft size={16} aria-hidden="true" /> Volver al inicio
      </Link>

      <header
        className="pagina-encabezado vidrio"
        style={{ '--c1': modulo.acento, '--c2': modulo.acentoClaro ?? modulo.acento }}
      >
        <span className="tarjeta-icono" aria-hidden="true">
          <Icono size={28} strokeWidth={1.9} />
        </span>
        <div>
          <h1>{modulo.nombre}</h1>
          <p>{modulo.descripcion}</p>
        </div>
      </header>

      <div className="aviso vidrio">
        <Construction size={22} aria-hidden="true" />
        <div>
          <strong>Módulo en construcción</strong>
          <p>
            Responsable: {modulo.responsable}. Historias: {modulo.historias.join(', ')}.
          </p>
        </div>
      </div>
    </section>
  )
}
