import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { CATEGORIAS_LICENCIA, infoCategoria, habilita, categoriasHabilitadas } from './categoriasLicencia.js'
import { leerTabla } from '../datos/seed.js'

test('cada categoría oficial tiene dibujito y descripción', () => {
  assert.equal(CATEGORIAS_LICENCIA.length, 22)
  assert.ok(CATEGORIAS_LICENCIA.every((c) => c.grupo && c.titulo && c.detalle))
  assert.equal(infoCategoria('a.1.2').grupo, 'moto')
  assert.equal(infoCategoria('B.1').grupo, 'auto')
  assert.equal(infoCategoria('B.2').grupo, 'trailer')
  assert.equal(infoCategoria('C.3').grupo, 'camion')
  assert.equal(infoCategoria('D.4').grupo, 'emergencia')
  assert.equal(infoCategoria('E.1').grupo, 'articulado')
  assert.equal(infoCategoria('F').grupo, 'adaptado')
  assert.equal(infoCategoria('G.3').grupo, 'tractor')
  assert.equal(infoCategoria('Z.9').grupo, 'desconocido')
})

test('el catálogo del seed es exactamente el oficial (22 subclases)', () => {
  const sql = readFileSync(new URL('../../../../database/seed/001_datos_demo.sql', import.meta.url), 'utf8')
  const codigos = leerTabla(sql, 'categoria_licencia').map((c) => c.codigo)
  assert.deepEqual(codigos, CATEGORIAS_LICENCIA.map((c) => c.codigo))
  assert.match(infoCategoria('A.1').titulo, /sin subclase/) // licencias viejas: se muestran igual
})

test('inclusiones: solo las que la normativa dice expresamente', () => {
  const hab = (codigos) => [...categoriasHabilitadas(codigos)].sort()
  assert.deepEqual(hab(['A.1.4']), ['A.1.1', 'A.1.2', 'A.1.3', 'A.1.4'])
  assert.deepEqual(hab(['C.3']), ['A.3', 'B.1', 'C.1', 'C.2', 'C.3'])
  assert.deepEqual(hab(['E.1']), ['A.3', 'B.1', 'B.2', 'E.1'])
  assert.deepEqual(hab(['D.3']), ['D.2', 'D.3'])
  assert.equal(habilita(['C.3'], 'D.2').ok, false) // un camión no habilita colectivos
  assert.equal(habilita(['D.3'], 'B.1').ok, false) // D.3 no incluye B.1
  assert.equal(habilita(['B.1'], 'A.1.1').ok, false) // B.1 no habilita motos
  assert.equal(habilita(['G.1'], 'G.2').ok, false)
  assert.deepEqual(habilita(['C.1'], 'B.1'), { ok: true, directa: false, via: 'C.1' })
  assert.deepEqual(habilita(['B.1'], 'B.1'), { ok: true, directa: true, via: 'B.1' })
  assert.equal(habilita([], null).ok, true)
})
