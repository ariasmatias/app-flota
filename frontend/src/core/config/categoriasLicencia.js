// Clases y subclases de la Licencia Nacional de Conducir (Argentina).
// Fuente: argentina.gob.ar/seguridadvial/licencianacional/clasesysubclases
// (consultada el 07/10/2026). Texto resumido para la interfaz.
//
// `grupo` elige el dibujito (core/componentes/CategoriaLicencia.jsx).
// OJO: el catálogo de la base (categoria_licencia) hoy usa A.1 y A.2 sin
// subclase; la licencia actual distingue A.1.1 a A.1.4 y A.2.1 / A.2.2.
// Pendiente de definir con Mariano y RRHH qué códigos traen las licencias reales.

export const CLASES = [
  { clase: 'A', nombre: 'Motos, triciclos y cuatriciclos', corto: 'Motos' },
  { clase: 'B', nombre: 'Autos y camionetas', corto: 'Autos' },
  { clase: 'C', nombre: 'Camiones', corto: 'Camiones' },
  { clase: 'D', nombre: 'Transporte de pasajeros y emergencias', corto: 'Pasajeros' },
  { clase: 'E', nombre: 'Articulados y maquinaria especial', corto: 'Articulados' },
  { clase: 'F', nombre: 'Vehículos adaptados', corto: 'Adaptados' },
  { clase: 'G', nombre: 'Maquinaria agrícola', corto: 'Agrícolas' },
]

export const CATEGORIAS_LICENCIA = [
  { codigo: 'A.1.1', grupo: 'moto', titulo: 'Ciclomotor', detalle: 'Hasta 50 cc o 4 kW eléctrico.', edad: 16 },
  { codigo: 'A.1.2', grupo: 'moto', titulo: 'Moto hasta 150 cc', detalle: 'Hasta 150 cc o 11 kW eléctrico. Incluye A.1.1.', edad: 17 },
  { codigo: 'A.1.3', grupo: 'moto', titulo: 'Moto de 150 a 300 cc', detalle: 'De 150 a 300 cc o de 11 a 20 kW. Pide 2 años de A.1.2 (salvo mayores de 21).', edad: 19 },
  { codigo: 'A.1.4', grupo: 'moto', titulo: 'Moto de más de 300 cc', detalle: 'Más de 300 cc o 20 kW. Pide experiencia previa en A.1.3.', edad: 21 },
  { codigo: 'A.2.1', grupo: 'cuatriciclo', titulo: 'Triciclo / cuatriciclo hasta 300 cc', detalle: 'Sin cabina, con manubrio. Hasta 300 cc o 20 kW.', edad: 17 },
  { codigo: 'A.2.2', grupo: 'cuatriciclo', titulo: 'Triciclo / cuatriciclo de más de 300 cc', detalle: 'Sin cabina, con manubrio. Más de 300 cc o 20 kW. Pide experiencia en A.2.1.', edad: 19 },
  { codigo: 'A.3', grupo: 'cabina', titulo: 'Triciclo / cuatriciclo con cabina', detalle: 'Con cabina y volante.', edad: 17 },
  { codigo: 'B.1', grupo: 'auto', titulo: 'Auto, camioneta o utilitario', detalle: 'Hasta 3.500 kg. Incluye A.3.', edad: 17 },
  { codigo: 'B.2', grupo: 'trailer', titulo: 'Auto con trailer', detalle: 'Hasta 3.500 kg con trailer de hasta 750 kg o casa rodante no motorizada. Pide 1 año de B.1.', edad: 18 },
  { codigo: 'C.1', grupo: 'camion', titulo: 'Camión de 3.500 a 12.000 kg', detalle: 'Camión o casa rodante motorizada, sin acoplado. Incluye B.1.', edad: 21 },
  { codigo: 'C.2', grupo: 'camion', titulo: 'Camión de 12.000 a 24.000 kg', detalle: 'Sin acoplado. Incluye C.1.', edad: 21 },
  { codigo: 'C.3', grupo: 'camion', titulo: 'Camión de más de 24.000 kg', detalle: 'Sin acoplado. Incluye C.2.', edad: 21 },
  { codigo: 'D.1', grupo: 'combi', titulo: 'Pasajeros: hasta 8', detalle: 'Hasta 8 pasajeros sin contar al conductor. Incluye B.1.', edad: 21 },
  { codigo: 'D.2', grupo: 'colectivo', titulo: 'Pasajeros: de 8 a 20', detalle: 'De 8 a 20 pasajeros sin contar al conductor.', edad: 21 },
  { codigo: 'D.3', grupo: 'colectivo', titulo: 'Pasajeros: más de 20', detalle: 'Más de 20 pasajeros. Incluye D.2.', edad: 21 },
  { codigo: 'D.4', grupo: 'emergencia', titulo: 'Servicios de emergencia', detalle: 'Vehículos de emergencia o urgencia. Va junto con la clase del vehículo (A, B, C, D o E).', edad: 21 },
  { codigo: 'E.1', grupo: 'articulado', titulo: 'Con acoplado o articulado', detalle: 'Vehículos de clase C o D con uno o más acoplados. Incluye B.2.', edad: 21 },
  { codigo: 'E.2', grupo: 'maquina', titulo: 'Maquinaria especial no agrícola', detalle: 'Grúas, máquinas viales y similares.', edad: 21 },
  { codigo: 'F', grupo: 'adaptado', titulo: 'Vehículo adaptado', detalle: 'Adaptado a la condición física del conductor. Va junto con la subclase que corresponda.', edad: null },
  { codigo: 'G.1', grupo: 'tractor', titulo: 'Tractor agrícola', detalle: 'Tractores agrícolas.', edad: 17 },
  { codigo: 'G.2', grupo: 'tractor', titulo: 'Maquinaria agrícola especial', detalle: 'Cosechadoras y otras máquinas agrícolas.', edad: 17 },
  { codigo: 'G.3', grupo: 'tractor', titulo: 'Tren agrícola', detalle: 'Combinaciones de tren agrícola. Pide 1 año de B.1 o G.1.', edad: 18 },
]

// Códigos sin subclase que todavía usa el catálogo de la base.
const GENERICAS = {
  'A.1': { grupo: 'moto', titulo: 'Motos (sin subclase)', detalle: 'Código general de motos. La licencia actual lo divide en A.1.1 a A.1.4.' },
  'A.2': { grupo: 'cuatriciclo', titulo: 'Triciclos y cuatriciclos (sin subclase)', detalle: 'Código general. La licencia actual lo divide en A.2.1 y A.2.2.' },
}

// Qué es un código. Si no lo conoce exacto, usa la clase (primera letra).
export function infoCategoria(codigo) {
  const c = String(codigo ?? '').trim().toUpperCase()
  const exacta = CATEGORIAS_LICENCIA.find((x) => x.codigo === c)
  if (exacta) return exacta
  if (GENERICAS[c]) return { codigo: c, edad: null, ...GENERICAS[c] }
  const porClase = CATEGORIAS_LICENCIA.find((x) => x.codigo[0] === c[0])
  return porClase
    ? { codigo: c, grupo: porClase.grupo, titulo: CLASES.find((k) => k.clase === c[0])?.nombre ?? c, detalle: 'Código no reconocido en el catálogo oficial.', edad: null }
    : { codigo: c, grupo: 'desconocido', titulo: c || 'Sin categoría', detalle: 'Código no reconocido.', edad: null }
}
