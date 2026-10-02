import { hoy, sumarDias } from './dominio.js'
import * as reglas from './dominio.js'

// Datos FICTICIOS y exclusivamente en memoria. La API real reemplazará este adaptador.
// Personas, licencias y autorizaciones copian los de la demo de RRHH (mismos ids y legajos)
// para que ambos módulos cuenten la misma historia. Propuesta: mover los datos
// compartidos a core/ cuando Matías y Jorge lo acuerden.
//
// Las fechas son relativas a hoy, así siempre hay ejemplos vencidos y por vencer.

const d = (dias) => sumarDias(hoy(), dias)

export const CATEGORIAS = ['A.1', 'A.2', 'A.3', 'B.1', 'B.2', 'C.1', 'C.2', 'C.3', 'D.1', 'D.2', 'D.3', 'D.4', 'E.1', 'E.2', 'F', 'G.1', 'G.2', 'G.3']
  .map((codigo, i) => ({ id: i + 1, codigo }))
const cat = (codigo) => CATEGORIAS.find((c) => c.codigo === codigo).id

export function datosIniciales() {
  return {
    categorias: CATEGORIAS,

    // persona (provisoria hasta confirmar GLM)
    personas: [
      { id: 1, legajo: 'DEMO-001', apellido_nombre: 'Acosta, Lucía', dni: 'DEMO-1001' },
      { id: 2, legajo: 'DEMO-002', apellido_nombre: 'Benítez, Martín', dni: 'DEMO-1002' },
      { id: 3, legajo: 'DEMO-003', apellido_nombre: 'Costa, Valeria', dni: 'DEMO-1003' },
      { id: 4, legajo: 'DEMO-004', apellido_nombre: 'Duarte, Nicolás', dni: 'DEMO-1004' },
      { id: 5, legajo: 'DEMO-005', apellido_nombre: 'Estévez, Paula', dni: 'DEMO-1005' },
    ],
    // persona_estado
    estadosPersona: [
      ...[1, 2, 3, 5].map((id) => ({ id, persona_id: id, estado: 'alta', vigente_desde: d(-800), vigente_hasta: null })),
      { id: 4, persona_id: 4, estado: 'alta', vigente_desde: d(-800), vigente_hasta: d(-20) },
      { id: 6, persona_id: 4, estado: 'baja', vigente_desde: d(-20), vigente_hasta: null },
    ],
    // licencia + licencia_categoria (categorías como códigos, igual que RRHH)
    licencias: [
      { id: 1, persona_id: 1, nro_registro: 'REG-DEMO-01', categorias: ['B.1'], vencimiento: d(-100), vigente_desde: d(-700), vigente_hasta: d(-90) },
      { id: 2, persona_id: 1, nro_registro: 'REG-DEMO-02', categorias: ['B.1', 'C.1'], vencimiento: d(360), vigente_desde: d(-90), vigente_hasta: null },
      { id: 3, persona_id: 2, nro_registro: 'REG-DEMO-03', categorias: ['B.1'], vencimiento: d(18), vigente_desde: d(-600), vigente_hasta: null },
      { id: 4, persona_id: 3, nro_registro: 'REG-DEMO-04', categorias: ['B.1', 'D.1'], vencimiento: d(-12), vigente_desde: d(-600), vigente_hasta: null },
      { id: 5, persona_id: 5, nro_registro: 'REG-DEMO-05', categorias: ['B.1'], vencimiento: d(500), vigente_desde: d(-30), vigente_hasta: null },
    ],
    // autorizacion_conducir (alta de Legales, revisión de Mantenimiento)
    autorizaciones: [
      { id: 1, persona_id: 1, revision: 'si', observacion: null, revisado_por: 6, revisado_fecha: d(-290), vigente_desde: d(-300), vigente_hasta: null, documento: 'Autorización Acosta · ejemplo' },
      { id: 2, persona_id: 2, revision: 'si', observacion: null, revisado_por: 6, revisado_fecha: d(-290), vigente_desde: d(-300), vigente_hasta: null, documento: 'Autorización Benítez · ejemplo' },
      { id: 3, persona_id: 3, revision: 'pendiente', observacion: null, revisado_por: null, revisado_fecha: null, vigente_desde: d(-300), vigente_hasta: null, documento: 'Autorización Costa · ejemplo' },
      { id: 4, persona_id: 5, revision: 'pendiente', observacion: null, revisado_por: null, revisado_fecha: null, vigente_desde: d(-6), vigente_hasta: null, documento: 'Autorización Estévez · ejemplo' },
    ],

    // vehiculo (dominios ficticios, serie ZZ)
    vehiculos: [
      { id: 1, dominio: 'AA001ZZ', marca: 'Toyota', modelo: 'Hilux', categoria_requerida_id: cat('B.1') },
      { id: 2, dominio: 'AA002ZZ', marca: 'Ford', modelo: 'Ranger', categoria_requerida_id: cat('B.1') },
      { id: 3, dominio: 'AA003ZZ', marca: 'Iveco', modelo: 'Daily', categoria_requerida_id: cat('C.1') },
      { id: 4, dominio: 'AB004ZZ', marca: 'Renault', modelo: 'Kangoo', categoria_requerida_id: cat('B.1') },
      { id: 5, dominio: 'AA005ZZ', marca: 'Volkswagen', modelo: 'Amarok', categoria_requerida_id: cat('B.1') },
    ],
    // vehiculo_estado
    estadosVehiculo: [
      { id: 1, vehiculo_id: 1, estado: 'activo', motivo: 'Alta del vehículo', vigente_desde: d(-900), vigente_hasta: null },
      { id: 2, vehiculo_id: 2, estado: 'activo', motivo: 'Alta del vehículo', vigente_desde: d(-900), vigente_hasta: null },
      { id: 3, vehiculo_id: 3, estado: 'activo', motivo: 'Alta del vehículo', vigente_desde: d(-400), vigente_hasta: null },
      { id: 4, vehiculo_id: 4, estado: 'activo', motivo: 'Alta del vehículo', vigente_desde: d(-700), vigente_hasta: d(-5) },
      { id: 5, vehiculo_id: 4, estado: 'taller', motivo: 'Service de 60.000 km', vigente_desde: d(-5), vigente_hasta: null },
      { id: 6, vehiculo_id: 5, estado: 'activo', motivo: 'Alta del vehículo', vigente_desde: d(-1200), vigente_hasta: d(-60) },
      { id: 7, vehiculo_id: 5, estado: 'baja', motivo: 'Fin de vida útil (ejemplo)', vigente_desde: d(-60), vigente_hasta: null },
    ],
    // asignacion
    asignaciones: [
      { id: 1, persona_id: 1, vehiculo_id: 1, motivo: 'Asignación inicial', vigente_desde: d(-300), vigente_hasta: null },
      { id: 2, persona_id: 2, vehiculo_id: 1, motivo: 'Turno tarde', vigente_desde: d(-300), vigente_hasta: null },
      { id: 3, persona_id: 3, vehiculo_id: 2, motivo: 'Asignación inicial', vigente_desde: d(-300), vigente_hasta: null },
      { id: 4, persona_id: 4, vehiculo_id: 2, motivo: 'Asignación inicial · Cierre: baja de la persona', vigente_desde: d(-500), vigente_hasta: d(-20) },
      { id: 5, persona_id: 1, vehiculo_id: 3, motivo: 'Reparto de insumos', vigente_desde: d(-60), vigente_hasta: null },
    ],
    // poliza + poliza_vehiculo
    polizas: [
      { id: 1, nro_poliza: 'POL-DEMO-0001', aseguradora: 'Aseguradora Ejemplo', vigente_desde: d(-730), vigente_hasta: d(-366) },
      { id: 2, nro_poliza: 'POL-DEMO-0002', aseguradora: 'Aseguradora Ejemplo', vigente_desde: d(-365), vigente_hasta: d(25) },
    ],
    polizasVehiculo: [
      { id: 1, poliza_id: 1, vehiculo_id: 1, vigente_desde: d(-730), vigente_hasta: d(-365) },
      { id: 2, poliza_id: 1, vehiculo_id: 2, vigente_desde: d(-730), vigente_hasta: d(-365) },
      { id: 3, poliza_id: 2, vehiculo_id: 1, vigente_desde: d(-365), vigente_hasta: null },
      { id: 4, poliza_id: 2, vehiculo_id: 2, vigente_desde: d(-365), vigente_hasta: null },
      { id: 5, poliza_id: 2, vehiculo_id: 3, vigente_desde: d(-365), vigente_hasta: null },
      { id: 6, poliza_id: 2, vehiculo_id: 4, vigente_desde: d(-100), vigente_hasta: null },
      { id: 7, poliza_id: 2, vehiculo_id: 5, vigente_desde: d(-365), vigente_hasta: d(-60) },
    ],
    // vtv (vigente_hasta = vencimiento)
    vtv: [
      { id: 1, vehiculo_id: 1, vigente_desde: d(-165), vigente_hasta: d(200) },
      { id: 2, vehiculo_id: 2, vigente_desde: d(-353), vigente_hasta: d(12) },
      { id: 3, vehiculo_id: 3, vigente_desde: d(-368), vigente_hasta: d(-3) },
      { id: 4, vehiculo_id: 4, vigente_desde: d(-65), vigente_hasta: d(300) },
    ],
    // vehiculo_finanzas (solo lectura acá: lo carga Finanzas en FI-01)
    centrosCosto: [
      { vehiculo_id: 1, nombre: 'Operaciones · ejemplo', tipo_flota: 'aubasa', vigente_desde: d(-500), vigente_hasta: d(-10) },
      { vehiculo_id: 1, nombre: 'Administración · ejemplo', tipo_flota: 'aubasa', vigente_desde: d(-10), vigente_hasta: null },
      { vehiculo_id: 2, nombre: 'Mantenimiento · ejemplo', tipo_flota: 'aubasa', vigente_desde: d(-500), vigente_hasta: null },
      { vehiculo_id: 3, nombre: 'Mantenimiento · ejemplo', tipo_flota: 'propia', vigente_desde: d(-400), vigente_hasta: null },
    ],
    // Apoyo de la demo. La auditoría real (auditoria_evento) la escribe el backend.
    auditoria: [],
  }
}

