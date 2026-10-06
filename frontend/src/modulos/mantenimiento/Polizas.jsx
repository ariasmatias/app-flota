import { useState } from 'react'
import { Plus } from 'lucide-react'
import { hoy, sumarDias, estadoVencimiento, estadoVehiculoEn } from './dominio'
import { guardarPoliza, guardarRenovacion, guardarIncorporacion, guardarRetiro } from './servicioDemo'
import { Etiqueta, Panel, MensajeError, intentar, fecha, dominio } from './ui'
import Desplegable from '../../core/componentes/Desplegable'

// M-03: una póliza cubre varios vehículos; agregar o retirar conserva el período; renovar cierra la anterior.
export default function Polizas({ datos, usuario, actualizar }) {
  const [nueva, setNueva] = useState(false)
  const [abierta, setAbierta] = useState(null)
  const hecho = (d, msg) => { actualizar(d, msg); setNueva(false) }

  const polizas = [...datos.polizas].sort((a, b) => b.vigente_desde.localeCompare(a.vigente_desde))

  return (
    <>
      {nueva && <FormPoliza datos={datos} usuario={usuario} hecho={hecho} cancelar={() => setNueva(false)} />}
      <Panel
        titulo="Pólizas"
        subtitulo="Una póliza se carga una sola vez y cubre uno o varios vehículos."
        acciones={!nueva && <button className="mant-boton" onClick={() => setNueva(true)}><Plus size={16} /> Nueva póliza</button>}
      >
        <div className="mant-scroll">
          <table>
            <thead><tr><th>Póliza</th><th>Aseguradora</th><th>Vigencia</th><th>Vehículos cubiertos</th><th>Estado</th><th>Acción</th></tr></thead>
            <tbody>
              {polizas.map((p) => {
                const cubiertos = datos.polizasVehiculo.filter((pv) => pv.poliza_id === p.id && !pv.vigente_hasta)
                return (
                  <tr key={p.id}>
                    <td><b>{p.nro_poliza}</b></td>
                    <td>{p.aseguradora}</td>
                    <td>{fecha(p.vigente_desde)} → {fecha(p.vigente_hasta)}</td>
                    <td>{cubiertos.length ? cubiertos.map((pv) => dominio(datos, pv.vehiculo_id)).join(' · ') : '—'}</td>
                    <td><Etiqueta>{estadoVencimiento(p.vigente_hasta)}</Etiqueta></td>
                    <td><button className="mant-enlace" onClick={() => setAbierta(abierta === p.id ? null : p.id)}>{abierta === p.id ? 'Cerrar' : 'Gestionar'}</button></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Panel>
      {abierta && <Detalle key={abierta} datos={datos} id={abierta} usuario={usuario} actualizar={actualizar} />}
    </>
  )
}

function FormPoliza({ datos, usuario, hecho, cancelar, renovarDe = null }) {
  const [error, setError] = useState('')
  const [elegidos, setElegidos] = useState([])
  const disponibles = datos.vehiculos.filter((v) => estadoVehiculoEn(datos, v.id) !== 'baja')

  function enviar(e) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const nueva = { nro_poliza: f.get('nro'), aseguradora: f.get('aseguradora'), vigente_desde: f.get('desde'), vigente_hasta: f.get('hasta') }
    intentar(() => hecho(
      renovarDe
        ? guardarRenovacion(datos, renovarDe.id, nueva, usuario)
        : guardarPoliza(datos, { ...nueva, vehiculos: elegidos }, usuario),
      renovarDe ? 'Póliza renovada. La anterior quedó en el historial.' : 'Póliza cargada.',
    ), setError)
  }

  return (
    <form className="vidrio mant-panel mant-form" onSubmit={enviar}>
      <h3>{renovarDe ? `Renovar ${renovarDe.nro_poliza}` : 'Nueva póliza'}</h3>
      {renovarDe && <p className="mant-muted">La nueva póliza toma los vehículos cubiertos hoy y la cobertura anterior se cierra en la fecha de inicio.</p>}
      <div className="mant-form-grid">
        <label>Número de póliza<input required name="nro" maxLength={40} /></label>
        <label>Aseguradora<input required name="aseguradora" maxLength={100} defaultValue={renovarDe?.aseguradora} /></label>
        <label>Vigente desde<input required type="date" name="desde" defaultValue={hoy()} /></label>
        <label>Vence<input required type="date" name="hasta" defaultValue={sumarDias(hoy(), 365)} /></label>
      </div>
      {!renovarDe && (
        <fieldset>
          <legend>Vehículos cubiertos</legend>
          <div className="mant-checks">
            {disponibles.map((v) => (
              <label key={v.id}>
                <input type="checkbox" checked={elegidos.includes(v.id)} onChange={(e) => setElegidos(e.target.checked ? [...elegidos, v.id] : elegidos.filter((x) => x !== v.id))} />
                {v.dominio}
              </label>
            ))}
          </div>
        </fieldset>
      )}
      <MensajeError texto={error} />
      <div className="mant-acciones">
        <button className="mant-boton">{renovarDe ? 'Renovar (prueba)' : 'Guardar póliza de prueba'}</button>
        {cancelar && <button type="button" className="mant-boton secundario" onClick={cancelar}>Cancelar</button>}
      </div>
    </form>
  )
}

function Detalle({ datos, id, usuario, actualizar }) {
  const [error, setError] = useState('')
  const [agregar, setAgregar] = useState('')
  const [renovar, setRenovar] = useState(false)
  const poliza = datos.polizas.find((p) => p.id === id)
  const filas = datos.polizasVehiculo.filter((pv) => pv.poliza_id === id).sort((a, b) => b.vigente_desde.localeCompare(a.vigente_desde))
  const cubiertos = new Set(filas.filter((f) => !f.vigente_hasta).map((f) => f.vehiculo_id))
  const candidatos = datos.vehiculos.filter((v) => !cubiertos.has(v.id) && estadoVehiculoEn(datos, v.id) !== 'baja')
  const vigente = poliza.vigente_hasta >= hoy()

  return (
    <>
      <Panel titulo={`Póliza ${poliza.nro_poliza}`} subtitulo={`${poliza.aseguradora} · ${fecha(poliza.vigente_desde)} → ${fecha(poliza.vigente_hasta)}`}
        acciones={vigente && <button className="mant-boton secundario" onClick={() => setRenovar(!renovar)}>{renovar ? 'Cancelar renovación' : 'Renovar'}</button>}>
        <h3>Vehículos (con su período en la póliza)</h3>
        {filas.map((f) => (
          <p className="mant-historial" key={f.id}>
            <span className="mant-dominio">{dominio(datos, f.vehiculo_id)}</span> · {fecha(f.vigente_desde)} → {f.vigente_hasta ? fecha(f.vigente_hasta) : 'cubierto'}
            {!f.vigente_hasta && vigente && (
              <button className="mant-enlace mant-derecha" onClick={() => intentar(() => actualizar(guardarRetiro(datos, f.id, hoy(), usuario), 'Vehículo retirado de la póliza. Su período quedó registrado.'), setError)}>Retirar hoy</button>
            )}
          </p>
        ))}
        {vigente && candidatos.length > 0 && (
          <div className="mant-filtros">
            <Desplegable
              etiqueta="Agregar vehículo"
              ancho={280}
              valor={agregar}
              alCambiar={setAgregar}
              opciones={candidatos.map((v) => ({ valor: v.id, etiqueta: v.dominio, detalle: `· ${v.marca} ${v.modelo}` }))}
            />
            <button className="mant-boton" disabled={!agregar} onClick={() => intentar(() => { actualizar(guardarIncorporacion(datos, id, Number(agregar), hoy(), usuario), 'Vehículo agregado a la póliza.'); setAgregar('') }, setError)}>Agregar desde hoy</button>
          </div>
        )}
        <MensajeError texto={error} />
      </Panel>
      {renovar && <FormPoliza datos={datos} usuario={usuario} renovarDe={poliza} hecho={(d, msg) => { actualizar(d, msg); setRenovar(false) }} />}
    </>
  )
}
