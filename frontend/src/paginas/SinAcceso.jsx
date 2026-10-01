import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'

export default function SinAcceso() {
  return (
    <section className="pagina-centrada vidrio">
      <ShieldAlert size={40} aria-hidden="true" />
      <h1>No tenés acceso a este módulo</h1>
      <p>Si creés que es un error, pedile a Sistemas que revise tu área.</p>
      <Link to="/" className="boton">Volver al inicio</Link>
    </section>
  )
}
