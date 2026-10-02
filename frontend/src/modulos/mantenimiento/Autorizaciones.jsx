import { useState } from 'react'
import { guardarRevision } from './servicioDemo'
import { Etiqueta, Panel, MensajeError, intentar, fecha, persona } from './ui'

// M-08: Legales da de alta la autorización (L-02); Mantenimiento la revisa.
// El resultado lo ve RRHH en la ficha de la persona, en solo lectura.
export default function Autorizaciones({ datos, usuario, actualizar }) {
  const [abierta, setAbierta] = useState(null)
  const pendientes = datos.autorizaciones.filter((a) => a.revision === 'pendiente' && !a.vigente_hasta)
  const revisadas = datos.autorizaciones.filter((a) => a.revision !== 'pendiente')

  return (
    <>
      <Panel titulo="Autorizaciones pendientes de revisión" subtitulo="Cargadas por Legales. Abrí el documento y marcá el resultado.">
        <div className="mant-scroll">
          <table>
            <thead><tr><th>Persona</th><th>Cargada</th><th>Documento</th><th>Estado</th><th>Acción</th></tr></thead>
            <tbody>
              {pendientes.map((a) => (
                <tr key={a.id}>
                  <td><b>{persona(datos, a.persona_id)}</b></td>
                  <td>{fecha(a.vigente_desde)}</td>
                  <td className="mant-muted">{a.documento} (sin archivo)</td>
                  <td><Etiqueta>pendiente</Etiqueta></td>
                  <td><button className="mant-enlace" onClick={() => setAbierta(abierta === a.id ? null : a.id)}>{abierta === a.id ? 'Cancelar' : 'Revisar'}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!pendientes.length && <p className="mant-vacio">No hay autorizaciones pendientes.</p>}
      </Panel>

      {abierta && <FormRevision key={abierta} datos={datos} id={abierta} usuario={usuario} hecho={(d, msg) => { actualizar(d, msg); setAbierta(null) }} />}

      <Panel titulo="Revisadas">
        {revisadas.map((a) => (
          <p className="mant-historial" key={a.id}>
            {persona(datos, a.persona_id)} · <Etiqueta>{a.revision}</Etiqueta> · revisada el {fecha(a.revisado_fecha)} {a.observacion && `· ${a.observacion}`}
          </p>
        ))}
      </Panel>
    </>
  )
}

function FormRevision({ datos, id, usuario, hecho }) {
  const [error, setError] = useState('')
  const [revision, setRevision] = useState('si')
  const a = datos.autorizaciones.find((x) => x.id === id)
  function enviar(e) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    intentar(() => hecho(guardarRevision(datos, id, { revision, observacion: f.get('observacion') }, usuario), 'Revisión guardada. RRHH la verá en la ficha de la persona.'), setError)
  }
  return (
    <form className="vidrio mant-panel mant-form" onSubmit={enviar}>
      <h3>Revisar autorización · {persona(datos, a.persona_id)}</h3>
      <div className="mant-form-grid">
        <label>Resultado
          <select value={revision} onChange={(e) => setRevision(e.target.value)}>
            <option value="si">Sí, puede conducir</option>
            <option value="no">No</option>
            <option value="pendiente">Sigue pendiente</option>
          </select>
        </label>
        <label>Observación<input name="observacion" maxLength={500} placeholder={revision === 'no' ? 'Obligatoria si se rechaza' : 'Opcional'} /></label>
      </div>
      <MensajeError texto={error} />
      <button className="mant-boton">Guardar revisión de prueba</button>
    </form>
  )
}
