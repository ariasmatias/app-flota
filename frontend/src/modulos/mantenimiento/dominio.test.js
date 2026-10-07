import test from 'node:test'
import assert from 'node:assert/strict'
import {
  hoy, sumarDias, normalizarDominio, altaVehiculo, corregirVehiculo, cambiarEstadoVehiculo, estadoVehiculoEn,
  validarAsignacion, asignar, asignarVarios, cerrarAsignacion, problemasDeAsignacion, crearPoliza, renovarPoliza,
  retirarVehiculoDePoliza, agregarVehiculoAPoliza, polizaDeVehiculoEn, revisarAutorizacion, fichaVehiculoEn,
  estadoVencimiento,
} from './dominio.js'
import { readFileSync } from 'node:fs'
import { datosDesdeSeed } from './datosSeed.js'

// Mismos datos que la pantalla: el seed compartido (servicioDemo lo importa con Vite).
const seed = readFileSync(new URL('../../../../database/seed/001_datos_demo.sql', import.meta.url), 'utf8')
const datosIniciales = () => datosDesdeSeed(seed)

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
  const retirado = retirarVehiculoDePoliza(datos, 7, hoy())
  assert.equal(retirado.polizasVehiculo.find((pv) => pv.id === 7).vigente_hasta, hoy())
  assert.equal(polizaDeVehiculoEn(retirado, 4, d(-1)).id, 2)
  assert.equal(polizaDeVehiculoEn(retirado, 4, hoy()), null)
  assert.throws(() => agregarVehiculoAPoliza(datos, 2, 1, hoy()), /ya está cubierto/)

  const renovada = renovarPoliza(datos, 2, { nro_poliza: 'POL-DEMO-0005', aseguradora: 'Aseguradora Ejemplo', vigente_desde: hoy(), vigente_hasta: d(365) })
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
  assert.equal(actual.centroCosto.nombre, 'Administración (ejemplo)')
  const pasado = fichaVehiculoEn(datos, 1, d(-400))
  assert.equal(pasado.conductores.length, 0)
  assert.equal(pasado.poliza.nro_poliza, 'POL-DEMO-0001')
  assert.equal(pasado.centroCosto.nombre, 'Operaciones (ejemplo)')
  assert.equal(estadoVencimiento(d(12)), 'Por vencer')
  assert.equal(estadoVencimiento(d(-1)), 'Vencida')
})

test('la demo usa el seed compartido: mismos datos que RRHH y la base', () => {
  const datos = datosIniciales()
  assert.equal(datos.personas.length, 20)
  assert.equal(datos.vehiculos.length, 20)
  assert.equal(datos.vehiculos[0].dominio, 'AA001ZZ')
  assert.equal(datos.categorias.find((c) => c.id === datos.vehiculos[2].categoria_requerida_id).codigo, 'C.1')
  // Caso de prueba del seed: la única asignación vigente con problemas es Costa en AA002ZZ.
  const conProblemas = datos.asignaciones.filter((a) => !a.vigente_hasta && problemasDeAsignacion(datos, a, hoy()).length)
  assert.deepEqual(conProblemas.map((a) => a.id), [3])
  assert.equal(estadoVehiculoEn(datos, 4), 'taller')
  assert.equal(estadoVehiculoEn(datos, 5), 'baja')
  assert.equal(polizaDeVehiculoEn(datos, 20, hoy()), null)
  assert.equal(datos.autorizaciones.filter((a) => a.revision === 'pendiente').length, 3)
  assert.equal(datos.autorizaciones.find((a) => a.id === 1).documento, 'autorizacion-acosta.pdf')
})

test('una persona puede recibir varios vehículos de una vez (todo o nada)', () => {
  const datos = datosIniciales()
  // Benítez (2) maneja AA001ZZ y AA006ZZ; le sumamos AB004ZZ (4) y AA008ZZ (8).
  const r = asignarVarios(datos, { persona_id: 2, vehiculo_ids: ['4', '8'], vigente_desde: hoy() })
  const suyas = r.asignaciones.filter((a) => a.persona_id === 2 && !a.vigente_hasta).map((a) => a.vehiculo_id).sort((a, b) => a - b)
  assert.deepEqual(suyas, [1, 4, 6, 8])
  // Si uno falla (AA003ZZ pide C.1 y Benítez tiene B.1), no se guarda ninguno.
  assert.throws(() => asignarVarios(datos, { persona_id: 2, vehiculo_ids: [4, 3], vigente_desde: hoy() }), /AA003ZZ: .*categoría C\.1/)
  assert.throws(() => asignarVarios(datos, { persona_id: 2, vehiculo_ids: [], vigente_desde: hoy() }), /al menos un vehículo/)
  // Repetir un vehículo que ya tiene: el control lo explica en criollo.
  const repetido = validarAsignacion(datos, { persona_id: 2, vehiculo_id: 1, vigente_desde: hoy() }).find((c) => c.id === 'superposicion')
  assert.equal(repetido.ok, false)
  assert.match(repetido.texto, /Ya tiene este vehículo asignado desde el/)
})
