import { renovarLicencia, gestionarMulta } from './dominio.js'
import seedSql from '../../../../database/seed/001_datos_demo.sql?raw'
import { datosDesdeSeed } from './leerSeed.js'

// Fuente única de prueba: el mismo SQL que se carga en PostgreSQL.
// Los cambios de la demo siguen en memoria; no hay conexión a una BD.
export function datosIniciales() {
  return datosDesdeSeed(seedSql)
}

export function guardarLicencia(datos, nueva, usuario) {
  const licencias = renovarLicencia(datos.licencias, nueva)
  return { ...datos, licencias, auditoria: [...datos.auditoria, { fecha: new Date().toISOString(), usuario: usuario.usuario, accion: 'Renovación de licencia', entidad: nueva.persona_id }] }
}

export function guardarMulta(datos, id, cambios, usuario) {
  const multas = gestionarMulta(datos, id, cambios)
  return { ...datos, multas, auditoria: [...datos.auditoria, { fecha: new Date().toISOString(), usuario: usuario.usuario, accion: 'Gestión de multa', entidad: id }] }
}
