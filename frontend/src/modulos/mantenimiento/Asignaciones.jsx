import { useState } from 'react'
import { Plus } from 'lucide-react'
import { hoy, problemasDeAsignacion } from './dominio'
import { guardarCierreAsignacion } from './servicioDemo'
import { Etiqueta, Panel, MensajeError, intentar, fecha, persona, dominio } from './ui'
import FormAsignacion from './FormAsignacion'

// M-06 / M-07: asignaciones vigentes, alertas y cierre manual.
export default function Asignaciones({ datos, usuario, actualizar }) {
  const [nueva, setNueva] = useState(false)
  const [cerrando, setCerrando] = useState(null)
  const [verCerradas, setVerCerradas] = useState(false)
  const hecho = (d, msg) => { actualizar(d, msg); setNueva(false); setCerrando(null) }

  const vigentes = datos.asignaciones.filter((a) => !a.vigente_hasta)
  const cerradas = datos.asignaciones.filter((a) => a.vigente_hasta).sort((a, b) => b.vigente_hasta.localeCompare(a.vigente_hasta))

  return (
    <>
      {nueva && <FormAsignacion datos={datos} usuario={usuario} hecho={hecho} />}
      <Panel
        titulo="Asignaciones vigentes"
        subtitulo="Quién maneja qué vehículo hoy. Las marcadas en rojo necesitan revisión."
        acciones={!nueva && <button className="mant-boton" onClick={() => setNueva(true)}><Plus size={16} /> Nueva asignación</button>}
      >
        <div className="mant-scroll">
          <table>
            <thead><tr><th>Conductor</th><th>Vehículo</th><th>Desde</th><th>Motivo</th><th>Situación</th><th>Acción</th></tr></thead>
            <tbody>
              {vigentes.map((a) => {
                const problemas = problemasDeAsignacion(datos, a)
                return (
                  <tr key={a.id} className={problemas.length ? 'mant-fila-alerta' : ''}>
                    <td><b>{persona(datos, a.persona_id)}</b></td>
                    <td><span className="mant-dominio">{dominio(datos, a.vehiculo_id)}</span></td>
                    <td>{fecha(a.vigente_desde)}</td>
                    <td>{a.motivo ?? '—'}</td>
                    <td>{problemas.length ? problemas.map((p) => <Etiqueta key={p} tono="error">{p}</Etiqueta>) : <Etiqueta>Al día</Etiqueta>}</td>
                    <td><button className="mant-enlace" onClick={() => setCerrando(cerrando === a.id ? null : a.id)}>{cerrando === a.id ? 'Cancelar' : 'Cerrar'}</button></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {!vigentes.length && <p className="mant-vacio">No hay asignaciones vigentes.</p>}
      </Panel>

      {cerrando && <FormCierre datos={datos} id={cerrando} usuario={usuario} hecho={hecho} />}

      <Panel
        titulo="Asignaciones cerradas"
        acciones={<button className="mant-enlace" onClick={() => setVerCerradas(!verCerradas)}>{verCerradas ? 'Ocultar' : `Ver (${cerradas.length})`}</button>}
      >
        {verCerradas && cerradas.map((a) => (
          <p className="mant-historial" key={a.id}>
            {fecha(a.vigente_desde)} → {fecha(a.vigente_hasta)} · {persona(datos, a.persona_id)} · {dominio(datos, a.vehiculo_id)} {a.motivo && `· ${a.motivo}`}
          </p>
        ))}
      </Panel>
    </>
  )
}

function FormCierre({ datos, id, usuario, hecho }) {
  const [error, setError] = useState('')
  const a = datos.asignaciones.find((x) => x.id === id)
  function enviar(e) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    intentar(() => hecho(guardarCierreAsignacion(datos, id, { vigente_hasta: f.get('hasta'), motivo: f.get('motivo') }, usuario), 'Asignación cerrada. Las demás no se modificaron.'), setError)
  }
  return (
    <form className="vidrio mant-panel mant-form" onSubmit={enviar}>
      <h3>Cerrar asignación</h3>
      <p className="mant-muted">{persona(datos, a.persona_id)} · {dominio(datos, a.vehiculo_id)}. Se cierra solo esta asignación; queda en el historial.</p>
      <div className="mant-form-grid">
        <label>Fecha de cierre<input required type="date" name="hasta" defaultValue={hoy()} max={hoy()} min={a.vigente_desde} /></label>
        <label>Motivo<input required name="motivo" maxLength={300} placeholder="Ej.: cambio de sector" /></label>
      </div>
      <MensajeError texto={error} />
      <button className="mant-boton">Cerrar asignación de prueba</button>
    </form>
  )
}
