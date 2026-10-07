import { useEffect, useMemo, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { CircleAlert, Bell, ShieldCheck, Truck, ChevronRight } from 'lucide-react'
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

// Búsqueda por dominio (o marca/modelo) en la flota de prueba. Los datos se
// cargan recién cuando alguien escribe, para no hacer más pesado el inicio.
// En modo real va a consultar la API.
function useVehiculosBuscados(texto) {
  const [resultado, setResultado] = useState([])
  useEffect(() => {
    if (!MODO_DESARROLLO || texto.trim().length < 2) { setResultado([]); return }
    let vigente = true
    Promise.all([import('../core/datos/flotaDePrueba'), import('../core/datos/fichaVehiculo')]).then(([f, b]) => {
      if (vigente) setResultado(b.buscarVehiculos(f.flotaDePrueba(), texto))
    })
    return () => { vigente = false }
  }, [texto])
  return resultado
}

// Pantalla principal: saludo, avisos, vehículos buscados y una tarjeta por módulo visible.
export default function Inicio() {
  const { usuario } = useSesion()
  const { busqueda = '' } = useOutletContext() ?? {}

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return modulosVisibles(usuario, MODULOS).filter(
      (m) => !q || `${m.nombre} ${m.descripcion}`.toLowerCase().includes(q),
    )
  }, [usuario, busqueda])

  const vehiculos = useVehiculosBuscados(busqueda)
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

      {vehiculos.length > 0 && (
        <div>
          <h2 className="seccion">Vehículos</h2>
          <div className="resultados-vehiculo">
            {vehiculos.map((v) => (
              <Link key={v.id} to={`/vehiculo/${v.dominio}`} className="vidrio resultado-vehiculo">
                <span className="resultado-icono" aria-hidden="true"><Truck size={20} /></span>
                <span className="resultado-texto">
                  <span className="ficha-dominio">{v.dominio}</span>
                  <span>{v.marca} {v.modelo}{v.estado && v.estado !== 'activo' ? ` · ${v.estado}` : ''}</span>
                </span>
                <span className="resultado-abrir">Ver ficha completa <ChevronRight size={16} aria-hidden="true" /></span>
              </Link>
            ))}
          </div>
        </div>
      )}

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

      {visibles.length === 0 && vehiculos.length === 0 && <p className="estado">No hay módulos ni dominios que coincidan con la búsqueda.</p>}
    </section>
  )
}
