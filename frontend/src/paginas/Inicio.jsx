import { useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import { CircleAlert, Bell, ShieldCheck } from 'lucide-react'
import { MODULOS, SECCIONES } from '../core/config/modulos'
import { modulosVisibles } from '../core/config/permisos'
import { useSesion, MODO_DESARROLLO } from '../core/sesion/SesionContext'
import { PENDIENTES_DE_PRUEBA, AVISOS_DE_PRUEBA } from '../core/sesion/datosDePrueba'
import TarjetaModulo from '../core/componentes/TarjetaModulo'
import Chip from '../core/componentes/Chip'

// Hasta que existan la bandeja (N-02) y los vencimientos (N-08), los números
// solo se muestran en desarrollo, con datos de prueba.
const PENDIENTES = MODO_DESARROLLO ? PENDIENTES_DE_PRUEBA : {}
const AVISOS = MODO_DESARROLLO ? AVISOS_DE_PRUEBA : []
const ICONO_AVISO = { alerta: CircleAlert, info: Bell, ok: ShieldCheck }

function saludo() {
  const h = new Date().getHours()
  if (h < 13) return 'Buen día'
  if (h < 20) return 'Buenas tardes'
  return 'Buenas noches'
}

// Pantalla principal: saludo, avisos y una tarjeta por módulo visible.
export default function Inicio() {
  const { usuario } = useSesion()
  const { busqueda = '' } = useOutletContext() ?? {}

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return modulosVisibles(usuario, MODULOS).filter(
      (m) => !q || `${m.nombre} ${m.descripcion}`.toLowerCase().includes(q),
    )
  }, [usuario, busqueda])

  const primerNombre = usuario.nombre.split(' ')[0]

  return (
    <section>
      <div className="saludo">
        <h1>
          {saludo()}, {primerNombre}
        </h1>
        <p>Elegí un módulo para empezar a trabajar.</p>
        <div className="chips">
          {AVISOS.map((a) => (
            <Chip key={a.id} tono={a.tono} icono={ICONO_AVISO[a.tono]} ruta={a.ruta}>
              {a.texto}
            </Chip>
          ))}
          <Chip tono="ok" icono={ShieldCheck}>
            Sistema en línea
          </Chip>
        </div>
      </div>

      {SECCIONES.map((s) => {
        const deLaSeccion = visibles.filter((m) => m.categoria === s.id)
        if (deLaSeccion.length === 0) return null
        return (
          <div key={s.id}>
            <h2 className="seccion">{s.nombre}</h2>
            <div className="grilla">
              {deLaSeccion.map((m) => (
                <TarjetaModulo key={m.id} modulo={m} pendientes={PENDIENTES[m.id]} />
              ))}
            </div>
          </div>
        )
      })}

      {visibles.length === 0 && <p className="estado">No hay módulos que coincidan con la búsqueda.</p>}
    </section>
  )
}
