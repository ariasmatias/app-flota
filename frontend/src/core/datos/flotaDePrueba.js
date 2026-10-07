import seedSql from '../../../../database/seed/001_datos_demo.sql?raw'
import { tablasDeFlota } from './fichaVehiculo.js'

// Datos de prueba para las herramientas compartidas (búsqueda por dominio de la
// pantalla principal). Salen del mismo seed que RRHH y Mantenimiento.
// Solo se usan en modo desarrollo; en modo real hace falta la API.
let cache = null
export function flotaDePrueba() {
  cache ??= tablasDeFlota(seedSql)
  return cache
}
