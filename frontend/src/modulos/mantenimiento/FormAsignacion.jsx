import { useState } from 'react'
import { CircleCheck, CircleX } from 'lucide-react'
import { hoy, validarAsignacion, estadoVehiculoEn } from './dominio'
import { guardarAsignaciones } from './servicioDemo'
import { MensajeError, intentar, persona as nombrePersona } from './ui'
import Desplegable from '../../core/componentes/Desplegable'

// Controles que dependen solo de la persona (se muestran una vez) y los que
// dependen de cada vehículo (se muestran por vehículo).
const DE_PERSONA = ['persona', 'licencia', 'autorizacion']

function Control({ c }) {
  return (
    <li className={c.ok ? 'ok' : 'falla'}>
      {c.ok ? <CircleCheck size={16} /> : <CircleX size={16} />} {c.texto}
    </li>
  )
}

// M-06: asignar a un conductor uno o VARIOS vehículos de una vez.
// Los controles se ven en vivo antes de guardar; se guarda todo o nada.
export default function FormAsignacion({ datos, usuario, hecho, vehiculoFijo = null, personaFija = null }) {
  const [personaId, setPersonaId] = useState(personaFija ? String(personaFija) : '')
  const [vehiculoIds, setVehiculoIds] = useState(vehiculoFijo ? [String(vehiculoFijo)] : [])
  const [desde, setDesde] = useState(hoy())
  const [motivo, setMotivo] = useState('')
  const [error, setError] = useState('')

  const porVehiculo = personaId
    ? vehiculoIds.map((vid) => ({
        vehiculo: datos.vehiculos.find((v) => v.id === Number(vid)),
        controles: validarAsignacion(datos, { persona_id: Number(personaId), vehiculo_id: Number(vid), vigente_desde: desde }).filter((c) => c.id !== 'datos'),
      }))
    : []
  const dePersona = porVehiculo[0]?.controles.filter((c) => DE_PERSONA.includes(c.id)) ?? []
  const todoOk = porVehiculo.length > 0 && porVehiculo.every((x) => x.controles.every((c) => c.ok))

  function enviar(e) {
    e.preventDefault()
    const cantidad = vehiculoIds.length
    intentar(() => hecho(
      guardarAsignaciones(datos, { persona_id: Number(personaId), vehiculo_ids: vehiculoIds, vigente_desde: desde, motivo }, usuario),
      cantidad === 1 ? 'Conductor asignado.' : `${cantidad} vehículos asignados a ${nombrePersona(datos, Number(personaId))}.`,
    ), setError)
  }

  return (
    <form className="vidrio mant-panel mant-form" onSubmit={enviar}>
      <h3>Asignar conductor</h3>
      <p className="mant-muted">Una persona puede manejar varios vehículos y un vehículo tener varios conductores. Podés elegir varios vehículos de una vez.</p>
      <div className="mant-form-grid">
        <Desplegable
          etiqueta="Conductor"
          required
          buscable
          placeholder="Seleccionar persona"
          valor={personaId}
          alCambiar={setPersonaId}
          deshabilitado={Boolean(personaFija)}
          opciones={datos.personas.map((p) => ({ valor: p.id, etiqueta: p.apellido_nombre, detalle: `· ${p.legajo}` }))}
        />
        <Desplegable
          etiqueta={vehiculoFijo ? 'Vehículo' : 'Vehículos'}
          required
          buscable
          multiple
          limpiable
          placeholder="Elegir uno o varios vehículos"
          valor={vehiculoIds}
          alCambiar={setVehiculoIds}
          deshabilitado={Boolean(vehiculoFijo)}
          opciones={datos.vehiculos.map((v) => ({
            valor: v.id,
            etiqueta: v.dominio,
            detalle: `· ${v.marca} ${v.modelo}${estadoVehiculoEn(datos, v.id) === 'baja' ? ' (baja)' : ''}`,
          }))}
        />
        <label>Desde<input required type="date" max={hoy()} value={desde} onChange={(e) => setDesde(e.target.value)} /></label>
        <label>Motivo<input maxLength={300} value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Opcional" /></label>
      </div>

      {porVehiculo.length > 0 && (
        <div className="mant-controles-grupo" aria-label="Controles antes de asignar">
          <div>
            <h4>{nombrePersona(datos, Number(personaId))}</h4>
            <ul className="mant-controles">{dePersona.map((c) => <Control key={c.id} c={c} />)}</ul>
          </div>
          {porVehiculo.map(({ vehiculo, controles }) => (
            <div key={vehiculo.id}>
              <h4><span className="mant-dominio">{vehiculo.dominio}</span> {vehiculo.marca} {vehiculo.modelo}</h4>
              <ul className="mant-controles">
                {controles.filter((c) => !DE_PERSONA.includes(c.id)).map((c) => <Control key={c.id} c={c} />)}
              </ul>
            </div>
          ))}
        </div>
      )}
      <MensajeError texto={error} />
      <button className="mant-boton" disabled={!todoOk}>
        {vehiculoIds.length > 1 ? `Guardar ${vehiculoIds.length} asignaciones de prueba` : 'Guardar asignación de prueba'}
      </button>
    </form>
  )
}
