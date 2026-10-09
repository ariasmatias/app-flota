// Datos PROVISORIOS del vehículo mientras no exista la migración 002.
//
// El documento de Mariano "Flota: campos para el diseño de pantallas" (v1.0,
// 08/10/2026) y las respuestas del 08/10 suman al vehículo: año, chasis, motor,
// clase de flota (operativa / ejecutiva), fecha de alta, fecha y motivo de baja,
// gerencia propia y varias jefaturas con historial. El esquema v1.0 y el seed
// todavía no tienen esas columnas ni tablas, así que acá se completan con
// valores FICTICIOS para que las pantallas se puedan probar.
//
// Cuando la migración 002 esté aprobada (guía de base v1.2), esto se borra y
// los datos salen del seed / la API con los mismos nombres de campo.
//
// Cambios de modelo que ya aplica:
//  - La baja deja de ser un estado: es vehiculo.fecha_baja + motivo_baja.
//    vehiculo_estado queda solo con 'activo' y 'taller'.
//  - La gerencia se guarda junto al centro de costo (vehiculo_finanzas.gerencia_id).
//    Se propone la del centro de costo, pero puede ser otra.
//  - Jefaturas: catálogo por gerencia y tabla vehiculo_jefatura (varias por vehículo).

export const CLASES_FLOTA = [
  { valor: 'operativa', etiqueta: 'Operativa' },
  { valor: 'ejecutiva', etiqueta: 'Ejecutiva' },
]

export const MOTIVOS_BAJA = ['Venta', 'Siniestro', 'Fin de vida útil', 'Otro']

// Valores ficticios por id de vehículo del seed (año, clase).
const ANIO = { 1: 2019, 2: 2018, 3: 2021, 4: 2017, 5: 2012, 6: 2020, 7: 2020, 8: 2021, 9: 2019, 10: 2018, 11: 2019, 12: 2022, 13: 2016, 14: 2022, 15: 2021, 16: 2025, 17: 2015, 18: 2023, 19: 2016, 20: 2026 }
const EJECUTIVOS = new Set([14, 18, 19])

// Gerencias que no salen de ningún centro de costo de ejemplo.
const GERENCIAS_EXTRA = ['Gerencia General']

// Jefaturas de ejemplo por gerencia (nombres inventados).
const JEFATURAS = {
  Operaciones: ['Cuadrilla Norte (ejemplo)', 'Cuadrilla Sur (ejemplo)', 'Seguridad Vial Tramo 1 (ejemplo)'],
  Mantenimiento: ['Taller Mecánico (ejemplo)', 'Mantenimiento Eléctrico (ejemplo)'],
  'Administración y Finanzas': ['Administración (ejemplo)'],
  Comercial: ['Atención al Usuario (ejemplo)'],
  'Recursos Humanos': ['Servicios Generales (ejemplo)'],
  Legales: ['Asuntos Legales (ejemplo)'],
  'Gerencia General': ['Presidencia (ejemplo)'],
}

// Jefaturas por vehículo: [vehiculo_id, nombre de jefatura]. AA003ZZ tiene dos.
const JEFATURA_DE = [
  [1, 'Administración (ejemplo)'], [2, 'Taller Mecánico (ejemplo)'], [3, 'Taller Mecánico (ejemplo)'], [3, 'Mantenimiento Eléctrico (ejemplo)'],
  [4, 'Taller Mecánico (ejemplo)'], [5, 'Cuadrilla Norte (ejemplo)'], [6, 'Cuadrilla Norte (ejemplo)'], [7, 'Cuadrilla Sur (ejemplo)'],
  [8, 'Seguridad Vial Tramo 1 (ejemplo)'], [9, 'Seguridad Vial Tramo 1 (ejemplo)'], [10, 'Mantenimiento Eléctrico (ejemplo)'],
  [11, 'Atención al Usuario (ejemplo)'], [12, 'Cuadrilla Sur (ejemplo)'], [13, 'Cuadrilla Norte (ejemplo)'], [14, 'Presidencia (ejemplo)'],
  [15, 'Cuadrilla Sur (ejemplo)'], [16, 'Atención al Usuario (ejemplo)'], [17, 'Taller Mecánico (ejemplo)'], [18, 'Servicios Generales (ejemplo)'],
  // AA020ZZ (0 km) todavía sin jefatura: caso de prueba.
]

// Vehículo con gerencia distinta a la de su centro de costo (puede pasar, no es error).
const GERENCIA_DISTINTA = { 14: 'Gerencia General' }

