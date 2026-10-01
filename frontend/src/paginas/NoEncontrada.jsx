import { Link } from 'react-router-dom'
import { MapPinOff } from 'lucide-react'

export default function NoEncontrada() {
  return (
    <section className="pagina-centrada vidrio">
      <MapPinOff size={40} aria-hidden="true" />
      <h1>Página no encontrada</h1>
      <p>La dirección no existe o cambió.</p>
      <Link to="/" className="boton">Volver al inicio</Link>
    </section>
  )
}
