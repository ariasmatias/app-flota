import { hoy, vigenteEn } from './dominio.js'

// Lee únicamente los INSERT VALUES estáticos del seed de prueba versionado.
// No ejecuta SQL ni evalúa código. Ante un formato nuevo falla explícitamente.
export function separarValores(texto) {
  const partes = []
  let inicio = 0, nivel = 0, comillas = false
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i]
    if (c === "'") {
      if (comillas && texto[i + 1] === "'") { i++; continue }
      comillas = !comillas
    } else if (!comillas) {
      if (c === '(') nivel++
      if (c === ')') nivel--
      if (c === ',' && nivel === 0) { partes.push(texto.slice(inicio, i).trim()); inicio = i + 1 }
    }
  }
  if (comillas || nivel !== 0) throw new Error('Formato de seed no soportado: valores incompletos.')
  partes.push(texto.slice(inicio).trim())
  return partes
}

function valorSql(valor, referencia) {
  if (/^NULL$/i.test(valor)) return null
  if (/^(true|false)$/i.test(valor)) return valor.toLowerCase() === 'true'
  if (/^-?\d+$/.test(valor)) return Number(valor)
  if (/^'(?:[^']|'')*'$/.test(valor)) return valor.slice(1, -1).replaceAll("''", "'")
  const dias = valor.match(/^CURRENT_DATE(?:\s*([+-])\s*(\d+))?$/i)
  if (dias) {
    const fecha = new Date(`${referencia}T12:00:00Z`)
    fecha.setUTCDate(fecha.getUTCDate() + Number(dias[2] ?? 0) * (dias[1] === '-' ? -1 : 1))
    return fecha.toISOString().slice(0, 10)
  }
  throw new Error(`Formato de seed no soportado: ${valor}`)
}

export function leerTabla(sql, tabla, referencia = hoy(), ignorar = ['creado', 'sha256']) {
  const match = sql.match(new RegExp(`INSERT INTO ${tabla} \\(([^)]+)\\) VALUES\\s*([\\s\\S]*?);`, 'i'))
  if (!match) throw new Error(`Falta la tabla ${tabla} en el seed de prueba.`)
  const columnas = match[1].split(',').map(c => c.trim())
  return separarValores(match[2]).map(tupla => {
    if (!tupla.startsWith('(') || !tupla.endsWith(')')) throw new Error(`INSERT inválido: ${tabla}`)
    const valores = separarValores(tupla.slice(1, -1))
    if (valores.length !== columnas.length) throw new Error(`Columnas incompatibles: ${tabla}`)
    return Object.fromEntries(columnas.flatMap((c, i) => ignorar.includes(c) ? [] : [[c, valorSql(valores[i], referencia)]]))
  })
}

export function datosDesdeSeed(sql, referencia = hoy()) {
  const tabla = nombre => leerTabla(sql, nombre, referencia)
  const categorias = tabla('categoria_licencia')
  const relacionCategorias = tabla('licencia_categoria')
  const catalogoCentros = tabla('centro_costo')
  const documentos = tabla('documento')
  const versiones = tabla('documento_version')
  const vinculos = tabla('documento_vinculo')
  function documentosDe(tipo, id, fecha) {
    return vinculos.filter(v => v.entidad_tipo === tipo && v.entidad_id === id).flatMap(v => {
      if (!documentos.some(d => d.id === v.documento_id && d.estado === 'vigente')) return []
      return versiones.filter(d => d.documento_id === v.documento_id && vigenteEn(d, fecha)).map(d => ({ nombre: d.nombre_original, ejemplo: true, id: d.id, documento_id: d.documento_id, vigente_desde: d.vigente_desde, vigente_hasta: d.vigente_hasta }))
    })
  }
  return {
    personas: tabla('persona'),
    estados: tabla('persona_estado'),
    categorias,
    licencias: tabla('licencia').map(l => ({ ...l,
      categorias: relacionCategorias.filter(c => c.licencia_id === l.id).map(c => categorias.find(x => x.id === c.categoria_id).codigo),
      documento: documentosDe('licencia', l.id, referencia)[0] ?? null,
      documentos_versiones: vinculos.filter(v => v.entidad_tipo === 'licencia' && v.entidad_id === l.id && documentos.some(d => d.id === v.documento_id && d.estado === 'vigente')).flatMap(v => versiones.filter(d => d.documento_id === v.documento_id).map(d => ({ nombre: d.nombre_original, ejemplo: true, vigente_desde: d.vigente_desde, vigente_hasta: d.vigente_hasta }))),
    })),
    autorizaciones: tabla('autorizacion_conducir'),
    vehiculos: tabla('vehiculo'),
    asignaciones: tabla('asignacion'),
    centros: tabla('vehiculo_finanzas').map(c => ({ ...c, nombre: catalogoCentros.find(x => x.id === c.centro_costo_id).nombre })),
    multas: tabla('multa').map(m => ({ ...m, documentos: documentosDe('multa', m.id, referencia) })),
    auditoria: [],
  }
}
