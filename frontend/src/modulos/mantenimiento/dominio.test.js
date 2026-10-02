import test from 'node:test'
import assert from 'node:assert/strict'
import {
  hoy, sumarDias, normalizarDominio, altaVehiculo, corregirVehiculo, cambiarEstadoVehiculo, estadoVehiculoEn,
  validarAsignacion, asignar, cerrarAsignacion, problemasDeAsignacion, crearPoliza, renovarPoliza,
  retirarVehiculoDePoliza, agregarVehiculoAPoliza, polizaDeVehiculoEn, revisarAutorizacion, fichaVehiculoEn,
  estadoVencimiento,
} from './dominio.js'
import { datosIniciales } from './servicioDemo.js'

const d = (dias) => sumarDias(hoy(), dias)
const usuario = { id: 1, usuario: 'agomez' }

test('el dominio se normaliza, se valida y no se repite', () => {
  assert.equal(normalizarDominio(' ab-123 cd '), 'AB123CD')
  const datos = datosIniciales()
  const nuevo = altaVehiculo(datos, { dominio: 'ab 999 zz', marca: 'Fiat', modelo: 'Strada', vigente_desde: hoy() })
  assert.equal(nuevo.vehiculos.at(-1).dominio, 'AB999ZZ')
  assert.equal(estadoVehiculoEn(nuevo, nuevo.vehiculos.at(-1).id), 'activo')
  assert.throws(() => altaVehiculo(nuevo, { dominio: 'AB999ZZ', marca: 'X', modelo: 'Y', vigente_desde: hoy() }), /ya está registrado/)
  assert.throws(() => altaVehiculo(datos, { dominio: '12ABC', marca: 'X', modelo: 'Y', vigente_desde: hoy() }), /inválido/)
})

test('corregir el dominio conserva el id y las referencias', () => {
  const datos = datosIniciales()
  const { datos: corregido, anterior } = corregirVehiculo(datos, 1, { dominio: 'AA111ZZ' })
  assert.equal(anterior.dominio, 'AA001ZZ')
  assert.equal(corregido.vehiculos.find((v) => v.id === 1).dominio, 'AA111ZZ')
  assert.equal(corregido.asignaciones.filter((a) => a.vehiculo_id === 1).length, 2)
  assert.throws(() => corregirVehiculo(datos, 1, { dominio: 'AA002ZZ' }), /ya está registrado/)
})

test('cambiar estado cierra el período anterior sin borrarlo', () => {
  const datos = datosIniciales()
  const r = cambiarEstadoVehiculo(datos, 2, { estado: 'taller', motivo: 'Frenos', vigente_desde: hoy() })
  const historial = r.estadosVehiculo.filter((e) => e.vehiculo_id === 2)
  assert.equal(historial.length, 2)
  assert.equal(historial[0].vigente_hasta, hoy())
  assert.equal(estadoVehiculoEn(r, 2, d(-1)), 'activo')
  assert.equal(estadoVehiculoEn(r, 2, hoy()), 'taller')
  assert.throws(() => cambiarEstadoVehiculo(datos, 2, { estado: 'activo', vigente_desde: hoy() }), /ya está/)
  assert.throws(() => cambiarEstadoVehiculo(datos, 1, { estado: 'baja', motivo: 'x', vigente_desde: hoy() }), /asignaciones vigentes/)
})

test('la asignación valida licencia, categoría, autorización y superposición', () => {
  const datos = datosIniciales()
  const control = (p, v) => Object.fromEntries(validarAsignacion(datos, { persona_id: p, vehiculo_id: v, vigente_desde: hoy() }).map((c) => [c.id, c.ok]))
  assert.equal(control(2, 3).categoria, false) // Benítez: solo B.1, la Daily pide C.1
  assert.equal(control(3, 4).licencia, false) // Costa: licencia vencida
  assert.equal(control(3, 4).autorizacion, false) // Costa: autorización pendiente
  assert.equal(control(4, 2).persona, false) // Duarte: de baja
  assert.equal(control(1, 1).superposicion, false) // Acosta ya tiene el 1
  assert.equal(control(2, 5).vehiculo, false) // vehículo 5 dado de baja
  assert.throws(() => asignar(datos, { persona_id: 2, vehiculo_id: 3, vigente_desde: hoy() }), /categoría C\.1/)
  const ok = asignar(datos, { persona_id: 2, vehiculo_id: 4, vigente_desde: hoy() })
  assert.equal(ok.asignaciones.length, datos.asignaciones.length + 1)
})

