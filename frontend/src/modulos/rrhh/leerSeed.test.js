import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { datosDesdeSeed, leerTabla, separarValores } from './leerSeed.js'
import { vigenteEn, estadoLicencia, contextoMulta } from './dominio.js'
const sql = readFileSync(new URL('../../../../database/seed/001_datos_demo.sql', import.meta.url), 'utf8')
const referencia = '2026-10-02'
const datos = datosDesdeSeed(sql, referencia)

test('seed único: personas, vehículos y multas completos, sin variantes locales', () => {
  assert.equal(datos.personas.length, 20)
  assert.equal(datos.vehiculos.length, 20)
  assert.equal(datos.multas.length, 20)
  assert.deepEqual(datos.personas, leerTabla(sql, 'persona', referencia))
  assert.deepEqual(datos.vehiculos, leerTabla(sql, 'vehiculo', referencia))
  assert.deepEqual(datos.multas.map(({ documentos, ...m }) => m), leerTabla(sql, 'multa', referencia))
  assert.equal(datos.vehiculos[0].dominio, 'AA001ZZ')
  assert.equal(datos.vehiculos[3].dominio, 'AB004ZZ')
  assert.equal(datos.multas.at(-1).nro_acta, 'ACTA-DEMO-020')
})
test('preserva casos de prueba de licencias, bajas, autorizaciones y fechas relativas', () => {
  const licencia = id => datos.licencias.find(l => l.persona_id === id && vigenteEn(l, referencia))
  assert.equal(estadoLicencia(licencia(3), referencia), 'Vencida')
  assert.equal(licencia(2).vencimiento, '2026-10-20')
  assert.equal(licencia(11).vencimiento, '2026-10-27')
  for (const id of [4, 18]) assert.equal(datos.estados.find(e => e.persona_id === id && vigenteEn(e, referencia)).estado, 'baja')
  assert.equal(datos.autorizaciones.find(a => a.persona_id === 10).revision, 'no')
  for (const id of [3, 5, 19]) assert.equal(datos.autorizaciones.find(a => a.persona_id === id).revision, 'pendiente')
  assert.equal(licencia(19), undefined)
  assert.deepEqual(licencia(15).categorias, ['A.2'])
  assert.deepEqual(licencia(1).categorias, ['B.1', 'C.1'])
  assert.equal(licencia(2).documento.nombre, 'licencia-benitez.pdf')
  assert.equal(licencia(1).documentos_versiones.some(d => vigenteEn(d, '2024-01-01')), false)
})
test('responsables históricos de todas las multas coinciden con asignaciones del seed', () => {
  for (const multa of datos.multas.filter(m => m.responsable_id)) {
    assert.ok(contextoMulta(datos, multa).conductores.some(p => p.id === multa.responsable_id), multa.nro_acta)
  }
  assert.equal(contextoMulta(datos, datos.multas[0]).centro, 'Operaciones (ejemplo)')
  assert.equal(datosDesdeSeed(sql, '2027-01-01').multas[0].fecha_infraccion, '2026-12-02')
})
test('parser cerrado interpreta comas y apóstrofes, rechaza expresiones desconocidas', () => {
  assert.deepEqual(separarValores("1, 'Pérez, Ana', 'O''Connor', fn(1, 2)"), ['1', "'Pérez, Ana'", "'O''Connor'", 'fn(1, 2)'])
  assert.throws(() => leerTabla('INSERT INTO persona (id) VALUES (random());', 'persona'), /no soportado/)
})
