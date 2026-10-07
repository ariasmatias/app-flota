import { hoy, vigenteEn } from './dominio.js'
import { leerTabla } from '../../core/datos/seed.js'

// El lector genérico (separarValores, leerTabla) vive en core/datos/seed.js.
export { separarValores, leerTabla } from '../../core/datos/seed.js'

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