test('un vehículo admite varios conductores y cerrar una asignación no toca las demás', () => {
  const datos = datosIniciales()
  const r = cerrarAsignacion(datos, 1, { vigente_hasta: hoy(), motivo: 'Cambio de sector' })
  assert.equal(r.asignaciones.find((a) => a.id === 1).vigente_hasta, hoy())
  assert.equal(r.asignaciones.find((a) => a.id === 2).vigente_hasta, null)
  assert.throws(() => cerrarAsignacion(r, 1, { vigente_hasta: hoy(), motivo: 'x' }), /ya está cerrada/)
  assert.throws(() => cerrarAsignacion(datos, 2, { vigente_hasta: hoy() }), /motivo/)
})

test('detecta asignaciones vigentes con problemas sobrevinientes', () => {
  const datos = datosIniciales()
  const costa = datos.asignaciones.find((a) => a.id === 3)
  assert.deepEqual(problemasDeAsignacion(datos, costa), ['Licencia vencida', 'Autorización no aprobada'])
  assert.deepEqual(problemasDeAsignacion(datos, datos.asignaciones[0]), [])
})

test('póliza con varios vehículos: retirar conserva el período y renovar cierra la anterior', () => {
  const datos = datosIniciales()
  assert.throws(() => crearPoliza(datos, { nro_poliza: 'X', aseguradora: 'Y', vigente_desde: hoy(), vigente_hasta: d(365), vehiculos: [] }), /al menos un vehículo/)
  const retirado = retirarVehiculoDePoliza(datos, 6, hoy())
  assert.equal(retirado.polizasVehiculo.find((pv) => pv.id === 6).vigente_hasta, hoy())
  assert.equal(polizaDeVehiculoEn(retirado, 4, d(-1)).id, 2)
  assert.equal(polizaDeVehiculoEn(retirado, 4, hoy()), null)
  assert.throws(() => agregarVehiculoAPoliza(datos, 2, 1, hoy()), /ya está cubierto/)

  const renovada = renovarPoliza(datos, 2, { nro_poliza: 'POL-DEMO-0003', aseguradora: 'Aseguradora Ejemplo', vigente_desde: hoy(), vigente_hasta: d(365) })
  const nueva = renovada.polizas.at(-1)
  assert.equal(polizaDeVehiculoEn(renovada, 1, hoy()).id, nueva.id)
  assert.equal(polizaDeVehiculoEn(renovada, 1, d(-1)).id, 2)
  assert.equal(renovada.polizasVehiculo.filter((pv) => pv.poliza_id === nueva.id).length, 4)
})

test('rechazar una autorización exige observación y registra quién revisó', () => {
  const datos = datosIniciales()
  assert.throws(() => revisarAutorizacion(datos, 3, { revision: 'no' }, usuario), /motivo/)
  const { nuevo } = revisarAutorizacion(datos, 3, { revision: 'si' }, usuario)
  assert.equal(nuevo.revisado_por, 1)
  assert.equal(nuevo.revisado_fecha, hoy())
})

test('la ficha del vehículo muestra lo vigente en la fecha elegida', () => {
  const datos = datosIniciales()
  const actual = fichaVehiculoEn(datos, 1, hoy())
  assert.equal(actual.conductores.length, 2)
  assert.equal(actual.centroCosto.nombre, 'Administración · ejemplo')
  const pasado = fichaVehiculoEn(datos, 1, d(-400))
  assert.equal(pasado.conductores.length, 0)
  assert.equal(pasado.poliza.nro_poliza, 'POL-DEMO-0001')
  assert.equal(pasado.centroCosto.nombre, 'Operaciones · ejemplo')
  assert.equal(estadoVencimiento(d(12)), 'Por vencer')
  assert.equal(estadoVencimiento(d(-1)), 'Vencida')
})
