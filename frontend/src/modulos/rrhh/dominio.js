// Períodos [desde, hasta): el cierre pertenece a la versión siguiente.
export function vigenteEn(periodo, fecha) {
  return periodo.vigente_desde <= fecha && (!periodo.vigente_hasta || fecha < periodo.vigente_hasta)
}

export function hoy() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function diasHasta(fecha, referencia = hoy()) {
  return Math.round((Date.parse(`${fecha}T12:00:00Z`) - Date.parse(`${referencia}T12:00:00Z`)) / 86400000)
}

export function estadoLicencia(licencia, fecha = hoy()) {
  if (!licencia) return 'Sin licencia'
  const dias = diasHasta(licencia.vencimiento, fecha)
  return dias < 0 ? 'Vencida' : dias <= 60 ? 'Por vencer' : 'Vigente'
}

export function renovarLicencia(licencias, nueva, fechaActual = hoy()) {
  if (!nueva.nro_registro.trim() || !nueva.categorias.length || !nueva.documento) throw new Error('Completá registro, categorías y documento.')
  if (!nueva.vigente_desde || !nueva.vencimiento || nueva.vencimiento < nueva.vigente_desde) throw new Error('El vencimiento debe ser igual o posterior al inicio de vigencia.')
  if (nueva.vigente_desde > fechaActual) throw new Error('La vigencia no puede comenzar en el futuro.')
  const propias = licencias.filter(l => l.persona_id === nueva.persona_id)
  if (propias.some(l => l.vigente_desde >= nueva.vigente_desde)) throw new Error('La nueva vigencia debe ser posterior a todas las versiones existentes.')
  return [...licencias.map(l => l.persona_id === nueva.persona_id && !l.vigente_hasta ? { ...l, vigente_hasta: nueva.vigente_desde } : l), { ...nueva, nro_registro: nueva.nro_registro.trim(), id: Math.max(0, ...licencias.map(l => l.id)) + 1, vigente_hasta: null }]
}

export function contextoMulta(datos, multa) {
  const asignaciones = datos.asignaciones.filter(a => a.vehiculo_id === multa.vehiculo_id && vigenteEn(a, multa.fecha_infraccion))
  const centro = datos.centros.filter(c => c.vehiculo_id === multa.vehiculo_id && vigenteEn(c, multa.fecha_infraccion))[0]
  return { conductores: datos.personas.filter(p => asignaciones.some(a => a.persona_id === p.id)), centro: centro?.nombre ?? 'Sin centro de costo registrado' }
}

// Estado de gestión: qué responde cada informe que se sube a una multa.
// Valores PROVISORIOS, a confirmar con RRHH. Los que dicen "aviso" cuentan
// como aviso dado a la persona responsable.
export const ESTADOS_GESTION = ['Primer aviso', 'Segundo aviso', 'Aviso final', 'Descargo del conductor', 'Descuento aplicado', 'Gestión cerrada']
export const esAviso = estado => /aviso/i.test(estado ?? '')

// Todos los informes de multas cargados con una persona como responsable.
export function gestionesDePersona(datos, personaId) {
  return datos.multas.flatMap(m => (m.documentos ?? [])
    .filter(d => d.estado_gestion && (d.responsable_id ?? m.responsable_id) === personaId)
    .map(d => ({ ...d, multa_id: m.id, nro_acta: m.nro_acta, vehiculo_id: m.vehiculo_id })))
    .sort((a, b) => (b.fecha ?? '').localeCompare(a.fecha ?? ''))
}

export function gestionarMulta(datos, id, cambios, fechaActual = hoy()) {
  const multa = datos.multas.find(m => m.id === id)
  if (!multa) throw new Error('Multa inexistente.')
  const siguiente = { ...multa, ...cambios }
  if (!siguiente.responsable_id || !contextoMulta(datos, multa).conductores.some(p => p.id === siguiente.responsable_id)) throw new Error('Elegí un conductor asignado en la fecha de infracción.')
  if (!['pendiente', 'pagada'].includes(siguiente.estado_pago)) throw new Error('Estado de pago inválido.')
  if (siguiente.estado_pago === 'pagada' && (!siguiente.fecha_pago || siguiente.fecha_pago < multa.fecha_infraccion || siguiente.fecha_pago > fechaActual)) throw new Error('Indicá una fecha de pago entre la infracción y hoy.')
  const nuevos = (siguiente.documentos ?? []).slice((multa.documentos ?? []).length)
  if (nuevos.some(d => !ESTADOS_GESTION.includes(d.estado_gestion))) throw new Error('Indicá el estado de gestión del informe que subís.')
  if (siguiente.estado_pago === 'pendiente') siguiente.fecha_pago = null
  return datos.multas.map(m => m.id === id ? siguiente : m)
}