// ───── Operaciones: aplican la regla y dejan registro de auditoría en memoria ─────

function auditar(datos, usuario, accion, entidad, entidad_id, valor_anterior = null, valor_nuevo = null) {
  return {
    ...datos,
    auditoria: [
      ...datos.auditoria,
      { fecha: new Date().toISOString(), usuario: usuario.usuario, accion, entidad, entidad_id, valor_anterior, valor_nuevo },
    ],
  }
}

export function guardarVehiculo(datos, nuevo, usuario) {
  const resultado = reglas.altaVehiculo(datos, nuevo)
  const v = resultado.vehiculos.at(-1)
  return auditar(resultado, usuario, 'alta', 'vehiculo', v.id, null, v)
}

export function guardarCorreccion(datos, id, cambios, usuario) {
  const { anterior, nuevo, datos: resultado } = reglas.corregirVehiculo(datos, id, cambios)
  return auditar(resultado, usuario, 'modificacion', 'vehiculo', id, anterior, nuevo)
}

export function guardarEstado(datos, vehiculoId, cambio, usuario) {
  return auditar(reglas.cambiarEstadoVehiculo(datos, vehiculoId, cambio), usuario, 'modificacion', 'vehiculo_estado', vehiculoId, null, cambio)
}

export function guardarAsignacion(datos, nueva, usuario) {
  const resultado = reglas.asignar(datos, nueva)
  const a = resultado.asignaciones.at(-1)
  return auditar(resultado, usuario, 'alta', 'asignacion', a.id, null, a)
}