// Motivos de baja del seed (texto libre) → lista oficial.
function motivoOficial(texto = '') {
  const t = texto.toLowerCase()
  if (t.includes('vida útil')) return { motivo_baja: 'Fin de vida útil', nota_baja: null }
  if (t.includes('venta')) return { motivo_baja: 'Venta', nota_baja: null }
  if (t.includes('siniestro')) return { motivo_baja: 'Siniestro', nota_baja: null }
  return { motivo_baja: 'Otro', nota_baja: texto.replace(/\s*\(ejemplo\)\s*/i, '').trim() || null }
}

const pad = (n, largo) => String(n).padStart(largo, '0')
const cerrarEn = (fila, fecha) => (!fila.vigente_hasta || fila.vigente_hasta > fecha ? { ...fila, vigente_hasta: fecha } : fila)

// Recibe las tablas del seed y devuelve las mismas completadas + catálogos nuevos.
export function completarFlota({ vehiculos, estados, finanzas, centros }) {
  // Catálogo de gerencias: las de los centros de costo + extras.
  const nombresGerencia = [...new Set([...centros.map((c) => c.gerencia), ...GERENCIAS_EXTRA])]
  const gerencias = nombresGerencia.map((nombre, i) => ({ id: i + 1, nombre, activo: true }))
  const gerenciaId = (nombre) => gerencias.find((g) => g.nombre === nombre)?.id ?? null
  const centrosConGerencia = centros.map((c) => ({ ...c, gerencia_id: gerenciaId(c.gerencia) }))

  let idJ = 0
  const jefaturas = Object.entries(JEFATURAS).flatMap(([gerencia, nombres]) =>
    nombres.map((nombre) => ({ id: ++idJ, nombre, gerencia_id: gerenciaId(gerencia), activo: true })))

  // Baja: sale de vehiculo_estado y pasa al vehículo.
  const bajas = new Map(estados.filter((e) => e.estado === 'baja').map((e) => [e.vehiculo_id, e]))
  const estadosSinBaja = estados.filter((e) => e.estado !== 'baja')

  const vehiculosCompletos = vehiculos.map((v) => {
    const desde = estados.filter((e) => e.vehiculo_id === v.id).map((e) => e.vigente_desde).sort()[0] ?? null
    const baja = bajas.get(v.id)
    return {
      ...v,
      anio: v.anio ?? ANIO[v.id] ?? null,
      // AA019ZZ repite el chasis y motor de AA005ZZ (los dos de baja): caso de prueba del error de carga.
      nro_chasis: v.nro_chasis ?? `DEMOCHASIS${pad(v.id === 19 ? 5 : v.id, 7)}`,
      nro_motor: v.nro_motor ?? `DEMO-MOT-${pad(v.id === 19 ? 5 : v.id, 4)}`,
      clase_flota: v.clase_flota ?? (EJECUTIVOS.has(v.id) ? 'ejecutiva' : 'operativa'),
      fecha_alta: v.fecha_alta ?? desde,
      fecha_baja: v.fecha_baja ?? baja?.vigente_desde ?? null,
      ...(baja ? motivoOficial(baja.motivo) : { motivo_baja: v.motivo_baja ?? null, nota_baja: v.nota_baja ?? null }),
    }
  })
  const fechaBaja = (id) => vehiculosCompletos.find((v) => v.id === id)?.fecha_baja

  // Centro de costo + gerencia (lo que no se cerró al dar de baja, se cierra en la fecha de baja).
  const finanzasCompletas = finanzas.map((f) => {
    const cc = centrosConGerencia.find((c) => c.id === f.centro_costo_id)
    const fila = { ...f, gerencia_id: f.gerencia_id ?? gerenciaId(GERENCIA_DISTINTA[f.vehiculo_id]) ?? cc?.gerencia_id ?? null }
    return fechaBaja(f.vehiculo_id) ? cerrarEn(fila, fechaBaja(f.vehiculo_id)) : fila
  })

  const vehiculoJefaturas = JEFATURA_DE.flatMap(([vehiculo_id, nombre], i) => {
    const v = vehiculosCompletos.find((x) => x.id === vehiculo_id)
    const j = jefaturas.find((x) => x.nombre === nombre)
    if (!v || !j) return []
    const fila = { id: i + 1, vehiculo_id, jefatura_id: j.id, vigente_desde: v.fecha_alta, vigente_hasta: null }
    return [v.fecha_baja ? cerrarEn(fila, v.fecha_baja) : fila]
  })

  return {
    vehiculos: vehiculosCompletos,
    estados: estadosSinBaja,
    finanzas: finanzasCompletas,
    centros: centrosConGerencia,
    gerencias,
    jefaturas,
    vehiculoJefaturas,
  }
}
