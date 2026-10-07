import { hoy } from './dominio.js'
import { leerTabla } from '../../core/datos/seed.js'

// Arma los datos de la demo de Mantenimiento a partir del seed compartido
// (database/seed/001_datos_demo.sql), el mismo que se carga en PostgreSQL y
// que ya usa RRHH. Así los dos módulos muestran las mismas personas,
// vehículos y fechas. Usa el lector compartido core/datos/seed.js: solo lee
// INSERT VALUES estáticos, no ejecuta SQL.
export function datosDesdeSeed(sql, referencia = hoy()) {
  const tabla = (nombre) => leerTabla(sql, nombre, referencia)
  const categorias = tabla('categoria_licencia')
  const licCat = tabla('licencia_categoria')
  const centros = tabla('centro_costo')
  const documentos = tabla('documento')
  const versiones = tabla('documento_version')
  const vinculos = tabla('documento_vinculo')

  // Nombre del documento vigente vinculado a una entidad (no hay archivos reales).
  function documentoDe(tipo, id) {
    const v = vinculos.find((x) => x.entidad_tipo === tipo && x.entidad_id === id &&
      documentos.some((d) => d.id === x.documento_id && d.estado === 'vigente'))
    if (!v) return null
    const version = versiones.filter((d) => d.documento_id === v.documento_id).at(-1)
    return version?.nombre_original ?? null
  }

  return {
    categorias,
    personas: tabla('persona'),
    estadosPersona: tabla('persona_estado'),
    licencias: tabla('licencia').map((l) => ({
      ...l,
      categorias: licCat.filter((c) => c.licencia_id === l.id).map((c) => categorias.find((x) => x.id === c.categoria_id).codigo),
    })),
    autorizaciones: tabla('autorizacion_conducir').map((a) => ({
      ...a,
      documento: documentoDe('autorizacion', a.id) ?? 'Documento de ejemplo',
    })),
    vehiculos: tabla('vehiculo'),
    estadosVehiculo: tabla('vehiculo_estado'),
    asignaciones: tabla('asignacion'),
    polizas: tabla('poliza'),
    polizasVehiculo: tabla('poliza_vehiculo'),
    vtv: tabla('vtv'),
    centrosCosto: tabla('vehiculo_finanzas').map((f) => ({
      ...f,
      nombre: centros.find((c) => c.id === f.centro_costo_id)?.nombre ?? 'Sin centro de costo',
    })),
    // Apoyo de la demo. La auditoría real (auditoria_evento) la escribe el backend.
    auditoria: [],
  }
}
