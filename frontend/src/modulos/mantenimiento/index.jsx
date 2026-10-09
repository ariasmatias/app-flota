import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Truck } from 'lucide-react'
import { useSesion, VISTAS_DEMO } from '../../core/sesion/SesionContext'
import { hoy, estadoVehiculoEn, estadoVencimiento, vtvDeVehiculoEn, polizaDeVehiculoEn, problemasDeAsignacion } from './dominio'
import { datosIniciales } from './servicioDemo'
import Vehiculos from './Vehiculos'
import Asignaciones from './Asignaciones'
import Polizas from './Polizas'
import Autorizaciones from './Autorizaciones'
import Conductores from './Conductores'
import './mantenimiento.css'

const SECCIONES = [
  ['vehiculos', 'Vehículos'],
  ['asignaciones', 'Asignaciones'],
  ['conductores', 'Conductores'],
  ['polizas', 'Pólizas'],
  ['autorizaciones', 'Autorizaciones'],
]

export default function Modulo() {
  if (!VISTAS_DEMO) {
    return (
      <section className="pagina">
        <h1>Mantenimiento</h1>
        <p>La conexión con la API de Mantenimiento todavía está pendiente.</p>
      </section>
    )
  }
  return <Demo />
}

function Demo() {
  const { usuario } = useSesion()
  const [datos, setDatos] = useState(datosIniciales)
  const [vista, setVista] = useState('vehiculos')
  const [seleccion, setSeleccion] = useState(null)
  const [mensaje, setMensaje] = useState('')

  function ir(v, id = null) { setVista(v); setSeleccion(id); setMensaje('') }
  function actualizar(nuevos, texto = 'Cambio guardado en esta sesión de prueba.') { setDatos(nuevos); setMensaje(texto) }

  // Resumen (ignora vehículos de baja)
  const operativos = datos.vehiculos.filter((v) => estadoVehiculoEn(datos, v.id) !== 'baja')
  const enTaller = operativos.filter((v) => estadoVehiculoEn(datos, v.id) === 'taller').length
  const documentosAlerta = operativos.filter((v) =>
    [vtvDeVehiculoEn(datos, v.id)?.vigente_hasta, polizaDeVehiculoEn(datos, v.id)?.vigente_hasta].some((f) => estadoVencimiento(f) !== 'Vigente'),
  ).length
  const asignacionesAlerta = datos.asignaciones.filter((a) => !a.vigente_hasta && problemasDeAsignacion(datos, a, hoy()).length).length
  const pendientes = datos.autorizaciones.filter((a) => a.revision === 'pendiente' && !a.vigente_hasta).length

  const props = { datos, usuario, actualizar }

  return (
    <section className="pagina mant">
      <Link to="/" className="volver"><ArrowLeft size={16} /> Volver al inicio</Link>
      <header className="mant-cabecera">
        <div className="mant-icono"><Truck size={28} /></div>
        <div>
          <span className="mant-kicker">GESTIÓN DE FLOTA / VEHÍCULOS</span>
          <h1>Mantenimiento</h1>
          <p>Vehículos, estados, pólizas, VTV y asignación de conductores.</p>
        </div>
      </header>
      <p className="mant-demo">
        <b>Vista de prueba</b> · Datos ficticios. Los cambios duran mientras el módulo siga abierto; al recargar o salir se reinician.
      </p>

      <div className="mant-resumen">
        <button className="vidrio" onClick={() => ir('vehiculos')}>
          <span>Vehículos operativos</span><strong>{operativos.length}</strong><small>{enTaller} en taller</small>
        </button>
        <button className="vidrio" onClick={() => ir('vehiculos')}>
          <span>VTV o póliza a revisar</span><strong>{documentosAlerta}</strong><small>Vencidas o a 30 días</small>
        </button>
        <button className="vidrio" onClick={() => ir('asignaciones')}>
          <span>Asignaciones con problemas</span><strong>{asignacionesAlerta}</strong><small>Licencia o autorización</small>
        </button>
        <button className="vidrio" onClick={() => ir('autorizaciones')}>
          <span>Autorizaciones pendientes</span><strong>{pendientes}</strong><small>Cargadas por Legales</small>
        </button>
      </div>

      <nav className="mant-tabs" aria-label="Secciones de Mantenimiento">
        {SECCIONES.map(([id, titulo]) => (
          <button key={id} aria-current={vista === id ? 'page' : undefined} onClick={() => ir(id)}>{titulo}</button>
        ))}
      </nav>

      {mensaje && <p role="status" className="mant-feedback">{mensaje}</p>}

      {vista === 'vehiculos' && <Vehiculos {...props} seleccion={seleccion} setSeleccion={setSeleccion} />}
      {vista === 'asignaciones' && <Asignaciones {...props} />}
      {vista === 'conductores' && <Conductores {...props} />}
      {vista === 'polizas' && <Polizas {...props} />}
      {vista === 'autorizaciones' && <Autorizaciones {...props} />}
    </section>
  )
}
