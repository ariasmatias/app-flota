import { useSesion } from '../sesion/SesionContext'
import { puedeVer } from '../config/permisos'
import SinAcceso from '../../paginas/SinAcceso'

// Muestra el módulo solo si el área del usuario lo puede ver.
// Si alguien escribe la URL a mano, ve "Sin acceso" (y el backend igual rechaza).
export default function RutaModulo({ modulo }) {
  const { usuario } = useSesion()
  if (!puedeVer(usuario, modulo)) return <SinAcceso />
  const Pantalla = modulo.componente
  return <Pantalla />
}
