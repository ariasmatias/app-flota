import test from 'node:test'
import assert from 'node:assert/strict'
import { vigenteEn, renovarLicencia, gestionarMulta, contextoMulta, hoy, estadoLicencia, gestionesDePersona, esAviso } from './dominio.js'
import { readFileSync } from 'node:fs'
import { datosDesdeSeed } from './leerSeed.js'
const seed = readFileSync(new URL('../../../../database/seed/001_datos_demo.sql', import.meta.url), 'utf8')
const datosIniciales = () => datosDesdeSeed(seed)

test('renovar conserva categorías y documento anteriores, sin superposición al cierre', () => {
  const originales = [{ id: 1, persona_id: 1, nro_registro: 'ANTERIOR', categorias: ['B.1'], vigente_desde: '2025-01-01', vigente_hasta: null, documento: { nombre: 'anterior.pdf' } }]
  const nueva = { persona_id: 1, nro_registro: 'NUEVA', categorias: ['B.1', 'C.1'], vigente_desde: '2026-01-01', vencimiento: '2027-01-01', documento: { nombre: 'nueva.pdf' } }
  const resultado = renovarLicencia(originales, nueva, '2026-10-02')
  assert.equal(originales[0].vigente_hasta, null)
  assert.equal(resultado[0].documento.nombre, 'anterior.pdf')
  assert.equal(resultado.filter(l => vigenteEn(l, '2026-01-01')).length, 1)
  assert.equal(resultado.find(l => vigenteEn(l, '2025-12-31')).nro_registro, 'ANTERIOR')
  assert.deepEqual(resultado[1].categorias, ['B.1', 'C.1'])
  assert.throws(() => renovarLicencia(resultado, nueva, '2026-10-02'), /posterior/)
  assert.throws(() => renovarLicencia([], { ...nueva, categorias: [] }), /categorías/)
  assert.throws(() => renovarLicencia([], { ...nueva, vencimiento: '2025-01-01' }), /vencimiento/)
})
test('multas consultan asignaciones y centro de costo a la fecha de infracción', () => {
  const datos = datosIniciales()
  const contexto = contextoMulta(datos, datos.multas[0])
  assert.equal(contexto.centro, 'Operaciones (ejemplo)')
  assert.deepEqual(contexto.conductores.map(p => p.id), [1, 2])
  assert.throws(() => gestionarMulta(datos, 1, { responsable_id: 3 }), /asignado/)
  assert.throws(() => gestionarMulta(datos, 1, { responsable_id: 1, estado_pago: 'pagada' }), /fecha de pago/)
  const nuevas = gestionarMulta(datos, 1, { responsable_id: 1, estado_pago: 'pagada', fecha_pago: hoy() })
  assert.equal(nuevas[0].responsable_id, 1)
  assert.equal(datos.multas[0].responsable_id, null)
  assert.equal(gestionarMulta({ ...datos, multas: nuevas }, 1, { estado_pago: 'pendiente' })[0].fecha_pago, null)
})
test('la licencia vence después de la fecha indicada, no al inicio de ese día', () => {
  assert.equal(estadoLicencia({ vencimiento: '2026-10-02' }, '2026-10-02'), 'Por vencer')
  assert.equal(estadoLicencia({ vencimiento: '2026-10-01' }, '2026-10-02'), 'Vencida')
})

test('cada informe de multa lleva estado de gestión y suma avisos a la persona', () => {
  const datos = datosDesdeSeed(seed)
  const m = datos.multas.find(x => x.nro_acta === 'ACTA-DEMO-002') // AA002ZZ, responsable Costa (3)
  const informe = estado => ({ nombre: 'aviso.pdf', hash: 'x', estado_gestion: estado, fecha: hoy(), responsable_id: 3 })
  assert.throws(() => gestionarMulta(datos, m.id, { documentos: [...m.documentos, { nombre: 'sin-estado.pdf' }] }), /estado de gestión/)
  let multas = gestionarMulta(datos, m.id, { documentos: [...m.documentos, informe('Primer aviso')] })
  let d2 = { ...datos, multas }
  const m2 = multas.find(x => x.id === m.id)
  multas = gestionarMulta(d2, m.id, { documentos: [...m2.documentos, informe('Descargo del conductor')] })
  d2 = { ...datos, multas }
  const gestiones = gestionesDePersona(d2, 3)
  assert.equal(gestiones.length, 2)
  assert.equal(gestiones.filter(g => esAviso(g.estado_gestion)).length, 1)
  assert.equal(gestionesDePersona(d2, 1).length, 0)
})
