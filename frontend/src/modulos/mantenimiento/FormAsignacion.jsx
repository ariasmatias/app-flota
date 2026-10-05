import { useState } from 'react'
import { CircleCheck, CircleX } from 'lucide-react'
import { hoy, validarAsignacion, estadoVehiculoEn } from './dominio'
import { guardarAsignacion } from './servicioDemo'
import { MensajeError, intentar } from './ui'
import Desplegable from '../../core/componentes/Desplegable'

// M-06: asignar un conductor a un vehículo. Los controles se ven en vivo antes de guardar.
export default function FormAsignacion({ datos, usuario, hecho, vehiculoFijo = null }) {
  const [personaId, setPersonaId] = useState('')
  const [vehiculoId, setVehiculoId] = useState(vehiculoFijo ?? '')
  const [desde, setDesde] = useState(hoy())
  const [motivo, setMotivo] = useState('')
  const [error, setError] = useState('')

  const nueva = { persona_id: Number(personaId), vehiculo_id: Number(vehiculoId), vigente_desde: desde, motivo }
  const controles = personaId && vehiculoId ? validarAsignacion(datos, nueva).filter((c) => c.id !== 'datos') : []
  const todoOk = controles.length > 0 && controles.every((c) => c.ok)

  function enviar(e) {
    e.preventDefault()
    intentar(() => hecho(guardarAsignacion(datos, nueva, usuario), 'Conductor asignado.'), setError)
  }

  return (
    <form className="vidrio mant-panel mant-form" onSubmit={enviar}>
      <h3>Asignar conductor</h3>
      <p className="mant-muted">Un vehículo puede tener varios conductores y un conductor varios vehículos.</p>
      <div className="mant-form-grid">
        <Desplegable
          etiqueta="Conductor"
          required
          buscable
          placeholder="Seleccionar persona"
          valor={personaId}
          alCambiar={setPersonaId}
          opciones={datos.personas.map((p) => ({ valor: p.id, etiqueta: p.apellido_nombre, detalle: `· ${p.legajo}` }))}
        />
        <Desplegable
          etiqueta="Vehículo"
          required
          buscable
          placeholder="Seleccionar vehículo"
          valor={vehiculoId}
          alCambiar={setVehiculoId}
          deshabilitado={Boolean(vehiculoFijo)}
          opciones={datos.vehiculos.map((v) => ({
            valor: v.id,
            etiqueta: `${v.dominio} · ${v.marca} ${v.modelo}`,
            detalle: estadoVehiculoEn(datos, v.id) === 'baja' ? '(baja)' : undefined,
          }))}
        />
        <label>Desde<input required type="date" max={hoy()} value={desde} onChange={(e) => setDesde(e.target.value)} /></label>
        <label>Motivo<input maxLength={300} value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Opcional" /></label>
      </div>

      {controles.length > 0 && (
        <ul className="mant-controles" aria-label="Controles antes de asignar">
          {controles.map((c) => (
            <li key={c.id} className={c.ok ? 'ok' : 'falla'}>
              {c.ok ? <CircleCheck size={16} /> : <CircleX size={16} />} {c.texto}
            </li>
          ))}
        </ul>
      )}
      <MensajeError texto={error} />
      <button className="mant-boton" disabled={!todoOk}>Guardar asignación de prueba</button>
    </form>
  )
}
