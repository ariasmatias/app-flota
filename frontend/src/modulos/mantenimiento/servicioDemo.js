import * as reglas from './dominio.js'
import seedSql from '../../../../database/seed/001_datos_demo.sql?raw'
import { datosDesdeSeed } from './datosSeed.js'

// Fuente única de prueba: el seed compartido (database/seed/001_datos_demo.sql),
// el mismo SQL que se carga en PostgreSQL y que usa RRHH. Los cambios de la demo
// siguen en memoria: al recargar o salir del módulo se reinician.
export function datosIniciales() {
  return datosDesdeSeed(seedSql)
}

// ───── Operaciones: aplican la regla y dejan registro de auditoría en memoria ─────

function auditar(datos, usuario, accion, entidad, entidad_id, valor_anterior = null, valor_nuevo = null) {
  return {
    ...datos,
    auditoria: [
      ...datos.auditoria,
      { fecha: new Date().toISOString(), usuario: usuario.usuario, accion, entidad, entidad_id, valor_anterior, valor_nuevo },
    ],
  }
}

export function guardarVehiculo(datos, nuevo, usuario) {
  const resultado = reglas.altaVehiculo(datos, nuevo)
  const v = resultado.vehiculos.at(-1)
  return auditar(resultado, usuario, 'alta', 'vehiculo', v.id, null, v)
}

export function guardarCorreccion(datos, id, cambios, usuario) {
  const { anterior, nuevo, datos: resultado } = reglas.corregirVehiculo(datos, id, cambios)
  return auditar(resultado, usuario, 'modificacion', 'vehiculo', id, anterior, nuevo)
}

export function guardarEstado(datos, vehiculoId, cambio, usuario) {
  return auditar(reglas.cambiarEstadoVehiculo(datos, vehiculoId, cambio), usuario, 'modificacion', 'vehiculo_estado', vehiculoId, null, cambio)
}

export function guardarAsignacion(datos, nueva, usuario) {
  const resultado = reglas.asignar(datos, nueva)
  const a = resultado.asignaciones.at(-1)
  return auditar(resultado, usuario, 'alta', 'asignacion', a.id, null, a)
}

// Varios vehículos para una persona: un evento de auditoría por asignación.
export function guardarAsignaciones(datos, nueva, usuario) {
  const resultado = reglas.asignarVarios(datos, nueva)
  const nuevas = resultado.asignaciones.slice(datos.asignaciones.length)
  return nuevas.reduce((acc, a) => auditar(acc, usuario, 'alta', 'asignacion', a.id, null, a), resultado)
}

export function guardarCierreAsignacion(datos, id, cierre, usuario) {
  return auditar(reglas.cerrarAsignacion(datos, id, cierre), usuario, 'anulacion', 'asignacion', id, null, cierre)
}

export function guardarPoliza(datos, nueva, usuario) {
  const resultado = reglas.crearPoliza(datos, nueva)
  const p = resultado.polizas.at(-1)
  return auditar(resultado, usuario, 'alta', 'poliza', p.id, null, p)
}

export function guardarRenovacion(datos, polizaId, nueva, usuario) {
  const resultado = reglas.renovarPoliza(datos, polizaId, nueva)
  return auditar(resultado, usuario, 'alta', 'poliza', resultado.polizas.at(-1).id, { renueva: polizaId }, nueva)
}

export function guardarIncorporacion(datos, polizaId, vehiculoId, desde, usuario) {
  return auditar(reglas.agregarVehiculoAPoliza(datos, polizaId, vehiculoId, desde), usuario, 'alta', 'poliza_vehiculo', polizaId, null, { vehiculoId, desde })
}

export function guardarRetiro(datos, filaId, hasta, usuario) {
  return auditar(reglas.retirarVehiculoDePoliza(datos, filaId, hasta), usuario, 'anulacion', 'poliza_vehiculo', filaId, null, { hasta })
}

export function guardarRevision(datos, id, revision, usuario) {
  const { anterior, nuevo, datos: resultado } = reglas.revisarAutorizacion(datos, id, revision, usuario)
  return auditar(resultado, usuario, 'modificacion', 'autorizacion_conducir', id, anterior, nuevo)
}
