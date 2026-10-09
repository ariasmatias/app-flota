import { useSesion } from '../sesion/SesionContext'
import { puedeVer } from '../config/permisos'
import SinAcceso from '../../paginas/SinAcceso'
import { MODO_DESARROLLO, VISTAS_DEMO } from '../sesion/SesionContext'

// Muestra el módulo solo si el área del usuario lo puede ver.
// Si alguien escribe la URL a mano, ve "Sin acceso" (y el backend igual rechaza).
export default function RutaModulo({ modulo }) {
  const { usuario } = useSesion()
  if (usuario && !VISTAS_DEMO && !MODO_DESARROLLO && usuario.area == null) {
    return <section className="estado"><h1>{modulo.nombre}</h1><p>Vista demostrativa. Las operaciones y datos del módulo todavía no están habilitados.</p></section>
  }
  if (!(VISTAS_DEMO && !MODO_DESARROLLO && usuario?.area == null) && !puedeVer(usuario, modulo)) return <SinAcceso />
  const Pantalla = modulo.componente
  return <Pantalla />
}
