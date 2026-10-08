// Reglas de negocio de Mantenimiento (funciones puras, sin React ni red).
// Usan los mismos nombres de tablas y columnas que el esquema de base v1.0
// (AUBASA_Esquema_Base_Datos_Jorge.pdf), para que la API las adopte sin renombrar.
//
// Convenciones (Guía de Desarrollo §3):
//  - Períodos [vigente_desde, vigente_hasta): el cierre es exclusivo, igual que en RRHH.
//  - Nunca se pisa una fila vigente: se cierra y se abre otra.
//  - Nada se borra: se anula o se cierra con fecha y motivo.
//
// Excepción: en poliza y vtv, vigente_hasta es la fecha de vencimiento del
// documento (puede ser futura). Se interpreta como último día cubierto.

import { habilita } from '../../core/config/categoriasLicencia.js'

// ───────────── Fechas ─────────────

export function hoy() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function sumarDias(fecha, dias) {
  const d = new Date(`${fecha}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + dias)
  return d.toISOString().slice(0, 10)
}

export function diasHasta(fecha, referencia = hoy()) {
  return Math.round((Date.parse(`${fecha}T12:00:00Z`) - Date.parse(`${referencia}T12:00:00Z`)) / 86400000)
}

// Período histórico [desde, hasta)
export function vigenteEn(periodo, fecha) {
  return periodo.vigente_desde <= fecha && (!periodo.vigente_hasta || fecha < periodo.vigente_hasta)
}

// Documento con vencimiento (póliza, VTV): cubre hasta el último día inclusive.
export function cubiertoEn(documento, fecha) {
  return documento.vigente_desde <= fecha && (!documento.vigente_hasta || fecha <= documento.vigente_hasta)
}

// 'Vigente' | 'Por vencer' | 'Vencida' | 'Sin dato'
export function estadoVencimiento(fechaVencimiento, referencia = hoy(), aviso = 30) {
  if (!fechaVencimiento) return 'Sin dato'
  const dias = diasHasta(fechaVencimiento, referencia)
  return dias < 0 ? 'Vencida' : dias <= aviso ? 'Por vencer' : 'Vigente'
}

function siguienteId(lista) {
  return Math.max(0, ...lista.map((x) => x.id)) + 1
}

function exigirFechaPasada(fecha, campo = 'La fecha') {
  if (!fecha) throw new Error(`${campo} es obligatoria.`)
  if (fecha > hoy()) throw new Error(`${campo} no puede ser futura.`)
}

// ───────────── Vehículos (M-01, M-02) ─────────────

// Dominio argentino: formato viejo AAA123 o Mercosur AA123AA.
const FORMATO_DOMINIO = /^([A-Z]{3}\d{3}|[A-Z]{2}\d{3}[A-Z]{2})$/

export function normalizarDominio(dominio = '') {
  return dominio.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

export function validarDominio(dominio, vehiculos, idPropio = null) {
  const normal = normalizarDominio(dominio)
  if (!FORMATO_DOMINIO.test(normal)) throw new Error('Dominio inválido. Formato AAA123 o AA123AA.')
  if (vehiculos.some((v) => v.dominio === normal && v.id !== idPropio)) {
    throw new Error(`El dominio ${normal} ya está registrado.`)
  }
  return normal
}

export function estadoVehiculoEn(datos, vehiculoId, fecha = hoy()) {
  return datos.estadosVehiculo.find((e) => e.vehiculo_id === vehiculoId && vigenteEn(e, fecha))?.estado ?? null
}

export function altaVehiculo(datos, nuevo) {
  const dominio = validarDominio(nuevo.dominio, datos.vehiculos)
  if (!nuevo.marca?.trim() || !nuevo.modelo?.trim()) throw new Error('Completá marca y modelo.')
  exigirFechaPasada(nuevo.vigente_desde, 'La fecha de alta')
  const id = siguienteId(datos.vehiculos)
  const vehiculo = {
    id,
    dominio,
    marca: nuevo.marca.trim(),
    modelo: nuevo.modelo.trim(),
    categoria_requerida_id: nuevo.categoria_requerida_id || null,
  }
  const estado = {
    id: siguienteId(datos.estadosVehiculo),
    vehiculo_id: id,
    estado: 'activo',
    motivo: 'Alta del vehículo',
    vigente_desde: nuevo.vigente_desde,
    vigente_hasta: null,
  }
  return { ...datos, vehiculos: [...datos.vehiculos, vehiculo], estadosVehiculo: [...datos.estadosVehiculo, estado] }
}

// Corrección de datos (incluido el dominio). Las referencias usan el id interno,
// así que corregir el dominio no rompe asignaciones, pólizas ni multas.
export function corregirVehiculo(datos, id, cambios) {
  const actual = datos.vehiculos.find((v) => v.id === id)
  if (!actual) throw new Error('Vehículo inexistente.')
  const dominio = validarDominio(cambios.dominio ?? actual.dominio, datos.vehiculos, id)
  const siguiente = {
    ...actual,
    ...cambios,
    dominio,
    marca: (cambios.marca ?? actual.marca).trim(),
    modelo: (cambios.modelo ?? actual.modelo).trim(),
  }
  if (!siguiente.marca || !siguiente.modelo) throw new Error('Completá marca y modelo.')
  return { anterior: actual, nuevo: siguiente, datos: { ...datos, vehiculos: datos.vehiculos.map((v) => (v.id === id ? siguiente : v)) } }
}

export const ESTADOS_VEHICULO = ['activo', 'taller', 'baja']

export function cambiarEstadoVehiculo(datos, vehiculoId, { estado, motivo, vigente_desde }) {
  if (!ESTADOS_VEHICULO.includes(estado)) throw new Error('Estado inválido.')
  exigirFechaPasada(vigente_desde, 'La fecha del cambio')
  const vigente = datos.estadosVehiculo.find((e) => e.vehiculo_id === vehiculoId && !e.vigente_hasta)
  if (vigente?.estado === estado) throw new Error(`El vehículo ya está en estado ${estado}.`)
  if (vigente && vigente_desde <= vigente.vigente_desde) {
    throw new Error('La fecha debe ser posterior al inicio del estado actual.')
  }
  if (estado !== 'activo' && !motivo?.trim()) throw new Error('Indicá el motivo del cambio.')
  if (estado === 'baja' && datos.asignaciones.some((a) => a.vehiculo_id === vehiculoId && !a.vigente_hasta)) {
    throw new Error('Cerrá primero las asignaciones vigentes del vehículo.')
  }
  const estadosVehiculo = datos.estadosVehiculo
    .map((e) => (e === vigente ? { ...e, vigente_hasta: vigente_desde } : e))
    .concat({
      id: siguienteId(datos.estadosVehiculo),
      vehiculo_id: vehiculoId,
      estado,
      motivo: motivo?.trim() || null,
      vigente_desde,
      vigente_hasta: null,
    })
  return { ...datos, estadosVehiculo }
}

// ───────────── Asignaciones (M-06, M-07) ─────────────

// Devuelve la lista de controles que se muestran en pantalla antes de guardar.
export function validarAsignacion(datos, { persona_id, vehiculo_id, vigente_desde }) {
  const vehiculo = datos.vehiculos.find((v) => v.id === vehiculo_id)
  const persona = datos.personas.find((p) => p.id === persona_id)
  const fecha = vigente_desde
  const licencia = datos.licencias.find((l) => l.persona_id === persona_id && vigenteEn(l, fecha))
  const autorizacion = datos.autorizaciones.find((a) => a.persona_id === persona_id && vigenteEn(a, fecha))
  const estadoPersona = datos.estadosPersona.find((e) => e.persona_id === persona_id && vigenteEn(e, fecha))?.estado
  const estadoAuto = vehiculo ? estadoVehiculoEn(datos, vehiculo.id, fecha) : null
  const categoria = datos.categorias.find((c) => c.id === vehiculo?.categoria_requerida_id)?.codigo
  // Una licencia incluye otra categoría solo si la normativa lo dice (ver core/config/categoriasLicencia.js).
  const cat = habilita(licencia?.categorias ?? [], categoria)
  // Evita cargar dos veces la misma persona en el mismo vehículo con fechas que se pisan.
  const repetida = datos.asignaciones.find(
    (a) => a.persona_id === persona_id && a.vehiculo_id === vehiculo_id && (!a.vigente_hasta || a.vigente_hasta > fecha),
  )

  return [
    { id: 'datos', ok: Boolean(persona && vehiculo && fecha), texto: 'Persona, vehículo y fecha elegidos' },
    { id: 'persona', ok: estadoPersona === 'alta', texto: 'La persona está de alta en esa fecha' },
    { id: 'vehiculo', ok: Boolean(estadoAuto) && estadoAuto !== 'baja', texto: 'El vehículo no está dado de baja' },
    {
      id: 'licencia',
      ok: Boolean(licencia) && licencia.vencimiento >= fecha,
      texto: licencia ? `Licencia vigente (vence ${licencia.vencimiento.split('-').reverse().join('/')})` : 'Licencia vigente',
    },
    {
      id: 'categoria',
      ok: !categoria || cat.ok,
      texto: !categoria
        ? 'El vehículo no exige categoría'
        : cat.ok && !cat.directa
          ? `La licencia habilita ${categoria} (la incluye ${cat.via})`
          : `La licencia habilita la categoría ${categoria}`,
    },
    { id: 'autorizacion', ok: autorizacion?.revision === 'si', texto: 'Autorización para conducir en "sí"' },
    {
      id: 'superposicion',
      ok: !repetida,
      texto: repetida
        ? `Ya tiene este vehículo asignado desde el ${repetida.vigente_desde.split('-').reverse().join('/')}`
        : 'No tiene ya este vehículo asignado en esas fechas',
    },
  ]
}

export function asignar(datos, nueva) {
  exigirFechaPasada(nueva.vigente_desde, 'La fecha de inicio')
  const fallas = validarAsignacion(datos, nueva).filter((c) => !c.ok)
  if (fallas.length) throw new Error(`No se puede asignar. Falta cumplir: ${fallas.map((f) => f.texto).join(' · ')}.`)
  const asignacion = {
    id: siguienteId(datos.asignaciones),
    persona_id: nueva.persona_id,
    vehiculo_id: nueva.vehiculo_id,
    motivo: nueva.motivo?.trim() || null,
    vigente_desde: nueva.vigente_desde,
    vigente_hasta: null,
  }
  return { ...datos, asignaciones: [...datos.asignaciones, asignacion] }
}

// Problemas de una asignación YA vigente (por ejemplo, la licencia venció después
// de asignar). No la cierra sola: Mantenimiento decide.
// Asigna VARIOS vehículos a una misma persona de una vez. Todo o nada: si
// alguno no cumple las reglas, no se guarda ninguno (y se dice cuál falla).
export function asignarVarios(datos, { persona_id, vehiculo_ids, vigente_desde, motivo }) {
  const ids = [...new Set((vehiculo_ids ?? []).map(Number))]
  if (!ids.length) throw new Error('Elegí al menos un vehículo.')
  return ids.reduce((acc, vehiculo_id) => {
    try {
      return asignar(acc, { persona_id, vehiculo_id, vigente_desde, motivo })
    } catch (e) {
      const dom = datos.vehiculos.find((v) => v.id === vehiculo_id)?.dominio ?? vehiculo_id
      throw new Error(`${dom}: ${e.message}`)
    }
  }, datos)
}

export function problemasDeAsignacion(datos, asignacion, fecha = hoy()) {
  const licencia = datos.licencias.find((l) => l.persona_id === asignacion.persona_id && vigenteEn(l, fecha))
  const autorizacion = datos.autorizaciones.find((a) => a.persona_id === asignacion.persona_id && vigenteEn(a, fecha))
  const estadoPersona = datos.estadosPersona.find((e) => e.persona_id === asignacion.persona_id && vigenteEn(e, fecha))?.estado
  const problemas = []
  if (estadoPersona !== 'alta') problemas.push('Persona de baja')
  if (!licencia || licencia.vencimiento < fecha) problemas.push('Licencia vencida')
  if (autorizacion?.revision !== 'si') problemas.push('Autorización no aprobada')
  return problemas
}

// Cierra UNA asignación puntual. No toca ninguna otra.
export function cerrarAsignacion(datos, id, { vigente_hasta, motivo }) {
  const actual = datos.asignaciones.find((a) => a.id === id)
  if (!actual) throw new Error('Asignación inexistente.')
  if (actual.vigente_hasta) throw new Error('La asignación ya está cerrada.')
  exigirFechaPasada(vigente_hasta, 'La fecha de cierre')
  if (vigente_hasta <= actual.vigente_desde) throw new Error('El cierre debe ser posterior al inicio.')
  if (!motivo?.trim()) throw new Error('Indicá el motivo del cierre.')
  return {
    ...datos,
    asignaciones: datos.asignaciones.map((a) =>
      a.id === id ? { ...a, vigente_hasta, motivo: [a.motivo, `Cierre: ${motivo.trim()}`].filter(Boolean).join(' · ') } : a,
    ),
  }
}

// ───────────── Pólizas (M-03) ─────────────

export function crearPoliza(datos, { nro_poliza, aseguradora, vigente_desde, vigente_hasta, vehiculos = [] }) {
  if (!nro_poliza?.trim() || !aseguradora?.trim()) throw new Error('Completá número de póliza y aseguradora.')
  if (!vigente_desde || !vigente_hasta || vigente_hasta < vigente_desde) {
    throw new Error('El vencimiento debe ser igual o posterior al inicio.')
  }
  if (!vehiculos.length) throw new Error('Elegí al menos un vehículo.')
  const id = siguienteId(datos.polizas)
  let polizasVehiculo = datos.polizasVehiculo
  for (const vehiculo_id of vehiculos) {
    polizasVehiculo = [
      ...polizasVehiculo,
      { id: siguienteId(polizasVehiculo), poliza_id: id, vehiculo_id, vigente_desde, vigente_hasta: null },
    ]
  }
  return {
    ...datos,
    polizas: [...datos.polizas, { id, nro_poliza: nro_poliza.trim(), aseguradora: aseguradora.trim(), vigente_desde, vigente_hasta }],
    polizasVehiculo,
  }
}

export function vehiculosDePoliza(datos, polizaId, fecha = hoy()) {
  return datos.polizasVehiculo.filter((pv) => pv.poliza_id === polizaId && vigenteEn(pv, fecha))
}

export function agregarVehiculoAPoliza(datos, polizaId, vehiculoId, desde) {
  exigirFechaPasada(desde, 'La fecha de incorporación')
  const poliza = datos.polizas.find((p) => p.id === polizaId)
  if (!poliza) throw new Error('Póliza inexistente.')
  if (!cubiertoEn(poliza, desde)) throw new Error('La póliza no está vigente en esa fecha.')
  if (datos.polizasVehiculo.some((pv) => pv.poliza_id === polizaId && pv.vehiculo_id === vehiculoId && !pv.vigente_hasta)) {
    throw new Error('El vehículo ya está cubierto por esta póliza.')
  }
  const fila = { id: siguienteId(datos.polizasVehiculo), poliza_id: polizaId, vehiculo_id: vehiculoId, vigente_desde: desde, vigente_hasta: null }
  return { ...datos, polizasVehiculo: [...datos.polizasVehiculo, fila] }
}

// Retirar conserva el período: se cierra la fila, no se borra.
export function retirarVehiculoDePoliza(datos, polizaVehiculoId, hasta) {
  const fila = datos.polizasVehiculo.find((pv) => pv.id === polizaVehiculoId)
  if (!fila || fila.vigente_hasta) throw new Error('El vehículo no está cubierto actualmente.')
  exigirFechaPasada(hasta, 'La fecha de retiro')
  if (hasta <= fila.vigente_desde) throw new Error('El retiro debe ser posterior a la incorporación.')
  return { ...datos, polizasVehiculo: datos.polizasVehiculo.map((pv) => (pv.id === polizaVehiculoId ? { ...pv, vigente_hasta: hasta } : pv)) }
}

// Renovar: crea la póliza nueva con los mismos vehículos y cierra la cobertura
// de esos vehículos en la anterior. La póliza anterior queda como historial.
export function renovarPoliza(datos, polizaId, nueva) {
  const anterior = datos.polizas.find((p) => p.id === polizaId)
  if (!anterior) throw new Error('Póliza inexistente.')
  if (nueva.vigente_desde <= anterior.vigente_desde) throw new Error('La renovación debe empezar después de la póliza anterior.')
  const cubiertos = datos.polizasVehiculo.filter((pv) => pv.poliza_id === polizaId && !pv.vigente_hasta)
  const conNueva = crearPoliza(datos, { ...nueva, vehiculos: cubiertos.map((pv) => pv.vehiculo_id) })
  const ids = new Set(cubiertos.map((pv) => pv.id))
  return {
    ...conNueva,
    polizasVehiculo: conNueva.polizasVehiculo.map((pv) => (ids.has(pv.id) ? { ...pv, vigente_hasta: nueva.vigente_desde } : pv)),
  }
}

export function polizaDeVehiculoEn(datos, vehiculoId, fecha = hoy()) {
  const fila = datos.polizasVehiculo.find((pv) => pv.vehiculo_id === vehiculoId && vigenteEn(pv, fecha))
  const poliza = fila && datos.polizas.find((p) => p.id === fila.poliza_id)
  return poliza && cubiertoEn(poliza, fecha) ? poliza : null
}

// ───────────── VTV (consulta; la carga es M-04) ─────────────

export function vtvDeVehiculoEn(datos, vehiculoId, fecha = hoy()) {
  return (
    datos.vtv
      .filter((v) => v.vehiculo_id === vehiculoId && v.vigente_desde <= fecha)
      .sort((a, b) => b.vigente_desde.localeCompare(a.vigente_desde))[0] ?? null
  )
}

// ───────────── Autorizaciones (M-08) ─────────────

export function revisarAutorizacion(datos, id, { revision, observacion }, usuario) {
  const actual = datos.autorizaciones.find((a) => a.id === id)
  if (!actual) throw new Error('Autorización inexistente.')
  if (!['pendiente', 'si', 'no'].includes(revision)) throw new Error('Resultado de revisión inválido.')
  if (revision === 'no' && !observacion?.trim()) throw new Error('Explicá el motivo del rechazo en la observación.')
  const siguiente = {
    ...actual,
    revision,
    observacion: observacion?.trim() || null,
    revisado_por: usuario.id,
    revisado_fecha: hoy(),
  }
  return { anterior: actual, nuevo: siguiente, datos: { ...datos, autorizaciones: datos.autorizaciones.map((a) => (a.id === id ? siguiente : a)) } }
}

// ───────────── Ficha del vehículo en una fecha (M-09) ─────────────

export function fichaVehiculoEn(datos, vehiculoId, fecha = hoy()) {
  const vehiculo = datos.vehiculos.find((v) => v.id === vehiculoId)
  const conductores = datos.asignaciones
    .filter((a) => a.vehiculo_id === vehiculoId && vigenteEn(a, fecha))
    .map((a) => ({ asignacion: a, persona: datos.personas.find((p) => p.id === a.persona_id) }))
  return {
    vehiculo,
    estado: estadoVehiculoEn(datos, vehiculoId, fecha),
    conductores,
    poliza: polizaDeVehiculoEn(datos, vehiculoId, fecha),
    vtv: vtvDeVehiculoEn(datos, vehiculoId, fecha),
    centroCosto: datos.centrosCosto.find((c) => c.vehiculo_id === vehiculoId && vigenteEn(c, fecha)) ?? null,
  }
}
