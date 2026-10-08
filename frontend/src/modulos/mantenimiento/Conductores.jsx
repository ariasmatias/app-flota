import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Plus } from 'lucide-react'
import { hoy, vigenteEn, estadoVencimiento, problemasDeAsignacion } from './dominio'
import { Etiqueta, Panel, fecha } from './ui'
import FormAsignacion from './FormAsignacion'
import { CategoriasLicencia, GuiaCategorias } from '../../core/componentes/CategoriaLicencia'

// Lo que tiene hoy cada persona: estado, licencia, autorización y vehículos.
function situacion(datos, personaId, f = hoy()) {
  const estado = datos.estadosPersona.find((e) => e.persona_id === personaId && vigenteEn(e, f))?.estado ?? 'Sin estado'
  const licencia = datos.licencias.find((l) => l.persona_id === personaId && vigenteEn(l, f))
  const autorizacion = datos.autorizaciones.find((a) => a.persona_id === personaId && vigenteEn(a, f))
  const vigentes = datos.asignaciones.filter((a) => a.persona_id === personaId && !a.vigente_hasta)
  return { estado, licencia, autorizacion, vigentes }
}

const vehiculo = (datos, id) => datos.vehiculos.find((v) => v.id === id)

// Conductores: una persona puede manejar varios vehículos. Lista y ficha por persona.
export default function Conductores({ datos, usuario, actualizar }) {
  const [busqueda, setBusqueda] = useState('')
  const [seleccion, setSeleccion] = useState(null)

  if (seleccion) {
    return <FichaPersona key={seleccion} datos={datos} id={seleccion} usuario={usuario} actualizar={actualizar} volver={() => setSeleccion(null)} />
  }

  const q = busqueda.trim().toLowerCase()
  const personas = datos.personas.filter((p) => !q || `${p.apellido_nombre} ${p.legajo}`.toLowerCase().includes(q))

  return (
    <Panel titulo="Conductores" subtitulo={<>Quién maneja qué. Una persona puede tener varios vehículos asignados a la vez. <GuiaCategorias /></>}>
      <div className="mant-filtros">
        <label className="mant-busqueda">
          <Search size={18} />
          <input aria-label="Buscar persona" placeholder="Nombre o legajo" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        </label>
      </div>
      <div className="mant-scroll">
        <table>
          <thead><tr><th>Persona</th><th>Estado</th><th>Licencia</th><th>Categorías</th><th>Autorización</th><th>Vehículos hoy</th><th>Acción</th></tr></thead>
          <tbody>
            {personas.map((p) => {
              const s = situacion(datos, p.id)
              return (
                <tr key={p.id}>
                  <td><b>{p.apellido_nombre}</b><small>{p.legajo}</small></td>
                  <td><Etiqueta tono={s.estado === 'alta' ? 'ok' : 'error'}>{s.estado}</Etiqueta></td>
                  <td>{s.licencia ? <Etiqueta>{estadoVencimiento(s.licencia.vencimiento)}</Etiqueta> : <Etiqueta tono="neutro">Sin licencia</Etiqueta>}</td>
                  <td><CategoriasLicencia codigos={s.licencia?.categorias} /></td>
                  <td><Etiqueta>{s.autorizacion?.revision ?? 'Sin dato'}</Etiqueta></td>
                  <td>
                    <div className="mant-chips">
                      {s.vigentes.length ? s.vigentes.map((a) => <span key={a.id} className="mant-dominio">{vehiculo(datos, a.vehiculo_id)?.dominio}</span>) : <span className="mant-muted">—</span>}
                    </div>
                  </td>
                  <td><button className="mant-enlace" onClick={() => setSeleccion(p.id)}>Ver ficha →</button></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {!personas.length && <p className="mant-vacio">No hay personas que coincidan.</p>}
    </Panel>
  )
}

function FichaPersona({ datos, id, usuario, actualizar, volver }) {
  const [asignar, setAsignar] = useState(false)
  const p = datos.personas.find((x) => x.id === id)
  const s = situacion(datos, id)
  const historicas = datos.asignaciones.filter((a) => a.persona_id === id && a.vigente_hasta).sort((a, b) => b.vigente_hasta.localeCompare(a.vigente_hasta))
  const hecho = (d, msg) => { actualizar(d, msg); setAsignar(false) }

  return (
    <>
      <button className="mant-enlace" onClick={volver}>← Volver a conductores</button>
      <Panel
        titulo={p.apellido_nombre}
        subtitulo={`Legajo ${p.legajo}`}
        acciones={s.estado === 'alta' && <button className="mant-boton" onClick={() => setAsignar(!asignar)}>{asignar ? 'Cancelar' : <><Plus size={16} /> Asignar vehículos</>}</button>}
      >
        <dl className="mant-datos">
          <div><dt>Estado del personal</dt><dd><Etiqueta tono={s.estado === 'alta' ? 'ok' : 'error'}>{s.estado}</Etiqueta></dd></div>
          <div><dt>Licencia</dt><dd>{s.licencia ? <><CategoriasLicencia codigos={s.licencia.categorias} /> · vence {fecha(s.licencia.vencimiento)} <Etiqueta>{estadoVencimiento(s.licencia.vencimiento)}</Etiqueta></> : 'Sin licencia cargada'}</dd></div>
          <div><dt>Autorización para conducir</dt><dd><Etiqueta>{s.autorizacion?.revision ?? 'Sin dato'}</Etiqueta></dd></div>
        </dl>
      </Panel>

      {asignar && <FormAsignacion datos={datos} usuario={usuario} personaFija={id} hecho={hecho} />}

      <Panel titulo={`Vehículos que maneja hoy (${s.vigentes.length})`}>
        {s.vigentes.length ? (
          <div className="mant-scroll">
            <table>
              <thead><tr><th>Dominio</th><th>Vehículo</th><th>Desde</th><th>Motivo</th><th>Situación</th><th>Ficha</th></tr></thead>
              <tbody>
                {s.vigentes.map((a) => {
                  const v = vehiculo(datos, a.vehiculo_id)
                  const problemas = problemasDeAsignacion(datos, a)
                  return (
                    <tr key={a.id} className={problemas.length ? 'mant-fila-alerta' : ''}>
                      <td><span className="mant-dominio">{v?.dominio}</span></td>
                      <td>{v?.marca} {v?.modelo}</td>
                      <td>{fecha(a.vigente_desde)}</td>
                      <td>{a.motivo ?? '—'}</td>
                      <td>{problemas.length ? problemas.map((x) => <Etiqueta key={x} tono="error">{x}</Etiqueta>) : <Etiqueta>Al día</Etiqueta>}</td>
                      <td><Link className="mant-enlace" to={`/vehiculo/${v?.dominio}`}>Historial →</Link></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : <p className="mant-vacio">No tiene vehículos asignados hoy.</p>}
      </Panel>

      <Panel titulo={`Vehículos que manejó antes (${historicas.length})`}>
        {historicas.length ? historicas.map((a) => (
          <p className="mant-historial" key={a.id}>
            {fecha(a.vigente_desde)} → {fecha(a.vigente_hasta)} · <span className="mant-dominio">{vehiculo(datos, a.vehiculo_id)?.dominio}</span> {a.motivo && `· ${a.motivo}`}
          </p>
        )) : <p className="mant-muted">Sin asignaciones anteriores.</p>}
      </Panel>
    </>
  )
}
