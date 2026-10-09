import { hoy, leerTabla } from './seed.js'
import { completarFlota, CLASES_FLOTA } from './vehiculoProvisorio.js'

// Ficha completa de un vehículo, con todo su historial, armada desde el seed
// compartido. Es de solo lectura y la usa la búsqueda por dominio de la
// pantalla principal. Cuando exista la API, esto se reemplaza por
// GET /api/vehiculos/:dominio/ficha (misma forma de respuesta).

// Períodos [desde, hasta): el cierre pertenece al período siguiente.
const vigenteEn = (p, f) => p.vigente_desde <= f && (!p.vigente_hasta || f < p.vigente_hasta)
const porDesdeDesc = (a, b) => (b.vigente_desde ?? '').localeCompare(a.vigente_desde ?? '')

export const normalizarDominio = (texto) => String(texto ?? '').toUpperCase().replace(/[\s.-]/g, '')

export function tablasDeFlota(sql, referencia = hoy()) {
  const t = (nombre) => leerTabla(sql, nombre, referencia)
  // Año, chasis, motor, clase, alta/baja, gerencia y jefaturas: provisorios hasta la migración 002.
  const flota = completarFlota({ vehiculos: t('vehiculo'), estados: t('vehiculo_estado'), finanzas: t('vehiculo_finanzas'), centros: t('centro_costo') })
  return {
    referencia,
    vehiculos: flota.vehiculos,
    categorias: t('categoria_licencia'),
    estados: flota.estados,
    gerencias: flota.gerencias,
    jefaturas: flota.jefaturas,
    vehiculoJefaturas: flota.vehiculoJefaturas,
    personas: t('persona'),
    asignaciones: t('asignacion'),
    polizas: t('poliza'),
    polizasVehiculo: t('poliza_vehiculo'),
    vtv: t('vtv'),
    centros: flota.centros,
    finanzas: flota.finanzas,
    multas: t('multa'),
    tarjetas: t('tarjeta'),
    tarjetaPeriodos: t('tarjeta_periodo'),
    perfiles: t('perfil'),
    tags: t('tag'),
    tipoDocumentos: t('tipo_documento_catalogo'),
    documentos: t('documento'),
    versiones: t('documento_version'),
    vinculos: t('documento_vinculo'),
  }
}

// La baja es la fecha de baja (ya no es un estado).
const estadoActual = (t, vehiculoId) => {
  const v = t.vehiculos.find((x) => x.id === vehiculoId)
  if (v?.fecha_baja && t.referencia >= v.fecha_baja) return 'baja'
  return t.estados.find((e) => e.vehiculo_id === vehiculoId && vigenteEn(e, t.referencia))?.estado ?? null
}

// Vehículos que coinciden con lo escrito (dominio, chasis, motor, marca o modelo). Prioriza el dominio.
export function buscarVehiculos(t, texto, limite = 6) {
  const q = normalizarDominio(texto)
  const libre = String(texto ?? '').trim().toLowerCase()
  if (libre.length < 2) return []
  return t.vehiculos
    .map((v) => {
      const porDominio = v.dominio.includes(q)
      const porNumero = q.length >= 4 && [v.nro_chasis, v.nro_motor].some((x) => normalizarDominio(x).includes(q))
      const porNombre = `${v.marca} ${v.modelo}`.toLowerCase().includes(libre)
      return { v, puntaje: v.dominio === q ? 4 : porDominio ? 3 : porNumero ? 2 : porNombre ? 1 : 0 }
    })
    .filter((x) => x.puntaje > 0)
    .sort((a, b) => b.puntaje - a.puntaje || a.v.dominio.localeCompare(b.v.dominio))
    .slice(0, limite)
    .map(({ v }) => ({ ...v, estado: estadoActual(t, v.id) }))
}