export function guardarCierreAsignacion(datos, id, cierre, usuario) {
  return auditar(reglas.cerrarAsignacion(datos, id, cierre), usuario, 'anulacion', 'asignacion', id, null, cierre)
}

export function guardarPoliza(datos, nueva, usuario) {
  const resultado = reglas.crearPoliza(datos, nueva)
  const p = resultado.polizas.at(-1)
  return auditar(resultado, usuario, 'alta', 'poliza', p.id, null, p)
}

export function guardarRenovacion(datos, polizaId, nueva, usuario) {
  const resultado = reglas.renovarPoliza(datos, polizaId, nueva)
  return auditar(resultado, usuario, 'alta', 'poliza', resultado.polizas.at(-1).id, { renueva: polizaId }, nueva)
}

export function guardarIncorporacion(datos, polizaId, vehiculoId, desde, usuario) {
  return auditar(reglas.agregarVehiculoAPoliza(datos, polizaId, vehiculoId, desde), usuario, 'alta', 'poliza_vehiculo', polizaId, null, { vehiculoId, desde })
}

export function guardarRetiro(datos, filaId, hasta, usuario) {
  return auditar(reglas.retirarVehiculoDePoliza(datos, filaId, hasta), usuario, 'anulacion', 'poliza_vehiculo', filaId, null, { hasta })
}

export function guardarRevision(datos, id, revision, usuario) {
  const { anterior, nuevo, datos: resultado } = reglas.revisarAutorizacion(datos, id, revision, usuario)
  return auditar(resultado, usuario, 'modificacion', 'autorizacion_conducir', id, anterior, nuevo)
}
