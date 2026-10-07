import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { tablasDeFlota, buscarVehiculos, fichaCompleta, normalizarDominio } from './fichaVehiculo.js'

const sql = readFileSync(new URL('../../../../database/seed/001_datos_demo.sql', import.meta.url), 'utf8')
const t = tablasDeFlota(sql, '2026-10-07')

test('la búsqueda encuentra por dominio (con o sin espacios/guiones) y por marca', () => {
  assert.equal(normalizarDominio(' aa-001 zz '), 'AA001ZZ')
  assert.equal(buscarVehiculos(t, 'aa 001')[0].dominio, 'AA001ZZ')
  assert.equal(buscarVehiculos(t, 'AA001ZZ').length, 1)
  assert.ok(buscarVehiculos(t, 'hilux').every((v) => v.modelo === 'Hilux'))
  assert.equal(buscarVehiculos(t, 'a').length, 0)
  assert.equal(buscarVehiculos(t, 'AB004ZZ')[0].estado, 'taller')
})

test('la ficha completa trae todo el historial del vehículo', () => {
  const f = fichaCompleta(t, 'aa001zz')
  assert.equal(f.vehiculo.dominio, 'AA001ZZ')
  assert.equal(f.estado, 'activo')
  assert.equal(f.conductoresHoy.length, 2)
  assert.deepEqual(f.polizas.map((p) => p.nro_poliza), ['POL-DEMO-0002', 'POL-DEMO-0001'])
  assert.equal(f.polizaHoy.nro_poliza, 'POL-DEMO-0002')
  assert.equal(f.vtv.length, 2)
  assert.equal(f.centros.length, 2)
  assert.equal(f.centroHoy.nombre, 'Administración (ejemplo)')
  assert.equal(f.multas.length, 3)
  assert.equal(f.tarjetas.length, 1)
  assert.ok(f.documentos.some((d) => d.nombre === 'cedula-aa001zz.pdf'))
  assert.equal(fichaCompleta(t, 'ZZ999ZZ'), null)
})

test('casos de prueba: vehículo de baja con historia y 0 km sin póliza', () => {
  const baja = fichaCompleta(t, 'AA005ZZ')
  assert.equal(baja.estado, 'baja')
  assert.equal(baja.conductoresHoy.length, 0)
  assert.ok(baja.asignaciones.length > 0)
  const nuevo = fichaCompleta(t, 'AA020ZZ')
  assert.equal(nuevo.polizaHoy, null)
  assert.equal(nuevo.vtvHoy, null)
})