export function fichaCompleta(t, dominioBuscado) {
  const v = t.vehiculos.find((x) => x.dominio === normalizarDominio(dominioBuscado))
  if (!v) return null
  const id = v.id
  const persona = (pid) => t.personas.find((p) => p.id === pid)
  const ref = t.referencia

  const asignaciones = t.asignaciones.filter((a) => a.vehiculo_id === id).sort(porDesdeDesc).map((a) => ({
    ...a, persona: persona(a.persona_id)?.apellido_nombre ?? '—', legajo: persona(a.persona_id)?.legajo, vigente: vigenteEn(a, ref),
  }))

  const polizas = t.polizasVehiculo.filter((pv) => pv.vehiculo_id === id).sort(porDesdeDesc).map((pv) => {
    const p = t.polizas.find((x) => x.id === pv.poliza_id)
    return { ...pv, nro_poliza: p?.nro_poliza, aseguradora: p?.aseguradora, vence: p?.vigente_hasta, vigente: !pv.vigente_hasta && p?.vigente_hasta >= ref }
  })

  const vtv = t.vtv.filter((x) => x.vehiculo_id === id).sort(porDesdeDesc)

  const centros = t.finanzas.filter((f) => f.vehiculo_id === id).sort(porDesdeDesc).map((f) => {
    const cc = t.centros.find((c) => c.id === f.centro_costo_id)
    return {
      ...f, nombre: cc?.nombre ?? '—', codigo: cc?.codigo ?? null, vigente: vigenteEn(f, ref),
      gerencia: t.gerencias.find((g) => g.id === f.gerencia_id)?.nombre ?? '—',
      gerenciaDistinta: Boolean(cc && f.gerencia_id && cc.gerencia_id !== f.gerencia_id),
    }
  })

  const jefaturas = t.vehiculoJefaturas.filter((j) => j.vehiculo_id === id).sort(porDesdeDesc).map((j) => ({
    ...j, nombre: t.jefaturas.find((x) => x.id === j.jefatura_id)?.nombre ?? '—', vigente: vigenteEn(j, ref),
  }))

  const multas = t.multas.filter((m) => m.vehiculo_id === id)
    .sort((a, b) => b.fecha_infraccion.localeCompare(a.fecha_infraccion))
    .map((m) => ({ ...m, responsable: m.responsable_id ? persona(m.responsable_id)?.apellido_nombre : null }))

  const tarjetas = t.tarjetas.filter((x) => x.vehiculo_id === id).map((x) => {
    const periodos = t.tarjetaPeriodos.filter((p) => p.tarjeta_id === x.id).sort(porDesdeDesc)
    const actual = periodos.find((p) => vigenteEn(p, ref)) ?? periodos[0]
    return { ...x, estado: actual?.estado ?? '—', perfil: t.perfiles.find((p) => p.id === actual?.perfil_id)?.nombre ?? '—', periodos }
  })

  const tags = t.tags.filter((x) => x.vehiculo_id === id).sort(porDesdeDesc)

  // Documentos vinculados al vehículo o a su VTV, póliza o multas.
  const vinculosPropios = t.vinculos.filter((l) =>
    (l.entidad_tipo === 'vehiculo' && l.entidad_id === id) ||
    (l.entidad_tipo === 'vtv' && vtv.some((x) => x.id === l.entidad_id)) ||
    (l.entidad_tipo === 'poliza' && polizas.some((x) => x.poliza_id === l.entidad_id)) ||
    (l.entidad_tipo === 'multa' && multas.some((x) => x.id === l.entidad_id)))
  const documentos = vinculosPropios.flatMap((l) => {
    const doc = t.documentos.find((d) => d.id === l.documento_id)
    if (!doc) return []
    const tipo = t.tipoDocumentos.find((x) => x.id === doc.tipo_documento_id)?.descripcion ?? 'Documento'
    return t.versiones.filter((x) => x.documento_id === doc.id).sort((a, b) => b.nro_version - a.nro_version).map((x) => ({
      id: x.id, tipo, nombre: x.nombre_original, version: x.nro_version, desde: x.vigente_desde, hasta: x.vigente_hasta, anulado: doc.estado === 'anulado',
    }))
  })

  return {
    vehiculo: v,
    categoria: t.categorias.find((c) => c.id === v.categoria_requerida_id)?.codigo ?? 'Sin exigencia',
    estado: estadoActual(t, id),
    estados: t.estados.filter((e) => e.vehiculo_id === id).sort(porDesdeDesc),
    asignaciones,
    conductoresHoy: asignaciones.filter((a) => a.vigente),
    polizas,
    polizaHoy: polizas.find((p) => p.vigente) ?? null,
    vtv,
    vtvHoy: vtv[0] ?? null,
    centros,
    centroHoy: centros.find((c) => c.vigente) ?? null,
    jefaturas,
    jefaturasHoy: jefaturas.filter((j) => j.vigente),
    clase: CLASES_FLOTA.find((c) => c.valor === v.clase_flota)?.etiqueta ?? '—',
    multas,
    tarjetas,
    tags,
    tagHoy: tags.find((x) => !x.vigente_hasta) ?? null,
    documentos,
  }
}
