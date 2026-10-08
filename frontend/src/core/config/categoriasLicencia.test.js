import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { CATEGORIAS_LICENCIA, infoCategoria } from './categoriasLicencia.js'
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

test('todas las categorías del seed se reconocen (A.1 y A.2 como códigos generales)', () => {
  const sql = readFileSync(new URL('../../../../database/seed/001_datos_demo.sql', import.meta.url), 'utf8')
  const codigos = leerTabla(sql, 'categoria_licencia').map((c) => c.codigo)
  for (const c of codigos) assert.notEqual(infoCategoria(c).grupo, 'desconocido', c)
  assert.match(infoCategoria('A.1').titulo, /sin subclase/)
})
