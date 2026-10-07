// Lector del seed compartido (database/seed/001_datos_demo.sql).
// Lo usan RRHH, Mantenimiento y la ficha de vehículo de la pantalla principal.
// Movido desde modulos/rrhh/leerSeed.js para no depender de un módulo puntual.

// Fecha local de hoy (AAAA-MM-DD): referencia de las fechas relativas del seed.
export function hoy() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

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
